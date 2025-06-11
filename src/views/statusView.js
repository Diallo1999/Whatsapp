function createStatusView() {
  const statusContainer = document.createElement('div');
  // Changement de la classe pour limiter la largeur
  statusContainer.className = 'status-view w-[400px] bg-[#111b21] h-full flex flex-col border-r border-gray-700';
  
  statusContainer.innerHTML = `
    <div class="p-4 bg-[#202c33] flex items-center justify-between border-b border-gray-700">
      <h2 class="text-white text-lg">Statut</h2>
    </div>

    <div class="overflow-y-auto flex-1">
      <div class="p-4">
        <div class="flex items-center gap-4 mb-6">
          <div class="relative">
            <div class="w-12 h-12 rounded-full bg-[#2a3942] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
            </div>
            <button id="add-status-btn" class="absolute bottom-0 right-0 w-5 h-5 bg-[#00a884] rounded-full flex items-center justify-center">
              <span class="text-white text-sm">+</span>
            </button>
          </div>
          <div>
            <h3 class="text-white text-sm font-medium">Mon statut</h3>
            <p class="text-gray-400 text-xs">Appuyez pour ajouter un statut</p>
          </div>
        </div>

        <div class="mb-6">
          <h4 class="text-[#008069] text-xs uppercase font-medium mb-4">Statuts récents</h4>
          <div id="status-list" class="space-y-4"></div>
        </div>
      </div>
    </div>
  `;

  // Ajouter les événements
  const addStatusBtn = statusContainer.querySelector('#add-status-btn');
  addStatusBtn.addEventListener('click', showAddStatusModal);

  return statusContainer;
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