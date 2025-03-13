# Apple Wallet Pass Generator

A Next.js application for generating Apple Wallet passes using the passkit-generator library.

## Features

- Generate Apple Wallet passes with custom data
- Support for different pass types (generic, eventTicket, etc.)
- Customizable fields, colors, and barcodes
- API endpoint for pass generation

## Prerequisites

- Node.js 18.x or higher
- Apple Developer Account with Pass Type ID certificate
- PEM files for certificate validation

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd passenger
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables in `.env.local`:

```
APPLE_TEAM_ID=<your-team-id>
PASS_TYPE_IDENTIFIER=<your-pass-type-identifier>
SIGNER_KEY_PASSPHRASE=<your-signer-key-passphrase>
```

4. Add your certificates to the `certificates` directory:
   - `wwdr.pem` - Apple Worldwide Developer Relations Certificate
   - `signerCert.pem` - Your Pass Type ID Certificate
   - `signerKey.pem` - Your private key

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000/test](http://localhost:3000/test) to access the test page for generating passes.

## Generating a Pass

You can generate a pass by making a POST request to the `/api/passes` endpoint with the following data structure:

```json
{
  "passType": "generic",
  "passData": {
    "title": "Test Pass",
    "subtitle": "Subtitle",
    "description": "Test Pass Description",
    "logoText": "Test Company",
    "organizationName": "Test Organization",

    "primaryColor": "#FF0000",
    "secondaryColor": "#0000FF",
    "backgroundColor": "#FFFFFF",
    "foregroundColor": "#000000",
    "labelColor": "#666666",

    "location": "Sample Location",
    "date": "2023-12-31",
    "time": "14:30",

    "barcode": true,
    "barcodeFormat": "PKBarcodeFormatQR",
    "barcodeMessage": "TEST-PASS-123456",
    "notifications": true,

    "customFields": [
      {
        "key": "custom1",
        "label": "Custom Field 1",
        "value": "Custom Value 1",
        "textAlignment": "left"
      }
    ]
  }
}
```

## Deployment with Docker

Build and run the application using Docker:

```bash
docker-compose up -d
```

## Additional Resources

- [passkit-generator Documentation](https://github.com/alexandercerutti/passkit-generator/wiki/API-Documentation-Reference)
- [Apple Wallet Developer Guide](https://developer.apple.com/documentation/walletpasses)
- [PKPass Validator](https://pkpassvalidator.azurewebsites.net/) - Useful for validating generated passes

## License

[MIT](LICENSE)
