import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server as SocketIOServer } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

export const USER_LIST = ['Alan', 'Bob', 'Carol', 'Dean', 'Elin'];

function extractMentions(text, explicitMentions = []) {
  const result = [];
  const lowerSeen = new Set();

  const addName = (name) => {
    if (!name || typeof name !== 'string') return;
    const matchedUser = USER_LIST.find((u) => u.toLowerCase() === name.toLowerCase());
    const canonical = matchedUser || name;
    const lower = canonical.toLowerCase();
    if (!lowerSeen.has(lower)) {
      lowerSeen.add(lower);
      result.push(canonical);
    }
  };

  explicitMentions.forEach(addName);

  if (text && typeof text === 'string') {
    const matches = text.match(/@([A-Za-z0-9_]+)/g);
    if (matches) {
      matches.forEach((m) => addName(m.substring(1)));
    }
  }

  return result;
}

// Start with an empty message thread as requested by the user
let messages = [];

const app = express();
app.use(express.json());

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

let connectedClients = 0;

// Socket.IO real-time publish/subscribe
io.on('connection', (socket) => {
  connectedClients++;
  io.emit('presence:update', { onlineCount: connectedClients });

  // Send current message history on connection
  socket.emit('chat:init', messages);

  socket.on('chat:send', (payload) => {
    if (!payload || !payload.text || !payload.text.trim()) return;

    // Preserve client-provided ID to keep optimistic update synchronized without duplicates
    const messageId =
      payload.id && typeof payload.id === 'string'
        ? payload.id
        : `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Guard against duplicate processing
    if (messages.some((m) => m.id === messageId)) return;

    // Pick random username from required user_list if not specified
    const assignedUser =
      payload.user || USER_LIST[Math.floor(Math.random() * USER_LIST.length)];

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');

    // Extract and deduplicate mentions in message data
    const mentions = extractMentions(payload.text, payload.mentions || []);

    const newMessage = {
      id: messageId,
      user: assignedUser,
      text: payload.text.trim(),
      timestamp: `${hours}:${minutes}`,
      likes: 0,
      channelId: payload.channelId || 'introductions',
      mentions,
    };

    messages.push(newMessage);
    if (messages.length > 200) {
      messages = messages.slice(-200);
    }

    // Broadcast to all connected clients in real time
    io.emit('chat:message', newMessage);
  });

  socket.on('chat:like', (payload) => {
    if (!payload?.messageId) return;
    const msg = messages.find((m) => m.id === payload.messageId);
    if (msg) {
      msg.likes = (msg.likes || 0) + 1;
      io.emit('chat:liked', { messageId: msg.id, likes: msg.likes });
    }
  });

  socket.on('chat:typing', (payload) => {
    socket.broadcast.emit('chat:user_typing', payload);
  });

  socket.on('disconnect', () => {
    connectedClients = Math.max(0, connectedClients - 1);
    io.emit('presence:update', { onlineCount: connectedClients });
  });
});

// REST API Endpoints
app.get('/api/messages', (_req, res) => {
  res.json({ success: true, messages });
});

app.post('/api/messages', (req, res) => {
  const { id, text, user, channelId, mentions: clientMentions } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Message text is required' });
  }

  const messageId =
    id && typeof id === 'string'
      ? id
      : `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // Return existing message if already saved (prevents duplicate submission)
  const existing = messages.find((m) => m.id === messageId);
  if (existing) {
    return res.json({ success: true, message: existing });
  }

  const assignedUser = user || USER_LIST[Math.floor(Math.random() * USER_LIST.length)];
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const mentions = extractMentions(text, clientMentions || []);

  const newMessage = {
    id: messageId,
    user: assignedUser,
    text: text.trim(),
    timestamp: `${hours}:${minutes}`,
    likes: 0,
    channelId: channelId || 'introductions',
    mentions,
  };

  messages.push(newMessage);
  if (messages.length > 200) {
    messages = messages.slice(-200);
  }

  io.emit('chat:message', newMessage);
  res.status(201).json({ success: true, message: newMessage });
});

app.post('/api/messages/:id/like', (req, res) => {
  const { id } = req.params;
  const msg = messages.find((m) => m.id === id);
  if (!msg) {
    return res.status(404).json({ error: 'Message not found' });
  }
  msg.likes = (msg.likes || 0) + 1;
  io.emit('chat:liked', { messageId: msg.id, likes: msg.likes });
  res.json({ success: true, messageId: msg.id, likes: msg.likes });
});

app.post('/api/messages/clear', (_req, res) => {
  messages = [];
  io.emit('chat:init', messages);
  res.json({ success: true, count: 0 });
});

app.get('/api/users', (_req, res) => {
  res.json({ users: USER_LIST });
});

async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
