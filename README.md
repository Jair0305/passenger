# Passenger - Generador de Pases Digitales para Apple Wallet

Esta aplicación te permite crear pases digitales para Apple Wallet utilizando tus certificados de Apple Developer.

## Requisitos Previos

Para utilizar esta aplicación, necesitas:

1. Una cuenta de Apple Developer
2. Certificados de Apple Developer para la creación de pases digitales
3. Node.js 18.0.0 o superior

## Configuración de Certificados

La aplicación espera encontrar los siguientes archivos en la carpeta `appledeveloper`:

- `Certificates.p12`: Tu certificado P12 exportado desde Keychain Access
- `pass.cer`: Tu certificado de tipo de pase descargado desde Apple Developer Portal

### Obtener los Certificados

1. Inicia sesión en [Apple Developer Portal](https://developer.apple.com)
2. Ve a "Certificates, Identifiers & Profiles"
3. Crea un nuevo "Pass Type ID" en la sección "Identifiers"
4. Genera un certificado para ese Pass Type ID
5. Descarga e instala el certificado en tu Keychain Access
6. Exporta el certificado como archivo .p12 (asegúrate de recordar la contraseña)
7. Coloca los archivos en la carpeta `appledeveloper`

## Configuración de Variables de Entorno

Crea un archivo `.env.local` con las siguientes variables:

```env
# Contraseña del certificado P12 (si es necesaria)
P12_PASSWORD=tu_contraseña

# ID del equipo de Apple Developer
APPLE_TEAM_ID=tu_team_id

# ID del tipo de pase
PASS_TYPE_IDENTIFIER=pass.com.tuempresa.passenger
```

## Instalación

```bash
npm install
# o
yarn install
# o
pnpm install
# o
bun install
```

## Desarrollo

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
# o
bun dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

## Uso

1. Completa los campos del formulario para personalizar tu pase digital
2. Visualiza la vista previa en tiempo real
3. Haz clic en "Descargar Pase Digital (.pkpass)" para generar y descargar el pase
4. Abre el archivo .pkpass en tu dispositivo iOS para añadirlo a Apple Wallet

## Tecnologías Utilizadas

- Next.js
- React
- TypeScript
- Tailwind CSS
- pkpass (para la generación de pases digitales)

## Licencia

MIT

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.