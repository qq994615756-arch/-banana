const express = require('express');
const cors = require('cors');

const app = express();
const allowedOrigins = [
  'http://localhost:3000',
  'http://banana-six-mu.vercel.app',
  'https://banana-six-mu.vercel.app',
  'http://banana-nnuxe4ul8-qq994615756-7066s-projects.vercel.app',
  'https://banana-nnuxe4ul8-qq994615756-7066s-projects.vercel.app',
];

function isAllowedOrigin(origin) {
  if (allowedOrigins.includes(origin)) return true;
  // Allow Vercel preview domains for this project namespace.
  return /^https?:\/\/banana-[a-z0-9-]+-qq994615756-7066s-projects\.vercel\.app$/i.test(origin);
}

const corsOptions = {
  origin(origin, callback) {
    // Allow server-to-server requests or curl without Origin header.
    if (!origin) return callback(null, true);
    if (isAllowedOrigin(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));

// ================= 路由模块挂载 =================
app.use('/api/generate', require('./routes/generate'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/admin', require('./routes/admin'));

app.listen(8000, '0.0.0.0', () => console.log('Backend running on port 8000'));
