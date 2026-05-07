const DEFAULT_USER_AVATAR_SVG = encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96' fill='none'>" +
    "<rect width='96' height='96' rx='28' fill='#EEF0FD'/>" +
    "<circle cx='48' cy='35' r='18' fill='#4F6EF7' opacity='.95'/>" +
    "<path d='M18 82c4-18 18-28 30-28s26 10 30 28' fill='#4F6EF7' opacity='.95'/>" +
  "</svg>"
);

export const DEFAULT_USER_AVATAR = `data:image/svg+xml;charset=UTF-8,${DEFAULT_USER_AVATAR_SVG}`;

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function getAvatarFallback(name = '') {
  const normalized = normalizeText(name);
  return normalized ? normalized.charAt(0).toUpperCase() : '?';
}

export function getResolvedAvatarUrl(value) {
  if (typeof value === 'string') {
    return normalizeText(value) || DEFAULT_USER_AVATAR;
  }

  return normalizeText(value?.avatarUrl) || DEFAULT_USER_AVATAR;
}

export function handleAvatarError(event) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = DEFAULT_USER_AVATAR;
}
