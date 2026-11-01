import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';
import pino from 'pino';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment configuration
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const PORT = process.env.WHATSAPP_SERVICE_PORT || 3001;
const SERVICE_TOKEN = process.env.WHATSAPP_SERVICE_TOKEN || 'ai01_whatsapp_secret_2026';
const FASTAPI_WEBHOOK_URL = process.env.FASTAPI_WEBHOOK_URL || 'http://127.0.0.1:8000/api/whatsapp/incoming';
const AUTH_DIR = path.resolve(__dirname, process.env.AUTH_DIR || './auth_info');

// Ensure persistent auth_info directory exists
if (!fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
}

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  timestamp: pino.stdTimeFunctions.isoTime
}).child({ module: 'whatsapp-service' });

const app = express();
app.use(cors());
app.use(express.json());

// In-Memory Connection State
let sock = null;
let connectionStatus = 'disconnected'; // 'connecting' | 'connected' | 'disconnected'
let currentQR = null;
let currentQRDataUrl = null;
let connectedUser = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
let isReconnecting = false;

// Outbound rate-limiting queue (1 message every 800ms)
let lastSendTimestamp = 0;
const MIN_SEND_INTERVAL_MS = 800;

/**
 * Authentication Middleware for Service-to-Service REST APIs
 */
function authenticateService(req, res, next) {
  const token = req.headers['x-api-key'] || 
                req.headers['x-service-token'] || 
                (req.headers.authorization && req.headers.authorization.replace(/^Bearer\s+/i, ''));

  if (!token || token !== SERVICE_TOKEN) {
    logger.warn({ ip: req.ip, path: req.path }, 'Unauthorized request rejected');
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Valid service token required'
    });
  }
  next();
}

/**
 * Phone number normalization & validation
 */
function normalizePhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') return null;
  // Strip non-digits
  let digits = phone.replace(/\D/g, '');
  
  // Default India country code (91) for 10-digit mobile numbers
  if (digits.length === 10) {
    digits = `91${digits}`;
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = `91${digits.slice(1)}`;
  }

  // Validate standard E.164 length (10 to 15 digits)
  if (digits.length < 11 || digits.length > 15) {
    return null;
  }

  return `${digits}@s.whatsapp.net`;
}

/**
 * Clean up auth_info directory on logout
 */
function clearAuthDir() {
  try {
    if (fs.existsSync(AUTH_DIR)) {
      const files = fs.readdirSync(AUTH_DIR);
      for (const file of files) {
        fs.unlinkSync(path.join(AUTH_DIR, file));
      }
      logger.info('Cleaned persistent WhatsApp session credentials');
    }
  } catch (err) {
    logger.error({ error: err.message }, 'Failed to clear auth directory');
  }
}

/**
 * Initialize and start Baileys WhatsApp Socket
 */
