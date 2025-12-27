import crypto from 'crypto';

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;
const IV_LENGTH = 16;
const ITERATIONS = 100000;
const DIGEST = 'sha512';
const ENCRYPTION_ALGORITHM = 'aes-256-cbc';

// Hashes a password with a salt using PBKDF2.
export function hashPassword(password: string): string {
    const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString('hex');
    return `${salt}:${hash}`;
}

// Compares a plaintext password with a stored hash.
export function comparePassword(password: string, storedHash: string): boolean {
    try {
        const [salt, hash] = storedHash.split(':');
        if (!salt || !hash) {
            // Fallback for plaintext passwords during transition
            return password === storedHash;
        }
        const hashToCompare = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString('hex');
        return hash === hashToCompare;
    } catch (error) {
        // If the stored hash is not in the expected format, treat as plaintext
        return password === storedHash;
    }
}

// Encrypts data using AES-256-CBC. Requires a secret key.
export function encrypt(text: string, secretKey: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, Buffer.from(secretKey, 'hex'), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
}

// Decrypts data using AES-256-CBC. Requires the same secret key.
export function decrypt(encryptedText: string, secretKey: string): string {
    try {
        const [ivHex, encrypted] = encryptedText.split(':');
        if (!ivHex || !encrypted) {
            throw new Error('Invalid encrypted text format');
        }
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, Buffer.from(secretKey, 'hex'), iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error("Decryption failed:", error);
        throw new Error("Decryption failed. Check the secret key and data integrity.");
    }
}
