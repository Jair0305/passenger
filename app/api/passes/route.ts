import { NextRequest, NextResponse } from 'next/server';
import { generatePass } from '@/lib/pass-service';
import { verifyCertificates } from '@/lib/apple-pass-config';
import fs from 'fs';
import path from 'path';

// Crear directorio temporal si no existe
const tempDir = path.join(process.cwd(), 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

export async function POST(request: NextRequest) {
  try {
    // Verificar certificados
    const certStatus = verifyCertificates();
    console.log('Certificate status:', certStatus);
    if (!certStatus.valid) {
      return NextResponse.json(
        { error: certStatus.message },
        { status: 500 }
      );
    }

    // Obtener datos del pase del cuerpo de la solicitud
    const data = await request.json();
    const { passType, passData } = data;

    // Validar datos
    if (!passType || !passData) {
      return NextResponse.json(
        { error: 'Missing required fields: passType or passData' },
        { status: 400 }
      );
    }

    console.log(`Generating ${passType} pass with data:`, passData);

    // Generar el pase
    const passBuffer = await generatePass(passType, passData);

    console.log("Pass generated successfully, sending response");

    // Devolver el pase como un archivo para descargar
    return new NextResponse(passBuffer, {
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename="pass-${Date.now()}.pkpass"`,
      },
    });
  } catch (error) {
    console.error('Error generating pass:', error);
    return NextResponse.json(
      { error: `Failed to generate pass: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

// Endpoint para verificar el estado de los certificados
export async function GET() {
  const certStatus = verifyCertificates();
  return NextResponse.json(certStatus);
} 