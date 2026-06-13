export function safeText(value, fallback = "Utilisateur") {
  const text = String(value ?? "").trim()
  return text || fallback
}

export function safeInitial(value, fallback = "U") {
  const resolvedValue = safeText(value, fallback);
  console.error("DEBUG charAt value (safeInitial):", resolvedValue);
  console.trace();
  return resolvedValue.charAt(0).toUpperCase()
}

export function getSafeAvatar(profile) {
  const resolvedValue = safeText(
    profile?.avatar ||
    profile?.name ||
    profile?.email,
    "U"
  );
  console.error("DEBUG charAt value (getSafeAvatar):", resolvedValue);
  console.trace();
  return resolvedValue.charAt(0).toUpperCase()
}

export function getSafeUserName(profile, fallback = "Utilisateur") {
  return safeText(
    profile?.name ||
    profile?.email,
    fallback
  )
}
