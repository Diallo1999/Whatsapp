// Fichier chatView.js simplifié et corrigé
import { EmojiPicker } from '../components/EmojiPicker.js';
import { renderChatOptionsModal } from './chatOptionsModalView.js';
import { MenuIcon, SearchIcon } from '../utils/icons.js';
import { 
  initEmojiPicker, 
  startVoiceRecording, 
  stopVoiceRecording, 
  cancelVoiceRecording,
  handleFileUpload,
  formatFileSize,
  startRecordingTimer,
  stopRecordingTimer
} from './chatView2.js';

let emojiPicker = null;
let isRecording = false;
let mediaRecorder = null;

// Render the chat header with the active chat information
function renderChatHeader(chat) {
  const chatHeader = document.getElementById('chat-header');
  const activeChatName = document.getElementById('active-chat-name');
  const activeChatStatus = document.getElementById('active-chat-status');
  const activeChatAvatar = document.getElementById('active-chat-avatar');
  const headerRight = document.querySelector('.chat-header-right');
  
  chatHeader.classList.remove('hidden');
  activeChatName.textContent = chat.name;
  activeChatStatus.textContent = chat.online ? 'En ligne' : 'Hors ligne';
  activeChatAvatar.src = chat.avatar;

  if (headerRight) {
    headerRight.innerHTML = `
      <button class="search-btn p-2 hover:bg-[#374045] rounded-full">
        <div class="w-5 h-5 text-[#aebac1]">${SearchIcon}</div>
      </button>
      <button id="chat-options-btn" class="chat-options-btn p-2 hover:bg-[#374045] rounded-full">
        <div class="w-5 h-5 text-[#aebac1]">${MenuIcon}</div>
      </button>
    `;

    const optionsBtn = headerRight.querySelector('.chat-options-btn');
    optionsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const buttonRect = optionsBtn.getBoundingClientRect();
      const position = {
        x: window.innerWidth - buttonRect.right + buttonRect.width + 5,
        y: buttonRect.bottom + 5
      };

      renderChatOptionsModal(position);
    });
  }
}

