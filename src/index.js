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
  constructor(system_prompt) {
    super();
    this.conversation = new Conversation(system_prompt);

    this.on('start_listening', async () => {
      await this.conversation.start_listening();
    });
    this.on('start_responding', async () => {
      await this.conversation.start_responding();
    });
    this.on('clear', async () => {
      await this.conversation.clear();
    });
  }

  start_listening() {
    this.emit('start_listening');
  }

  start_responding() {
    this.emit('start_responding');
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
    conversation.start_listening();
  } else {
    conversation.start_responding();
  }
  res.json({ event: status });
});

app.post('/update_tof_data', async (req, res) => {
  const result = await conversation.clear();
  res.json({ cleared: result });
});

app.listen(8000, '0.0.0.0', () => {
  console.log('Server started on http://localhost:8000');
});
