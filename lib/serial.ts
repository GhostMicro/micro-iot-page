import nacl from 'tweetnacl';

export interface SerialPayload {
    productId: number;
    version: number;
    hardwareId: number; // Unique integer for the device (random for now)
    expiry: number;
}

// Helpers for Base64 URL Safe
function toBase64(arr: Uint8Array): string {
    return Buffer.from(arr).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

export function generateSerialKey(payload: SerialPayload, privateKeyHex: string): string {
    const secretKey = Buffer.from(privateKeyHex, 'hex');
    if (secretKey.length !== 64) throw new Error("Invalid Private Key length");

    // 1. Serialize Payload
    const jsonStr = JSON.stringify(payload);
    const dataBytes = Buffer.from(jsonStr);

    // 2. Sign
    const signature = nacl.sign.detached(dataBytes, secretKey);

    // 3. Pack: Base64(Payload) + "." + Base64(Signature)
    return toBase64(dataBytes) + "." + toBase64(signature);
}
