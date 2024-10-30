// Get user input area
const userInput = document.getElementById('user-input');

// Adjust text area height based on content
userInput.addEventListener('input', function () {
  this.style.height = 'auto';
  this.style.height = this.scrollHeight + 'px';
});

// Store conversation history
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

  // Display message in the chat container
  messageDiv.appendChild(roleSpan);
  messageDiv.appendChild(contentSpan);
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Send and display a message
async function sendMessage() {
  const message = userInput.value;
  userInput.value = '';
  appendMessage('you', message);
  conversationHistory.push({ role: 'user', content: message });

  // Send message to the server
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history: conversationHistory }),
    });

    const data = await response.json();

    // Show chatbot's response
    appendMessage('chatbot', data.reply);
    conversationHistory.push({ role: 'assistant', content: data.reply });
    console.log(JSON.stringify(conversationHistory, null, 2));
  } catch (error) {
    console.error('Error communicating with server:', error);
  }
}
