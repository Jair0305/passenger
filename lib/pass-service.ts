import { PKPass } from 'passkit-generator';
import fs from 'fs';
import { applePassConfig } from './apple-pass-config';

// Interfaz para los datos del pase
export interface PassData {
  title: string;
  subtitle?: string;
  description: string;
  logoText: string;
  organizationName?: string;
  
  // Colores
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  foregroundColor?: string;
  labelColor?: string;
  logoTextColor?: string;
  
  // Ubicación y fechas
  location: string;
  date: string;
  time?: string;
  
  // Opciones de configuración
  barcode: boolean;
  barcodeFormat?: string;
  barcodeMessage?: string;
  notifications?: boolean;
  
  // Imágenes
  logoImage?: string;
  iconImage?: string;
  stripImage?: string;
  footerImage?: string;
  backgroundImage?: string;
  thumbnailImage?: string;
  
  // Opciones de relevancia
  relevantDate?: string;
  expirationDate?: string;
  voided?: boolean;
  
  // Campos personalizados
  customFields?: Array<{
    key: string;
    label: string;
    value: string;
    textAlignment?: 'left' | 'center' | 'right' | 'natural';
  }>;

  // Opciones de diseño avanzado
  headerAlignment?: 'left' | 'center' | 'right' | 'natural';
  primaryAlignment?: 'left' | 'center' | 'right' | 'natural';
  secondaryAlignment?: 'left' | 'center' | 'right' | 'natural';
  auxiliaryAlignment?: 'left' | 'center' | 'right' | 'natural';
  dateStyle?: 'none' | 'short' | 'medium' | 'long' | 'full';
  timeStyle?: 'none' | 'short' | 'medium' | 'long' | 'full';
  showReverse?: boolean;
  useAdvancedEditor?: boolean;
  customWidth?: number;
  customHeight?: number;
  allowCustomDimensions?: boolean;
  customPassType?: boolean;
  allowFullCustomization?: boolean;
}

// Tipo de pase
export type PassType = 'eventTicket' | 'boardingPass' | 'coupon' | 'generic' | 'storeCard';

// Función para generar un pase digital
export async function generatePass(passType: PassType, passData: PassData): Promise<Buffer> {
  try {
    console.log("Generating pass with type:", passType);
    console.log("Certificates info:", {
      wwdrPath: applePassConfig.wwdrPath,
      signerCertPath: applePassConfig.signerCertPath,
      signerKeyPath: applePassConfig.signerKeyPath,
      teamId: applePassConfig.teamIdentifier,
      passTypeId: applePassConfig.passTypeIdentifier
    });
    
    // Verificar certificados
    if (!fs.existsSync(applePassConfig.wwdrPath)) {
      throw new Error('WWDR certificate file not found');
    }
    
    if (!fs.existsSync(applePassConfig.signerCertPath)) {
      throw new Error('Signer certificate file not found');
    }
    
    if (!fs.existsSync(applePassConfig.signerKeyPath)) {
      throw new Error('Signer key file not found');
    }

    console.log("All certificates found, proceeding...");
    
    // Leer los certificados
    const wwdr = fs.readFileSync(applePassConfig.wwdrPath);
    const signerCert = fs.readFileSync(applePassConfig.signerCertPath);
    const signerKey = fs.readFileSync(applePassConfig.signerKeyPath);
    
    console.log("Certificates loaded, creating pass...");
    
    // IMPORTANTE: Siempre usar generic porque es el que funciona
    const model = 'generic';
    
    // Crear una instancia de PKPass
    const pass = new PKPass({}, {
      wwdr,
      signerCert,
      signerKey,
      signerKeyPassphrase: applePassConfig.signerKeyPassphrase
    });

    // Establecer propiedades del pase
    pass.type = model;
    
    // Preparar estructura del JSON
    const basicInfo = {
      formatVersion: 1,
      passTypeIdentifier: applePassConfig.passTypeIdentifier,
      serialNumber: `pass-${Date.now()}`,
      teamIdentifier: applePassConfig.teamIdentifier,
      organizationName: passData.organizationName || applePassConfig.organizationName,
      description: passData.description || applePassConfig.description,
      logoText: passData.logoText || "Logo Text",
    };
    
    // Añadir colores
    const colors: Record<string, string> = {};
    if (passData.foregroundColor) colors.foregroundColor = passData.foregroundColor;
    if (passData.backgroundColor) colors.backgroundColor = passData.backgroundColor;
    if (passData.labelColor) colors.labelColor = passData.labelColor;
    
    // Preparar campos principales
    const genericFields = {
      primaryFields: [
        {
          key: "title",
          label: "TITLE",
          value: passData.title
        }
      ],
      secondaryFields: [
        {
          key: "location",
          label: "LOCATION",
          value: passData.location
        }
      ],
      auxiliaryFields: [
        {
          key: "date",
          label: "DATE",
          value: passData.date
        }
      ],
      backFields: [] as any[]
    };
    
    // Añadir subtítulo si existe
    if (passData.subtitle) {
      genericFields.secondaryFields.push({
        key: "subtitle",
        label: "SUBTITLE",
        value: passData.subtitle
      });
    }
    
    // Añadir hora si existe
    if (passData.time) {
      genericFields.auxiliaryFields.push({
        key: "time",
        label: "TIME",
        value: passData.time
      });
    }
    
    // Añadir campos personalizados
    if (passData.customFields && passData.customFields.length > 0) {
      genericFields.backFields = passData.customFields.map(field => ({
        key: field.key,
        label: field.label,
        value: field.value
      }));
    }
    
    // Preparar información de código de barras
    const barcodeInfo: Record<string, any> = {};
    if (passData.barcode) {
      barcodeInfo.barcodes = [
        {
          message: passData.barcodeMessage || `PASS-${Date.now()}`,
          format: passData.barcodeFormat || "PKBarcodeFormatQR",
          messageEncoding: "iso-8859-1"
        }
      ];
      
      // Para compatibilidad con iOS antiguo
      barcodeInfo.barcode = {
        message: passData.barcodeMessage || `PASS-${Date.now()}`,
        format: passData.barcodeFormat || "PKBarcodeFormatQR",
        messageEncoding: "iso-8859-1"
      };
    }
    
    // Compilar el JSON completo del pase
    const passJSON = {
      ...basicInfo,
      ...colors,
      ...barcodeInfo,
      generic: genericFields
    };
    
    console.log("Pass structure prepared:", JSON.stringify(passJSON, null, 2));
    
    // Añadir el JSON del pase
    pass.addBuffer("pass.json", Buffer.from(JSON.stringify(passJSON)));
    
    // Agregar imágenes requeridas
    const simpleIcon = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAB0AAAAdCAYAAABWk2cPAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABISURBVEhL7c2hEQAwDAPBx/vvTKfJyxhMgLEq3cUVAPxhLdXztOF8klbP04bzSVo9TxvOJ2n1PG04n6TV87ThfJJWz9OGW7oLGUk9pCDtJ6sAAAAASUVORK5CYII=',
      'base64'
    );
    
    // Apple Wallet requiere estos archivos de imagen
    pass.addBuffer('icon.png', simpleIcon);
    pass.addBuffer('icon@2x.png', simpleIcon);
    pass.addBuffer('logo.png', simpleIcon);
    
    console.log("Pass configured, generating buffer...");
    
    // Generar buffer
    const passBuffer = pass.getAsBuffer();
    
    console.log("Pass generated successfully!");
    
    return passBuffer;
  } catch (error) {
    console.error('Error generating pass:', error);
    throw new Error(`Failed to generate pass: ${error instanceof Error ? error.message : String(error)}`);
  }
} 