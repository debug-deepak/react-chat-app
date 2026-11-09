import React from 'react';
import { USER_LIST, getUserColor } from '../constants.js';

/**
 * Parses message text and highlights @mentions with distinctive styling.
 */
export function formatMessageText(text) {
  if (!text || typeof text !== 'string') return null;

  // Match @username
  const mentionRegex = /(@[A-Za-z0-9_]+)/g;
  const parts = text.split(mentionRegex);

  return parts.map((part, index) => {
    if (part.startsWith('@')) {
      const mentionName = part.substring(1);
      const matchedUser = USER_LIST.find(
        (u) => u.toLowerCase() === mentionName.toLowerCase()
      );
      const displayName = matchedUser || mentionName;
      const color = getUserColor(displayName);

      return (
        <span
          key={index}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded-md font-semibold text-blue-700 bg-blue-50 border border-blue-200/80 transition-all hover:bg-blue-100 cursor-pointer text-xs sm:text-sm select-none"
          title={`Mentioned user: @${displayName}`}
        >
          <span
            className={`w-3.5 h-3.5 rounded-full text-[9px] font-bold flex items-center justify-center shrink-0 ${color.bg} ${color.text}`}
          >
            @
          </span>
          <span>{displayName}</span>
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
}
