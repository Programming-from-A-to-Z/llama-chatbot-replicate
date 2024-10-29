// Get the user input text area
const userInput = document.getElementById('user-input');

// Adjust the text area height based on content
userInput.addEventListener('input', function () {
  this.style.height = 'auto'; // Reset height
  this.style.height = this.scrollHeight + 'px'; // Set height based on content
});

// Array to store conversation history
let conversationHistory = [];

// Add a message to the chat container
function appendMessage(who, message) {
  const chatContainer = document.getElementById('chat-container');
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message';

  // Create sender label and message content
  const roleSpan = document.createElement('span');
  roleSpan.className = who.toLowerCase();
  roleSpan.textContent = who + ': ';

  const contentSpan = document.createElement('span');
  contentSpan.className = 'message-content';
  contentSpan.textContent = message;

  // Add elements to message div and display in chat
  messageDiv.appendChild(roleSpan);
  messageDiv.appendChild(contentSpan);
  chatContainer.appendChild(messageDiv);

  // Scroll to the latest message
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Send and display a message
async function sendMessage() {
  const userInput = document.getElementById('user-input');
  const message = userInput.value;
  userInput.value = ''; // Clear input
  appendMessage('you', message); // Show user's message

  // Add user's message to conversation history
  conversationHistory.push({ role: 'user', content: message });

  // Try sending the message to the server
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history: conversationHistory }),
    });
    const data = await response.json();

    // Display and log the chatbot's response
    appendMessage('chatbot', data.reply);
    conversationHistory.push({ role: 'assistant', content: data.reply });
    console.log(JSON.stringify(conversationHistory, null, 2));
  } catch (error) {
    console.error('Error communicating with server:', error); // Log errors
  }
}