async function startWhatsAppSocket() {
  if (isReconnecting) return;
  isReconnecting = true;

  try {
    connectionStatus = 'connecting';
    logger.info('Initializing WhatsApp Baileys connection...');

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const { version, isLatest } = await fetchLatestBaileysVersion();
    logger.info({ version: version.join('.'), isLatest }, 'Using Baileys version');

    const socketLogger = pino({ level: 'silent' });

    sock = makeWASocket({
      version,
      auth: state,
      logger: socketLogger,
      printQRInTerminal: false,
      browser: ['AI-01 MSME Agent', 'Chrome', '1.0.0'],
      syncFullHistory: false,
      connectTimeoutMs: 60000,
      keepAliveIntervalMs: 30000
    });

    // Save session credentials whenever updated
    sock.ev.on('creds.update', saveCreds);

    // Connection updates: QR code, opened, closed
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        currentQR = qr;
        try {
          currentQRDataUrl = await QRCode.toDataURL(qr, { margin: 2, scale: 6 });
          logger.info('Generated new WhatsApp authentication QR code');
        } catch (qrErr) {
          logger.error({ error: qrErr.message }, 'Failed to generate QR data URL');
        }
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        
        connectionStatus = 'disconnected';
        connectedUser = null;
        logger.warn({ statusCode, shouldReconnect }, 'WhatsApp connection closed');

        if (statusCode === DisconnectReason.loggedOut) {
          logger.warn('Device was logged out from WhatsApp. Resetting session credentials.');
          clearAuthDir();
          currentQR = null;
          currentQRDataUrl = null;
          reconnectAttempts = 0;
          isReconnecting = false;
          // Restart immediately to yield a fresh QR code
          setTimeout(startWhatsAppSocket, 1500);
        } else if (shouldReconnect) {
          if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttempts++;
            const backoff = Math.min(3000 * reconnectAttempts, 30000);
            logger.info({ reconnectAttempts, backoff }, 'Attempting automatic reconnect...');
            isReconnecting = false;
            setTimeout(startWhatsAppSocket, backoff);
          } else {
            logger.error('Max reconnection attempts reached. Please manually restart or scan QR.');
            isReconnecting = false;
          }
        } else {
          isReconnecting = false;
        }
      } else if (connection === 'open') {
        connectionStatus = 'connected';
        reconnectAttempts = 0;
        currentQR = null;
        currentQRDataUrl = null;
        connectedUser = {
          id: sock.user?.id ? sock.user.id.split(':')[0] : 'Unknown',
          name: sock.user?.name || 'AI-01 WhatsApp Operator'
        };
        logger.info({ user: connectedUser }, 'WhatsApp connection opened and ready');
        isReconnecting = false;
      }
    });

    // Incoming messages: forward to FastAPI webhook
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify' && type !== 'append') return;

      for (const msg of messages) {
        if (!msg.message || msg.key.fromMe) continue;
        if (msg.key.remoteJid === 'status@broadcast') continue;

        // Extract text content
        const text = msg.message.conversation ||
                     msg.message.extendedTextMessage?.text ||
                     msg.message.imageMessage?.caption ||
                     '';

        if (!text.trim()) continue;

        const senderJid = msg.key.participant || msg.key.remoteJid;
        const senderPhone = '+' + senderJid.replace(/@.*$/, '').replace(/:\d+$/, '');
        const messageId = msg.key.id;

        logger.info({ sender: senderPhone, messageId, snippet: text.slice(0, 40) }, 'Received inbound WhatsApp message');

        // Forward to FastAPI Webhook
        try {
          const payload = {
            from: senderPhone,
            body: text.trim(),
            messageId,
            timestamp: msg.messageTimestamp ? new Date(msg.messageTimestamp * 1000).toISOString() : new Date().toISOString()
          };

          const resp = await fetch(FASTAPI_WEBHOOK_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-service-token': SERVICE_TOKEN
            },
            body: JSON.stringify(payload)
          });

          if (!resp.ok) {
            const errText = await resp.text();
            logger.warn({ status: resp.status, response: errText }, 'FastAPI webhook returned non-200');
          } else {
            logger.info({ messageId }, 'Forwarded inbound message to FastAPI webhook successfully');
          }
        } catch (fwdErr) {
          logger.error({ error: fwdErr.message }, 'Failed to forward WhatsApp message to FastAPI webhook');
        }
      }
    });

  } catch (err) {
    logger.error({ error: err.message }, 'Fatal error initializing WhatsApp socket');
    isReconnecting = false;
    connectionStatus = 'disconnected';
  }
}

// ==========================================
// REST API ENDPOINTS
// ==========================================

/**
 * Health & Ping endpoint (no auth required for simple ping)
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'AI-01 Free WhatsApp Dispatcher (Baileys)',
    connectionStatus,
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /status: Connection status and active user
 */
app.get('/status', authenticateService, (req, res) => {
  res.json({
    success: true,
    connected: connectionStatus === 'connected',
    status: connectionStatus,
    user: connectedUser,
    hasQr: !!currentQRDataUrl
  });
});

