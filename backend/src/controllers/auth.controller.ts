import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { adminAuth, adminDb } from '../services/firebase-admin.service';
import dotenv from 'dotenv';
import { isValidCpf, isValidPassword, isValidPhone } from '../services/validation.service';
import { hashPassword, comparePassword } from '../services/security.service';
import { rateLimitAndSanitize, resetLoginAttempts } from '../middleware/sanitize-middleware';
import crypto from 'crypto';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || 'averysecuresecretkey'; // Fallback for development

interface User {
  id: string; // Changed to string for Firestore doc IDs
  email: string;
  password?: string; // Will be a hashed password, optional if using Firebase Auth
  name?: string;
  cpf: string;
  phone: string;
  role?: 'client' | 'admin';
}

/**
 * Registers a new user.
 */
export const register = [rateLimitAndSanitize, async (req: Request, res: Response) => {
  console.log('--- Registration attempt ---');
  const { email, password, name, cpf, phone } = req.body;

  if (!email || !password || !cpf || !phone) {
    return res.status(400).json({ message: 'Email, password, CPF, and phone are required' });
  }

  if (!isValidCpf(cpf)) {
    return res.status(400).json({ message: 'Invalid CPF' });
  }

  if (!isValidPassword(password)) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long and contain at least one uppercase and one lowercase letter.' });
  }

  if (!isValidPhone(phone)) {
    return res.status(400).json({ message: 'Invalid phone number format' });
  }

  if (!adminDb) return res.status(500).json({ message: 'Firebase not initialized' });

  try {
    const usersRef = adminDb.collection('users');

    // 1. Verificações de Unicidade
    const existingEmailSnap = await usersRef.where('email', '==', email).get();
    if (!existingEmailSnap.empty) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const cleanedCpf = cpf.replace(/[^\d]+/g, '');
    const cleanedPhone = phone.replace(/[^\d]+/g, '');

    const existingCpfSnap = await usersRef.where('cpf', '==', cleanedCpf).get();
    if (!existingCpfSnap.empty) {
      return res.status(409).json({ message: 'CPF already in use' });
    }

    const existingPhoneSnap = await usersRef.where('phone', '==', cleanedPhone).get();
    if (!existingPhoneSnap.empty) {
      return res.status(409).json({ message: 'Phone already in use' });
    }

    // 2. Registro no Firebase Auth (Obrigatório para o funcionamento do Frontend)
    let fbUid = undefined;
    if (adminAuth) {
      try {
        const userRecord = await adminAuth.createUser({
          email,
          password,
          displayName: name,
        });
        fbUid = userRecord.uid;
      } catch (fbErr: any) {
        console.error('Firebase Auth creation error:', fbErr.message);
        if (fbErr.code === 'auth/email-already-exists') {
          return res.status(409).json({ message: 'Email already in use' });
        }
        return res.status(500).json({ message: 'Erro ao criar autenticação', error: fbErr.message });
      }
    } else {
      return res.status(500).json({ message: 'Serviço de autenticação indiponível' });
    }

    // 3. Persistência no Firestore
    const hashedPassword = await hashPassword(password);
    const newDocRef = usersRef.doc(fbUid); // Usamos o UID do Firebase como ID do documento

    const newUser: User = {
      id: newDocRef.id,
      email,
      password: hashedPassword,
      name: name || '',
      cpf: cleanedCpf,
      phone: cleanedPhone,
      role: 'client'
    };

    await newDocRef.set(newUser);
    console.log('Successfully registered new user:', newUser.email);

    const userResponse = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      cpf: newUser.cpf,
      phone: newUser.phone
    };

    const accessToken = jwt.sign({ id: newUser.id, role: newUser.role }, SECRET_KEY, { expiresIn: '3d' });
    res.status(201).json({ message: 'User registered successfully', token: accessToken, user: userResponse });
  } catch (err: any) {
    console.error('Registration Catch Error:', err);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
}];

/**
 * Logs in a user.
 */
