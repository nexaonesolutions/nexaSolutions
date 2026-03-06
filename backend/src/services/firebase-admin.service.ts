import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

try {
    if (!admin.apps.length) {
        const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
        const serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json');

        if (serviceAccountEnv) {
            // Priority: Environment Variable (Perfect for Render/Vercel)
            const serviceAccount = JSON.parse(serviceAccountEnv);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: 'nexasolutions-d14c7'
            });
            console.log('✅ Firebase Admin SDK initialized via Environment Variable.');
        } else if (fs.existsSync(serviceAccountPath)) {
            // Fallback: Local file (Local development)
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccountPath),
                projectId: 'nexasolutions-d14c7'
            });
            console.log('✅ Firebase Admin SDK initialized with local Service Account Key file.');
        } else {
            admin.initializeApp({
                projectId: 'nexasolutions-d14c7'
            });
            console.log('⚠️ Firebase Admin SDK initialized without Service Account Key. Some features (like password update) may fail.');
        }
    }
} catch (e) {
    console.error('Firebase Admin init error (check credentials):', e);
}

export const adminAuth = admin.apps.length ? admin.auth() : null;
export const adminDb = admin.apps.length ? admin.firestore() : null;
