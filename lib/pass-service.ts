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

// Interfaz para los campos personalizados procesados
interface PKField {
  key: string;
  label: string;
  value: string;
  textAlignment?: string;
  dateStyle?: string;
  timeStyle?: string;
}

// Interfaz para el código de barras
interface PKBarcode {
  message: string;
  format: string;
  messageEncoding: string;
}

// Función para convertir el formato de alineación de texto al esperado por Apple Wallet
function getPKTextAlignment(alignment?: string): string {
  if (!alignment) return 'PKTextAlignmentNatural';
  
  switch (alignment.toLowerCase()) {
    case 'left': return 'PKTextAlignmentLeft';
    case 'center': return 'PKTextAlignmentCenter';
    case 'right': return 'PKTextAlignmentRight';
    default: return 'PKTextAlignmentNatural';
  }
}

// Función para convertir el estilo de fecha/hora al esperado por Apple Wallet
function getPKDateTimeStyle(style?: string): string | undefined {
  if (!style || style === 'none') return undefined;
  
  switch (style.toLowerCase()) {
    case 'short': return 'PKDateStyleShort';
    case 'medium': return 'PKDateStyleMedium';
    case 'long': return 'PKDateStyleLong';
    case 'full': return 'PKDateStyleFull';
    default: return undefined;
  }
}

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
    
    // Determinar el tipo de pase efectivo
    // Si el usuario solicita personalización completa, usamos 'generic'
    // De lo contrario, usamos el tipo solicitado
    const effectivePassType = passData.customPassType ? 'generic' : passType;
    
    // Crear una instancia de PKPass
    const pass = new PKPass({}, {
      wwdr,
      signerCert,
      signerKey,
      signerKeyPassphrase: applePassConfig.signerKeyPassphrase
    });

    // Importante: Establecer el tipo explícitamente
    pass.type = effectivePassType;
    
    // Preparar la información básica del pase
    const basicInfo: Record<string, string | number | boolean> = {
      formatVersion: 1,
      passTypeIdentifier: applePassConfig.passTypeIdentifier,
      serialNumber: `pass-${Date.now()}`,
      teamIdentifier: applePassConfig.teamIdentifier,
      organizationName: passData.organizationName || applePassConfig.organizationName,
      description: passData.description || applePassConfig.description,
      logoText: passData.logoText || "Logo Text",
    };
    
    // Aplicar colores
    if (passData.foregroundColor) basicInfo.foregroundColor = passData.foregroundColor;
    if (passData.backgroundColor) basicInfo.backgroundColor = passData.backgroundColor;
    if (passData.labelColor) basicInfo.labelColor = passData.labelColor;
    
    // Fechas de relevancia
    if (passData.relevantDate) basicInfo.relevantDate = passData.relevantDate;
    if (passData.expirationDate) basicInfo.expirationDate = passData.expirationDate;
    if (passData.voided !== undefined) basicInfo.voided = passData.voided;
    
    // Definir el JSON completo del pase con tipos más específicos
    type PassJsonType = {
      [key: string]: string | number | boolean | PKField[] | PKBarcode | PKBarcode[] | Record<string, PKField[]>;
    };
    
    const passJSON: PassJsonType = { ...basicInfo };
    
    if (passData.barcode) {
      // Formato moderno de códigos
      const barcodeData: PKBarcode = {
        message: passData.barcodeMessage || `PASS-${Date.now()}`,
        format: passData.barcodeFormat ? `PKBarcodeFormat${passData.barcodeFormat.charAt(0).toUpperCase() + passData.barcodeFormat.slice(1)}` : "PKBarcodeFormatQR",
        messageEncoding: "iso-8859-1"
      };
      
      passJSON.barcodes = [barcodeData];
      
      // Para compatibilidad con iOS antiguo
      passJSON.barcode = barcodeData;
    }
    
    // Preparar los campos del pase según su tipo
    const fieldsData: Record<string, PKField[]> = {
      primaryFields: [
        {
          key: "title",
          label: effectivePassType === 'eventTicket' ? "EVENT" : "TITLE",
          value: passData.title,
          textAlignment: getPKTextAlignment(passData.primaryAlignment)
        }
      ],
      secondaryFields: [
        {
          key: "location",
          label: "LOCATION",
          value: passData.location,
          textAlignment: getPKTextAlignment(passData.secondaryAlignment)
        }
      ],
      auxiliaryFields: [],
      backFields: []
    };
    
    // Añadir subtítulo si existe
    if (passData.subtitle) {
      fieldsData.secondaryFields.push({
        key: "subtitle",
        label: "SUBTITLE",
        value: passData.subtitle,
        textAlignment: getPKTextAlignment(passData.secondaryAlignment)
      });
    }
    
    // Añadir fecha con el estilo apropiado
    const dateField: PKField = {
      key: "date",
      label: "DATE",
      value: passData.date,
      textAlignment: getPKTextAlignment(passData.auxiliaryAlignment)
    };
    
    // Aplicar estilos de fecha/hora si están definidos
    if (passData.dateStyle) {
      const dateStyleValue = getPKDateTimeStyle(passData.dateStyle);
      if (dateStyleValue) dateField.dateStyle = dateStyleValue;
    }
    
    fieldsData.auxiliaryFields.push(dateField);
    
    // Añadir hora si existe
    if (passData.time) {
      const timeField: PKField = {
        key: "time",
        label: "TIME",
        value: passData.time,
        textAlignment: getPKTextAlignment(passData.auxiliaryAlignment)
      };
      
      // Aplicar estilo de hora si está definido
      if (passData.timeStyle) {
        const timeStyleValue = getPKDateTimeStyle(passData.timeStyle);
        if (timeStyleValue) timeField.timeStyle = timeStyleValue;
      }
      
      fieldsData.auxiliaryFields.push(timeField);
    }
    
    // Añadir campos personalizados si existen
    if (passData.customFields && passData.customFields.length > 0) {
      fieldsData.backFields = passData.customFields.map(field => ({
        key: field.key,
        label: field.label,
        value: field.value,
        textAlignment: getPKTextAlignment(field.textAlignment)
      }));
    }
    
    // Añadir los campos según el tipo de pase
    passJSON[effectivePassType] = fieldsData;
    
    console.log("Pass structure prepared:", JSON.stringify(passJSON, null, 2));
    
    // Añadir el JSON del pase
    pass.addBuffer("pass.json", Buffer.from(JSON.stringify(passJSON)));
    
    // Añadir imágenes requeridas
    const simpleIcon = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAB0AAAAdCAYAAABWk2cPAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABISURBVEhL7c2hEQAwDAPBx/vvTKfJyxhMgLEq3cUVAPxhLdXztOF8klbP04bzSVo9TxvOJ2n1PG04n6TV87ThfJJWz9OGW7oLGUk9pCDtJ6sAAAAASUVORK5CYII=',
      'base64'
    );
    
    // Apple Wallet requiere estos archivos de imagen
    pass.addBuffer('icon.png', simpleIcon);
    pass.addBuffer('icon@2x.png', simpleIcon);
    pass.addBuffer('logo.png', simpleIcon);
    
    // Añadir imágenes adicionales si están disponibles
    // Estas serían implementadas en una versión real pero están fuera del alcance de esta demostración
    
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