// EduBook Reservations List Component
import store from '../store.js';
import toast from '../utils/toast.js';

export function renderReservations(container) {
  const currentUser = store.getCurrentUser();
  let reservations = store.getReservations().filter(res => res.userId === currentUser.id);
  const equipmentList = store.getEquipment();

  let activeFilter = 'All'; // All, Active (In Progress), Upcoming, Past, Cancelled

  function getStatusBadge(status) {
    if (status === 'approved') return '<span class="badge badge-approved"><span class="badge-dot"></span>Approuvée</span>';
    if (status === 'pending') return '<span class="badge badge-pending"><span class="badge-dot"></span>En attente</span>';
    if (status === 'rejected') return '<span class="badge badge-rejected"><span class="badge-dot"></span>Rejetée</span>';
    if (status === 'cancelled') return '<span class="badge badge-cancelled"><span class="badge-dot"></span>Annulée</span>';
    return `<span class="badge">${status}</span>`;
  }

  function filterAndRenderTable() {
    const tableBody = container.querySelector('#reservations-table-body');
    const emptyState = container.querySelector('#empty-state-container');
    const tableContainer = container.querySelector('#table-card-container');
    
    if (!tableBody) return;

    const todayStr = new Date().toISOString().split('T')[0];

    // Filter reservations
    const filtered = reservations.filter(res => {
      if (activeFilter === 'All') return true;
      if (activeFilter === 'Upcoming') return res.startDate > todayStr && res.status !== 'cancelled' && res.status !== 'rejected';
      if (activeFilter === 'Active') return todayStr >= res.startDate && todayStr <= res.endDate && res.status === 'approved';
      if (activeFilter === 'Past') return res.endDate < todayStr || res.status === 'rejected';
      if (activeFilter === 'Cancelled') return res.status === 'cancelled';
      return true;
    });

    if (filtered.length === 0) {
      tableContainer.style.display = 'none';
      emptyState.style.display = 'flex';
      emptyState.innerHTML = `
        <i data-lucide="calendar-x" style="width: 48px; height: 48px; color: var(--text-muted); margin-bottom: 16px;"></i>
        <h3 style="color: var(--text-main);">Aucune réservation</h3>
        <p style="color: var(--text-muted); margin-top: 8px;">Aucune réservation ne correspond à ce filtre.</p>
        <a href="#catalog" class="btn btn-primary" style="margin-top: 20px;">Parcourir le Catalogue</a>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    tableContainer.style.display = 'block';
    emptyState.style.display = 'none';

    tableBody.innerHTML = filtered.map(res => {
      const eq = equipmentList.find(item => item.id === res.equipmentId) || {
        name: "Matériel Supprimé",
        imageUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=500&auto=format&fit=crop&q=60",
        ref: "N/A"
      };

      // Determine allowed actions
      const isPending = res.status === 'pending';
      const isApproved = res.status === 'approved';
      const isFinished = res.endDate < todayStr;
      
      let actionsHtml = '';
      
      // Cancel booking (allowed if pending, or if approved but not ended yet)
      if ((isPending || isApproved) && !isFinished) {
        actionsHtml += `
          <button class="btn btn-danger btn-cancel btn-icon-only" data-res-id="${res.id}" title="Annuler la réservation">
            <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
          </button>
        `;
      }

      // Prolong booking (allowed if approved, in-progress or upcoming, and not already requested)
      if (isApproved && !isFinished) {
        if (res.prolongationRequested) {
          actionsHtml += `
            <span style="font-size: 0.75rem; color: var(--warning); font-weight: 600; padding: 6px 12px; background: var(--warning-glow); border-radius: var(--radius-sm); border: 1px solid rgba(245,158,11,0.2);">
              Prolongation demandée
            </span>
          `;
        } else {
          actionsHtml += `
            <button class="btn btn-secondary btn-prolong" data-res-id="${res.id}" title="Demander une prolongation d'un jour">
              Prolonger d'un jour
            </button>
          `;
        }
      }

      return `
        <tr>
          <td style="font-weight: 600; display: flex; align-items: center; gap: 12px;">
            <img src="${eq.imageUrl}" alt="${eq.name}" style="width: 36px; height: 36px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border-color);" />
            <div>
              <div style="color: var(--text-main); font-size: 0.95rem;">${eq.name}</div>
              <span style="font-size: 0.75rem; color: var(--text-muted); font-family: monospace;">${eq.ref}</span>
            </div>
          </td>
          <td>
            <div style="font-size: 0.9rem; font-weight: 500; color: var(--text-main);">Du ${res.startDate} au ${res.endDate}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; display: flex; align-items: center; gap: 4px;">
              <i data-lucide="clock" style="width: 12px; height: 12px;"></i> ${res.timeSlot}
            </div>
          </td>
          <td>
            <div style="font-size: 0.85rem; max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${res.purpose}">
              ${res.purpose}
            </div>
          </td>
          <td>${getStatusBadge(res.status)}</td>
          <td>
            <div class="table-actions">
              ${actionsHtml || '<span style="color: var(--text-muted); font-size: 0.85rem;">Aucune action</span>'}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();

    // Bind cancel buttons
    const cancelButtons = tableBody.querySelectorAll('.btn-cancel');
    cancelButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const resId = btn.getAttribute('data-res-id');
        if (confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")) {
          store.updateReservationStatus(resId, 'cancelled');
          toast.success("Réservation annulée avec succès.");
          
          // Re-fetch and re-render
          reservations = store.getReservations().filter(res => res.userId === currentUser.id);
          filterAndRenderTable();
        }
      });
    });

    // Bind prolong buttons
    const prolongButtons = tableBody.querySelectorAll('.btn-prolong');
    prolongButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const resId = btn.getAttribute('data-res-id');
        store.prolongReservation(resId);
        toast.info("Demande de prolongation envoyée aux administrateurs.");
        
        // Re-fetch and re-render
        reservations = store.getReservations().filter(res => res.userId === currentUser.id);
        filterAndRenderTable();
      });
    });
  }

  container.innerHTML = `
    <div style="margin-bottom: 28px;">
      <h1 style="margin-bottom: 4px;">Mes Réservations</h1>
      <p style="color: var(--text-muted); font-size: 0.95rem;">Consultez vos réservations en cours, à venir et passées.</p>
    </div>

    <!-- Filter Buttons Grid -->
    <div class="glass-card" style="padding: 16px; margin-bottom: 24px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
      <button class="admin-tab active" data-filter="All">Toutes</button>
      <button class="admin-tab" data-filter="Active">En cours</button>
      <button class="admin-tab" data-filter="Upcoming">À venir</button>
      <button class="admin-tab" data-filter="Past">Historique</button>
      <button class="admin-tab" data-filter="Cancelled">Annulées</button>
    </div>

    <!-- Table Card Container -->
    <div class="glass-card" id="table-card-container" style="padding: 20px;">
      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Matériel</th>
              <th>Période & Horaire</th>
              <th>Activité Pédagogique</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="reservations-table-body"></tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div class="glass-card" id="empty-state-container" style="display: none; flex-direction: column; align-items: center; justify-content: center; padding: 48px; text-align: center;"></div>
  `;

  // Bind filter button triggers
  const filterButtons = container.querySelectorAll('.admin-tab');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle class
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      activeFilter = btn.getAttribute('data-filter');
      filterAndRenderTable();
    });
  });

  // Run initial render
  filterAndRenderTable();
}
