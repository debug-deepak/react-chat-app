import { USER_LIST } from '../constants.js';

/**
 * Extracts and normalizes mentions from message text in JavaScript.
 * Matches @username and checks against USER_LIST.
 * Deduplicates users case-insensitively so a user is never listed twice.
 */
export function extractMentions(text, userList = USER_LIST) {
  if (typeof text !== 'string' || !text.trim()) return [];

  const regex = /@([A-Za-z0-9_]+)/g;
  const matches = text.match(regex);
  if (!matches) return [];

  const found = [];
  const lowerSeen = new Set();

  for (const match of matches) {
    const rawName = match.substring(1);
    const matchedUser = userList.find(
      (u) => u.toLowerCase() === rawName.toLowerCase()
    );
    const canonicalName = matchedUser || rawName;
    const lower = canonicalName.toLowerCase();

    if (!lowerSeen.has(lower)) {
      lowerSeen.add(lower);
      found.push(canonicalName);
    }
  }

  return found;
}
