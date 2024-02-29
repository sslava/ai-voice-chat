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
  }

  getState() {
    return this.conversation.getState();
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

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const conversation = new ConversationEvents(prompt);


app.post('/update_button_status', async (req, res) => {
  const status = req.body?.status == 'ON';
  if (status) {
    conversation.startListening();
  } else {
    conversation.startResponding();
  }
  res.json({ event: status });
});

app.post('/update_tof_data', async (req, res) => {
  const result = await conversation.clear();
  res.json({ cleared: result });
});

app.get('/state', async (req, res) => {
  res.json({ state: conversation.getState() });
});

app.listen(8000, '0.0.0.0', () => {
  console.log('Server started on http://localhost:8000');
});
