const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mesaj depolama
let lastMessage = {
  from: '',
  text: 'Henuz mesaj yok',
  timestamp: ''
};

let allMessages = [];

// Ana sayfa
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>WhatsApp Webhook</title>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial; padding: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; }
        .container { background: white; padding: 40px; border-radius: 15px; max-width: 600px; margin: 0 auto; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
        h1 { color: #25D366; margin: 0 0 20px 0; }
        .status { background: #d4edda; color: #155724; padding: 15px; border-radius: 8px; margin: 20px 0; }
        a { display: block; margin: 10px 0; padding: 15px; background: #25D366; color: white; text-decoration: none; border-radius: 8px; text-align: center; }
        a:hover { background: #128C7E; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📱 WhatsApp Webhook API</h1>
        <div class="status">✅ API çalışıyor ve hazır!</div>
        <a href="/last-message">📩 Son Mesajı Gör</a>
        <a href="/messages">📋 Tüm Mesajları Gör</a>
      </div>
    </body>
    </html>
  `);
});

// Webhook doğrulama (GET)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('🔍 Webhook verify:', { mode, token });

  if (mode === 'subscribe' && token === 'SECURE_WEBHOOK_TOKEN_2024') {
    console.log('✅ Webhook verified!');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Invalid token');
    res.sendStatus(403);
  }
});

// Webhook mesaj alma (POST)
app.post('/webhook', (req, res) => {
  try {
    console.log('📩 Message received');

    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    if (message) {
      const from = message.from || 'Unknown';
      const text = message.text?.body || 'No text';
      const timestamp = new Date().toLocaleString('tr-TR');

      lastMessage = { from, text, timestamp };
      allMessages.push({ from, text, timestamp });

      if (allMessages.length > 100) {
        allMessages.shift();
      }

      console.log(`✅ From: ${from}`);
      console.log(`✅ Text: ${text}`);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.sendStatus(200);
  }
});

// Son mesaj
app.get('/last-message', (req, res) => {
  res.json(lastMessage);
});

// Tüm mesajlar
app.get('/messages', (req, res) => {
  res.json(allMessages);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('═══════════════════════════════════');
  console.log('  🚀 WhatsApp Webhook API');
  console.log(`  📍 Port: ${PORT}`);
  console.log('═══════════════════════════════════');
});
