// EduBook Administrative Panel Component
import store from '../store.js';
import toast from '../utils/toast.js';

export function renderAdminPanel(container) {
  let activeTab = 'bookings'; // bookings, equipment, stats
  
  function renderContent() {
    const dynamicContent = container.querySelector('#admin-dynamic-content');
    if (!dynamicContent) return;

    dynamicContent.innerHTML = '';
    
    if (activeTab === 'bookings') {
      renderBookingsTab(dynamicContent);
    } else if (activeTab === 'equipment') {
      renderEquipmentTab(dynamicContent);
    } else if (activeTab === 'stats') {
      renderStatsTab(dynamicContent);
    }

    if (window.lucide) window.lucide.createIcons();
  }

  // --- HTML Framework Layout ---
  container.innerHTML = `
    <div style="margin-bottom: 28px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
      <div>
        <h1 style="margin-bottom: 4px;">Console d'Administration</h1>
        <p style="color: var(--text-muted); font-size: 0.95rem;">Gérez l'inventaire, validez les réservations des enseignants et visualisez les statistiques d'utilisation.</p>
      </div>
      <button class="btn btn-secondary" id="btn-export-data">
        <i data-lucide="download" style="width: 18px; height: 18px;"></i>
        Exporter les données (JSON)
      </button>
    </div>

    <!-- Administrative Sub-navigation tabs -->
    <div class="glass-card" style="padding: 12px; margin-bottom: 24px;">
      <div class="admin-tabs" style="border-bottom: none; padding-bottom: 0; margin-bottom: 0;">
        <button class="admin-tab active" data-tab="bookings" style="display: flex; align-items: center; gap: 8px;">
          <i data-lucide="file-check" style="width: 16px; height: 16px;"></i>
          Demandes & Réservations
        </button>
        <button class="admin-tab" data-tab="equipment" style="display: flex; align-items: center; gap: 8px;">
          <i data-lucide="box" style="width: 16px; height: 16px;"></i>
          Gestion du Matériel
        </button>
        <button class="admin-tab" data-tab="stats" style="display: flex; align-items: center; gap: 8px;">
          <i data-lucide="pie-chart" style="width: 16px; height: 16px;"></i>
          Rapports & Stats
        </button>
      </div>
    </div>

    <!-- Dynamic Target Div -->
    <div id="admin-dynamic-content"></div>

    <!-- Overlay placeholders for forms -->
    <div id="admin-modal-placeholder"></div>
  `;

  // Bind main tab buttons
  const tabs = container.querySelectorAll('.admin-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeTab = tab.getAttribute('data-tab');
      renderContent();
    });
  });

  // Bind JSON exporter
  container.querySelector('#btn-export-data').addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(store.state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `edubook_export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Exportation du fichier de base de données effectuée avec succès.");
  });

  // Initial draw
  renderContent();

  // ==========================================
  // TAB 1: BOOKINGS & VALIDATION
  // ==========================================
  function renderBookingsTab(parent) {
    const reservations = store.getReservations();
    const equipment = store.getEquipment();

    // Filter to only display items that require admin action or are active/pending
    const pendingReservations = reservations.filter(res => res.status === 'pending' || res.prolongationRequested);
    const otherReservations = reservations.filter(res => res.status !== 'pending' && !res.prolongationRequested);

    parent.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        
        <!-- Section: Demandes en attente -->
        <div class="glass-card" style="padding: 20px;">
          <h3 style="margin-bottom: 20px; font-size: 1.1rem; display: flex; align-items: center; gap: 8px; color: var(--warning);">
            <i data-lucide="clock" style="width: 18px; height: 18px;"></i>
            Demandes En Attente d'Action (${pendingReservations.length})
          </h3>
          
          ${pendingReservations.length === 0 ? `
            <div style="text-align: center; padding: 24px; color: var(--text-muted);">
              Aucune demande de réservation ou de prolongation en attente.
            </div>
          ` : `
            <div class="table-container">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th>Enseignant</th>
                    <th>Matériel</th>
                    <th>Période & Horaire</th>
                    <th>Type d'Action</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${pendingReservations.map(res => {
                    const eq = equipment.find(item => item.id === res.equipmentId) || { name: 'Matériel Inconnu' };
                    let actionTypeHtml = '';
                    
                    if (res.prolongationRequested) {
                      actionTypeHtml = '<span class="badge badge-reserved">Demande de Prolongation</span>';
                    } else {
                      actionTypeHtml = '<span class="badge badge-pending">Nouvelle Réservation</span>';
                    }

                    return `
                      <tr>
                        <td style="font-weight: 600; color: var(--text-main);">${res.userName}</td>
                        <td>
                          <div style="font-weight: 600;">${eq.name}</div>
                          <div style="font-size: 0.85rem; color: var(--text-muted); font-family: monospace;">${eq.ref || ''}</div>
                        </td>
                        <td>
                          <div style="font-size: 0.9rem; font-weight: 500;">Du ${res.startDate} au ${res.endDate}</div>
                          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">${res.timeSlot}</div>
                        </td>
                        <td>${actionTypeHtml}</td>
                        <td>
                          <div class="table-actions">
                            ${res.prolongationRequested ? `
                              <button class="btn btn-success btn-approve-prolong" data-res-id="${res.id}">
                                <i data-lucide="check" style="width: 14px; height: 14px;"></i> Approuver +1J
                              </button>
                            ` : `
                              <button class="btn btn-success btn-approve" data-res-id="${res.id}">
                                <i data-lucide="check" style="width: 14px; height: 14px;"></i> Approuver
                              </button>
                            `}
                            <button class="btn btn-danger btn-reject" data-res-id="${res.id}">
                              <i data-lucide="x" style="width: 14px; height: 14px;"></i> Rejeter
                            </button>
                          </div>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>

        <!-- Section: Historique global -->
        <div class="glass-card" style="padding: 20px;">
          <h3 style="margin-bottom: 20px; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
            <i data-lucide="history" style="width: 18px; height: 18px; color: var(--primary);"></i>
            Historique Global des Réservations
          </h3>
          <div class="table-container">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Enseignant</th>
                  <th>Matériel</th>
                  <th>Dates & Créneaux</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${otherReservations.slice(0, 10).map(res => {
                  const eq = equipment.find(item => item.id === res.equipmentId) || { name: 'Matériel Inconnu' };
                  let badge = '';
                  if (res.status === 'approved') badge = '<span class="badge badge-available">Approuvée</span>';
                  if (res.status === 'rejected') badge = '<span class="badge badge-outoforder">Refusée</span>';
                  if (res.status === 'cancelled') badge = '<span class="badge badge-cancelled">Annulée</span>';

                  return `
                    <tr>
                      <td style="font-weight: 600;">${res.userName}</td>
                      <td>
                        <div style="font-weight: 500;">${eq.name}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); font-family: monospace;">${eq.ref || ''}</div>
                      </td>
                      <td>
                        <div style="font-size: 0.85rem; font-weight: 500;">Du ${res.startDate} au ${res.endDate}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${res.timeSlot}</div>
                      </td>
                      <td>${badge}</td>
                      <td>
                        ${res.status === 'approved' ? `
                          <button class="btn btn-secondary btn-cancel-res" data-res-id="${res.id}" style="padding: 4px 8px; font-size: 0.75rem;">Annuler</button>
                        ` : '<span style="color: var(--text-muted); font-size: 0.85rem;">-</span>'}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    // Bind validation buttons
    parent.querySelectorAll('.btn-approve').forEach(btn => {
      btn.addEventListener('click', () => {
        const resId = btn.getAttribute('data-res-id');
        store.updateReservationStatus(resId, 'approved');
        toast.success("Réservation approuvée et activée.");
        renderBookingsTab(parent);
      });
    });

    parent.querySelectorAll('.btn-approve-prolong').forEach(btn => {
      btn.addEventListener('click', () => {
        const resId = btn.getAttribute('data-res-id');
        const res = store.getReservations().find(r => r.id === resId);
        if (res) {
          // Add 1 day to endDate
          const currentEnd = new Date(res.endDate);
          currentEnd.setDate(currentEnd.getDate() + 1);
          res.endDate = currentEnd.toISOString().split('T')[0];
          res.prolongationRequested = false;
          store.saveReservations();
          toast.success("Prolongation de la réservation d'un jour accordée.");
          renderBookingsTab(parent);
        }
      });
    });

    parent.querySelectorAll('.btn-reject').forEach(btn => {
      btn.addEventListener('click', () => {
        const resId = btn.getAttribute('data-res-id');
        store.updateReservationStatus(resId, 'rejected');
        toast.warning("Demande de réservation rejetée.");
        renderBookingsTab(parent);
      });
    });

    parent.querySelectorAll('.btn-cancel-res').forEach(btn => {
      btn.addEventListener('click', () => {
        const resId = btn.getAttribute('data-res-id');
        store.updateReservationStatus(resId, 'cancelled');
        toast.success("Réservation révoquée par l'administrateur.");
        renderBookingsTab(parent);
      });
    });
  }

  // ==========================================
  // TAB 2: EQUIPMENT MANAGEMENT (CRUD)
  // ==========================================
  function renderEquipmentTab(parent) {
    const equipment = store.getEquipment();

    parent.innerHTML = `
      <div class="glass-card" style="padding: 20px;">
        <div class="admin-list-actions">
          <h3 style="font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
            <i data-lucide="package" style="width: 18px; height: 18px; color: var(--primary);"></i>
            Inventaire du Matériel (${equipment.length})
          </h3>
          <button class="btn btn-primary" id="btn-add-equipment">
            <i data-lucide="plus" style="width: 16px; height: 16px;"></i>
            Ajouter du Matériel
          </button>
        </div>

        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Nom du Matériel</th>
                <th>Catégorie</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${equipment.map(item => {
                let badgeClass = 'badge-available';
                let statusLabel = 'Disponible';
                if (item.status === 'reserved') { badgeClass = 'badge-reserved'; statusLabel = 'Réservé'; }
                if (item.status === 'maintenance') { badgeClass = 'badge-maintenance'; statusLabel = 'En maintenance'; }
                if (item.status === 'outoforder') { badgeClass = 'badge-outoforder'; statusLabel = 'Hors service'; }

                return `
                  <tr>
                    <td style="font-family: monospace; font-weight: 600; color: var(--primary); font-size: 0.85rem;">${item.ref}</td>
                    <td style="font-weight: 600; display: flex; align-items: center; gap: 12px;">
                      <img src="${item.imageUrl}" alt="${item.name}" style="width: 36px; height: 36px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border-color);" />
                      <span>${item.name}</span>
                    </td>
                    <td>${item.category}</td>
                    <td>
                      <span class="badge ${badgeClass}">
                        <span class="badge-dot"></span>
                        ${statusLabel}
                      </span>
                    </td>
                    <td>
                      <div class="table-actions">
                        <button class="btn btn-secondary btn-edit-item" data-item-id="${item.id}" title="Modifier">
                          <i data-lucide="edit" style="width: 14px; height: 14px;"></i>
                        </button>
                        <button class="btn btn-danger btn-delete-item" data-item-id="${item.id}" title="Supprimer">
                          <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Bind Add button
    parent.querySelector('#btn-add-equipment').addEventListener('click', () => {
      openEquipmentFormModal(null, () => renderEquipmentTab(parent));
    });

    // Bind Edit buttons
    parent.querySelectorAll('.btn-edit-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const itemId = btn.getAttribute('data-item-id');
        openEquipmentFormModal(itemId, () => renderEquipmentTab(parent));
      });
    });

    // Bind Delete buttons
    parent.querySelectorAll('.btn-delete-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const itemId = btn.getAttribute('data-item-id');
        const item = equipment.find(eq => eq.id === itemId);
        if (confirm(`Êtes-vous sûr de vouloir supprimer définitivement le matériel : ${item.name} ?\nToutes les réservations associées seront annulées.`)) {
          store.deleteEquipment(itemId);
          toast.success("Matériel supprimé de l'inventaire.");
          renderEquipmentTab(parent);
        }
      });
    });
  }

  // ==========================================
  // TAB 3: STATS & REPORTS
  // ==========================================
  function renderStatsTab(parent) {
    const equipment = store.getEquipment();
    const reservations = store.getReservations();

    // Calculate usage rates
    const categoryTotals = {};
    const categoryReservations = {};

    equipment.forEach(item => {
      categoryTotals[item.category] = (categoryTotals[item.category] || 0) + 1;
    });

    reservations.forEach(res => {
      const item = equipment.find(eq => eq.id === res.equipmentId);
      if (item) {
        categoryReservations[item.category] = (categoryReservations[item.category] || 0) + 1;
      }
    });

    // Calculate status percentages
    const total = equipment.length || 1;
    const available = equipment.filter(eq => eq.status === 'available').length;
    const reserved = equipment.filter(eq => eq.status === 'reserved').length;
    const maintenance = equipment.filter(eq => eq.status === 'maintenance').length;
    const outoforder = equipment.filter(eq => eq.status === 'outoforder').length;

    parent.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        
        <!-- Quick stats summary card -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
          <div class="glass-card" style="text-align: center; padding: 20px;">
            <div style="font-size: 2rem; font-weight: 800; color: var(--primary);">${reservations.length}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Total Réservations</div>
          </div>
          <div class="glass-card" style="text-align: center; padding: 20px;">
            <div style="font-size: 2rem; font-weight: 800; color: var(--success);">${((available / total) * 100).toFixed(0)}%</div>
            <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Taux de Disponibilité</div>
          </div>
          <div class="glass-card" style="text-align: center; padding: 20px;">
            <div style="font-size: 2rem; font-weight: 800; color: var(--warning);">${((reserved / total) * 100).toFixed(0)}%</div>
            <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Taux de Réservation</div>
          </div>
          <div class="glass-card" style="text-align: center; padding: 20px;">
            <div style="font-size: 2rem; font-weight: 800; color: var(--danger);">${outoforder + maintenance}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Appareils Indisponibles</div>
          </div>
        </div>

        <!-- Section: Réservations par catégorie -->
        <div class="glass-card" style="padding: 20px;">
          <h3 style="margin-bottom: 24px; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
            <i data-lucide="bar-chart-2" style="width: 18px; height: 18px; color: var(--secondary);"></i>
            Popularité des Réservations par Catégorie
          </h3>
          
          <div style="display: flex; flex-direction: column; gap: 16px;">
            ${Object.keys(categoryTotals).map(category => {
              const bookings = categoryReservations[category] || 0;
              const maxBookings = Math.max(...Object.values(categoryReservations), 1);
              const percentage = (bookings / maxBookings) * 100;

              return `
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; font-size: 0.9rem;">
                    <span style="font-weight: 600; color: var(--text-main);">${category}</span>
                    <span style="font-weight: 700; color: var(--primary);">${bookings} réservations</span>
                  </div>
                  <div style="width: 100%; height: 12px; background: rgba(255,255,255,0.05); border-radius: var(--radius-sm); overflow: hidden;">
                    <div style="width: ${percentage}%; height: 100%; background: linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%); border-radius: var(--radius-sm); transition: width 0.6s ease;"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>
    `;
  }

  // ==========================================
  // ADD & EDIT EQUIPMENT DIALOG MODAL
  // ==========================================
  function openEquipmentFormModal(itemId = null, onModalSuccess) {
    const modalPlaceholder = container.querySelector('#admin-modal-placeholder');
    if (!modalPlaceholder) return;

    const isEdit = itemId !== null;
    const item = isEdit ? store.getEquipment().find(eq => eq.id === itemId) : null;

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';

    modalOverlay.innerHTML = `
      <div class="glass-card modal-content" style="max-width: 500px;">
        <div class="modal-header">
          <h3 class="modal-title" style="display: flex; align-items: center; gap: 8px;">
            <i data-lucide="${isEdit ? 'edit' : 'plus-circle'}" style="width: 24px; height: 24px; color: var(--primary);"></i>
            ${isEdit ? 'Modifier le Matériel' : 'Ajouter un Matériel'}
          </h3>
          <button class="modal-close" id="admin-close-modal">
            <i data-lucide="x" style="width: 18px; height: 18px;"></i>
          </button>
        </div>

        <form id="admin-equipment-form">
          <div class="form-group">
            <label class="form-label">Nom du Matériel</label>
            <input type="text" id="admin-eq-name" class="form-control" value="${isEdit ? item.name : ''}" placeholder="Ex: Chariot d'ordinateurs" required />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div class="form-group">
              <label class="form-label">Référence</label>
              <input type="text" id="admin-eq-ref" class="form-control" value="${isEdit ? item.ref : ''}" placeholder="Ex: INF-LAP-05" required />
            </div>

            <div class="form-group">
              <label class="form-label">Catégorie</label>
              <select id="admin-eq-cat" class="form-control" required>
                <option value="Informatique" ${isEdit && item.category === 'Informatique' ? 'selected' : ''}>Informatique</option>
                <option value="Audiovisuel" ${isEdit && item.category === 'Audiovisuel' ? 'selected' : ''}>Audiovisuel</option>
                <option value="Sciences" ${isEdit && item.category === 'Sciences' ? 'selected' : ''}>Sciences</option>
                <option value="Robotique" ${isEdit && item.category === 'Robotique' ? 'selected' : ''}>Robotique</option>
                <option value="Sport" ${isEdit && item.category === 'Sport' ? 'selected' : ''}>Sport</option>
                <option value="Bibliothèque" ${isEdit && item.category === 'Bibliothèque' ? 'selected' : ''}>Bibliothèque</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Statut Actuel</label>
            <select id="admin-eq-status" class="form-control" required>
              <option value="available" ${isEdit && item.status === 'available' ? 'selected' : ''}>Disponible</option>
              <option value="reserved" ${isEdit && item.status === 'reserved' ? 'selected' : ''}>Réservé (En cours d'utilisation)</option>
              <option value="maintenance" ${isEdit && item.status === 'maintenance' ? 'selected' : ''}>En maintenance</option>
              <option value="outoforder" ${isEdit && item.status === 'outoforder' ? 'selected' : ''}>Hors service</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea id="admin-eq-desc" class="form-control" placeholder="Entrez la description technique et le contenu du kit..." required>${isEdit ? item.description : ''}</textarea>
          </div>

          <div class="form-group">
            <label class="form-label">URL de l'image (Optionnel)</label>
            <input type="url" id="admin-eq-img" class="form-control" value="${isEdit ? item.imageUrl : ''}" placeholder="Laissez vide pour l'image par défaut" />
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="admin-cancel-modal">Annuler</button>
            <button type="submit" class="btn btn-primary">${isEdit ? 'Enregistrer les modifications' : 'Ajouter le matériel'}</button>
          </div>
        </form>
      </div>
    `;

    modalPlaceholder.appendChild(modalOverlay);
    if (window.lucide) window.lucide.createIcons();

    // Closing handlers
    const closeModal = () => {
      modalOverlay.classList.add('removing');
      setTimeout(() => {
        if (modalOverlay.parentNode) {
          modalOverlay.parentNode.removeChild(modalOverlay);
        }
      }, 250);
    };

    modalOverlay.querySelector('#admin-close-modal').addEventListener('click', closeModal);
    modalOverlay.querySelector('#admin-cancel-modal').addEventListener('click', closeModal);

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });

    // Submit handler
    const form = modalOverlay.querySelector('#admin-equipment-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = modalOverlay.querySelector('#admin-eq-name').value;
      const ref = modalOverlay.querySelector('#admin-eq-ref').value;
      const category = modalOverlay.querySelector('#admin-eq-cat').value;
      const status = modalOverlay.querySelector('#admin-eq-status').value;
      const description = modalOverlay.querySelector('#admin-eq-desc').value;
      const imageUrlInput = modalOverlay.querySelector('#admin-eq-img').value;

      // Select default image if none provided based on category
      let imageUrl = imageUrlInput;
      if (!imageUrl) {
        if (category === 'Informatique') imageUrl = 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=60';
        else if (category === 'Audiovisuel') imageUrl = 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=500&auto=format&fit=crop&q=60';
        else if (category === 'Sciences') imageUrl = 'https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=500&auto=format&fit=crop&q=60';
        else if (category === 'Robotique') imageUrl = 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500&auto=format&fit=crop&q=60';
        else if (category === 'Sport') imageUrl = 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&auto=format&fit=crop&q=60';
        else imageUrl = 'https://images.unsplash.com/photo-1544822417-e8104598595c?w=500&auto=format&fit=crop&q=60';
      }

      if (isEdit) {
        store.updateEquipment(itemId, { name, ref, category, status, description, imageUrl });
        toast.success(`Matériel modifié avec succès : ${name}`);
      } else {
        store.addEquipment({ name, ref, category, status, description, imageUrl });
        toast.success(`Matériel ajouté avec succès : ${name}`);
      }

      if (onModalSuccess) onModalSuccess();
      closeModal();
    });
  }
}
