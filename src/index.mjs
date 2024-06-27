import path from 'node:path';
import fs from 'node:fs';
import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import { DialogManager } from './dialog/dialog-manager.mjs';

dotenv.config();

const { HOST, PORT } = process.env;

const prompt = fs.readFileSync('prompt.txt', 'utf-8');

const conversation = new DialogManager(prompt);

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'src', 'views'));

app.use(bodyParser.json());

app.use(express.static('public'));

app.get('/', (_, res) => {
  res.render('index');
});

app.get('/controls', (_, res) => {
  res.render('controls');
});

app.get('/api/state', async (_, res) => {
  res.json({ state: conversation.getState() });
});

app.post('/api/toggle-button', async (req, res) => {
  const status = req.body?.status === 'ON';
  status ? conversation.listen() : conversation.respond();
  res.json({ ok: true });
});

app.post('/api/reset-session', async (_, res) => {
  conversation.bye();
  res.json({ ok: true });
});

app.post('/api/greetings', async (_, res) => {
  conversation.greetings();
  res.json({ ok: true });
});

const server = app.listen(PORT ? +PORT : 8000, HOST ?? '0.0.0.0', () => {
  const info = server?.address();
  console.info(`[app]: started http://${info?.address}:${info?.port}`);
});

process.on('uncaughtException', (err) => {
  console.log(err);
});