// Render messages for a specific chat
function renderMessages(messages) {
  const messagesContainer = document.getElementById('messages-container');
  const messagesList = document.getElementById('messages-list');
  messagesList.innerHTML = '';
  
  // Ajout de la date
  const dateSeparator = document.createElement('div');
  dateSeparator.className = 'flex justify-center my-4';
  const dateElement = document.createElement('span');
  dateElement.className = 'bg-[#182229] text-[#8696a0] text-xs px-3 py-1 rounded-lg';
  dateElement.textContent = 'AUJOURD\'HUI';
  
  dateSeparator.appendChild(dateElement);
  messagesList.appendChild(dateSeparator);

  messages.forEach(message => {
    const messageElement = createMessageElement(message);
    messagesList.appendChild(messageElement);
  });

  // Scroll vers le bas
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Create a single message element
function createMessageElement(message) {
  const messageElement = document.createElement('div');
  
  // Conteneur principal du message avec marge
  messageElement.className = `flex ${message.isMe ? 'justify-end' : 'justify-start'} mb-2 px-4`;
  
  const messageBubble = document.createElement('div');
  // Style amélioré pour la bulle de message
  messageBubble.className = `relative max-w-[65%] rounded-lg px-3 py-2 ${
    message.isMe 
      ? 'bg-[#005c4b] rounded-tr-none ml-auto' 
      : 'bg-[#202c33] rounded-tl-none'
  }`;

  // Ajout du texte du message
  const messageText = document.createElement('div');
  messageText.className = 'text-white text-sm break-words';
  messageText.innerHTML = parseEmojis(message.text);

  // Ajout du timestamp
  const timeStamp = document.createElement('span');
  timeStamp.className = 'text-[11px] text-gray-400 ml-2 float-right mt-1';
  timeStamp.textContent = message.timestamp;

  // Assemblage des éléments
  messageBubble.appendChild(messageText);
  messageBubble.appendChild(timeStamp);
  messageElement.appendChild(messageBubble);

  return messageElement;
}

function createVoiceMessageElement(message) {
  const voiceContainer = document.createElement('div');
  voiceContainer.className = 'flex items-center gap-2 min-w-[200px]';
  
  const playButton = document.createElement('button');
  playButton.className = 'text-white hover:text-gray-300 flex-shrink-0';
  playButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
  
  const waveform = document.createElement('div');
  waveform.className = 'h-8 flex-1 bg-[#2a3942] rounded-lg flex items-center justify-center px-2';
  waveform.innerHTML = '<div class="flex gap-1 items-center">' + 
    Array.from({length: 20}, () => '<div class="w-1 bg-gray-400 rounded" style="height: ' + (Math.random() * 20 + 5) + 'px"></div>').join('') +
    '</div>';
  
  const duration = document.createElement('span');
  duration.className = 'text-sm text-gray-400 flex-shrink-0';
  duration.textContent = message.duration || '00:00';

  // Audio functionality
  if (message.audioUrl || message.audioBlob) {
    const audioElement = document.createElement('audio');
    if (message.audioBlob instanceof Blob) {
      const audioUrl = URL.createObjectURL(message.audioBlob);
      audioElement.src = audioUrl;
    } else if (message.audioUrl) {
      audioElement.src = message.audioUrl;
    }
    audioElement.preload = 'metadata';

    let isPlaying = false;

    playButton.addEventListener('click', () => {
      // Stop all other audio elements
      const allAudioElements = document.querySelectorAll('audio');
      allAudioElements.forEach(audio => {
        if (audio !== audioElement && !audio.paused) {
          audio.pause();
          audio.currentTime = 0;
        }
      });

      // Reset all other play buttons
      const allPlayButtons = document.querySelectorAll('.voice-play-btn');
      allPlayButtons.forEach(btn => {
        if (btn !== playButton) {
          btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
        }
      });

      if (isPlaying) {
        audioElement.pause();
        audioElement.currentTime = 0;
        playButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
        isPlaying = false;
      } else {
        audioElement.play().then(() => {
          playButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
          isPlaying = true;
        }).catch(error => {
          console.error('Erreur lors de la lecture audio:', error);
        });
      }
    });

    audioElement.addEventListener('ended', () => {
      isPlaying = false;
      playButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
    });

    playButton.classList.add('voice-play-btn');
  }

  voiceContainer.appendChild(playButton);
  voiceContainer.appendChild(waveform);
  voiceContainer.appendChild(duration);
  
  return voiceContainer;
}

function createFileMessageElement(message) {
  const fileContainer = document.createElement('div');
  fileContainer.className = 'flex items-center gap-3 p-2 bg-[#2a3942] rounded-lg min-w-[200px]';
  
  const fileIcon = document.createElement('div');
  fileIcon.className = 'w-10 h-10 bg-[#00a884] rounded-full flex items-center justify-center flex-shrink-0';
  fileIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>';
  
  const fileInfo = document.createElement('div');
  fileInfo.className = 'flex-1 min-w-0';
  
  const fileName = document.createElement('div');
  fileName.className = 'text-white text-sm font-medium truncate';
  fileName.textContent = message.fileName || 'Document';
  
  const fileSize = document.createElement('div');
  fileSize.className = 'text-gray-400 text-xs';
  fileSize.textContent = formatFileSize(message.fileSize || 0);
  
  fileInfo.appendChild(fileName);
  fileInfo.appendChild(fileSize);
  
  fileContainer.appendChild(fileIcon);
  fileContainer.appendChild(fileInfo);
  
  return fileContainer;
}

function parseEmojis(text = '') {
  // Simple emoji parsing - in a real app you'd use a proper emoji library
  return text.replace(/:\)/g, '😊')
             .replace(/:\(/g, '😢')
             .replace(/:D/g, '😃')
             .replace(/;\)/g, '😉')
             .replace(/<3/g, '❤️');
}

