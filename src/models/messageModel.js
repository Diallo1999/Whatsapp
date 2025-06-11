import { updateLastMessage, createNewChat, getAllChats, getChatById } from './chatModel.js';

// Modifier l'URL de l'API
const API_URL = 'https://server-vo8j.onrender.com';

// Initialiser un objet vide pour les messages  
let messages = {};

// Charger les messages depuis le localStorage
function loadMessages() {
  const savedMessages = localStorage.getItem('whatsapp_messages');
  messages = savedMessages ? JSON.parse(savedMessages) : {};
}

// Sauvegarder les messages dans le localStorage
function saveMessages() {
  localStorage.setItem('whatsapp_messages', JSON.stringify(messages));
}

function getMessagesByChatId(chatId) {
  loadMessages();
  return messages[chatId] || [];
}

async function addMessage(chatId, text) {
  try {
    const message = {
      id: Date.now().toString(),
      chatId: chatId, 
      text: text,
      timestamp: new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      sent: true
    };

    // Modifier l'URL de l'appel API
    const response = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'ajout du message');
    }

    await updateLastMessage(chatId, text);
    return message;

  } catch (error) {
    console.error('Erreur addMessage:', error);
    return null;
  }
}

export {
  getMessagesByChatId,
  addMessage
};