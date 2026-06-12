// EduBook Catalog Component
import store from '../store.js';
import { renderBookingForm } from './bookingForm.js';

export function renderCatalog(container) {
  let equipment = store.getEquipment();
  
  // State for filtering
  let searchQuery = '';
  let selectedCategory = 'All';
  let selectedStatus = 'All';

  // Get unique categories
  const categories = ['All', 'Informatique', 'Audiovisuel', 'Sciences', 'Robotique', 'Sport', 'Bibliothèque'];

  function filterAndRenderItems() {
    const catalogGrid = container.querySelector('#catalog-grid');
    if (!catalogGrid) return;

    // Filter items
    const filteredItems = equipment.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.ref.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      
      const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Check if empty
    if (filteredItems.length === 0) {
      catalogGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <i data-lucide="info" style="width: 48px; height: 48px; color: var(--text-muted); margin-bottom: 16px;"></i>
          <h3 style="color: var(--text-main);">Aucun matériel trouvé</h3>
          <p style="color: var(--text-muted); margin-top: 8px;">Essayez de modifier vos critères de recherche ou vos filtres.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    // Render items
    catalogGrid.innerHTML = filteredItems.map(item => {
      let badgeClass = 'badge-available';
      let statusLabel = 'Disponible';
      let buttonHtml = `<button class="btn btn-primary btn-book" data-item-id="${item.id}" style="width: 100%;">Réserver</button>`;

      if (item.status === 'reserved') {
        badgeClass = 'badge-reserved';
        statusLabel = 'Réservé';
        buttonHtml = `<button class="btn btn-secondary" disabled style="width: 100%;">Déjà Réservé</button>`;
      } else if (item.status === 'maintenance') {
        badgeClass = 'badge-maintenance';
        statusLabel = 'Maintenance';
        buttonHtml = `<button class="btn btn-secondary" disabled style="width: 100%;">En maintenance</button>`;
      } else if (item.status === 'outoforder') {
        badgeClass = 'badge-outoforder';
        statusLabel = 'Hors Service';
        buttonHtml = `<button class="btn btn-secondary" disabled style="width: 100%;">Hors service</button>`;
      }

      return `
        <div class="glass-card item-card">
          <div class="item-image-wrapper">
            <img src="${item.imageUrl}" alt="${item.name}" class="item-image" loading="lazy" />
            <span class="badge ${badgeClass} item-badge">
              <span class="badge-dot"></span>
              ${statusLabel}
            </span>
            <span class="item-category-badge">${item.category}</span>
          </div>
          <div class="item-content" style="display: flex; flex-direction: column; flex-grow: 1;">
            <h4 class="item-title">${item.name}</h4>
            <p class="item-description">${item.description}</p>
            <div class="item-footer">
              <span class="item-ref">${item.ref}</span>
            </div>
            <div style="margin-top: 16px;">
              ${buttonHtml}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Re-initialize icons for dynamic badges
    if (window.lucide) window.lucide.createIcons();

    // Attach click events to reserve buttons
    const bookButtons = catalogGrid.querySelectorAll('.btn-book');
    bookButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const itemId = btn.getAttribute('data-item-id');
        openBookingModal(itemId);
      });
    });
  }

  // Initial layout markup
  container.innerHTML = `
    <div style="margin-bottom: 28px;">
      <h1 style="margin-bottom: 4px;">Catalogue du Matériel</h1>
      <p style="color: var(--text-muted); font-size: 0.95rem;">Recherchez et réservez du matériel pédagogique pour vos cours.</p>
    </div>

    <!-- Controls area: Search & Filters -->
    <div class="glass-card" style="padding: 20px; margin-bottom: 28px;">
      <div class="catalog-controls">
        <!-- Search bar -->
        <div class="search-wrapper">
          <i data-lucide="search" class="search-icon" style="width: 20px; height: 20px;"></i>
          <input type="text" id="search-bar" class="form-control search-input" placeholder="Rechercher par nom, référence..." />
        </div>

        <!-- Filter Category -->
        <div class="filter-group-select" style="display: flex; gap: 12px; flex-wrap: wrap;">
          <div style="display: flex; flex-direction: column; min-width: 150px;">
            <label class="form-label" style="margin-bottom: 4px; font-size: 0.75rem; text-transform: uppercase;">Catégorie</label>
            <select id="category-filter" class="form-control" style="padding: 8px 12px; font-size: 0.85rem;">
              ${categories.map(cat => `<option value="${cat}">${cat === 'All' ? 'Toutes' : cat}</option>`).join('')}
            </select>
          </div>

          <!-- Filter Status -->
          <div style="display: flex; flex-direction: column; min-width: 150px;">
            <label class="form-label" style="margin-bottom: 4px; font-size: 0.75rem; text-transform: uppercase;">Disponibilité</label>
            <select id="status-filter" class="form-control" style="padding: 8px 12px; font-size: 0.85rem;">
              <option value="All">Tous</option>
              <option value="available">Disponible</option>
              <option value="reserved">Réservé</option>
              <option value="maintenance">En maintenance</option>
              <option value="outoforder">Hors service</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Catalog Grid -->
    <div class="catalog-grid" id="catalog-grid"></div>

    <!-- Container for booking modal -->
    <div id="booking-modal-placeholder"></div>
  `;

  // Bind controller logic
  const searchInput = container.querySelector('#search-bar');
  const categoryFilter = container.querySelector('#category-filter');
  const statusFilter = container.querySelector('#status-filter');

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    filterAndRenderItems();
  });

  categoryFilter.addEventListener('change', (e) => {
    selectedCategory = e.target.value;
    filterAndRenderItems();
  });

  statusFilter.addEventListener('change', (e) => {
    selectedStatus = e.target.value;
    filterAndRenderItems();
  });

  // Run initial filter and render
  filterAndRenderItems();

  // Helper to open the booking modal
  function openBookingModal(itemId) {
    const modalPlaceholder = container.querySelector('#booking-modal-placeholder');
    if (modalPlaceholder) {
      renderBookingForm(modalPlaceholder, itemId, () => {
        // Callback after successful booking
        equipment = store.getEquipment(); // Refresh equipment list state
        filterAndRenderItems(); // Refresh catalog grid view
      });
    }
  }
}