export const login = [rateLimitAndSanitize, async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const ip = req.ip;

  try {
    console.log('--- /api/auth/login received ---');
  } catch (e) { }

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  if (!adminDb) return res.status(500).json({ message: 'Firebase not initialized' });

  try {
    const normalizedEmail = email.toLowerCase();
    const usersSnap = await adminDb.collection('users').where('email', '==', normalizedEmail).limit(1).get();
    if (usersSnap.empty) {
      console.log(`[Login Fallback] User not found for email: ${normalizedEmail}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const doc = usersSnap.docs[0];
    const user = doc.data() as User;

    if (!user.password || !(await comparePassword(password, user.password))) {
      console.log(`[Login Fallback] Password mismatch for email: ${normalizedEmail}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    resetLoginAttempts(ip || 'unknown');

    // SYNC WITH FIREBASE AUTH
    if (adminAuth) {
      try {
        let fbUid;
        try {
          const fbUser = await adminAuth.getUserByEmail(email);
          fbUid = fbUser.uid;
          await adminAuth.updateUser(fbUid, { password });
        } catch (fbErr: any) {
          if (fbErr.code === 'auth/user-not-found') {
            const newFbUser = await adminAuth.createUser({
              uid: doc.id,
              email: user.email,
              password,
              displayName: user.name
            });
            fbUid = newFbUser.uid;
          }
        }
      } catch (err) {
        console.error('Failed to sync password to Firebase Auth:', err);
      }
    }

    console.log('User logged in:', user.email);
    const userResponse = {
      id: doc.id,
      email: user.email,
      name: user.name,
      role: user.role || 'client',
      cpf: user.cpf,
      phone: user.phone
    };

    const accessToken = jwt.sign({ id: doc.id, role: user.role || 'client' }, SECRET_KEY, { expiresIn: '3d' });
    res.status(200).json({ message: 'Login successful', token: accessToken, user: userResponse });
  } catch (err: any) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
}];

/**
 * Requests a password reset. Calculates and stores a 6-digit OTP using nodemailer.
 */
export const forgotPassword = [rateLimitAndSanitize, async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  if (!adminDb) return res.status(500).json({ message: 'Firebase not initialized' });

  try {
    const userSnap = await adminDb.collection('users').where('email', '==', email).limit(1).get();
    if (userSnap.empty) {
      return res.status(200).json({ message: 'Se o e-mail existir, um código foi enviado.' });
    }

    const user = userSnap.docs[0].data() as User;
    const code = Array.from(crypto.randomFillSync(new Uint8Array(6)))
      .map((n) => '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'[n % 36])
      .join('');

    const codeExpires = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins expiry

    // Delete old resets for this email
    const resetsRef = adminDb.collection('resets');
    const oldResets = await resetsRef.where('email', '==', email).get();
    const batch = adminDb.batch();
    oldResets.docs.forEach((d) => batch.delete(d.ref));

    // Create new reset
    const newResetRef = resetsRef.doc();
    batch.set(newResetRef, {
      email,
      code,
      expires: codeExpires,
      verified: false
    });

    await batch.commit();

    // Send the actual code via Nodemailer
    try {
      const { sendEmail } = await import('../services/email.service');

      const emailBody = `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f5; padding: 40px; text-align: center;">
          <div style="background-color: #ffffff; max-width: 500px; margin: 0 auto; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <h2 style="color: #000; font-size: 24px; font-weight: bold; margin-bottom: 20px;">Redefinição de Senha</h2>
            <p style="color: #52525b; font-size: 16px; margin-bottom: 30px;">
               Recebemos uma solicitação para redefinir a senha da sua conta na Nexa Solutions. Copie o código abaixo e cole no aplicativo para continuar:
            </p>
            <div style="background-color: #e0f2fe; border: 1px solid #7dd3fc; padding: 15px; border-radius: 8px; margin-bottom: 30px;">
               <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0284c7;">${code}</span>
            </div>
            <p style="color: #a1a1aa; font-size: 14px; margin-bottom: 10px;">
               Este código expira em 15 minutos. Se você não solicitou, apenas ignore este e-mail.
            </p>
          </div>
        </div>
      `;

      await sendEmail({
        to: user.email,
        subject: 'Seu Código de Recuperação - Nexa Solutions',
        body: emailBody,
      });
    } catch (e) {
      console.error('Failed to send SMTP email (check credentials):', e);
    }

    return res.status(200).json({ message: 'Se o e-mail existir, um código foi enviado.' });
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to process forgot password', error: err.message });
  }
}];

