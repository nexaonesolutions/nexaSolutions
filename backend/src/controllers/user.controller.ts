import { Request, Response } from 'express';
import { adminDb } from '../services/firebase-admin.service';

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