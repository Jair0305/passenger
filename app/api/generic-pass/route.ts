import { NextRequest, NextResponse } from 'next/server';
import { PKPass } from 'passkit-generator';
import fs from 'fs';
import { applePassConfig } from '@/lib/apple-pass-config';

// Interface for custom field
interface CustomField {
  key: string;
  label: string;
  value: string;
  textAlignment?: 'left' | 'center' | 'right' | 'natural';
}

// Interfaz para el contenido del pase
interface PassContent {
  formatVersion: number;
  passTypeIdentifier: string;
  serialNumber: string;
  teamIdentifier: string;
  organizationName: string;
  description: string;
  logoText: string;
  foregroundColor: string;
  backgroundColor: string;
  labelColor: string;
  generic: {
    primaryFields: Array<{key: string, label: string, value: string}>;
    secondaryFields: Array<{key: string, label: string, value: string}>;
    auxiliaryFields: Array<{key: string, label: string, value: string}>;
    backFields: Array<{key: string, label: string, value: string, textAlignment?: string}>;
  };
  barcodes?: Array<{
    message: string;
    format: string;
    messageEncoding: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    console.log("Certificates info:", {
      wwdrPath: applePassConfig.wwdrPath,
      signerCertPath: applePassConfig.signerCertPath,
      signerKeyPath: applePassConfig.signerKeyPath,
      teamId: applePassConfig.teamIdentifier,
      passTypeId: applePassConfig.passTypeIdentifier
    });
    
    // Verify certificates
    if (!fs.existsSync(applePassConfig.wwdrPath)) {
      return NextResponse.json(
        { error: 'WWDR certificate file not found' },
        { status: 500 }
      );
    }
    
    if (!fs.existsSync(applePassConfig.signerCertPath)) {
      return NextResponse.json(
        { error: 'Signer certificate file not found' },
        { status: 500 }
      );
    }
    
    if (!fs.existsSync(applePassConfig.signerKeyPath)) {
      return NextResponse.json(
        { error: 'Signer key file not found' },
        { status: 500 }
      );
    }

    console.log("All certificates found, proceeding...");
    
    // Get pass data from request
    const passData = await request.json();
    
    // Read certificate files
    const wwdr = fs.readFileSync(applePassConfig.wwdrPath);
    const signerCert = fs.readFileSync(applePassConfig.signerCertPath);
    const signerKey = fs.readFileSync(applePassConfig.signerKeyPath);
    
    console.log("Certificates loaded, creating pass...");

    // Create pass content
    const passContent: PassContent = {
      formatVersion: 1,
      passTypeIdentifier: applePassConfig.passTypeIdentifier,
      serialNumber: `pass-${Date.now()}`,
      teamIdentifier: applePassConfig.teamIdentifier,
      organizationName: passData.organizationName || "Generic Organization",
      description: passData.description || "Generic Pass",
      logoText: passData.logoText || "Logo Text",
      foregroundColor: passData.foregroundColor || "rgb(0, 0, 0)",
      backgroundColor: passData.backgroundColor || "rgb(255, 255, 255)", 
      labelColor: passData.labelColor || "rgb(136, 136, 136)",
      generic: {
        primaryFields: [
          {
            key: "title",
            label: "TITLE",
            value: passData.title || "Generic Pass"
          }
        ],
        secondaryFields: [
          {
            key: "location",
            label: "LOCATION",
            value: passData.location || "Sample Location"
          }
        ],
        auxiliaryFields: [
          {
            key: "date",
            label: "DATE",
            value: passData.date || "2023-12-31"
          }
        ],
        backFields: []
      }
    };

    // Add custom fields if provided
    if (passData.customFields && Array.isArray(passData.customFields) && passData.customFields.length > 0) {
      passContent.generic.backFields = passData.customFields.map((field: CustomField) => ({
        key: field.key,
        label: field.label,
        value: field.value,
        textAlignment: field.textAlignment || 'PKTextAlignmentLeft'
      }));
    }
    
    // Add barcode if enabled
    if (passData.barcode) {
      passContent.barcodes = [
        {
          message: passData.barcodeMessage || "GENERIC-TEST-123",
          format: "PKBarcodeFormatQR",
          messageEncoding: "iso-8859-1"
        }
      ];
    }
    
    // Create a new pass
    const pass = new PKPass({}, {
      wwdr,
      signerCert,
      signerKey,
      signerKeyPassphrase: applePassConfig.signerKeyPassphrase
    });
    
    // Add pass.json
    pass.addBuffer("pass.json", Buffer.from(JSON.stringify(passContent)));
    
    // Add required images - basic black icon as PNG
    const simpleIcon = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAB0AAAAdCAYAAABWk2cPAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABISURBVEhL7c2hEQAwDAPBx/vvTKfJyxhMgLEq3cUVAPxhLdXztOF8klbP04bzSVo9TxvOJ2n1PG04n6TV87ThfJJWz9OGW7oLGUk9pCDtJ6sAAAAASUVORK5CYII=',
      'base64'
    );
    pass.addBuffer('icon.png', simpleIcon);
    pass.addBuffer('icon@2x.png', simpleIcon);
    
    console.log("Pass configured, generating buffer...");
    
    // Generate buffer
    const passBuffer = pass.getAsBuffer();
    
    console.log("Pass generated successfully!");
    
    // Return the pass as a downloadable file
    return new NextResponse(passBuffer, {
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename="generic-pass-${Date.now()}.pkpass"`,
      },
    });
  } catch (error) {
    console.error('Error generating generic pass:', error);
    return NextResponse.json(
      { error: `Failed to generate pass: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 