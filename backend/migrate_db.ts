import { promises as fs } from 'fs';
import * as admin from 'firebase-admin';
import path from 'path';

const serviceAccountPath = path.resolve(__dirname, './serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
    projectId: 'nexasolutions-d14c7'
});

const adminDb = admin.firestore();

async function migrate() {
    try {
        const data = await fs.readFile(path.resolve(__dirname, './src/db.json'), 'utf-8');
        const db = JSON.parse(data);

        console.log('Migrating users...');
        for (const user of db.users || []) {
            const snap = await adminDb.collection('users').where('email', '==', user.email).get();
            if (snap.empty) {
                // Not in Firestore
                const newUserRef = adminDb.collection('users').doc();
                const fbUser = {
                    ...user,
                    id: newUserRef.id,
                };
                await newUserRef.set(fbUser);
                console.log(`Migrated user: ${user.email} (new ID: ${newUserRef.id})`);
            } else {
                console.log(`User already exists in Firestore: ${user.email}`);
            }
        }

        console.log('Migrating orders...');
        for (const order of db.orders || []) {
            const snap = await adminDb.collection('orders').doc(order.id).get();
            if (!snap.exists) {
                await adminDb.collection('orders').doc(order.id).set(order);
                console.log(`Migrated order: ${order.id}`);
            } else {
                console.log(`Order already exists in Firestore: ${order.id}`);
            }
        }

        console.log('Migration complete.');
    } catch (e) {
        console.error('Error during migration:', e);
    }
}

migrate();
