import React, { useState } from 'react';
import { getUserColor, getUserInitials } from '../constants.js';
import { formatMessageText } from '../utils/formatText.jsx';
import { ThumbsUp } from 'lucide-react';

export function MessageItem({ message, onLike }) {
  const [isLiking, setIsLiking] = useState(false);
  const color = getUserColor(message.user);
  const initials = getUserInitials(message.user);

  const handleLikeClick = (e) => {
    e.stopPropagation();
    setIsLiking(true);
    onLike(message.id);
    setTimeout(() => setIsLiking(false), 300);
  };

  return (
    <div className="flex items-start gap-3 sm:gap-3.5 group transition-colors px-2 py-1.5 rounded-xl hover:bg-slate-50/60">
      {/* User Avatar with Initials */}
      <div
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 shadow-xs ring-2 ${color.ring} ${color.bg} ${color.text} select-none`}
        title={message.user}
      >
        {initials}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {/* Name and Timestamp row matching reference design */}
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-sm text-slate-900 tracking-tight">
            {message.user}
          </span>
          <span className="text-xs text-slate-400 font-normal">
            {message.timestamp}
          </span>
          {message.isOptimistic && (
            <span className="text-[10px] text-blue-500 font-medium">sending...</span>
          )}
        </div>

        {/* Message Bubble & Like Button Row */}
        <div className="flex items-end justify-between gap-3 max-w-3xl">
          {/* Bubble with formatted text and @mentions */}
          <div className="inline-block bg-white border border-slate-200/90 rounded-2xl rounded-tl-xs px-4 py-2.5 text-sm sm:text-[15px] text-slate-800 leading-relaxed shadow-xs break-words">
            {formatMessageText(message.text)}
          </div>

          {/* Like button positioned at the right end of the chat message */}
          <div className="shrink-0 flex items-center gap-1 self-center">
            <button
              type="button"
              onClick={handleLikeClick}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-150 cursor-pointer ${
                message.likes > 0
                  ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300'
                  : 'bg-white border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-slate-50 hover:border-slate-300'
              } ${isLiking ? 'scale-115 ring-2 ring-blue-300' : ''}`}
              title="Click to like message"
              aria-label={`Like message from ${message.user}. Current likes: ${message.likes}`}
            >
              <ThumbsUp
                className={`w-3.5 h-3.5 transition-transform ${
                  isLiking ? '-rotate-12' : ''
                } ${message.likes > 0 ? 'fill-blue-600 text-blue-600' : ''}`}
              />
              <span className="tabular-nums font-semibold">
                {message.likes}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
