require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const { prisma } = require('./prisma');
const rabbitmq = require('./services/rabbitmq');
const { normalizeApiPrefix } = require('./middleware/normalizeApiPrefix');
const { registerRoutes } = require('./routes');

const app = express();

function ensureUploadDir() {
  const uploadDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
}

function createUploadMiddleware(uploadDir) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const base = path.basename(file.originalname, ext).replace(/\s+/g, '-');
      cb(null, `${Date.now()}-${base}${ext}`);
    },
  });

  return multer({ storage });
}

function configureApp(appInstance) {
  const uploadDir = ensureUploadDir();
  const upload = createUploadMiddleware(uploadDir);

  appInstance.set('trust proxy', 1);

  const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:5173'];

  appInstance.use(
    cors({
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  appInstance.use(
    helmet({
      crossOriginResourcePolicy: false,
    })
  );

  const authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many authentication attempts, try again later.' },
  });

  appInstance.disable('x-powered-by');
  appInstance.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
  });

  appInstance.use(express.json());
  appInstance.use('/uploads', express.static(uploadDir));
  appInstance.use('/api/auth', authLimiter);
  appInstance.use(normalizeApiPrefix);

  registerRoutes(appInstance, { upload });
}

async function startRabbitConsumer() {
  try {
    await rabbitmq.connect();
    await rabbitmq.consumeOrders(async (orderData) => {
      console.log('Traitement commande:', orderData.orderId);

      try {
        await prisma.order.update({
          where: { id: orderData.orderId },
          data: { status: 'processing' },
        });
        console.log(`Commande ${orderData.orderId} mise a jour: processing`);
      } catch (error) {
        console.error(`Erreur mise a jour commande ${orderData.orderId}:`, error.message);
      }
    });
  } catch (err) {
    console.error('RabbitMQ non disponible:', err.message);
    console.log('Le serveur continue sans RabbitMQ');
  }
}

function registerShutdown(server) {
  process.on('SIGTERM', async () => {
    console.log('SIGTERM recu, fermeture...');
    await rabbitmq.close();
    server.close(() => {
      console.log('Serveur ferme');
      process.exit(0);
    });
  });
}

configureApp(app);

function start(port = process.env.PORT || 4003) {
  const server = app.listen(port, () => {
    const address = server.address();
    const actualPort = typeof address === 'object' && address ? address.port : port;
    console.log(`Backend running on http://localhost:${actualPort}`);
  });

  startRabbitConsumer();
  registerShutdown(server);

  return server;
}

if (require.main === module) {
  start();
}

module.exports = { app, start };
