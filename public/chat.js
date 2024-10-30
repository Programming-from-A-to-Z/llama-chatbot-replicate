// Access the user input text area
const userInput = document.getElementById('user-input');

// Event listener to adjust the height of the text area based on its content
userInput.addEventListener('input', function () {
  this.style.height = 'auto'; // Reset the height to default
  this.style.height = this.scrollHeight + 'px'; // Set the height based on the content
});

// Initialize an array to store the conversation history
let conversationHistory = [];

// Function to append a message to the chat container
function appendMessage(who, message) {
  // Access the chat container where messages will be displayed
  const chatContainer = document.getElementById('chat-container');
  // Create a new div element to hold the message
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message'; // Assign a class for styling

  // Create a span element to label the message sender
  const roleSpan = document.createElement('span');
  roleSpan.className = who.toLowerCase(); // Class based on the sender's role
  roleSpan.textContent = who + ': '; // Text to indicate the sender

  // Create a span element to contain the message text
  const contentSpan = document.createElement('span');
  contentSpan.className = 'message-content'; // Class for styling message content
  contentSpan.textContent = message; // The actual message text

  // Add the sender label and message content to the message div
  messageDiv.appendChild(roleSpan);
  messageDiv.appendChild(contentSpan);
  // Add the message div to the chat container
  chatContainer.appendChild(messageDiv);

  // Automatically scroll the chat container to the newest message
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Async function to handle sending messages
async function sendMessage() {
  // Access the user input element and get the current message
  const userInput = document.getElementById('user-input');
  const message = userInput.value;
  userInput.value = ''; // Clear the input after getting the message
  appendMessage('you', message); // Display the user's message in the chat
  // Add the user's message to the conversation history
  conversationHistory.push({ role: 'user', content: message });

  // Automatically scroll the chat container to the newest message
  const chatContainer = document.getElementById('chat-container');
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Try to send the message to the server and process the response
  try {
    // Make a POST request to the server to send the user's message
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Indicate that we're sending JSON data
      },
      body: JSON.stringify({ history: conversationHistory }), // Send the conversation history
    });
    // Parse the JSON response from the server
    const data = await response.json();
    // Display the chatbot's response in the chat
    appendMessage('chatbot', data.reply);
    // Add the chatbot's message to the conversation history
    conversationHistory.push({ role: 'assistant', content: data.reply });

    // Log the conversation history for debugging
    console.log(JSON.stringify(conversationHistory, null, 2));
  } catch (error) {
    // Log any errors that occur during the fetch operation
    console.error('Error communicating with server:', error);
  }
}
