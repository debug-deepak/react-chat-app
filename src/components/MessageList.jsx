import React, { useEffect, useRef } from 'react';
import { MessageItem } from './MessageItem.jsx';

export function MessageList({ messages, typingUsers, onLikeMessage }) {
  const bottomRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto px-4 py-6 space-y-4 sm:space-y-5 bg-[#f8fafc]/50"
    >
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
          <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 mb-3 shadow-xs">
            💬
          </div>
          <p className="text-base font-semibold text-slate-700">No messages yet</p>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1">
            Send a chat message below to start the conversation! You can also type <code className="bg-slate-200/80 px-1 py-0.5 rounded text-blue-600 font-mono font-medium">@</code> to mention someone.
          </p>
        </div>
      ) : (
        messages.map((msg) => (
          <MessageItem key={msg.id} message={msg} onLike={onLikeMessage} />
        ))
      )}

      {/* Typing indicator */}
      {typingUsers && typingUsers.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-slate-500 italic px-3 py-1">
          <div className="flex gap-1 items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.3s]" />
          </div>
          <span>
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
