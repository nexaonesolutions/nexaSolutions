import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

try {
    if (!admin.apps.length) {
        const serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json');

        // Check if the service account key exists before trying to initialize with it
        if (fs.existsSync(serviceAccountPath)) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccountPath),
                projectId: 'nexasolutions-d14c7'
            });
            console.log('✅ Firebase Admin SDK initialized with Service Account Key.');
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
