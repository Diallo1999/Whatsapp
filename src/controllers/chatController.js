import { getAllChats, getChatById, searchChats, markAsRead, createNewChat } from '../models/chatModel.js';
import { getMessagesByChatId, addMessage } from '../models/messageModel.js';
import { renderChatList, updateChatInList } from '../views/chatListView.js';
import { 
  renderChatHeader, 
  renderMessages, 
  addMessageToChat, 
  initMessageInput 
} from '../views/chatView.js';
import { renderNewDiscussionView, hideNewDiscussionView } from '../views/newDiscussionView.js';

let activeChat = null;

function initChat() {
  const chats = getAllChats();
  renderChatList(chats, handleChatClick);

  initSearch();
  initMessageInput(handleSendMessage);
  
  initNewChatButton();
}

function initNewChatButton() {
  const newChatBtn = document.getElementById('new-chat-btn');
  if (!newChatBtn) return;

  newChatBtn.addEventListener('click', async () => {
    try {
      await renderNewDiscussionView(handleNewChat);
    } catch (error) {
      console.error('Error opening new discussion view:', error);
    }
  });
}

async function handleNewChat(contact) {
  try {
    if (!contact || !contact.id) {
      throw new Error('Contact invalide');
    }

    // Créer ou récupérer le chat
    const chat = await createNewChat(contact);
    if (!chat) {
      throw new Error('Erreur lors de la création du chat');
    }

    // Définir le chat actif
    activeChat = chat;
    window.activeChat = chat;

    // Mettre à jour l'interface
    showChatInterface();
    renderChatHeader(chat);
    renderMessages([]); // Commencer avec une liste vide de messages

    // Mettre à jour la liste des chats
    const allChats = getAllChats();
    renderChatList(allChats, handleChatClick);

    // Créer un message de bienvenue
    if (!chat.lastMessage) {
      const welcomeMessage = {
        id: Date.now().toString(),
        chatId: chat.id,
        text: `Début de la conversation avec ${contact.name}`,
        timestamp: new Date().toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        isSystem: true
      };
      addMessageToChat(welcomeMessage);
    }

  } catch (error) {
    console.error('Erreur handleNewChat:', error);
    showNotification('Erreur lors de la création de la discussion', 'error');
  }
}

function showChatInterface() {
  const messagesContainer = document.getElementById('messages-container');
  const welcomeScreen = document.getElementById('welcome-screen');
  const chatHeader = document.getElementById('chat-header');
  const messageInput = document.getElementById('message-input-container');

  if (welcomeScreen) {
    welcomeScreen.classList.add('hidden');
  }
  
  if (messagesContainer) {
    messagesContainer.classList.remove('hidden');
  }
  
  if (chatHeader) {
    chatHeader.classList.remove('hidden');
  }
  
  if (messageInput) {
    messageInput.classList.remove('hidden');
  }
}

function handleChatClick(chat) {
  if (!chat || !chat.id) {
    console.error('Invalid chat object');
    return;
  }

  // Masquer l'écran de bienvenue
  const welcomeScreen = document.getElementById('welcome-screen');
  if (welcomeScreen) {
    welcomeScreen.style.display = 'none';
  }

  // Afficher les éléments de chat
  const messagesContainer = document.getElementById('messages-container');
  const chatHeader = document.getElementById('chat-header');
  const messageInput = document.getElementById('message-input-container');

  if (messagesContainer) {
    messagesContainer.classList.remove('hidden');
  }
  
  if (chatHeader) {
    chatHeader.classList.remove('hidden');
  }
  
  if (messageInput) {
    messageInput.classList.remove('hidden');
  }

  // Gérer les messages non lus
  if (chat.unreadCount > 0) {
    markAsRead(chat.id);
    updateChatInList(getChatById(chat.id));
  }

  // Mettre à jour le chat actif
  activeChat = chat;
  window.activeChat = chat;

  // Mettre à jour l'interface
  renderChatHeader(chat);
  const messages = getMessagesByChatId(chat.id);
  renderMessages(messages || []);
}

function initSearch() {
  const searchInput = document.getElementById('search-input');
  
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim();
      const filteredChats = searchChats(query);
      renderChatList(filteredChats, handleChatClick);
    });
  }
}

async function handleSendMessage(text, isVoice = false, duration = null, audioBlob = null) {
  if (!activeChat || !activeChat.id) {
    console.error('No active chat or invalid chat ID');
    return;
  }
  
  try {
    let message;
    
    if (isVoice && audioBlob) {
      // Créer un message vocal
      message = {
        id: Date.now().toString(),
        chatId: activeChat.id,
        text: text,
        timestamp: new Date().toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        isMe: true,
        isVoice: true,
        duration: duration,
        audioBlob: audioBlob
      };
      
      // Ajouter le message directement à l'interface
      addMessageToChat(message);
      
      // Mettre à jour le dernier message dans la liste des chats
      const chats = getAllChats();
      renderChatList(chats, handleChatClick);
      
    } else {
      // Message texte normal
      message = await addMessage(activeChat.id, text);
      if (message) {
        addMessageToChat(message);
        const chats = getAllChats();
        renderChatList(chats, handleChatClick);
        
        // Simuler une réponse
        simulateReply(activeChat.id);
      }
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

function simulateReply(chatId) {
  setTimeout(() => {
    if (activeChat && activeChat.id === chatId) {
      const replies = [
        "D'accord, je comprends.",
        "Merci pour l'information.",
        "Intéressant, dis-m'en plus.",
        "Je suis d'accord avec toi.",
        "On peut en discuter plus tard?",
        "👍",
        "😊",
        "Je vais y réfléchir."
      ];
      
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const replyMessage = addMessage(chatId, randomReply, false);
      addMessageToChat(replyMessage);
      
      const updatedChat = getChatById(chatId);
      updateChatInList({
        ...updatedChat,
        lastMessage: randomReply,
        timestamp: replyMessage.timestamp
      });
    }
  }, 2000);
}

// Message reçu
const message = {
  text: "Message reçu",
  isMe: false, // Pour les messages que vous recevez
  timestamp: "..."
};

async function handleContactSelect(contact) {
  try {
    // Créer ou récupérer le chat existant
    const chat = await createNewChat(contact);
    
    if (!chat) {
      throw new Error('Erreur lors de la création du chat');
    }

    // Définir le chat actif
    activeChat = chat;
    window.activeChat = chat;

    // Masquer l'écran de bienvenue s'il est visible
    const welcomeScreen = document.getElementById('welcome-screen');
    if (welcomeScreen) {
      welcomeScreen.style.display = 'none';
    }

    // Afficher l'interface du chat
    showChatInterface();

    // Mettre à jour l'interface
    renderChatHeader(chat);
    
    // Charger et afficher les messages
    const messages = getMessagesByChatId(chat.id);
    renderMessages(messages || []);

    // Afficher le conteneur de saisie de message
    const messageInput = document.getElementById('message-input-container');
    if (messageInput) {
      messageInput.style.display = 'flex';
    }

    // Mettre à jour la liste des chats
    const allChats = getAllChats();
    renderChatList(allChats, handleChatClick);

  } catch (error) {
    console.error('Erreur handleContactSelect:', error);
    showNotification('Erreur lors de l\'ouverture de la discussion', 'error');
  }
}

export { initChat };