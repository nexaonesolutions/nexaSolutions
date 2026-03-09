import { Request, Response } from 'express';
import { adminDb, adminAuth } from '../services/firebase-admin.service';

export const updateProfile = async (req: Request, res: Response) => {
  if (!adminDb) return res.status(500).json({ message: 'Firebase not initialized' });
  try {
    const userId = (req as any).user?.id || (req as any).userId;

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    const { name, email, avatar } = req.body;

    const updateData: any = {
      ...(name && { name }),
      ...(email && { email }),
      ...(avatar !== undefined && { avatar }),
      updatedAt: new Date().toISOString()
    };

    // Update Firestore record
    await adminDb.collection('users').doc(userId).update(updateData);

    res.status(200).json({ message: 'Perfil atualizado com sucesso!', ...updateData });
  } catch (error: any) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ message: 'Erro interno ao atualizar perfil.', error: error.message });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  if (!adminDb || !adminAuth) return res.status(500).json({ message: 'Firebase not initialized' });

  try {
    const userId = (req as any).user?.id || (req as any).userId;

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    try {
      // 1. Tenta deletar no Firebase Auth (se existir)
      await adminAuth.deleteUser(userId);
    } catch (authErr: any) {
      // Se o usuário não existir no Auth (ex: foi deletado na mão e ficou só no Firestore), apenas ignora e segue para deletar os dados
      if (authErr.code !== 'auth/user-not-found') {
        throw authErr;
      }
    }

    // 2. Deleta o documento do usuário no Firestore
    await adminDb.collection('users').doc(userId).delete();

    // Nota: Historicamente, se houver tabelas secundárias vinculadas ao ID (como orders), 
    // a deleção em cascata (cascade delete) pode ser feita aqui.
    // Para Landing Page, apenas o Perfil é o essencial por LGPD.

    res.status(200).json({ message: 'Conta deletada com sucesso.' });
  } catch (error: any) {
    console.error('Erro ao deletar conta:', error);
    res.status(500).json({ message: 'Erro interno ao deletar conta.', error: error.message });
  }
};