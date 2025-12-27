import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { readDb, writeDb } from '../services/db.service';
import { isValidCpf, isValidPassword, isValidPhone } from '../services/validation.service';
import { hashPassword, comparePassword } from '../services/security.service';
import { rateLimitAndSanitize, resetLoginAttempts } from '../middleware/sanitize-middleware';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || 'averysecuresecretkey'; // Fallback for development, MUST be set in .env for production

// Define a simple User interface for better type hinting
interface User {
  id: number;
  email: string;
  password: string; // Will be a hashed password
  name?: string;
  cpf: string;
  phone: string;
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

  const db = await readDb();

  const userExists = db.users.find((user) => user.email === email);
  if (userExists) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const cleanedCpf = cpf.replace(/[^\d]+/g, '');
  const cleanedPhone = phone.replace(/[^\d]+/g, '');

  const cpfExists = db.users.find((user) => user.cpf === cleanedCpf);
  if (cpfExists) {
    return res.status(409).json({ message: 'CPF already in use' });
  }

  const hashedPassword = await hashPassword(password);

  const newUser: User = {
    id: db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1,
    email,
    password: hashedPassword,
    name: name || '',
    cpf: cleanedCpf,
    phone: cleanedPhone
  };
  db.users.push(newUser);
  await writeDb(db);

  console.log('Registered new user:', newUser.email);
  const userResponse = { id: String(newUser.id), email: newUser.email, name: newUser.name };
  const accessToken = jwt.sign({ id: newUser.id }, SECRET_KEY, { expiresIn: '1h' });
  res.status(201).json({ message: 'User registered successfully', token: accessToken, user: userResponse });
}];

/**
 * Logs in a user.
 */
export const login = [rateLimitAndSanitize, async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const ip = req.ip;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const db = await readDb();
  const user = db.users.find((user) => user.email === email);

  if (!user || !await comparePassword(password, user.password)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  resetLoginAttempts(ip || 'unknown');

  console.log('User logged in:', user.email);
  const userResponse = { id: String(user.id), email: user.email, name: user.name };
  const accessToken = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1h' });
  res.status(200).json({ message: 'Login successful', token: accessToken, user: userResponse });
}];

// Extend the Request type to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
      userId?: number;
    }
  }
}

/**
 * Middleware to authenticate requests using JWT.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, SECRET_KEY, (err: any, payload: any) => {
    if (err) {
      console.error('JWT Verification Error:', err);
      return res.sendStatus(403);
    }
    req.userId = payload.id;
    req.user = payload;
    next();
  });
};

/**
 * Get user profile. Requires authentication.
 */
export const getProfile = [authenticate, async (req: Request, res: Response) => {
  const userId = req.userId;
  const db = await readDb();
  const user = db.users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const { password: _pass, ...userData } = user;
  const userResponse = { ...userData, id: String(user.id) };
  res.status(200).json({ user: userResponse });
}];

/**
 * Update user profile. Requires authentication.
 */
export const updateProfile = [authenticate, rateLimitAndSanitize, async (req: Request, res: Response) => {
  const userId = req.userId;
  const { email, phone } = req.body;

  const db = await readDb();
  const userIndex = db.users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  const user = db.users[userIndex];

  if (email && email !== user.email && db.users.some(u => u.email === email && u.id !== userId)) {
    return res.status(409).json({ message: 'Email already in use' });
  }

  if (phone) {
      if (!isValidPhone(phone)) {
        return res.status(400).json({ message: 'Invalid phone number format' });
      }
      user.phone = phone.replace(/[^\d]+/g, '');
  }

  user.email = email !== undefined ? email : user.email;

  await writeDb(db);

  console.log('Updated user profile:', user.email);
  const { password: _pass, ...updatedUserData } = user;
  const userResponse = { ...updatedUserData, id: String(user.id) };
  res.status(200).json({ message: 'Profile updated successfully', user: userResponse });
}];

/**
 * Change user password. Requires authentication.
 */
export const changePassword = [authenticate, rateLimitAndSanitize, async (req: Request, res: Response) => {
  const userId = req.userId;
  const { oldPassword, newPassword } = req.body;

  if (!isValidPassword(newPassword)) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long and contain at least one uppercase and one lowercase letter.' });
  }

  const db = await readDb();
  const userIndex = db.users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  const user = db.users[userIndex];

  if (!await comparePassword(oldPassword, user.password)) {
    return res.status(401).json({ message: 'Incorrect old password' });
  }

  user.password = await hashPassword(newPassword);
  await writeDb(db);
  console.log('User password changed:', user.email);
  res.status(200).json({ message: 'Password changed successfully' });
}];