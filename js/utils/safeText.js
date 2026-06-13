export function safeText(value, fallback = "Utilisateur") {
  const text = String(value ?? "").trim()
  return text || fallback
}

export function safeInitial(value, fallback = "U") {
  return safeText(value, fallback).charAt(0).toUpperCase()
}

export function getSafeAvatar(profile) {
  return safeInitial(
    profile?.avatar ||
    profile?.name ||
    profile?.email,
    "U"
  )
}

export function getSafeUserName(profile, fallback = "Utilisateur") {
  return safeText(
    profile?.name ||
    profile?.email,
    fallback
  )
}
