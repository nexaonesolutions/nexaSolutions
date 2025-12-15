import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import paymentRoutes from './routes/payment.routes';
import authRoutes from './routes/auth.routes';
import ordersRoutes from './routes/orders.routes';

const app = express();
// Default to the frontend's expected port so they connect without extra env setup
const PORT = process.env.PORT || 3000;

// Middleware
// Allow Authorization header explicitly and reflect origin
app.use(cors({ origin: true, allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json());

// Routes
app.use('/api/payments', paymentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);

// Health check route
app.get('/', (req: Request, res: Response) => {
  res.send('Nexa backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
