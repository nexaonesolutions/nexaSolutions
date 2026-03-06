const admin = require('firebase-admin');

// Load service account key
const serviceAccount = require('./src/config/firebase-service-account.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function deleteCollection(collectionPath, batchSize) {
    const collectionRef = db.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(db, query, resolve).catch(reject);
    });
}

async function deleteQueryBatch(db, query, resolve) {
    const snapshot = await query.get();

    const batchSize = snapshot.size;
    if (batchSize === 0) {
        // When there are no documents left, we are done
        resolve();
        return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });

    await batch.commit();

    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(() => {
        deleteQueryBatch(db, query, resolve);
    });
}

async function clearDb() {
    console.log('Clearing old data from Firestore...');
    try {
        await deleteCollection('orders', 100);
        console.log('Orders cleared.');
        await deleteCollection('messages', 100);
        console.log('Messages cleared.');
        await deleteCollection('chat_meta', 100);
        console.log('Chat Meta cleared.');
        await deleteCollection('activity', 100);
        console.log('Activity cleared.');
        console.log('Database successfully cleared!');
        process.exit(0);
    } catch (e) {
        console.error('Error clearing database:', e);
        process.exit(1);
    }
}

clearDb();
