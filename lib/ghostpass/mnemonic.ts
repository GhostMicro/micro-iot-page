import { WORDLIST_2048 } from './data';

/**
 * 🛠️ GHOSTPASS v8.1 Engine
 * Implements the 12-Word Rule:
 */

export interface GhostPassData {
    role: number;       // 0-2047
    type: number;       // 0-2047
    name: number;       // 0-2047
    reserved1: number;  // 4th (Future)
    version: number;    // 0-2047
    model: number;      // 0-2047
    prodDate: number;   // 0-2047
    actDate: number;    // 0-2047
    expiryDate: number; // 0-2047
    sku: number;        // 0-2047
    reserved2: number;  // 11th (Future)
}

// Security Checksum calculation (Word 12)
function calculateChecksum(indices: number[], masterSecret: string): number {
    const dataString = indices.join('-') + masterSecret;
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
        const char = dataString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash) % 2048;
}

/**
 * 🔑 Encode: Data Object -> 12 Word Phrase
 */
export function encodeGhostPass(data: GhostPassData, masterSecret: string): string[] {
    const indices = [
        data.role % 2048,
        data.type % 2048,
        data.name % 2048,
        data.reserved1 % 2048,
        data.version % 2048,
        data.model % 2048,
        data.prodDate % 2048,
        data.actDate % 2048,
        data.expiryDate % 2048,
        data.sku % 2048,
        data.reserved2 % 2048
    ];

    const checksum = calculateChecksum(indices, masterSecret);
    indices.push(checksum);

    return indices.map(idx => WORDLIST_2048[idx]);
}

/**
 * 🔍 Decode: 12 Word Phrase -> Data Object (with validation)
 */
export function decodeGhostPass(phrase: string[], masterSecret: string): { data: GhostPassData; valid: boolean } {
    if (phrase.length !== 12) throw new Error("Invalid phrase length. Must be 12 words.");

    const indices = phrase.map(word => {
        const idx = WORDLIST_2048.indexOf(word.toLowerCase().trim());
        if (idx === -1) throw new Error(`Word not in wordlist: ${word}`);
        return idx;
    });

    const dataIndices = indices.slice(0, 11);
    const providedChecksum = indices[11];
    const expectedChecksum = calculateChecksum(dataIndices, masterSecret);

    const isValid = providedChecksum === expectedChecksum;

    return {
        valid: isValid,
        data: {
            role: dataIndices[0],
            type: dataIndices[1],
            name: dataIndices[2],
            reserved1: dataIndices[3],
            version: dataIndices[4],
            model: dataIndices[5],
            prodDate: dataIndices[6],
            actDate: dataIndices[7],
            expiryDate: dataIndices[8],
            sku: dataIndices[9],
            reserved2: dataIndices[10]
        }
    };
}
