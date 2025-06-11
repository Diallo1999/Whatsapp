function createStatusView() {
  // Conteneur principal prenant toute la hauteur
  const container = document.createElement('div');
  container.className = 'flex w-full h-screen'; // Ajout de h-screen pour prendre toute la hauteur
  
  // Partie gauche - Statuts (prend toute la hauteur)
  const statusContainer = document.createElement('div');
  statusContainer.className = 'w-[400px] bg-[#111b21] h-screen flex flex-col border-r border-gray-700';
  
  statusContainer.innerHTML = `
    <div class="p-4 bg-[#202c33] flex items-center">
      <button id="status-back-btn" class="text-gray-400 hover:text-white mr-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <h2 class="text-white text-xl font-medium">Statut</h2>
    </div>

    <div class="overflow-y-auto flex-1"> <!-- Ajout d'un conteneur scrollable -->
      <!-- Entête chiffrement -->
      <div class="p-3 bg-[#111b21] border-b border-gray-700">
        <div class="flex items-center gap-2 text-gray-400 text-sm">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
          <span>Vos mises à jour sont chiffrées de bout en bout</span>
        </div>
      </div>

      <!-- Mon statut -->
      <div class="p-3 bg-[#111b21] border-b border-gray-700">
        <div class="flex items-center gap-4">
          <div class="relative">
            <div class="w-12 h-12 rounded-full bg-[#2a3942] flex items-center justify-center overflow-hidden">
              <svg class="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <button id="add-status-btn" class="absolute bottom-0 right-0 w-5 h-5 bg-[#00a884] rounded-full flex items-center justify-center">
              <span class="text-white text-lg">+</span>
            </button>
          </div>
          <div>
            <h3 class="text-white text-[15px]">Mon statut</h3>
            <p class="text-gray-400 text-[13px]">Aucune mise à jour</p>
          </div>
        </div>
      </div>

      <!-- Statuts récents -->
      <div class="px-3 py-2">
        <h4 class="text-[#00a884] text-xs font-medium uppercase tracking-wide mb-3">Statuts récents</h4>
        <div id="status-list" class="space-y-3">
          <!-- Les statuts seront injectés ici dynamiquement -->
        </div>
      </div>
    </div>
  `;

  // Partie droite - Message WhatsApp Windows
  const welcomeContainer = document.createElement('div');
  welcomeContainer.className = 'flex-1 bg-[#222e35] h-screen flex flex-col items-center justify-center';
  welcomeContainer.innerHTML = `
    <div class="w-72 h-72 rounded-full bg-[#364147] flex items-center justify-center mb-8">
      <div class="w-56 h-56 text-gray-500"></div>
    </div>
    <h1 class="text-3xl text-white font-light mb-3">WhatsApp pour Windows</h1>
    <p class="text-gray-400 text-center max-w-md">
      Envoyez et recevez des messages sans avoir à garder votre téléphone connecté.
      <br>
      Utilisez WhatsApp sur un maximum de 4 appareils et 1 téléphone, simultanément.
    </p>
  `;

  // Assembler les deux parties
  container.appendChild(statusContainer);
  container.appendChild(welcomeContainer);

  // Gestionnaires d'événements
  const addStatusBtn = statusContainer.querySelector('#add-status-btn');
  addStatusBtn.addEventListener('click', showAddStatusModal);

  const backBtn = statusContainer.querySelector('#status-back-btn');
  backBtn.addEventListener('click', () => {
    container.remove();
    const chatList = document.getElementById('chat-list-container');
    if (chatList) {
      chatList.style.display = 'flex';
    }
  });

  return container;
}

function showAddStatusModal() {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  
  modal.innerHTML = `
    <div class="bg-[#2a3942] rounded-lg p-4 w-72">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-white text-lg">Ajouter un statut</h3>
        <button class="text-gray-400 hover:text-white" id="close-modal">×</button>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <button class="p-4 bg-[#111b21] rounded-lg text-white hover:bg-[#182229]">
          <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <span>Photo</span>
        </button>
        <button class="p-4 bg-[#111b21] rounded-lg text-white hover:bg-[#182229]">
          <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
          </svg>
          <span>Texte</span>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Fermer le modal
  modal.querySelector('#close-modal').addEventListener('click', () => {
    modal.remove();
  });

  // Fermer en cliquant en dehors
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

export { createStatusView, showAddStatusModal };