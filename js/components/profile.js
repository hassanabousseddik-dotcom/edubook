// EduBook Profile Component
import store from '../store.js';
import { signOut } from '../auth.js';

export function renderProfile(container) {
  const rawUser = store.getCurrentUser();
  const currentUser = {
    id: rawUser?.id || '',
    name: rawUser?.name || 'Utilisateur',
    email: rawUser?.email || 'Non renseigné',
    avatar: rawUser?.avatar || 'U',
    role: rawUser?.role || 'teacher'
  };
  const allUsers = store.getUsers() || [];
  const reservations = (store.getReservations() || []).filter(res => res.userId === currentUser.id);

  // Stats
  const totalBookings = reservations.length;
  const activeBookings = reservations.filter(res => {
    const todayStr = new Date().toISOString().split('T')[0];
    return todayStr >= res.startDate && todayStr <= res.endDate && res.status === 'approved';
  }).length;
  const pendingRequests = reservations.filter(res => res.status === 'pending').length;

  // Mock Notifications
  const mockNotifications = [
    {
      id: "n-1",
      title: "Réservation approuvée",
      message: "Votre demande pour le Vidéoprojecteur Epson Nomade a été approuvée.",
      time: "Il y a 2 heures",
      read: false,
      type: "success"
    },
    {
      id: "n-2",
      title: "Rappel de retour",
      message: "Le matériel 'Caméra 4K Sony & Trépied' doit être rendu avant ce soir 18h00.",
      time: "Hier",
      read: true,
      type: "warning"
    },
    {
      id: "n-3",
      title: "Maintenance préventive",
      message: "L'imprimante 3D est indisponible pour maintenance jusqu'au 15 Juin.",
      time: "Il y a 2 jours",
      read: true,
      type: "info"
    }
  ];

  container.innerHTML = `
    <div style="margin-bottom: 28px;">
      <h1 style="margin-bottom: 4px;">Espace Utilisateur</h1>
      <p style="color: var(--text-muted); font-size: 0.95rem;">Gérez vos informations personnelles et consultez vos notifications.</p>
    </div>

    <div class="profile-grid">
      
      <!-- Profile Details Card -->
      <div class="glass-card profile-card" style="height: fit-content;">
        <div class="profile-avatar">
          ${currentUser.avatar}
        </div>
        <h2 style="color: var(--text-main); font-size: 1.4rem; margin-bottom: 4px;">${currentUser.name}</h2>
        <span style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 16px;">${currentUser.email}</span>
        
        <span class="user-badge ${currentUser.role === 'admin' ? 'admin' : 'teacher'}" style="padding: 6px 16px; font-size: 0.8rem; margin-bottom: 24px;">
          ${currentUser.role === 'admin' ? 'Administrateur' : 'Enseignant'}
        </span>

        <button id="profile-logout-btn" class="btn btn-danger" style="width: 100%; margin-bottom: 24px; gap: 8px;">
          <i data-lucide="log-out" style="width:16px;height:16px;"></i>
          Se déconnecter
        </button>

        <!-- Stats grid inside profile card -->
        <div style="width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; border-top: 1px solid var(--border-color); padding-top: 24px;">
          <div style="text-align: center;">
            <div style="font-size: 1.4rem; font-weight: 800; color: var(--primary);">${totalBookings}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Réservations</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 1.4rem; font-weight: 800; color: var(--success);">${activeBookings}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">En cours</div>
          </div>
          <div style="text-align: center; grid-column: 1 / -1; margin-top: 12px;">
            <div style="font-size: 1.4rem; font-weight: 800; color: var(--warning);">${pendingRequests}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Demandes en attente</div>
          </div>
        </div>
      </div>

      <!-- Right Column: Notifications & Demo actions -->
      <div style="display: flex; flex-direction: column; gap: 24px;">
        
        <!-- Notifications Card -->
        <div class="glass-card" style="flex-grow: 1;">
          <h3 style="margin-bottom: 20px; font-size: 1.15rem; display: flex; align-items: center; gap: 8px;">
            <i data-lucide="bell" style="width: 18px; height: 18px; color: var(--primary);"></i>
            Centre de Notifications
          </h3>
          
          <div style="display: flex; flex-direction: column; gap: 16px;">
            ${mockNotifications.map(notif => {
              let icon = 'info';
              let iconColor = 'var(--primary)';
              if (notif.type === 'success') {
                icon = 'check-circle';
                iconColor = 'var(--success)';
              } else if (notif.type === 'warning') {
                icon = 'alert-triangle';
                iconColor = 'var(--warning)';
              }

              return `
                <div style="display: flex; gap: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color); opacity: ${notif.read ? 0.75 : 1}; position: relative;">
                  ${!notif.read ? `
                    <span style="position: absolute; top: 4px; left: -8px; width: 6px; height: 6px; border-radius: 50%; background: var(--primary);"></span>
                  ` : ''}
                  <div style="display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: var(--radius-sm); background: rgba(255,255,255,0.03); color: ${iconColor}; flex-shrink: 0; border: 1px solid var(--border-color);">
                    <i data-lucide="${icon}" style="width: 18px; height: 18px;"></i>
                  </div>
                  <div style="flex-grow: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                      <h4 style="font-size: 0.95rem; font-weight: 600; color: var(--text-main);">${notif.title}</h4>
                      <span style="font-size: 0.75rem; color: var(--text-muted);">${notif.time}</span>
                    </div>
                    <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4;">${notif.message}</p>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Demo settings -->
        <div class="glass-card">
          <h3 style="margin-bottom: 12px; font-size: 1.15rem; display: flex; align-items: center; gap: 8px;">
            <i data-lucide="cog" style="width: 18px; height: 18px; color: var(--secondary);"></i>
            Paramètres de Démonstration
          </h3>
          <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 16px;">
            Changez de rôle instantanément pour tester les accès Enseignant ou Administrateur. 
            Le rôle Administrateur débloque le panneau "Administration" dans la barre de navigation et permet de valider les demandes de réservation.
          </p>
          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            ${allUsers.map(user => `
              <button class="btn btn-secondary btn-switch-user ${currentUser.id === user.id ? 'btn-primary' : ''}" 
                data-user-id="${user.id}" 
                style="padding: 8px 16px; font-size: 0.85rem;">
                ${user.name} (${user.role === 'admin' ? 'Admin' : 'Prof'})
              </button>
            `).join('')}
          </div>
        </div>

      </div>
    </div>
  `;

  // Bind Switch buttons
  const switchButtons = container.querySelectorAll('.btn-switch-user');
  switchButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const userId = btn.getAttribute('data-user-id');
      store.setCurrentUser(userId);
      
      // Update global navigation navbar
      const navContainer = document.getElementById('navbar-container');
      import('./navbar.js').then(({ renderNavbar }) => {
        renderNavbar(navContainer);
      });

      // Re-render profile page
      renderProfile(container);
    });
  });

  // Bind Logout button
  container.querySelector('#profile-logout-btn')?.addEventListener('click', async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Erreur de déconnexion:', err);
    }
  });

  if (window.lucide) window.lucide.createIcons();
}
