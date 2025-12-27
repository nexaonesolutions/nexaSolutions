import { Request, Response } from 'express';
import User from '../User';
import bcrypt from 'bcryptjs';

export const updateProfile = async (req: Request, res: Response) => {
  try {
    // O ID do usuário deve vir do middleware de autenticação (req.user ou req.userId)
    const userId = (req as any).user?.id || (req as any).userId;

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    const { name, email, password, avatar } = req.body;

    // Verifica se o email já está em uso por outro usuário (caso esteja mudando o email)
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Este email já está em uso.' });
      }
    }

    const updateData: any = {
      ...(name && { name }),
      ...(email && { email }),
      ...(avatar !== undefined && { avatar })
    };

    // Se houver senha, criptografa antes de salvar
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.status(200).json(updatedUser);
  } catch (error: any) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ message: 'Erro interno ao atualizar perfil.', error: error.message });
  }
};