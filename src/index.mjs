import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import EventEmitter  from 'node:events';

import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import Conversation from './conversation.mjs';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const views = path.join(__dirname, 'views');


const prompt = fs.readFileSync('prompt.txt', 'utf-8');

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

  togge(start) {
    this.emit(start ? 'startListening': 'stopListening');
  }

  clear() {
    this.emit('clear');
  }
}

const app = express();

app.use(bodyParser.json());

app.use(express.static('public'));


app.get('/', (_, res) => {
  res.sendFile(path.join(views, 'index.html'));
});

app.get('/testing', (_, res) => {
  res.sendFile(path.join(views, 'testing.html'));
});

const conversation = new ConversationEvents(prompt);


app.post('/update_button_status', async (req, res) => {
  const status = req.body?.status === 'ON'
  conversation.togge(status);
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