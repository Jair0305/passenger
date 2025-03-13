import path from 'path';
import fs from 'fs';

// Rutas a los certificados
const CERTIFICATES_PATH = path.join(process.cwd(), 'appledeveloper');

// Configuración para la generación de pases
export const applePassConfig = {
  // Ruta al certificado .p12
  p12Path: path.join(CERTIFICATES_PATH, 'Certificates.p12'),
  // Ruta al certificado .cer
  certPath: path.join(CERTIFICATES_PATH, 'pass.cer'),
  // Contraseña del certificado (si es necesaria)
  // Nota: En producción, esto debería estar en variables de entorno
  p12Password: process.env.P12_PASSWORD || '',
  // ID del equipo de Apple Developer
  teamIdentifier: process.env.APPLE_TEAM_ID || '',
  // ID del tipo de pase
  passTypeIdentifier: process.env.PASS_TYPE_IDENTIFIER || 'pass.com.yourcompany.passenger',
  // Organización
  organizationName: 'Your Organization',
  // Descripción
  description: 'Digital Pass',
};

// Función para verificar si los certificados existen
export function verifyCertificates(): { valid: boolean; message: string } {
  try {
    if (!fs.existsSync(applePassConfig.p12Path)) {
      return { 
        valid: false, 
        message: 'Certificate file (Certificates.p12) not found' 
      };
    }
    
    if (!fs.existsSync(applePassConfig.certPath)) {
      return { 
        valid: false, 
        message: 'Certificate file (pass.cer) not found' 
      };
    }
    
    return { valid: true, message: 'Certificates found' };
  } catch (error) {
    return { 
      valid: false, 
      message: `Error verifying certificates: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
} 