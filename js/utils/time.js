// EduBook — Relative Time Formatter
export function formatRelativeTime(dateStr) {
  if (!dateStr) return 'Récemment';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours   = Math.floor(diffMs / 3600000);
  const diffDays    = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1)  return "À l'instant";
  if (diffMinutes < 60) return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  if (diffHours < 24)   return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  if (diffDays === 1)   return 'Hier';
  if (diffDays < 7)     return `Il y a ${diffDays} jours`;
  return date.toLocaleDateString('fr-FR');
}
