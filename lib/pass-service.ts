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
  barcode: boolean | { message: string; format: string; messageEncoding: string };
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
  
  // Campos específicos por tipo de pase
  // Campos para tarjetas de fidelidad y tienda
  membershipNumber?: string;
  balance?: string;
  
  // Campos para cupones
  discount?: string;
  
  // Campos para pases de embarque
  flightNumber?: string;
  gate?: string;
  seat?: string;
  boardingTime?: string;
  
  // Campos para tarjetas de contacto
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactAddress?: string;
  contactWebsite?: string;
  contactJob?: string;
  contactCompany?: string;
  
  // Opciones de diseño avanzado
  headerAlignment?: string;
  primaryAlignment?: string;
  secondaryAlignment?: string;
  auxiliaryAlignment?: string;
  dateStyle?: string;
  timeStyle?: string;
  showReverse?: boolean;
  useAdvancedEditor?: boolean;
  customWidth?: number;
  customHeight?: number;
  allowCustomDimensions?: boolean;
  customPassType?: boolean;
  allowFullCustomization?: boolean;
  
  // Campos personalizados
  customFields?: Array<{
    key: string;
    label: string;
    value: string;
    textAlignment?: 'left' | 'center' | 'right' | 'natural';
  }>;
  
  // Campos personalizados para interfaz
  backFields?: Array<{
    key: string;
    label: string;
    value: string;
    textAlignment?: string;
  }>;
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
    if (passData.logoTextColor) basicInfo.logoTextColor = passData.logoTextColor;
    
    // Asegurarse de que los colores estén en formato hexadecimal correcto (Apple requiere #RRGGBB)
    for (const colorKey of ['foregroundColor', 'backgroundColor', 'labelColor', 'logoTextColor']) {
      if (basicInfo[colorKey] && typeof basicInfo[colorKey] === 'string') {
        const colorValue = basicInfo[colorKey] as string;
        if (!colorValue.startsWith('#')) {
          // Si el color no comienza con #, asumimos que es un nombre de color o formato rgb
          // y lo convertimos a hex (simplificado para este ejemplo)
          console.log(`Converting color format for ${colorKey}: ${colorValue}`);
          // Mantener el valor original si no podemos convertirlo
        }
      }
    }
    
    // Fechas de relevancia
    if (passData.relevantDate) basicInfo.relevantDate = passData.relevantDate;
    if (passData.expirationDate) basicInfo.expirationDate = passData.expirationDate;
    if (passData.voided !== undefined) basicInfo.voided = passData.voided;
    
    // Definir el JSON completo del pase con tipos más específicos
    type PassJsonType = {
      [key: string]: string | number | boolean | PKField[] | PKBarcode | PKBarcode[] | Record<string, PKField[]>;
    };
    
    const passJSON: PassJsonType = { ...basicInfo };
    
    // Comprobar si el campo barcode es un objeto con estructura de barcode o un booleano
    const hasBarcode = typeof passData.barcode === 'object' && passData.barcode !== null;
    
    if (hasBarcode && typeof passData.barcode === 'object') {
      // Si es un objeto con datos de barcode
      const barcodeObj = passData.barcode as { message?: string; format?: string; messageEncoding?: string };
      const barcodeMessage = barcodeObj.message || passData.barcodeMessage || `PASS-${Date.now()}`;
      const barcodeFormat = barcodeObj.format || passData.barcodeFormat || "QR";
      
      // Formato moderno de códigos
      const barcodeData: PKBarcode = {
        message: barcodeMessage,
        format: `PKBarcodeFormat${barcodeFormat.charAt(0).toUpperCase() + barcodeFormat.slice(1)}`,
        messageEncoding: "iso-8859-1"
      };
      
      passJSON.barcodes = [barcodeData];
      
      // Para compatibilidad con iOS antiguo
      passJSON.barcode = barcodeData;
    } else if (passData.barcodeMessage && passData.barcodeFormat) {
      // Usar los campos independientes si existen
      const barcodeData: PKBarcode = {
        message: passData.barcodeMessage,
        format: `PKBarcodeFormat${passData.barcodeFormat.charAt(0).toUpperCase() + passData.barcodeFormat.slice(1)}`,
        messageEncoding: "iso-8859-1"
      };
      
      passJSON.barcodes = [barcodeData];
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
    
    // Añadir campos específicos basados en el tipo de pase
    switch (effectivePassType) {
      case 'eventTicket':
        // Añadir campos específicos para eventos
        break;
        
      case 'coupon':
        // Añadir descuento si existe
        if (passData.discount) {
          fieldsData.primaryFields.push({
            key: "discount",
            label: "DISCOUNT",
            value: passData.discount,
            textAlignment: getPKTextAlignment(passData.primaryAlignment)
          });
        }
        break;
        
      case 'boardingPass':
        // Añadir información de vuelo
        if (passData.flightNumber) {
          fieldsData.primaryFields.push({
            key: "flightNumber",
            label: "FLIGHT",
            value: passData.flightNumber,
            textAlignment: getPKTextAlignment(passData.primaryAlignment)
          });
        }
        
        if (passData.gate) {
          fieldsData.secondaryFields.push({
            key: "gate",
            label: "GATE",
            value: passData.gate,
            textAlignment: getPKTextAlignment(passData.secondaryAlignment)
          });
        }
        
        if (passData.seat) {
          fieldsData.auxiliaryFields.push({
            key: "seat",
            label: "SEAT",
            value: passData.seat,
            textAlignment: getPKTextAlignment(passData.auxiliaryAlignment)
          });
        }
        
        if (passData.boardingTime) {
          fieldsData.auxiliaryFields.push({
            key: "boardingTime",
            label: "BOARDING",
            value: passData.boardingTime,
            textAlignment: getPKTextAlignment(passData.auxiliaryAlignment)
          });
        }
        break;
        
      case 'storeCard':
        // Añadir información de tarjeta de membresía
        if (passData.membershipNumber) {
          fieldsData.primaryFields.push({
            key: "membershipNumber",
            label: "MEMBERSHIP",
            value: passData.membershipNumber,
            textAlignment: getPKTextAlignment(passData.primaryAlignment)
          });
        }
        
        if (passData.balance) {
          fieldsData.secondaryFields.push({
            key: "balance",
            label: "BALANCE",
            value: passData.balance,
            textAlignment: getPKTextAlignment(passData.secondaryAlignment)
          });
        }
        break;
    }
    
    // Añadir campos de contacto si existen (para pases tipo tarjeta de contacto)
    if (passData.contactName) {
      fieldsData.backFields.push({
        key: "contactName",
        label: "NAME",
        value: passData.contactName,
        textAlignment: "PKTextAlignmentLeft"
      });
    }
    
    if (passData.contactPhone) {
      fieldsData.backFields.push({
        key: "contactPhone",
        label: "PHONE",
        value: passData.contactPhone,
        textAlignment: "PKTextAlignmentLeft"
      });
    }
    
    if (passData.contactEmail) {
      fieldsData.backFields.push({
        key: "contactEmail",
        label: "EMAIL",
        value: passData.contactEmail,
        textAlignment: "PKTextAlignmentLeft"
      });
    }
    
    if (passData.contactAddress) {
      fieldsData.backFields.push({
        key: "contactAddress",
        label: "ADDRESS",
        value: passData.contactAddress,
        textAlignment: "PKTextAlignmentLeft"
      });
    }
    
    if (passData.contactWebsite) {
      fieldsData.backFields.push({
        key: "contactWebsite",
        label: "WEBSITE",
        value: passData.contactWebsite,
        textAlignment: "PKTextAlignmentLeft"
      });
    }
    
    // Añadir campos personalizados del usuario si existen
    if (passData.backFields && passData.backFields.length > 0) {
      // Agregar a los campos existentes en backFields
      passData.backFields.forEach(field => {
        fieldsData.backFields.push({
          key: field.key,
          label: field.label,
          value: field.value,
          textAlignment: getPKTextAlignment(field.textAlignment)
        });
      });
    }
    
    // Añadir los campos según el tipo de pase
    passJSON[effectivePassType] = fieldsData;
    
    console.log("Pass structure prepared:", JSON.stringify(passJSON, null, 2));
    
    // Añadir el JSON del pase
    pass.addBuffer("pass.json", Buffer.from(JSON.stringify(passJSON)));
    
    // Icono genérico como respaldo
    const defaultIcon = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAB0AAAAdCAYAAABWk2cPAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABISURBVEhL7c2hEQAwDAPBx/vvTKfJyxhMgLEq3cUVAPxhLdXztOF8klbP04bzSVo9TxvOJ2n1PG04n6TV87ThfJJWz9OGW7oLGUk9pCDtJ6sAAAAASUVORK5CYII=',
      'base64'
    );
    
    // Funciones helper para procesar imágenes base64
    const processBase64Image = (base64String?: string): Buffer | null => {
      if (!base64String) return null;
      
      try {
        // Eliminar el prefijo "data:image/png;base64," si existe
        const base64Data = base64String.includes(',') 
          ? base64String.split(',')[1] 
          : base64String;
          
        return Buffer.from(base64Data, 'base64');
      } catch (error) {
        console.warn("Error processing base64 image:", error);
        return null;
      }
    };
    
    // Añadir imágenes desde los datos del pase si están disponibles
    const iconImage = processBase64Image(passData.iconImage) || defaultIcon;
    const logoImage = processBase64Image(passData.logoImage) || defaultIcon;
    const stripImage = processBase64Image(passData.stripImage);
    const footerImage = processBase64Image(passData.footerImage);
    const backgroundImage = processBase64Image(passData.backgroundImage);
    const thumbnailImage = processBase64Image(passData.thumbnailImage);
    
    // Apple Wallet requiere estos archivos de imagen
    pass.addBuffer('icon.png', iconImage);
    pass.addBuffer('icon@2x.png', iconImage);
    pass.addBuffer('logo.png', logoImage);
    pass.addBuffer('logo@2x.png', logoImage);
    
    // Añadir imágenes opcionales si están disponibles
    if (stripImage) {
      pass.addBuffer('strip.png', stripImage);
      pass.addBuffer('strip@2x.png', stripImage);
    }
    
    if (footerImage) {
      pass.addBuffer('footer.png', footerImage);
      pass.addBuffer('footer@2x.png', footerImage);
    }
    
    if (backgroundImage) {
      pass.addBuffer('background.png', backgroundImage);
      pass.addBuffer('background@2x.png', backgroundImage);
    }
    
    if (thumbnailImage) {
      pass.addBuffer('thumbnail.png', thumbnailImage);
      pass.addBuffer('thumbnail@2x.png', thumbnailImage);
    }
    
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