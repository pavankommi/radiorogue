import FingerprintJS from '@fingerprintjs/fingerprintjs';

// Function to get the fingerprint (visitorId)
export const getFingerprint = async (): Promise<string> => {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    return result.visitorId; // Unique identifier
};
