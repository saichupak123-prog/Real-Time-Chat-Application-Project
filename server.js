const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());

// Serve static files but DO NOT automatically serve index.html
app.use(express.static(__dirname, {
  index: false
}));

// Open login page first
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store messages and users
const messagesByRoom = {};
const onlineUsers = new Map();

// Get chat history
app.get('/api/messages/:room', (req, res) => {
  const room = req.params.room;
  res.json((messagesByRoom[room] || []).slice(-50));
});

// Broadcast message to everyone in the room
function broadcastToRoom(room, payload) {
  onlineUsers.forEach((user) => {
    if (user.room === room && user.ws.readyState === WebSocket.OPEN) {
      user.ws.send(JSON.stringify(payload));
    }
  });
}

// Get online users
function getOnlineUsersInRoom(room) {
  return Array.from(onlineUsers.values())
    .filter(user => user.room === room)
    .map(user => user.username);
}

// WebSocket Connection
wss.on('connection', (ws) => {

  const clientId = uuidv4();

  ws.on('message', (data) => {

    try {

      const parsed = JSON.parse(data);

      // Join Room
      if (parsed.type === 'join') {

        const room = parsed.room || 'general';

        onlineUsers.set(clientId, {
          ws,
          username: parsed.username || 'Anonymous',
          room
        });

        if (!messagesByRoom[room]) {
          messagesByRoom[room] = [];
        }

        ws.send(JSON.stringify({
          type: 'connected',
          clientId,
          room
        }));

        broadcastToRoom(room, {
          type: 'presence',
          users: getOnlineUsersInRoom(room)
        });

        broadcastToRoom(room, {
          type: 'system',
          text: `${parsed.username} joined the room`,
          timestamp: new Date().toISOString()
        });
      }

      // Chat Message
      if (parsed.type === 'chat') {

        const user = onlineUsers.get(clientId);

        if (!user) return;

        const room = user.room;

        const message = {
          id: uuidv4(),
          clientId,
          username: user.username,
          text: parsed.text,
          timestamp: new Date().toISOString()
        };

        messagesByRoom[room].push(message);

        broadcastToRoom(room, {
          type: 'chat',
          message
        });
      }

      // Typing Indicator
      if (parsed.type === 'typing') {

        const user = onlineUsers.get(clientId);

        if (!user) return;

        onlineUsers.forEach((u) => {

          if (
            u.room === user.room &&
            u.ws !== ws &&
            u.ws.readyState === WebSocket.OPEN
          ) {

            u.ws.send(JSON.stringify({
              type: 'typing',
              username: user.username,
              isTyping: parsed.isTyping
            }));
          }

        });
      }

    } catch (err) {
      console.error("WebSocket Error:", err);
    }

  });

  // User Disconnect
  ws.on('close', () => {

    const user = onlineUsers.get(clientId);

    if (user) {

      onlineUsers.delete(clientId);

      broadcastToRoom(user.room, {
        type: 'presence',
        users: getOnlineUsersInRoom(user.room)
      });

      broadcastToRoom(user.room, {
        type: 'system',
        text: `${user.username} left the room`,
        timestamp: new Date().toISOString()
      });
    }

  });

});

// Start Server
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