/**
 * GET /qr: Current QR Code for scanning
 */
app.get('/qr', authenticateService, (req, res) => {
  if (connectionStatus === 'connected') {
    return res.json({
      success: true,
      connected: true,
      status: 'connected',
      message: 'WhatsApp is already connected and authenticated.',
      qr: null
    });
  }

  res.json({
    success: true,
    connected: false,
    status: connectionStatus,
    qr: currentQRDataUrl,
    raw: currentQR,
    expiresIn: 'approx 30s'
  });
});

/**
 * POST /send: Send text message to recipient phone
 */
app.post('/send', authenticateService, async (req, res) => {
  const { phone, message } = req.body;

  if (connectionStatus !== 'connected' || !sock) {
    return res.status(503).json({
      success: false,
      error: 'WhatsApp service is not connected. Please scan the QR code to authenticate.'
    });
  }

  if (!phone || typeof phone !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Missing or invalid "phone" field'
    });
  }

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Missing or invalid "message" field. Content cannot be empty.'
    });
  }

  const jid = normalizePhoneNumber(phone);
  if (!jid) {
    return res.status(400).json({
      success: false,
      error: `Invalid phone number format: '${phone}'. Expecting 10-15 digits with valid country code.`
    });
  }

  // Rate Limiting Enforcement
  const now = Date.now();
  const timeSinceLastSend = now - lastSendTimestamp;
  if (timeSinceLastSend < MIN_SEND_INTERVAL_MS) {
    const delay = MIN_SEND_INTERVAL_MS - timeSinceLastSend;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  lastSendTimestamp = Date.now();

  try {
    logger.info({ jid, snippet: message.slice(0, 40) }, 'Sending outbound WhatsApp message');
    const sent = await sock.sendMessage(jid, { text: message.trim() });

    res.json({
      success: true,
      messageId: sent.key.id,
      to: phone,
      jid,
      status: 'SENT',
      timestamp: new Date().toISOString()
    });
  } catch (sendErr) {
    logger.error({ error: sendErr.message, phone }, 'Failed to send WhatsApp message via Baileys');
    res.status(500).json({
      success: false,
      error: `Failed to dispatch WhatsApp message: ${sendErr.message}`
    });
  }
});

/**
 * POST /disconnect: Disconnect WhatsApp session and optionally reset credentials
 */
app.post('/disconnect', authenticateService, async (req, res) => {
  const { clearAuth = false } = req.body || {};

  try {
    if (sock) {
      try {
        await sock.logout();
      } catch (_) {
        sock.end(new Error('User requested disconnect'));
      }
      sock = null;
    }

    if (clearAuth) {
      clearAuthDir();
    }

    connectionStatus = 'disconnected';
    connectedUser = null;
    currentQR = null;
    currentQRDataUrl = null;

    logger.info({ clearAuth }, 'WhatsApp session disconnected upon API request');

    // Trigger restart to create new QR if requested
    setTimeout(startWhatsAppSocket, 1000);

    res.json({
      success: true,
      status: 'disconnected',
      message: 'WhatsApp session disconnected. New QR generation scheduled.'
    });
  } catch (discErr) {
    logger.error({ error: discErr.message }, 'Error disconnecting WhatsApp session');
    res.status(500).json({
      success: false,
      error: `Disconnect error: ${discErr.message}`
    });
  }
});

// Start Express Server
const server = app.listen(PORT, '127.0.0.1', () => {
  logger.info(`Free WhatsApp Service running at http://127.0.0.1:${PORT}`);
  // Start Baileys socket connection
  startWhatsAppSocket();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Closing WhatsApp service.');
  if (sock) sock.end();
  server.close();
});
process.on('SIGINT', () => {
  logger.info('SIGINT received. Closing WhatsApp service.');
  if (sock) sock.end();
  server.close();
});
