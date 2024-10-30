// Import necessary modules
import express from 'express';
import bodyParser from 'body-parser';
import Replicate from 'replicate';
import dotenv from 'dotenv';

// Initialize dotenv for environment variable management
dotenv.config();

// Create an Express application instance
const app = express();
// Instantiate the Replicate client with the API token
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
// Define the model and version to use with Replicate
const model = 'meta/meta-llama-3-8b-instruct';
// const model = 'meta/llama-2-7b-chat';

// Middleware for parsing JSON request bodies
app.use(bodyParser.json());
// Serve static files from the 'public' directory
app.use(express.static('public'));

// Function to format the conversation history and generate a response
async function generate(history) {
  let formattedHistory = '<|begin_of_text|>';
  for (let i = 0; i < history.length; i++) {
    const message = history[i];
    // Format the message based on its role
    if (message.role === 'system') {
      formattedHistory += `<|start_header_id|>system<|end_header_id|>\n${message.content}<|eot_id|>`;
    } else if (message.role === 'user') {
      formattedHistory += `<|start_header_id|>user<|end_header_id|>\n${message.content}<|eot_id|>`;
    } else if (message.role === 'assistant') {
      formattedHistory += `<|start_header_id|>assistant<|end_header_id|>\n${message.content}<|eot_id|>`;
    }
  }

  // Add the final assistant prompt
  formattedHistory += `<|start_header_id|>assistant<|end_header_id|>`;

  // Construct the input object for the Llama 3 model
  const input = {
    prompt: formattedHistory,
    system_prompt: 'You are a helpful AI assistant.',
  };

  // Run the model with the formatted input and return the result
  const output = await replicate.run(model, { input });

  // Join and trim the model output
  return output.join('').trim();
}

// Route handler for POST requests to '/api/chat'
app.post('/api/chat', async (req, res) => {
  // Extract the conversation history from the request body
  const conversationHistory = req.body.history;
  try {
    // Generate a response using the Replicate model and send it back
    const modelReply = await generate(conversationHistory);
    res.json({ reply: modelReply });
  } catch (error) {
    // Handle errors in communication with the Replicate API
    console.error('Error communicating with Replicate API:', error);
    res.status(500).send('Error generating response');
  }
});

// Define the port for the server to listen on and start listening
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // Log the server's running status and port
  console.log(`Server is running on http://localhost:${PORT}`);
});
