// EduBook Booking Form Component — async Supabase version
import store from '../store.js';
import toast from '../utils/toast.js';

export function renderBookingForm(container, itemId, onSuccess) {
  const item = store.getEquipment().find(eq => eq.id === itemId);
  const currentUser = store.getCurrentUser();

  if (!item) { toast.error('Impossible de charger le matériel.'); return; }

  const todayStr = new Date().toISOString().split('T')[0];
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';

  modalOverlay.innerHTML = `
    <div class="glass-card modal-content" style="max-width:550px;">
      <div class="modal-header">
        <h3 class="modal-title" style="display:flex;align-items:center;gap:8px;">
          <i data-lucide="calendar-plus" style="width:24px;height:24px;color:var(--primary);"></i>
          Réserver du Matériel
        </h3>
        <button class="modal-close" id="close-modal-btn">
          <i data-lucide="x" style="width:18px;height:18px;"></i>
        </button>
      </div>

      <div style="display:flex;gap:16px;margin-bottom:20px;align-items:center;background:rgba(255,255,255,0.03);padding:12px;border-radius:var(--radius-md);border:1px solid var(--border-color);">
        <img src="${item.imageUrl || item.image_url}" alt="${item.name}"
          style="width:60px;height:60px;object-fit:cover;border-radius:var(--radius-sm);border:1px solid var(--border-color);" />
        <div>
          <h4 style="font-weight:700;color:var(--text-main);font-size:1.05rem;">${item.name}</h4>
          <span style="font-size:0.8rem;color:var(--text-muted);font-family:monospace;">Ref: ${item.ref}</span>
        </div>
      </div>

      <form id="booking-form">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div class="form-group">
            <label class="form-label">Date de Début</label>
            <input type="date" id="book-start-date" class="form-control" min="${todayStr}" value="${todayStr}" required />
          </div>
          <div class="form-group">
            <label class="form-label">Date de Fin</label>
            <input type="date" id="book-end-date" class="form-control" min="${todayStr}" value="${todayStr}" required />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Créneau Horaire</label>
          <select id="book-timeslot" class="form-control" required>
            <option value="08:00 - 10:00">Matin 1 (08:00 - 10:00)</option>
            <option value="10:00 - 12:00">Matin 2 (10:00 - 12:00)</option>
            <option value="08:00 - 12:00">Matinée Complète (08:00 - 12:00)</option>
            <option value="14:00 - 16:00">Après-midi 1 (14:00 - 16:00)</option>
            <option value="16:00 - 18:00">Après-midi 2 (16:00 - 18:00)</option>
            <option value="14:00 - 18:00">Après-midi Complète (14:00 - 18:00)</option>
            <option value="Journée Complète (08:00 - 18:00)">Journée Complète</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Enseignant Responsable</label>
          <input type="text" class="form-control" value="${currentUser?.name || ''}" disabled
            style="opacity:0.8;background:rgba(0,0,0,0.2);" />
        </div>

        <div class="form-group">
          <label class="form-label">Description de l'Activité Pédagogique</label>
          <textarea id="book-purpose" class="form-control"
            placeholder="Indiquer le but du matériel (ex: TP SVT sur la mitose…)" required></textarea>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="cancel-booking-btn">Annuler</button>
          <button type="submit" class="btn btn-primary" id="submit-booking-btn">
            <span id="submit-text">Confirmer la Réservation</span>
            <span id="submit-loader" style="display:none;">
              <svg class="spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            </span>
          </button>
        </div>
      </form>
    </div>
  `;

  container.appendChild(modalOverlay);
  if (window.lucide) window.lucide.createIcons();

  const startDateInput = modalOverlay.querySelector('#book-start-date');
  const endDateInput   = modalOverlay.querySelector('#book-end-date');

  startDateInput.addEventListener('change', (e) => {
    endDateInput.min = e.target.value;
    if (endDateInput.value < e.target.value) endDateInput.value = e.target.value;
  });

  const closeModal = () => {
    modalOverlay.classList.add('removing');
    setTimeout(() => { if (modalOverlay.parentNode) modalOverlay.parentNode.removeChild(modalOverlay); }, 250);
  };

  modalOverlay.querySelector('#close-modal-btn').addEventListener('click', closeModal);
  modalOverlay.querySelector('#cancel-booking-btn').addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

  const form       = modalOverlay.querySelector('#booking-form');
  const submitBtn  = modalOverlay.querySelector('#submit-booking-btn');
  const submitText = modalOverlay.querySelector('#submit-text');
  const submitLoader = modalOverlay.querySelector('#submit-loader');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const startDate = startDateInput.value;
    const endDate   = endDateInput.value;
    const timeSlot  = modalOverlay.querySelector('#book-timeslot').value;
    const purpose   = modalOverlay.querySelector('#book-purpose').value;

    if (new Date(startDate) > new Date(endDate)) {
      toast.error('La date de fin ne peut pas être antérieure à la date de début.');
      return;
    }

    submitBtn.disabled = true;
    submitText.style.display = 'none';
    submitLoader.style.display = 'inline-flex';

    try {
      const reservation = await store.createReservation({ equipmentId: itemId, startDate, endDate, timeSlot, purpose });
      if (reservation.status === 'approved') {
        toast.success(`Réservation confirmée pour : ${item.name}`);
      } else {
        toast.info(`Demande enregistrée. En attente de validation.`);
      }
      if (onSuccess) onSuccess();
      closeModal();
    } catch (error) {
      toast.error(error.message);
      submitBtn.disabled = false;
      submitText.style.display = 'inline';
      submitLoader.style.display = 'none';
    }
  });
}
