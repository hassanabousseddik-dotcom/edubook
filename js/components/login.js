// EduBook — Page de Connexion
import { signIn } from '../auth.js';

export function renderLogin() {
  return `
    <div class="login-page">
      <div class="login-container">
        <!-- Logo -->
        <div class="login-logo">
          <div class="login-logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <div class="login-logo-text">
            <span class="login-logo-name">EduBook</span>
            <span class="login-logo-sub">Réservation de Matériel Éducatif</span>
          </div>
        </div>

        <!-- Card -->
        <div class="login-card glass">
          <h1 class="login-title">Bienvenue 👋</h1>
          <p class="login-subtitle">Connectez-vous pour accéder à l'application</p>

          <form id="login-form" class="login-form">
            <div class="form-group">
              <label class="form-label" for="login-email">Adresse e-mail</label>
              <div class="input-wrapper">
                <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                <input class="form-input" id="login-email" type="email"
                  placeholder="admin@ecole.fr" required autocomplete="email"/>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="login-password">Mot de passe</label>
              <div class="input-wrapper">
                <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input class="form-input" id="login-password" type="password"
                  placeholder="••••••••" required autocomplete="current-password"/>
              </div>
            </div>

            <div id="login-error" class="login-error" style="display:none"></div>

            <button class="btn btn-primary btn-login" type="submit" id="login-btn">
              <span id="login-btn-text">Se connecter</span>
              <span id="login-btn-loader" style="display:none">
                <svg class="spin" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
              </span>
            </button>
          </form>

          <div class="login-hint">
            <p><strong>Comptes de démonstration :</strong></p>
            <div class="login-demo-accounts">
              <button class="demo-account-btn" data-email="admin@school.dz" data-password="000000">
                <span class="demo-badge admin">ADMIN</span> admin@school.dz
              </button>
              <button class="demo-account-btn" data-email="teacher@school.dz" data-password="000000">
                <span class="demo-badge teacher">PROF</span> teacher@school.dz
              </button>
            </div>
          </div>
        </div>

        <!-- Décoration fond -->
        <div class="login-bg-blob blob-1"></div>
        <div class="login-bg-blob blob-2"></div>
        <div class="login-bg-blob blob-3"></div>
      </div>
    </div>
  `;
}

export function initLogin(onSuccess) {
  const form = document.getElementById('login-form');
  const errorEl = document.getElementById('login-error');
  const btn = document.getElementById('login-btn');
  const btnText = document.getElementById('login-btn-text');
  const btnLoader = document.getElementById('login-btn-loader');

  function setLoading(loading) {
    btn.disabled = loading;
    btnText.style.display = loading ? 'none' : 'inline';
    btnLoader.style.display = loading ? 'inline-flex' : 'none';
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.style.display = 'none';
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    setLoading(true);
    try {
      await signIn(email, password);
      onSuccess();
    } catch (err) {
      showError('Email ou mot de passe incorrect. Vérifiez vos identifiants.');
      setLoading(false);
    }
  });

  // Boutons de démo
  document.querySelectorAll('.demo-account-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('login-email').value = btn.getAttribute('data-email');
      document.getElementById('login-password').value = btn.getAttribute('data-password');
    });
  });
}