/**
 * Verifies the 6-digit OTP code before displaying the "New Password" inputs.
 */
export const verifyCode = [rateLimitAndSanitize, async (req: Request, res: Response) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ message: 'Email and code are required' });
  if (!adminDb) return res.status(500).json({ message: 'Firebase not initialized' });

  try {
    const resetsSnap = await adminDb.collection('resets')
      .where('email', '==', email)
      .where('code', '==', code.toUpperCase())
      .limit(1)
      .get();

    if (resetsSnap.empty) {
      return res.status(400).json({ message: 'Código inválido ou expirado.' });
    }

    const resetDoc = resetsSnap.docs[0];
    const resetData = resetDoc.data();

    if (new Date(resetData.expires) < new Date()) {
      return res.status(400).json({ message: 'Este código já expirou. Solicite um novo.' });
    }

    await resetDoc.ref.update({ verified: true });

    return res.status(200).json({
      message: 'Código verificado com sucesso. Prossiga para nova senha.',
      token: jwt.sign({ resetEmail: email }, SECRET_KEY, { expiresIn: '10m' })
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to verify code', error: err.message });
  }
}];

/**
 * Actually changes the password if the token from /verify-code is provided.
 */
export const resetPassword = [rateLimitAndSanitize, async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ message: 'Token and new password are required' });

  if (!adminDb) return res.status(500).json({ message: 'Firebase not initialized' });

  try {
    const payload: any = jwt.verify(token, SECRET_KEY);
    const email = payload.resetEmail;
    if (!email) return res.status(400).json({ message: 'Token inválido' });

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({ message: 'A senha deve ter pelo menos 8 caracteres e conter pelo menos uma letra maiúscula e uma minúscula.' });
    }

    const resetsSnap = await adminDb.collection('resets')
      .where('email', '==', email)
      .where('verified', '==', true)
      .limit(1)
      .get();

    if (resetsSnap.empty) {
      return res.status(400).json({ message: 'Sessão de redefinição expirada ou inválida.' });
    }

    const resetDoc = resetsSnap.docs[0];
    if (new Date(resetDoc.data().expires) < new Date()) {
      return res.status(400).json({ message: 'Sessão de redefinição expirada ou inválida.' });
    }

    const usersSnap = await adminDb.collection('users').where('email', '==', email).limit(1).get();
    if (usersSnap.empty) return res.status(404).json({ message: 'User not found' });

    const userDocRef = usersSnap.docs[0].ref;
    const hashedNewPassword = await hashPassword(newPassword);

    await userDocRef.update({ password: hashedNewPassword });

    try {
      if (adminAuth && email) {
        const fbUser = await adminAuth.getUserByEmail(email);
        if (fbUser) {
          await adminAuth.updateUser(fbUser.uid, { password: newPassword });
        }
      }
    } catch (fbErr) {
      console.error('Failed to sync OTP reset password with Firebase Auth:', fbErr);
    }

    await resetDoc.ref.delete();

    return res.status(200).json({ message: 'Senha redefinida com sucesso!' });
  } catch (err: any) {
    console.error('Reset password error:', err);
    return res.status(400).json({ message: 'Token de redefinição inválido ou expirado' });
  }
}];

declare global {
  namespace Express {
    interface Request {
      user?: any;
      userId?: string | number;
    }
  }
}

