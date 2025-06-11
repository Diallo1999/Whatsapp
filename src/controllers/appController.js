import { getCurrentUser } from '../models/userModel.js';
import { initChat } from './chatController.js';
import { renderSettingsView } from '../views/settingsView.js';
import { initMenuController } from './menuController.js';
import { initChatFilters } from '../views/chatView.js';
import { createStatusView } from '../views/statusView.js';
import { addStatus, getMyStatuses } from '../models/statusModel.js';

function initApp() {
  setCurrentUserAvatar();
  
  initChat();
  initChatFilters();

  initMenuController();

  initNavigation();
  initStatusTab();
}

function setCurrentUserAvatar() {
  const currentUser = getCurrentUser();
  const avatarElement = document.getElementById('current-user-avatar');
  
  if (avatarElement) {
    avatarElement.src = currentUser.avatar;
  }
}

function initNavigation() {
  const statusBtn = document.getElementById('status-btn');
  const channelsBtn = document.getElementById('channels-btn');
  const chatsBtn = document.getElementById('chats-btn');
  const communitiesBtn = document.getElementById('communities-btn');
  const settingsBtn = document.getElementById('settings-btn');

  statusBtn.addEventListener('click', () => switchTab('status'));
  channelsBtn.addEventListener('click', () => switchTab('channels'));
  chatsBtn.addEventListener('click', () => switchTab('chats'));
  communitiesBtn.addEventListener('click', () => switchTab('communities'));
  settingsBtn.addEventListener('click', () => {
    switchTab('settings');
    renderSettingsView();
  });
}

function switchTab(tabName) {
  // Gérer les boutons
  const allButtons = document.querySelectorAll('#side-nav button');
  allButtons.forEach(button => {
    button.classList.remove('bg-[#00a884]', 'text-white');
    button.classList.add('bg-[#2a3942]', 'text-gray-400');
  });
  
  const activeButton = document.getElementById(`${tabName}-btn`);
  if (activeButton) {
    activeButton.classList.remove('bg-[#2a3942]', 'text-gray-400');
    activeButton.classList.add('bg-[#00a884]', 'text-white');
  }

  // Gérer l'affichage des contenus
  const containers = {
    chats: document.getElementById('chat-list-container'),
    status: document.getElementById('status-container'),
    channels: document.getElementById('channels-container'),
    communities: document.getElementById('communities-container'),
    settings: document.getElementById('settings-container')
  };

  // Cacher tous les conteneurs
  Object.values(containers).forEach(container => {
    if (container) container.classList.add('hidden');
  });

  // Afficher le conteneur actif
  const activeContainer = containers[tabName];
  if (activeContainer) {
    activeContainer.classList.remove('hidden');
    
    // Initialiser la vue si nécessaire
    if (tabName === 'status' && !activeContainer.hasChildNodes()) {
      const statusView = createStatusView();
      activeContainer.appendChild(statusView);
    }
  }
}

function initStatusTab() {
  const statusTab = document.getElementById('status-btn');
  const mainContent = document.getElementById('chat-content');
  const chatListContainer = document.getElementById('chat-list-container');

  if (!statusTab || !mainContent) return;

  statusTab.addEventListener('click', () => {
    // Cacher la liste des chats
    if (chatListContainer) {
      chatListContainer.classList.add('hidden');
    }

    // Afficher la vue des statuts avec l'écran de bienvenue
    let statusView = document.querySelector('.status-view');
    if (!statusView) {
      statusView = createStatusView();
      mainContent.insertBefore(statusView, mainContent.firstChild);
    }
    statusView.classList.remove('hidden');

    // Afficher l'écran de bienvenue à droite
    let welcomeScreen = document.querySelector('.welcome-screen');
    if (!welcomeScreen) {
      welcomeScreen = document.createElement('div');
      welcomeScreen.className = 'welcome-screen';
      welcomeScreen.innerHTML = `
        <div class="text-center">
          <img src="/whatsapp-web.svg" alt="WhatsApp" class="w-80 mb-8">
          <h1 class="text-3xl text-gray-200 mb-4">WhatsApp Web</h1>
          <p class="text-gray-400">Envoyez et recevez des messages sans conserver votre téléphone connecté.</p>
        </div>
      `;
      mainContent.appendChild(welcomeScreen);
    }
    welcomeScreen.classList.remove('hidden');
  });
}

export { initApp };