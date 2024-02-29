const express = require('express');
const path = require('path');
const EventEmitter = require('events');
const fs = require('fs');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

const Conversation = require('./conversation');

dotenv.config();


const prompt = fs.readFileSync(path.join(__dirname, 'prompt.txt'), 'utf-8');

process.on('uncaughtException',  (err) => {
  console.log(err);
});

class ConversationEvents extends EventEmitter {
  /**
   * @param {string} systemPrompt system prompt
   */
  constructor(systemPrompt) {
    super();
    this.conversation = new Conversation(systemPrompt);

    this.on('startListening', async () => {
      await this.conversation.startListening();
    });
    this.on('startResponding', async () => {
      await this.conversation.startResponding();
    });
    this.on('clear', async () => {
      await this.conversation.clear();
    });
    this.on('hello', async () => {
      await this.conversation.greetings();
    });
  }

  getState() {
    return this.conversation.getState();
  }

  hello() {
    this.emit('hello');
  }

  startListening() {
    this.emit('startListening');
  }

  startResponding() {
    this.emit('startResponding');
  }

  clear() {
    this.emit('clear');
  }
}

const app = express();

app.use(bodyParser.json());

app.use(express.static('public'));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/testing', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'testing.html'));
});

const conversation = new ConversationEvents(prompt);


app.post('/update_button_status', async (req, res) => {
  const status = req.body?.status === 'ON';
  if (status) {
    conversation.startListening();
  } else {
    conversation.startResponding();
  }
  res.json({ event: status });
});

app.post('/reset_session', async (req, res) => {
  conversation.clear();
  res.json({ ok: true });
});

app.get('/state', async (req, res) => {
  res.json({ state: conversation.getState() });
});

app.post('/hello', async (req, res) => {
  const result = conversation.hello();
  res.json({ ok: true });
});


app.listen(8000, '0.0.0.0', () => {
  console.log('Server started on http://localhost:8000');
});
