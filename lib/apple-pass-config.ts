import path from 'path';
import fs from 'fs';

// Rutas a los certificados
const CERTIFICATES_PATH = path.join(process.cwd(), 'certificates');

// Configuración para la generación de pases
export const applePassConfig = {
  // Rutas a los certificados PEM
  wwdrPath: path.join(CERTIFICATES_PATH, 'wwdr.pem'),
  signerCertPath: path.join(CERTIFICATES_PATH, 'signerCert.pem'),
  signerKeyPath: path.join(CERTIFICATES_PATH, 'signerKey.pem'),
  
  // Passphrase para signerKey (si es necesaria)
  signerKeyPassphrase: process.env.SIGNER_KEY_PASSPHRASE || 'passifyeslapolla', // Using 'test' as default from the image
  
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
    if (!fs.existsSync(applePassConfig.wwdrPath)) {
      return { 
        valid: false, 
        message: 'WWDR certificate file (wwdr.pem) not found' 
      };
    }
    
    if (!fs.existsSync(applePassConfig.signerCertPath)) {
      return { 
        valid: false, 
        message: 'Signer certificate file (signerCert.pem) not found' 
      };
    }
    
    if (!fs.existsSync(applePassConfig.signerKeyPath)) {
      return { 
        valid: false, 
        message: 'Signer key file (signerKey.pem) not found' 
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