// Add a new message to the chat
function addMessageToChat(message) {
  const messagesList = document.getElementById('messages-list');
  const messageElement = createMessageElement(message);
  messagesList.appendChild(messageElement);
  
  // Scroll to bottom
  const messagesContainer = document.getElementById('messages-container');
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Initialize the message input and voice recording
function initMessageInput(onSendMessage) {
  const messageInput = document.getElementById('message-input');
  const voiceBtn = document.getElementById('voice-btn');
  const emojiBtn = document.getElementById('emoji-btn');
  const messageInputContainer = document.getElementById('message-input-container');

  // Initialize emoji picker
  emojiPicker = initEmojiPicker();

  // Save original HTML
  const originalInputHTML = messageInputContainer.innerHTML;

  // Emoji button click handler
  emojiBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    emojiPicker.toggle((emoji) => {
      const currentValue = messageInput.value;
      const cursorPosition = messageInput.selectionStart;
      const newValue = currentValue.slice(0, cursorPosition) + emoji + currentValue.slice(cursorPosition);
      messageInput.value = newValue;
      messageInput.focus();
      messageInput.setSelectionRange(cursorPosition + emoji.length, cursorPosition + emoji.length);
      updateButton(newValue);
    });
  });

  async function handleVoiceRecord() {
    try {
      if (!isRecording) {
        mediaRecorder = await startVoiceRecording();
        isRecording = true;

        // Update UI for recording
        messageInputContainer.innerHTML = `
          <div class="flex items-center w-full bg-[#2a3942] rounded-lg px-4 py-2">
            <div class="flex-1 flex items-center">
              <div class="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-3"></div>
              <span class="text-gray-400" id="recording-timer">0:00</span>
            </div>
            <div class="flex items-center gap-4">
              <button id="cancel-record" class="text-gray-400 hover:text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <button id="send-record" class="text-gray-400 hover:text-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          </div>
        `;

        const timerElement = document.getElementById('recording-timer');
        startRecordingTimer(timerElement);

        // Add event listeners for recording controls
        document.getElementById('cancel-record').addEventListener('click', () => {
          cancelVoiceRecording();
          resetRecording();
        });

        document.getElementById('send-record').addEventListener('click', () => {
          stopVoiceRecording();
          // The audio will be processed in the mediaRecorder.stop event
          setTimeout(() => {
            if (mediaRecorder && mediaRecorder.audioChunks && mediaRecorder.audioChunks.length > 0) {
              const audioBlob = new Blob(mediaRecorder.audioChunks, { type: mediaRecorder.mimeType });
              const duration = getDuration(mediaRecorder.recordingStartTime);
              onSendMessage("Message vocal", true, duration, audioBlob);
            }
            resetRecording();
          }, 100);
        });

      }
    } catch (error) {
      console.error("Erreur d'accès au microphone:", error);
      alert("Impossible d'accéder au microphone. Vérifiez les permissions dans les paramètres de votre navigateur.");
      resetRecording();
    }
  }

  function resetRecording() {
    isRecording = false;
    stopRecordingTimer();
    mediaRecorder = null;
    
    // Reset UI
    messageInputContainer.innerHTML = originalInputHTML;
    
    // Reinitialize event listeners
    attachInputListeners();
  }

  function attachInputListeners() {
    const messageInput = document.getElementById('message-input');
    const voiceBtn = document.getElementById('voice-btn');
    const emojiBtn = document.getElementById('emoji-btn');

    if (!messageInput || !voiceBtn || !emojiBtn) return;

    function handleInput() {
      updateButton(messageInput.value);
    }

    function handleKeyPress(event) {
      if (event.key === 'Enter' && messageInput.value.trim() !== '') {
        onSendMessage(messageInput.value);
        messageInput.value = '';
        updateButton('');
      }
    }

    messageInput.addEventListener('input', handleInput);
    messageInput.addEventListener('keypress', handleKeyPress);

    emojiBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      emojiPicker.toggle((emoji) => {
        const currentValue = messageInput.value;
        const cursorPosition = messageInput.selectionStart;
        const newValue = currentValue.slice(0, cursorPosition) + emoji + currentValue.slice(cursorPosition);
        messageInput.value = newValue;
        messageInput.focus();
        messageInput.setSelectionRange(cursorPosition + emoji.length, cursorPosition + emoji.length);
        updateButton(newValue);
      });
    });

    updateButton(messageInput.value);
  }

  function updateButton(text) {
    const voiceBtn = document.getElementById('voice-btn');
    if (!voiceBtn) return;

    if (text.trim().length > 0) {
      // Change to send icon
      voiceBtn.innerHTML = `
        <div class="w-6 h-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </div>
      `;
      
      const newVoiceBtn = voiceBtn.cloneNode(true);
      voiceBtn.parentNode.replaceChild(newVoiceBtn, voiceBtn);
      
      newVoiceBtn.addEventListener('click', () => {
        const messageInput = document.getElementById('message-input');
        if (messageInput && messageInput.value.trim()) {
          onSendMessage(messageInput.value.trim());
          messageInput.value = '';
          updateButton('');
          messageInput.focus();
        }
      });
    } else {
      // Change to microphone icon
      voiceBtn.innerHTML = `
        <div class="w-6 h-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>
        </div>
      `;
      
      const newVoiceBtn = voiceBtn.cloneNode(true);
      voiceBtn.parentNode.replaceChild(newVoiceBtn, voiceBtn);
      
      newVoiceBtn.addEventListener('click', handleVoiceRecord);
    }
  }

  attachInputListeners();
  updateButton('');
}

