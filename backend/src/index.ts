import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import paymentRoutes from './routes/payment.routes';
import authRoutes from './routes/auth.routes';
import ordersRoutes from './routes/orders.routes';
import userRoutes from './routes/user.routes';
import chatRoutes from './routes/chat.routes';
import adminRoutes from './routes/admin.routes';
import { seedAdmin } from './controllers/auth.controller';

const app = express();
// Default to 4002 (changeable via process.env.PORT)
const PORT = process.env.PORT || 4002;

// Security Middlewares
app.use(helmet());

// Restrict CORS in production (currently allowing local dev and prod frontend)
const allowedOrigins = [
  process.env.VITE_FRONTEND_URL || 'http://localhost:5173',
  'https://nexa-solutions.vercel.app',
  'https://www.nexasolutions.com.br',
  'https://nexasolutions.com.br'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Request from disallowed origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Main Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased for development/testing
  message: 'Too many requests from this IP, please try again after 15 minutes',
  handler: (req, res, _next, options) => {
    console.warn(`[${new Date().toLocaleTimeString()}] RATE LIMIT HIT: ${req.ip} -> ${req.method} ${req.url}`);
    res.status(options.statusCode).send(options.message);
  }
});
// app.use('/api/', apiLimiter); // Temporarily disabled for production rollout debugging

// Logger Middleware: Mostra no terminal toda requisição que chega
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/payments', paymentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Health check route
app.get('/', (req: Request, res: Response) => {
  res.send('Nexa backend is running!');
});

// Seed admin on startup
seedAdmin().catch(err => console.error('Failed to seed admin:', err));

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[${new Date().toLocaleTimeString()}] ERROR: ${err.message}`);

  // Hide stack traces in production
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    console.error(err.stack);
  }

  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV !== 'production' ? err : undefined
  });
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;

