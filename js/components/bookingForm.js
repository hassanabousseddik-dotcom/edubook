// EduBook Booking Form Component
import store from '../store.js';
import toast from '../utils/toast.js';

export function renderBookingForm(container, itemId, onSuccess) {
  const item = store.getEquipment().find(eq => eq.id === itemId);
  const currentUser = store.getCurrentUser();
  
  if (!item) {
    toast.error("Impossible de charger le matériel.");
    return;
  }

  // Get current date string for input minimums (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];

  // Create modal element
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  
  modalOverlay.innerHTML = `
    <div class="glass-card modal-content" style="max-width: 550px;">
      <div class="modal-header">
        <h3 class="modal-title" style="display: flex; align-items: center; gap: 8px;">
          <i data-lucide="calendar-plus" style="width: 24px; height: 24px; color: var(--primary);"></i>
          Réserver du Matériel
        </h3>
        <button class="modal-close" id="close-modal-btn">
          <i data-lucide="x" style="width: 18px; height: 18px;"></i>
        </button>
      </div>

      <!-- Equipment Details Summary -->
      <div style="display: flex; gap: 16px; margin-bottom: 20px; align-items: center; background: rgba(255,255,255,0.03); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
        <img src="${item.imageUrl}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border-color);" />
        <div>
          <h4 style="font-weight: 700; color: var(--text-main); font-size: 1.05rem;">${item.name}</h4>
          <span style="font-size: 0.8rem; color: var(--text-muted); font-family: monospace;">Ref: ${item.ref}</span>
        </div>
      </div>

      <form id="booking-form">
        <!-- Date start and end -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div class="form-group">
            <label class="form-label">Date de Début</label>
            <input type="date" id="book-start-date" class="form-control" min="${todayStr}" value="${todayStr}" required />
          </div>
          <div class="form-group">
            <label class="form-label">Date de Fin</label>
            <input type="date" id="book-end-date" class="form-control" min="${todayStr}" value="${todayStr}" required />
          </div>
        </div>

        <!-- Time slots -->
        <div class="form-group">
          <label class="form-label">Créneau Horaire</label>
          <select id="book-timeslot" class="form-control" required>
            <option value="08:00 - 10:00">Matin 1 (08:00 - 10:00)</option>
            <option value="10:00 - 12:00">Matin 2 (10:00 - 12:00)</option>
            <option value="08:00 - 12:00">Matinée Complète (08:00 - 12:00)</option>
            <option value="14:00 - 16:00">Après-midi 1 (14:00 - 16:00)</option>
            <option value="16:00 - 18:00">Après-midi 2 (16:00 - 18:00)</option>
            <option value="14:00 - 18:00">Après-midi Complète (14:00 - 18:00)</option>
            <option value="Journée Complète (08:00 - 18:00)">Journée Complète (08:00 - 18:00)</option>
          </select>
        </div>

        <!-- Teacher in charge -->
        <div class="form-group">
          <label class="form-label">Enseignant Responsable</label>
          <input type="text" class="form-control" value="${currentUser.name}" disabled style="opacity: 0.8; background: rgba(0, 0, 0, 0.2);" />
        </div>

        <!-- Pedagogical Purpose -->
        <div class="form-group">
          <label class="form-label">Description de l'Activité Pédagogique</label>
          <textarea id="book-purpose" class="form-control" placeholder="Indiquer le but du matériel (ex: TP de SVT sur la mitose, cours d'EPS orientation...)" required></textarea>
        </div>

        <!-- Submit actions -->
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="cancel-booking-btn">Annuler</button>
          <button type="submit" class="btn btn-primary">Confirmer la Réservation</button>
        </div>
      </form>
    </div>
  `;

  container.appendChild(modalOverlay);
  if (window.lucide) window.lucide.createIcons();

  // Handle auto end-date shift based on start-date selection
  const startDateInput = modalOverlay.querySelector('#book-start-date');
  const endDateInput = modalOverlay.querySelector('#book-end-date');

  startDateInput.addEventListener('change', (e) => {
    endDateInput.min = e.target.value;
    if (endDateInput.value < e.target.value) {
      endDateInput.value = e.target.value;
    }
  });

  // Modal actions
  const closeModal = () => {
    modalOverlay.classList.add('removing');
    // Remove after animation completes (transition is 0.25s)
    setTimeout(() => {
      if (modalOverlay.parentNode) {
        modalOverlay.parentNode.removeChild(modalOverlay);
      }
    }, 250);
  };

  modalOverlay.querySelector('#close-modal-btn').addEventListener('click', closeModal);
  modalOverlay.querySelector('#cancel-booking-btn').addEventListener('click', closeModal);

  // Close modal when clicking on backdrop
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });

  // Form submission handler
  const form = modalOverlay.querySelector('#booking-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    const timeSlot = modalOverlay.querySelector('#book-timeslot').value;
    const purpose = modalOverlay.querySelector('#book-purpose').value;

    // Additional Date validation
    if (new Date(startDate) > new Date(endDate)) {
      toast.error("La date de fin ne peut pas être antérieure à la date de début.");
      return;
    }

    try {
      // Attempt creation
      const reservation = store.createReservation({
        equipmentId: itemId,
        startDate,
        endDate,
        timeSlot,
        purpose
      });

      // Show toast based on status (immediate approval for admins, pending for teachers)
      if (reservation.status === 'approved') {
        toast.success(`Réservation confirmée et validée pour : ${item.name}`);
      } else {
        toast.info(`Demande de réservation enregistrée. En attente de validation par l'administration.`);
      }

      // Execute success callback
      if (onSuccess) onSuccess();

      // Close modal
      closeModal();
    } catch (error) {
      toast.error(error.message);
    }
  });
}
