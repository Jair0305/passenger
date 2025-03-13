import { PKPass } from 'passkit-generator';
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
export type PassType = 'eventTicket' | 'boardingPass' | 'coupon' | 'generic' | 'storeCard';

// Función para generar un pase digital
export async function generatePass(passType: PassType, passData: PassData): Promise<Buffer> {
  try {
    // Leer los certificados
    const wwdr = fs.readFileSync(applePassConfig.wwdrPath);
    const signerCert = fs.readFileSync(applePassConfig.signerCertPath);
    const signerKey = fs.readFileSync(applePassConfig.signerKeyPath);
    const signerKeyPassphrase = applePassConfig.signerKeyPassphrase;

    // Crear un pass vacío con los certificados
    const pass = new PKPass({}, {
      wwdr,
      signerCert,
      signerKey,
      signerKeyPassphrase
    });

    // Información básica del pase
    const passFields = {
      serialNumber: `pass-${Date.now()}`,
      passTypeIdentifier: applePassConfig.passTypeIdentifier,
      teamIdentifier: applePassConfig.teamIdentifier,
      organizationName: passData.organizationName || applePassConfig.organizationName,
      description: passData.description || applePassConfig.description,
      logoText: passData.logoText || '',
      
      // Colores
      foregroundColor: passData.foregroundColor || '#000000',
      backgroundColor: passData.backgroundColor || '#FFFFFF',
      labelColor: passData.labelColor || '#6B7280',
    };

    // Añadir propiedades al pass
    Object.entries(passFields).forEach(([key, value]) => {
      // @ts-ignore - Estamos añadiendo propiedades dinámicamente
      pass[key] = value;
    });

    // Añadir código de barras si está habilitado
    if (passData.barcode) {
      // Use the simple string overload which is safer
      pass.setBarcodes(passData.barcodeMessage || `PASS-${Date.now()}`);
    }

    // Crear estructura para los campos según el tipo de pase
    const fields: any = {
      headerFields: [],
      primaryFields: [
        {
          key: 'title',
          label: 'TITLE',
          value: passData.title
        }
      ],
      secondaryFields: [
        {
          key: 'location',
          label: 'LOCATION',
          value: passData.location
        }
      ],
      auxiliaryFields: [
        {
          key: 'date',
          label: 'DATE',
          value: passData.date,
          dateStyle: 'PKDateStyleMedium'
        },
        {
          key: 'time',
          label: 'TIME',
          value: `${passData.date}T${passData.time}:00`,
          timeStyle: 'PKTimeStyleShort'
        }
      ],
      backFields: []
    };

    // Añadir campos personalizados al reverso del pase
    if (passData.customFields && passData.customFields.length > 0) {
      fields.backFields = passData.customFields.map(field => ({
        key: field.key,
        label: field.label,
        value: field.value,
        textAlignment: field.textAlignment === 'left' 
          ? 'PKTextAlignmentLeft' 
          : field.textAlignment === 'right' 
            ? 'PKTextAlignmentRight' 
            : field.textAlignment === 'center' 
              ? 'PKTextAlignmentCenter' 
              : 'PKTextAlignmentNatural'
      }));
    }

    // Añadir los campos al tipo de pase correspondiente
    // @ts-ignore - Need to set the pass type fields dynamically
    pass[passType] = fields;

    // Generar el pase
    const pkpassBuffer = pass.getAsBuffer();
    return pkpassBuffer;
  } catch (error) {
    console.error('Error generating pass:', error);
    throw new Error(`Failed to generate pass: ${error instanceof Error ? error.message : String(error)}`);
  }
} 