export const USER_LIST = ['Alan', 'Bob', 'Carol', 'Dean', 'Elin'];

export const USER_COLORS = {
  Alan: { bg: 'bg-sky-500', text: 'text-white', ring: 'ring-sky-200' },
  Bob: { bg: 'bg-emerald-600', text: 'text-white', ring: 'ring-emerald-200' },
  Carol: { bg: 'bg-purple-600', text: 'text-white', ring: 'ring-purple-200' },
  Dean: { bg: 'bg-amber-600', text: 'text-white', ring: 'ring-amber-200' },
  Elin: { bg: 'bg-rose-500', text: 'text-white', ring: 'ring-rose-200' },
  'Elin Emmanuel': { bg: 'bg-rose-400', text: 'text-white', ring: 'ring-rose-200' },
  'PubNub Bot': { bg: 'bg-[#d84a38]', text: 'text-white', ring: 'ring-red-200' },
  'Gregory Goolsby': { bg: 'bg-[#b8d432]', text: 'text-zinc-900', ring: 'ring-lime-200' },
  'Rolande Raimondi': { bg: 'bg-[#f47c7c]', text: 'text-white', ring: 'ring-rose-200' },
};

export function getUserColor(user) {
  if (USER_COLORS[user]) return USER_COLORS[user];
  const colors = [
    { bg: 'bg-indigo-500', text: 'text-white', ring: 'ring-indigo-200' },
    { bg: 'bg-teal-500', text: 'text-white', ring: 'ring-teal-200' },
    { bg: 'bg-pink-500', text: 'text-white', ring: 'ring-pink-200' },
    { bg: 'bg-amber-500', text: 'text-white', ring: 'ring-amber-200' },
    { bg: 'bg-cyan-600', text: 'text-white', ring: 'ring-cyan-200' },
  ];
  let hash = 0;
  for (let i = 0; i < (user || '').length; i++) {
    hash = user.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function getUserInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const DEFAULT_CHANNELS = [
  { id: 'poland', name: 'Poland Office', description: 'Regional branch updates & social discussions' },
  { id: 'introductions', name: 'Introductions', description: 'This Channel Is For Company Wide Chatter' },
  { id: 'india', name: 'India Office', description: 'Bengaluru & Hyderabad campus coordination' },
];

export const EMOJI_CATEGORIES = [
  {
    name: 'Popular',
    emojis: ['👍', '❤️', '🔥', '🎉', '🚀', '🙌', '✨', '👏', '😂', '💡', '✅', '💯'],
  },
  {
    name: 'Smileys',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😉', '😊', '😇', '🥰', '😍', '🤩', '😎'],
  },
  {
    name: 'Gestures',
    emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤙', '👋', '🤝', '🙏', '👏', '🙌', '💪', '🫡'],
  },
  {
    name: 'Reactions',
    emojis: ['❤️', '🔥', '🎉', '⭐', '⚡', '💡', '✨', '🚀', '🎯', '🏆', '💯', '💥', '👀', '🥳'],
  },
];
