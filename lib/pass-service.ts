import PKPass from 'pkpass';
import fs from 'fs';
import path from 'path';
import { applePassConfig } from './apple-pass-config';

// Interfaz para los datos del pase
export interface PassData {
  title: string;
  subtitle: string;
  description: string;
  logoText: string;
  organizationName?: string;
  
  // Colores
  primaryColor: string;
  secondaryColor: string;
  backgroundColor?: string;
  foregroundColor?: string;
  labelColor?: string;
  logoTextColor?: string;
  
  // Ubicación y fechas
  location: string;
  date: string;
  time: string;
  
  // Opciones de configuración
  barcode: boolean;
  barcodeFormat?: string;
  barcodeMessage?: string;
  notifications: boolean;
  
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
}

// Tipo de pase
export type PassType = 'event' | 'loyalty' | 'coupon' | 'boarding' | 'generic' | 'storeCard';

// Función para convertir color hexadecimal a RGB
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return [0, 0, 0];
  }
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255
  ];
}

// Función para generar un pase digital
export async function generatePass(passType: PassType, passData: PassData): Promise<Buffer> {
  try {
    // Crear un directorio temporal para los archivos del pase
    const tempDir = path.join(process.cwd(), 'temp', `pass-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });

    // Crear el modelo de datos del pase
    const passJson: any = {
      formatVersion: 1,
      passTypeIdentifier: applePassConfig.passTypeIdentifier,
      teamIdentifier: applePassConfig.teamIdentifier,
      organizationName: passData.organizationName || applePassConfig.organizationName,
      description: passData.description || applePassConfig.description,
      serialNumber: `pass-${Date.now()}`,
      
      // Colores
      backgroundColor: hexToRgb(passData.backgroundColor || '#FFFFFF'),
      foregroundColor: hexToRgb(passData.foregroundColor || '#000000'),
      labelColor: hexToRgb(passData.labelColor || '#6B7280'),
      
      // Información específica del tipo de pase
      [passType]: {
        headerFields: [],
        primaryFields: [
          {
            key: 'title',
            label: 'EVENT',
            value: passData.title,
          }
        ],
        secondaryFields: [
          {
            key: 'location',
            label: 'LOCATION',
            value: passData.location,
          }
        ],
        auxiliaryFields: [
          {
            key: 'date',
            label: 'DATE',
            value: passData.date,
            dateStyle: 'PKDateStyleMedium',
          },
          {
            key: 'time',
            label: 'TIME',
            value: `${passData.date}T${passData.time}:00`,
            timeStyle: 'PKTimeStyleShort',
          }
        ],
        backFields: []
      }
    };

    // Agregar campos personalizados si existen
    if (passData.customFields && passData.customFields.length > 0) {
      passData.customFields.forEach(field => {
        passJson[passType].backFields.push({
          key: field.key,
          label: field.label,
          value: field.value,
          textAlignment: field.textAlignment || 'left'
        });
      });
    }

    // Agregar código de barras si está habilitado
    if (passData.barcode) {
      passJson.barcodes = [
        {
          message: passData.barcodeMessage || `PASS-${Date.now()}`,
          format: passData.barcodeFormat || 'PKBarcodeFormatQR',
          messageEncoding: 'iso-8859-1'
        }
      ];
    }

    // Guardar el archivo pass.json
    fs.writeFileSync(path.join(tempDir, 'pass.json'), JSON.stringify(passJson, null, 2));

    // Crear el pase
    const pass = new PKPass({
      model: tempDir,
      certificates: {
        wwdr: applePassConfig.certPath,
        signerCert: applePassConfig.certPath,
        signerKey: {
          keyFile: applePassConfig.p12Path,
          passphrase: applePassConfig.p12Password
        }
      }
    });

    // Generar el archivo .pkpass
    const pkpassBuffer = await pass.generate();

    // Limpiar el directorio temporal
    fs.rmSync(tempDir, { recursive: true, force: true });

    return pkpassBuffer;
  } catch (error) {
    console.error('Error generating pass:', error);
    throw new Error(`Failed to generate pass: ${error instanceof Error ? error.message : String(error)}`);
  }
} 