/**
 * Middleware to authenticate requests using Firebase ID Token or legacy JWT.
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && typeof authHeader === 'string' ? authHeader.split(' ')[1] : null;

  if (!authHeader || !token) {
    console.warn('Missing Authorization header or token.');
    return res.status(401).json({ message: 'Missing Authorization header or token' });
  }

  try {
    if (adminAuth) {
      try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        req.user = {
          ...decodedToken,
          role: decodedToken.email === 'nexa2114@gmail.com' ? 'admin' : 'client'
        };
        req.userId = decodedToken.uid;
        return next();
      } catch (fbErr: any) {
        console.log('Not a valid Firebase token, trying legacy JWT... (Error: ' + fbErr.message + ')');
      }
    }

    jwt.verify(token, SECRET_KEY, (err: any, payload: any) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token', error: 'Firebase verification failed and legacy JWT is invalid' });
      }
      req.userId = payload.id;
      req.user = payload;
      next();
    });
  } catch (err: any) {
    console.error('Authentication Error:', err.message);
    res.status(500).json({ message: 'Internal server error during authentication' });
  }
};

/**
 * Get user profile. Requires authentication.
 */
export const getProfile = [authenticate, async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!adminDb || !userId) return res.status(500).json({ message: 'Firebase not initialized or missing user ID' });

  try {
    let userDoc;
    // We try to query by id if it's a number (legacy) or just use doc(userId.toString())
    if (typeof userId === 'number') {
      const snap = await adminDb.collection('users').where('id', '==', userId).limit(1).get();
      if (!snap.empty) userDoc = snap.docs[0];
    } else {
      const snap = await adminDb.collection('users').doc(userId.toString()).get();
      if (snap.exists) userDoc = snap;
    }

    if (!userDoc) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password: _pass, ...userData } = userDoc.data() as User;
    const userResponse = { ...userData, id: userDoc.id, role: userData.role || 'client' };
    res.status(200).json({ user: userResponse });
  } catch (e: any) {
    res.status(500).json({ message: 'Error fetching profile', error: e.message });
  }
}];

/**
 * Update user profile. Requires authentication.
 */
export const updateProfile = [authenticate, rateLimitAndSanitize, async (req: Request, res: Response) => {
  const userId = req.userId;
  const { name, email, phone, cpf } = req.body;
  if (!adminDb || !userId) return res.status(500).json({ message: 'Firebase not initialized or missing user ID' });

  try {
    let userDocRef;
    let userDocData: any;

    if (typeof userId === 'number') {
      const snap = await adminDb.collection('users').where('id', '==', userId).limit(1).get();
      if (!snap.empty) {
        userDocRef = snap.docs[0].ref;
        userDocData = snap.docs[0].data();
      }
    } else {
      const snap = await adminDb.collection('users').doc(userId.toString()).get();
      if (snap.exists) {
        userDocRef = snap.ref;
        userDocData = snap.data();
      }
    }

    if (!userDocRef || !userDocData) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email && email !== userDocData.email) {
      const emailSnap = await adminDb.collection('users').where('email', '==', email).limit(1).get();
      if (!emailSnap.empty && emailSnap.docs[0].id !== userDocRef.id) {
        return res.status(409).json({ message: 'Email already in use' });
      }
    }

    let updatedPhone = userDocData.phone;
    if (phone) {
      if (!isValidPhone(phone)) return res.status(400).json({ message: 'Invalid phone number format' });
      updatedPhone = phone.replace(/[^\d]+/g, '');
    }

    let updatedCpf = userDocData.cpf;
    if (cpf) {
      if (!isValidCpf(cpf)) return res.status(400).json({ message: 'Invalid CPF' });
      updatedCpf = cpf.replace(/[^\d]+/g, '');
    }

    const updates = {
      name: name !== undefined ? name : userDocData.name,
      email: email !== undefined ? email : userDocData.email,
      phone: updatedPhone,
      cpf: updatedCpf
    };

    await userDocRef.update(updates);

    console.log('Updated user profile:', updates.email);
    const updatedUserData = { ...userDocData, ...updates };
    const { password: _pass, ...filteredData } = updatedUserData;
    const userResponse = { ...filteredData, id: userDocRef.id, role: filteredData.role || 'client' };

    res.status(200).json({ message: 'Profile updated successfully', user: userResponse });
  } catch (e: any) {
    res.status(500).json({ message: 'Error updating profile', error: e.message });
  }
}];

