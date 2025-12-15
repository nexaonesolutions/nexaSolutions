const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// Carrega as variáveis de ambiente do ficheiro .env na raiz do projeto
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const mercadopago = require('mercadopago');

const app = express();
app.use(cors());
app.use(express.json());

// --- Configuração do Mercado Pago ---
mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

// --- Middleware de Autenticação JWT ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer TOKEN"

  if (token == null) {
    return res.sendStatus(401); // Unauthorized (Não autorizado)
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT Verification Error:', err);
      return res.sendStatus(403); // Forbidden (Token inválido ou expirado)
    }
    req.user = user;
    next();
  });
};

// --- Endpoint de Login (MOCK) ---
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  // NOTA: Em uma aplicação real, você validaria o email e a senha contra um banco de dados.
  // Simulação de um utilizador válido
  if (email === 'user@example.com' && password === 'password123') {
    const userPayload = { id: 'user-id-123', name: 'Utilizador de Teste', email: email };
    const accessToken = jwt.sign(userPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ accessToken });
  } else {
    res.status(401).json({ error: 'Email ou senha inválidos.' });
  }
});

// --- Endpoint para Stripe (Portugal - EUR) ---
app.post('/api/create-payment-intent', async (req, res) => {
  const { amount, currency } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ['card'],
    });
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// --- Endpoint para Mercado Pago (Brasil - BRL) ---
app.post('/api/create-preference', async (req, res) => {
  const { title, unit_price, quantity, currency_id } = req.body;
  const preference = {
    items: [{ title, unit_price: Number(unit_price), quantity: Number(quantity), currency_id }],
    back_urls: {
      success: `${process.env.VITE_FRONTEND_URL || 'http://localhost:5173'}/success`,
      failure: `${process.env.VITE_FRONTEND_URL || 'http://localhost:5173'}/failure`,
      pending: `${process.env.VITE_FRONTEND_URL || 'http://localhost:5173'}/pending`,
    },
    auto_return: 'approved',
    payment_methods: {
      excluded_payment_methods: [],
      excluded_payment_types: [],
      installments: 1, // Example: Disallow installments
    },
  };

  try {
    const response = await mercadopago.preferences.create(preference);
    res.send({ preferenceId: response.body.id });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// --- Endpoint para buscar histórico de pedidos (MOCK) ---
app.get('/api/orders', authenticateToken, (req, res) => {
  console.log(`Recebido pedido para /api/orders do utilizador:`, req.user);
  const mockOrders = [
    {
      id: 'ORD-12345',
      date: '2025-11-20T10:30:00Z',
      total: 1000.00,
      currency: 'BRL',
      items: [{ name: 'Plano Profissional', price: 1000.00 }],
      status: 'Concluído'
    },
    {
      id: 'ORD-67890',
      date: '2025-10-15T15:00:00Z',
      total: 50.00,
      currency: 'BRL',
      items: [{ name: 'Plano de Manutenção Básico', price: 50.00 }],
      status: 'Concluído'
    }
  ];
  res.json(mockOrders);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));