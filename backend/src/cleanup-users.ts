import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env before anything else
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { adminAuth, adminDb } from './services/firebase-admin.service';

const ADMIN_EMAIL = 'nexa2114@gmail.com';

const cleanup = async () => {
    console.log('🚀 Iniciando limpeza de usuários...');

    try {
        if (!adminAuth || !adminDb) {
            console.error('❌ Firebase Admin não pôde ser inicializado. Verifique as credenciais.');
            process.exit(1);
        }

        // 1. Listar usuários do Firebase Auth
        const listUsers = await adminAuth.listUsers();
        const usersToDelete = listUsers.users.filter(user => user.email !== ADMIN_EMAIL);

        console.log(`📊 Encontrados ${usersToDelete.length} usuários para remover.`);

        if (usersToDelete.length === 0) {
            console.log('✅ Nenhum usuário para remover (apenas o admin existe).');
            process.exit(0);
        }

        for (const user of usersToDelete) {
            console.log(`🗑️ Removendo: ${user.email} (${user.uid})`);

            try {
                // Deletar do Auth
                await adminAuth.deleteUser(user.uid);

                // Deletar do Firestore Users
                await adminDb.collection('users').doc(user.uid).delete();

                // Deletar pedidos (orders) associados a este usuário
                const ordersSnapshot = await adminDb.collection('orders').where('userId', '==', user.uid).get();
                if (!ordersSnapshot.empty) {
                    const orderBatch = adminDb.batch();
                    ordersSnapshot.forEach(doc => {
                        orderBatch.delete(doc.ref);
                    });
                    await orderBatch.commit();
                    console.log(`  - ${ordersSnapshot.size} pedidos removidos.`);
                }

                // Deletar atividade (activity) associada
                const activitySnapshot = await adminDb.collection('activity').where('userId', '==', user.uid).get();
                if (!activitySnapshot.empty) {
                    const activityBatch = adminDb.batch();
                    activitySnapshot.forEach(doc => {
                        activityBatch.delete(doc.ref);
                    });
                    await activityBatch.commit();
                    console.log(`  - ${activitySnapshot.size} atividades removidas.`);
                }

                console.log(`✅ Sucesso para: ${user.email}`);
            } catch (userErr) {
                console.error(`⚠️ Erro ao processar usuário ${user.email}:`, userErr);
            }
        }

        console.log('✨ Limpeza concluída!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro na limpeza:', error);
        process.exit(1);
    }
};

cleanup();