/**
 * Change user password. Requires authentication.
 */
export const changePassword = [authenticate, rateLimitAndSanitize, async (req: Request, res: Response) => {
  const userId = req.userId;
  const { oldPassword, newPassword } = req.body;
  if (!adminDb || !userId) return res.status(500).json({ message: 'Firebase not initialized or missing user ID' });

  if (!isValidPassword(newPassword)) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long and contain at least one uppercase and one lowercase letter.' });
  }

  try {
    let userDocRef;
    let userDocData: any;

    if (typeof userId === 'number') {
      const snap = await adminDb.collection('users').where('id', '==', userId).limit(1).get();
      if (!snap.empty) {
        userDocRef = snap.docs[0].ref;
        userDocData = snap.docs[0].data();
      }
    } else {
      const snap = await adminDb.collection('users').doc(userId.toString()).get();
      if (snap.exists) {
        userDocRef = snap.ref;
        userDocData = snap.data();
      }
    }

    if (!userDocRef || !userDocData) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!userDocData.password || !(await comparePassword(oldPassword, userDocData.password))) {
      return res.status(401).json({ message: 'Incorrect old password' });
    }

    const hashedNewPassword = await hashPassword(newPassword);
    await userDocRef.update({ password: hashedNewPassword });

    try {
      if (adminAuth && userDocData.email) {
        const fbUser = await adminAuth.getUserByEmail(userDocData.email);
        if (fbUser) {
          await adminAuth.updateUser(fbUser.uid, { password: newPassword });
        }
      }
    } catch (fbErr) {
      console.error('Failed to update password in Firebase (local DB was updated):', fbErr);
    }

    console.log('User password changed:', userDocData.email);
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (e: any) {
    res.status(500).json({ message: 'Error changing password', error: e.message });
  }
}];

/**
 * Middleware to check if authenticated user is an admin.
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const role = (req as any).user?.role;
  if (role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

/**
 * Seeds the NEXA admin account if it doesn't exist.
 */
export const seedAdmin = async () => {
  if (!adminDb) return;
  try {
    const adminEmail = 'nexa2114@gmail.com';
    const usersRef = adminDb.collection('users');
    const adminSnap = await usersRef.where('email', '==', adminEmail).limit(1).get();

    if (adminSnap.empty) {
      const hashedPassword = await hashPassword('NexaSolutions01');
      const adminUser = {
        email: adminEmail,
        password: hashedPassword,
        name: 'NEXA Solutions',
        cpf: '00000000000',
        phone: '00000000000',
        role: 'admin'
      };

      let fbUid = undefined;
      // also seed in fbauth?
      if (adminAuth) {
        try {
          const u = await adminAuth.getUserByEmail(adminEmail);
          fbUid = u.uid;
        } catch (fbErr: any) {
          if (fbErr.code === 'auth/user-not-found') {
            const newFbUser = await adminAuth.createUser({
              email: adminEmail,
              password: 'NexaSolutions01',
              displayName: 'NEXA Solutions'
            });
            fbUid = newFbUser.uid;
          }
        }
      }

      const docRef = fbUid ? usersRef.doc(fbUid) : usersRef.doc();
      (adminUser as any).id = docRef.id as any;
      await docRef.set(adminUser);
      console.log('✅ Admin account seeded: nexa2114@gmail.com');
    } else {
      const adminDoc = adminSnap.docs[0];
      if (adminDoc.data().role !== 'admin') {
        await adminDoc.ref.update({ role: 'admin' });
      }
    }
  } catch (e) {
    console.error('Error seeding admin in Firestore', e);
  }
};