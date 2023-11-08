const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const Replicate = require('replicate');
require('dotenv').config();

const app = express();
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
const model = 'meta/llama-2-7b-chat';
const version = '8e6975e5ed6174911a6ff3d60540dfd4844201974602551e10e9e87ab143d81e';

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

async function generate(history) {
  const formattedHistory = history
    .map((message) =>
      message.role === 'user' ? `[INST] ${message.content} [/INST]` : message.content
    )
    .join('\n');

  const input = {
    prompt: formattedHistory,
    system_prompt: 'You are a helpful assistant.',
  };

  const output = await replicate.run(`${model}:${version}`, { input });
  return output.join('').trim();
}

app.post('/api/chat', async (req, res) => {
  const conversationHistory = req.body.history;
  try {
    console.log(conversationHistory);
    const modelReply = await generate(conversationHistory);
    console.log(modelReply);
    res.json({ reply: modelReply });
  } catch (error) {
    console.error('Error communicating with Replicate API:', error);
    res.status(500).send('Error generating response');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
