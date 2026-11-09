import React, { useState, useRef, useEffect } from 'react';
import { EMOJI_CATEGORIES } from '../constants.js';
import { Smile, Sparkles, ThumbsUp, Heart, X } from 'lucide-react';

export function EmojiPicker({ isOpen, onClose, onSelectEmoji }) {
  const [activeTab, setActiveTab] = useState(0);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categoryIcons = [
    <Sparkles key="pop" className="w-3.5 h-3.5" />,
    <Smile key="smi" className="w-3.5 h-3.5" />,
    <ThumbsUp key="ges" className="w-3.5 h-3.5" />,
    <Heart key="rea" className="w-3.5 h-3.5" />,
  ];

  return (
    <div
      ref={containerRef}
      className="absolute bottom-16 right-2 sm:right-6 z-50 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Header with tabs */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50/80">
        <div className="flex items-center gap-1">
          {EMOJI_CATEGORIES.map((cat, idx) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => setActiveTab(idx)}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                activeTab === idx
                  ? 'bg-white text-blue-600 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
              }`}
            >
              {categoryIcons[idx]}
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors cursor-pointer"
          aria-label="Close emoji picker"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Emoji Grid */}
      <div className="p-3 max-h-52 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          {EMOJI_CATEGORIES[activeTab].name}
        </div>
        <div className="grid grid-cols-6 gap-2">
          {EMOJI_CATEGORIES[activeTab].emojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                onSelectEmoji(emoji);
              }}
              className="w-9 h-9 text-xl flex items-center justify-center rounded-xl hover:bg-blue-50 hover:scale-115 active:scale-95 transition-all select-none cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Quick reaction footer */}
      <div className="px-3 py-2 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
        <span>Click an emoji to insert into message</span>
      </div>
    </div>
  );
}
