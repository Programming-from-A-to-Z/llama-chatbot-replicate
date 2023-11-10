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
const model = 'meta/llama-2-7b-chat';
const version =
  '8e6975e5ed6174911a6ff3d60540dfd4844201974602551e10e9e87ab143d81e';

// Middleware for parsing JSON request bodies
app.use(bodyParser.json());
// Serve static files from the 'public' directory
app.use(express.static('public'));

// Function to format the conversation history and generate a response using Replicate
async function generate(history) {
  // Initialize an empty string to accumulate the formatted history
  let formattedHistory = '';

  // Loop through each message in the history array
  for (let i = 0; i < history.length; i++) {
    // Check the role of the message and format accordingly
    if (history[i].role === 'user') {
      // If the message is from the user, wrap the content with [INST] tags
      formattedHistory += `[INST] ${history[i].content} [/INST]\n`;
    } else {
      // If the message is not from the user, add it as is
      formattedHistory += `${history[i].content}\n`;
    }
  }

  // Remove the last newline character from the formatted history string
  if (formattedHistory.endsWith('\n')) {
    formattedHistory = formattedHistory.slice(0, -1);
  }

  // Construct the input object for the model
  const input = {
    prompt: formattedHistory,
    system_prompt: 'You are a helpful assistant.',
  };

  // Run the model with the formatted input and return the result
  const output = await replicate.run(`${model}:${version}`, { input });
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
