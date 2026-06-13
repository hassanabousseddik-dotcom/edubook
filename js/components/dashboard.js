// EduBook Dashboard Component
import store from '../store.js';
import { safeText, safeInitial } from '../utils/safeText.js';

export function renderDashboard(container) {
  const equipment = store.getEquipment() || [];
  const reservations = store.getReservations() || [];
  const activities = store.getActivities() || [];
  const currentUser = store.getCurrentUser();
  const profile = currentUser;

  console.log("Current User:", currentUser);
  console.log("Profile:", profile);
  console.log("Activities:", activities);
  console.log("Equipment:", equipment);
  console.log("Reservations:", reservations);

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate statistics
  const totalItems = equipment.length;
  const availableItems = equipment.filter(eq => eq.status === 'available').length;
  const maintenanceItems = equipment.filter(eq => eq.status === 'maintenance').length;
  const outOfOrderItems = equipment.filter(eq => eq.status === 'outoforder').length;
  const reservedItems = equipment.filter(eq => eq.status === 'reserved').length;

  const todayReservations = reservations.filter(res => 
    res.status === 'approved' && 
    todayStr >= res.startDate && 
    todayStr <= res.endDate
  ).length;

  const expectedReturnsToday = reservations.filter(res => 
    res.status === 'approved' && 
    res.endDate === todayStr
  ).length;

  // Most used equipment (simple calculation based on reservation frequency)
  const itemReservationCount = {};
  reservations.forEach(res => {
    itemReservationCount[res.equipmentId] = (itemReservationCount[res.equipmentId] || 0) + 1;
  });

  const popularEquipment = [...equipment]
    .map(eq => ({ ...eq, bookings: itemReservationCount[eq.id] || 0 }))
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 4);

  // SVG Chart calculation details (Donut Chart)
  // Total is: Available, Reserved, Maintenance, OutOfOrder
  const totalForChart = totalItems || 1;
  const pAvailable = (availableItems / totalForChart) * 100;
  const pReserved = (reservedItems / totalForChart) * 100;
  const pMaintenance = (maintenanceItems / totalForChart) * 100;
  const pOutOfOrder = (outOfOrderItems / totalForChart) * 100;

  // SVG Circumference = 2 * PI * r = 2 * 3.1415 * 50 = 314.15
  const circ = 314.15;
  const strokeAvailable = (pAvailable / 100) * circ;
  const strokeReserved = (pReserved / 100) * circ;
  const strokeMaintenance = (pMaintenance / 100) * circ;
  const strokeOutOfOrder = (pOutOfOrder / 100) * circ;

  const offsetAvailable = 0;
  const offsetReserved = strokeAvailable;
  const offsetMaintenance = strokeAvailable + strokeReserved;
  const offsetOutOfOrder = strokeAvailable + strokeReserved + strokeMaintenance;

  container.innerHTML = `
    <div class="dashboard-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; flex-wrap: wrap; gap: 16px;">
      <div>
        <h1 class="dashboard-title" style="margin-bottom: 4px;">Tableau de Bord</h1>
        <p style="color: var(--text-muted); font-size: 0.95rem;">Ravi de vous revoir, <strong style="color: var(--text-main);">${safeText(currentUser?.name)}</strong>. Voici l'état du matériel de l'établissement.</p>
      </div>
      <a href="#catalog" class="btn btn-primary">
        <i data-lucide="plus-circle" style="width: 18px; height: 18px;"></i>
        Réserver du Matériel
      </a>
    </div>

    <!-- Quick Stat Cards -->
    <div class="dashboard-stats">
      <div class="glass-card stat-card">
        <div class="stat-icon">
          <i data-lucide="box" style="width: 24px; height: 24px;"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">${totalItems}</span>
          <span class="stat-label">Total Matériels</span>
        </div>
      </div>
      <div class="glass-card stat-card">
        <div class="stat-icon">
          <i data-lucide="check-circle" style="width: 24px; height: 24px;"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">${availableItems}</span>
          <span class="stat-label">Disponibles</span>
        </div>
      </div>
      <div class="glass-card stat-card">
        <div class="stat-icon">
          <i data-lucide="calendar" style="width: 24px; height: 24px;"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">${todayReservations}</span>
          <span class="stat-label">Réservations du Jour</span>
        </div>
      </div>
      <div class="glass-card stat-card">
        <div class="stat-icon">
          <i data-lucide="corner-down-left" style="width: 24px; height: 24px;"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">${expectedReturnsToday}</span>
          <span class="stat-label">Retours Attendus</span>
        </div>
      </div>
    </div>

    <!-- Grid: Chart and Recent Activity -->
    <div class="dashboard-grid">
      
      <!-- Chart Card -->
      <div class="glass-card" style="display: flex; flex-direction: column;">
        <h3 style="margin-bottom: 20px; font-size: 1.15rem; display: flex; align-items: center; gap: 8px;">
          <i data-lucide="pie-chart" style="width: 18px; height: 18px; color: var(--primary);"></i>
          État de l'Inventaire
        </h3>
        
        <div class="chart-container" style="flex-grow: 1;">
          <svg width="220" height="220" viewBox="0 0 120 120" class="svg-chart-pie">
            <!-- Background circle -->
            <circle cx="60" cy="60" r="50" fill="transparent" stroke="var(--border-color)" stroke-width="12" />
            
            <!-- Available Segment -->
            <circle cx="60" cy="60" r="50" fill="transparent" 
              stroke="var(--success)" 
              stroke-width="12" 
              stroke-dasharray="${strokeAvailable} ${circ}" 
              stroke-dashoffset="-${offsetAvailable}" 
              stroke-linecap="round"
              style="transition: stroke-dasharray 0.5s ease;" />
              
            <!-- Reserved Segment -->
            <circle cx="60" cy="60" r="50" fill="transparent" 
              stroke="var(--warning)" 
              stroke-width="12" 
              stroke-dasharray="${strokeReserved} ${circ}" 
              stroke-dashoffset="-${offsetReserved}" 
              stroke-linecap="round"
              style="transition: stroke-dasharray 0.5s ease;" />

            <!-- Maintenance Segment -->
            <circle cx="60" cy="60" r="50" fill="transparent" 
              stroke="var(--primary)" 
              stroke-width="12" 
              stroke-dasharray="${strokeMaintenance} ${circ}" 
              stroke-dashoffset="-${offsetMaintenance}" 
              stroke-linecap="round"
              style="transition: stroke-dasharray 0.5s ease;" />

            <!-- Out of Order Segment -->
            <circle cx="60" cy="60" r="50" fill="transparent" 
              stroke="var(--danger)" 
              stroke-width="12" 
              stroke-dasharray="${strokeOutOfOrder} ${circ}" 
              stroke-dashoffset="-${offsetOutOfOrder}" 
              stroke-linecap="round"
              style="transition: stroke-dasharray 0.5s ease;" />
          </svg>
          
          <!-- Inner details absolute center -->
          <div style="position: absolute; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
            <span style="font-size: 1.8rem; font-weight: 800; font-family: var(--font-title);">${totalItems}</span>
            <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Matériels</span>
          </div>
        </div>

        <div class="chart-legend">
          <div class="legend-item">
            <span class="legend-color" style="background: var(--success);"></span>
            <span>Disponible (${availableItems})</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background: var(--warning);"></span>
            <span>Réservé (${reservedItems})</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background: var(--primary);"></span>
            <span>Maintenance (${maintenanceItems})</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background: var(--danger);"></span>
            <span>Hors service (${outOfOrderItems})</span>
          </div>
        </div>
      </div>

      <!-- Recent Activities Card -->
      <div class="glass-card">
        <h3 style="margin-bottom: 20px; font-size: 1.15rem; display: flex; align-items: center; gap: 8px;">
          <i data-lucide="trending-up" style="width: 18px; height: 18px; color: var(--secondary);"></i>
          Activités Récentes
        </h3>
        <div class="recent-activity-list">
          ${activities.slice(0, 4).map(activity => {
            if (!activity) return '';
            const userName = safeText(activity?.userName, 'Système');
            let avatarLetter = safeInitial(activity?.userName, 'S');
            if (userName.startsWith("Mme.")) avatarLetter = "M";
            if (userName.startsWith("M.")) avatarLetter = "M";
            if (userName === "Admin") avatarLetter = "A";

            return `
              <div class="activity-item">
                <div class="activity-avatar" style="flex-shrink: 0; background: ${userName === 'Admin' ? 'var(--secondary-glow)' : 'var(--primary-glow)'}; color: ${userName === 'Admin' ? 'var(--secondary)' : 'var(--primary)'}; border: 1px solid var(--border-color);">
                  ${avatarLetter}
                </div>
                <div class="activity-details">
                  <div class="activity-text">
                    <strong style="color: var(--text-main); font-weight: 600;">${userName}</strong> 
                    <span style="color: var(--text-muted);">${activity.action || 'a effectué une action'}</span> 
                    <span style="color: var(--primary); font-weight: 500;">${safeText(activity?.itemName, 'Matériel inconnu')}</span>
                  </div>
                  <div class="activity-time">${activity.time || '—'}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>

    <!-- Popular Equipment Table -->
    <div class="glass-card" style="margin-bottom: 20px;">
      <h3 style="margin-bottom: 20px; font-size: 1.15rem; display: flex; align-items: center; gap: 8px;">
        <i data-lucide="star" style="width: 18px; height: 18px; color: var(--warning);"></i>
        Matériels les Plus Demandés
      </h3>
      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Référence</th>
              <th>Nom du Matériel</th>
              <th>Catégorie</th>
              <th>Réservations</th>
              <th>Statut Actuel</th>
            </tr>
          </thead>
          <tbody>
            ${popularEquipment.map(eq => {
              let badgeClass = 'badge-available';
              let statusLabel = 'Disponible';
              if (eq.status === 'reserved') {
                badgeClass = 'badge-reserved';
                statusLabel = 'Réservé';
              } else if (eq.status === 'maintenance') {
                badgeClass = 'badge-maintenance';
                statusLabel = 'En maintenance';
              } else if (eq.status === 'outoforder') {
                badgeClass = 'badge-outoforder';
                statusLabel = 'Hors service';
              }

              return `
                <tr>
                  <td style="font-family: monospace; font-size: 0.85rem; font-weight: 600; color: var(--primary);">${eq.ref || 'N/A'}</td>
                  <td style="font-weight: 600; display: flex; align-items: center; gap: 12px;">
                    <img src="${eq.imageUrl || ''}" alt="${safeText(eq?.name, 'Matériel')}" style="width: 36px; height: 36px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border-color);" />
                    <span>${safeText(eq?.name, 'Matériel inconnu')}</span>
                  </td>
                  <td>${eq.category || 'Général'}</td>
                  <td style="font-weight: 700; color: var(--text-main);">${eq.bookings || 0} fois</td>
                  <td>
                    <span class="badge ${badgeClass}">
                      <span class="badge-dot"></span>
                      ${statusLabel}
                    </span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
