import React, { useEffect, useRef } from 'react';
import { USER_LIST, getUserColor, getUserInitials } from '../constants.js';
import { AtSign, CornerDownLeft } from 'lucide-react';

export function MentionDropdown({
  isOpen,
  filterText,
  selectedIndex,
  onSelectUser,
  onClose,
}) {
  const containerRef = useRef(null);

  const filteredUsers = Array.from(new Set(USER_LIST)).filter((user) =>
    user.toLowerCase().includes(filterText.toLowerCase())
  );

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

  return (
    <div
      ref={containerRef}
      className="absolute bottom-16 left-2 sm:left-4 z-50 w-68 bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150 ring-1 ring-slate-900/5"
    >
      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50/60 border-b border-blue-100/80 text-xs font-semibold text-blue-900">
        <div className="flex items-center gap-1.5">
          <AtSign className="w-3.5 h-3.5 text-blue-600" />
          <span>Mention Team Member</span>
        </div>
        <span className="text-[10px] text-blue-600/70 font-mono">user_list ({filteredUsers.length})</span>
      </div>

      <div className="py-1 max-h-52 overflow-y-auto divide-y divide-slate-50">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user, idx) => {
            const color = getUserColor(user);
            const initials = getUserInitials(user);
            const isSelected = idx === selectedIndex;

            return (
              <button
                key={user}
                type="button"
                onClick={() => onSelectUser(user)}
                className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/90 text-blue-900'
                    : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${color.bg} ${color.text}`}
                  >
                    {initials}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold truncate leading-tight">
                      {user}
                    </span>
                    <span className="text-[11px] text-slate-400">@{user.toLowerCase()}</span>
                  </div>
                </div>

                {isSelected ? (
                  <span className="flex items-center gap-1 text-[11px] text-blue-600 bg-blue-100/70 px-1.5 py-0.5 rounded font-medium">
                    <CornerDownLeft className="w-3 h-3" />
                    Select
                  </span>
                ) : (
                  <span className="text-xs text-slate-300">@</span>
                )}
              </button>
            );
          })
        ) : (
          <div className="px-3 py-4 text-xs text-center text-slate-400">
            No matching users from user_list
          </div>
        )}
      </div>

      <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between items-center">
        <span>Use <kbd className="font-mono bg-white px-1 border border-slate-200 rounded text-[10px]">↑</kbd> <kbd className="font-mono bg-white px-1 border border-slate-200 rounded text-[10px]">↓</kbd> & <kbd className="font-mono bg-white px-1 border border-slate-200 rounded text-[10px]">Enter</kbd></span>
        <span className="font-mono text-[10px] bg-slate-200/80 px-1 rounded">Esc to cancel</span>
      </div>
    </div>
  );
}