function getDuration(startTime) {
  const duration = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function initChatFilters() {
  const chatListHeader = document.querySelector('#chat-list-container');
  if (!chatListHeader) return;

  const filtersContainer = document.createElement('div');
  filtersContainer.className = 'flex space-x-2 p-3 bg-[#111b21] border-b border-gray-700';
  filtersContainer.innerHTML = `
    <button class="filter-btn px-4 py-1 rounded-full text-sm font-medium bg-[#00a884] text-white hover:bg-[#06cf9c] transition-colors" data-filter="all">
      Toutes
    </button>
    <button class="filter-btn px-4 py-1 rounded-full text-sm font-medium text-gray-400 hover:bg-[#202c33] transition-colors" data-filter="unread">
      Non lues
    </button>
    <button class="filter-btn px-4 py-1 rounded-full text-sm font-medium text-gray-400 hover:bg-[#202c33] transition-colors" data-filter="favorites">
      Favoris
    </button>
    <button class="filter-btn px-4 py-1 rounded-full text-sm font-medium text-gray-400 hover:bg-[#202c33] transition-colors" data-filter="groups">
      Groupes
    </button>
  `;

  const searchContainer = document.getElementById('search-container');
  if (searchContainer) {
    searchContainer.after(filtersContainer);
  }

  const filterButtons = filtersContainer.querySelectorAll('.filter-btn');
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => {
        btn.className = 'filter-btn px-4 py-1 rounded-full text-sm font-medium text-gray-400 hover:bg-[#202c33] transition-colors';
      });
      
      button.className = 'filter-btn px-4 py-1 rounded-full text-sm font-medium bg-[#00a884] text-white hover:bg-[#06cf9c] transition-colors';
      
      filterChats(button.dataset.filter);
    });
  });
}

function filterChats(filterType) {
  const chatElements = document.querySelectorAll('#chat-list .chat-item');
  chatElements.forEach(chat => {
    switch(filterType) {
      case 'unread':
        chat.style.display = chat.querySelector('.unread-count') ? 'flex' : 'none';
        break;
      case 'favorites':
        chat.style.display = chat.dataset.favorite === 'true' ? 'flex' : 'none';
        break;
      case 'groups':
        chat.style.display = chat.dataset.isGroup === 'true' ? 'flex' : 'none';
        break;
      default:
        chat.style.display = 'flex';
    }
  });
}

// Add this function after the existing UI rendering functions
function renderAttachmentModal(position) {
  // Remove any existing modals
  const existingModal = document.querySelector('.attachment-modal');
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement('div');
  modal.className = 'attachment-modal absolute bg-[#233138] rounded-lg shadow-lg z-50';
  modal.style.right = `${position.x}px`;
  modal.style.top = `${position.y}px`;

  const options = [
    {icon: '📷', label: 'Photo/Vidéo'},
    {icon: '📎', label: 'Document'}, 
    {icon: '📍', label: 'Localisation'},
    {icon: '👤', label: 'Contact'}
  ];

  const optionsList = options.map(opt => `
    <button class="w-full px-4 py-2 flex items-center gap-3 hover:bg-[#182229] text-white text-sm">
      <span>${opt.icon}</span>
      <span>${opt.label}</span>
    </button>
  `).join('');

  modal.innerHTML = optionsList;

  document.body.appendChild(modal);

  // Close modal when clicking outside
  document.addEventListener('click', function closeModal(e) {
    if (!modal.contains(e.target)) {
      modal.remove();
      document.removeEventListener('click', closeModal);
    }
  });
}

export {
  renderChatHeader,
  renderMessages,
  createMessageElement,
  addMessageToChat,
  initMessageInput,
  initChatFilters
};