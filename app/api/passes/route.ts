import { NextRequest, NextResponse } from 'next/server';
import { generatePass, PassType } from '@/lib/pass-service';
import { verifyCertificates } from '@/lib/apple-pass-config';
import fs from 'fs';
import path from 'path';

// Crear directorio temporal si no existe
const tempDir = path.join(process.cwd(), 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Función para mapear tipos de pases de la interfaz de usuario a los tipos Apple Wallet
function mapPassType(uiType: string): PassType {
  switch (uiType.toLowerCase()) {
    case 'event': return 'eventTicket';
    case 'boarding': return 'boardingPass'; 
    case 'coupon': return 'coupon';
    case 'storecard':
    case 'loyalty': return 'storeCard';
    default: return 'generic';
  }
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
    const { passType: uiPassType, passData } = data;

    // Validar datos
    if (!uiPassType || !passData) {
      return NextResponse.json(
        { error: 'Missing required fields: passType or passData' },
        { status: 400 }
      );
    }

    // Convertir el tipo de pase de la UI al formato de Apple Wallet
    const applePKPassType = mapPassType(uiPassType);

    console.log(`Generating ${applePKPassType} pass with data:`, JSON.stringify(passData, null, 2));

    // Generar el pase
    const passBuffer = await generatePass(applePKPassType, passData);

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