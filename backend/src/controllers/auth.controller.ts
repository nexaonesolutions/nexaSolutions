import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || 'supersecretjwtkey'; // Fallback for development, but should be set in .env


// #region Validation Functions
function isValidCpf(cpf: string): boolean {
  if (typeof cpf !== 'string') {
    return false;
  }

  // Remove non-digit characters
  cpf = cpf.replace(/[^\d]+/g, '');

  // Check if CPF has 11 digits
  if (cpf.length !== 11) {
    return false;
  }

  // Check for known invalid patterns (all digits are the same)
  if (/^(\d)\1+$/.test(cpf)) {
    return false;
  }

  let sum = 0;
  let remainder;

  // Calculate first verification digit
  for (let i = 1; i <= 9; i++) {
    sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;

  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== parseInt(cpf.substring(9, 10))) {
    return false;
  }

  sum = 0;
  // Calculate second verification digit
  for (let i = 1; i <= 10; i++) {
    sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;

  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== parseInt(cpf.substring(10, 11))) {
    return false;
  }

  return true;
}

function isValidPhone(phone: string): boolean {
    if (typeof phone !== 'string') return false;
    // Basic validation for Brazilian phone numbers (XX) XXXXX-XXXX or (XX) XXXX-XXXX
    const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
    return phoneRegex.test(phone);
}
// #endregion

// Define a simple User interface for better type hinting
interface User {
  id: number;
  email: string;
  password: string; // In a real app, this would be a hashed password
  name?: string;
  cpf: string;
  phone: string;
}

// STUB: In a real app, this would be a database table.
// Also, passwords should be hashed!
const users: User[] = [];

/**
 * Registers a new user.
 */
export const register = (req: Request, res: Response) => {
  console.log('--- Registration attempt ---');
  console.log('Request Body:', req.body);
  const { email, password, name, cpf, phone } = req.body;

  if (!email || !password || !cpf || !phone) {
    return res.status(400).json({ message: 'Email, password, CPF, and phone are required' });
  }

  if (!isValidCpf(cpf)) {
    return res.status(400).json({ message: 'Invalid CPF' });
  }

  if (!isValidPhone(phone)) {
    return res.status(400).json({ message: 'Invalid phone number format' });
  }

  const userExists = users.find((user) => user.email === email);
  if (userExists) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const cleanedCpf = cpf.replace(/[^\d]+/g, '');
  const cleanedPhone = phone.replace(/[^\d]+/g, '');

  const cpfExists = users.find((user) => user.cpf === cleanedCpf);
  if (cpfExists) {
    return res.status(409).json({ message: 'CPF already in use' });
  }


  const newUser: User = {
    id: users.length + 1,
    email,
    password, // Store as plain text for this stub, NOT for production!
    name: name || '',
    cpf: cleanedCpf,
    phone: cleanedPhone
  };
  users.push(newUser);

  console.log('Registered new user:', newUser);
  // Return a token and the created user (without password) so frontend can log in immediately if desired
  const { password: _pass, ...userData } = newUser as any;
  // ensure id is string for consistency with frontend expectations
  const userResponse = { ...userData, id: String(newUser.id) };
  const accessToken = jwt.sign(userResponse, SECRET_KEY, { expiresIn: '1h' });
  res.status(201).json({ message: 'User registered successfully', token: accessToken, user: userResponse });
};

/**
 * Logs in a user.
 */
export const login = (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = users.find((user) => user.email === email && user.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  console.log('User logged in:', user);
  // In a real app, you would return a JWT here.
  // For this stub, we return the user data (excluding password) and a dummy token.
  const { password: _pass, ...userData } = user as any; // Exclude password from response
  const userResponse = { ...userData, id: String(user.id) };
  const accessToken = jwt.sign(userResponse, SECRET_KEY, { expiresIn: '1h' });
  res.status(200).json({ message: 'Login successful', token: accessToken, user: userResponse });
};

// Extend the Request type to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: any; // Define the type of user that will be attached
      userId?: number;
    }
  }
}

/**
 * Middleware to authenticate requests using JWT.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format "Bearer TOKEN"

  if (token == null) {
    return res.sendStatus(401); // Unauthorized (No token provided)
  }

  jwt.verify(token, SECRET_KEY, (err: any, user: any) => {
    if (err) {
      console.error('JWT Verification Error:', err);
      return res.sendStatus(403); // Forbidden (Invalid or expired token)
    }
    req.user = user;
    req.userId = (user as any).id; // Assuming the user payload has an 'id'
    next();
  });
};

/**
 * Get user profile. Requires authentication.
 */
export const getProfile = [authenticate, (req: Request, res: Response) => {
  const userId = req.userId; // Use req.userId from the authenticate middleware
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const { password: _pass, ...userData } = user as any; // Exclude password
  const userResponse = { ...userData, id: String(user.id) };
  res.status(200).json({ user: userResponse });
}];

/**
 * Update user profile. Requires authentication.
 */
export const updateProfile = [authenticate, (req: Request, res: Response) => {
  const userId = req.userId; // Use req.userId from the authenticate middleware
  const { name, email, phone, cpf } = req.body;

  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  const user = users[userIndex];

  // Prevent changing email to an already existing one (if changed)
  if (email && email !== user.email && users.some(u => u.email === email && u.id !== userId)) {
    return res.status(409).json({ message: 'Email already in use' });
  }

  if (cpf) {
      if (!isValidCpf(cpf)) {
        return res.status(400).json({ message: 'Invalid CPF' });
      }
      const cleanedCpf = cpf.replace(/[^\d]+/g, '');
      if (users.some(u => u.cpf === cleanedCpf && u.id !== userId)) {
          return res.status(409).json({ message: 'CPF already in use' });
      }
      user.cpf = cleanedCpf;
  }

  if (phone) {
      if (!isValidPhone(phone)) {
        return res.status(400).json({ message: 'Invalid phone number format' });
      }
      user.phone = phone.replace(/[^\d]+/g, '');
  }

  user.name = name !== undefined ? name : user.name;
  user.email = email !== undefined ? email : user.email;

  console.log('Updated user profile:', user);
  const { password: _pass, ...updatedUserData } = user as any;
  const userResponse = { ...updatedUserData, id: String(user.id) };
  res.status(200).json({ message: 'Profile updated successfully', user: userResponse });
}];

/**
 * Change user password. Requires authentication.
 */
export const changePassword = [authenticate, (req: Request, res: Response) => {
  const userId = req.userId; // Use req.userId from the authenticate middleware
  const { oldPassword, newPassword } = req.body;

  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  const user = users[userIndex];

  if (user.password !== oldPassword) {
    return res.status(401).json({ message: 'Incorrect old password' });
  }

  user.password = newPassword; // Again, in real app, hash this!
  console.log('User password changed:', user.email);
  res.status(200).json({ message: 'Password changed successfully' });
}];