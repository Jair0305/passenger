declare module 'pkpass' {
  interface PKPassOptions {
    model: string;
    certificates: {
      wwdr: string;
      signerCert: string;
      signerKey: {
        keyFile: string;
        passphrase?: string;
      };
    };
  }

  class PKPass {
    constructor(options: PKPassOptions);
    generate(): Promise<Buffer>;
  }

  export default PKPass;
} 