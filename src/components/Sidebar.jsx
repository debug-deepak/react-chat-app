import React from 'react';
import { USER_LIST, getUserColor, getUserInitials } from '../constants.js';
import { Hash, Plus, X } from 'lucide-react';

export function Sidebar({
  channels,
  activeChannelId,
  onSelectChannel,
  isOpen,
  onClose,
}) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 sm:w-72 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-200 ease-in-out shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top User Profile matching screenshot (Rolande Raimondi, Research Nurse, RR circle) */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar circle with initials RR and green online dot */}
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-[#f47c7c] text-white font-bold text-base flex items-center justify-center shadow-xs">
                RR
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            <div className="flex flex-col">
              <span className="font-bold text-sm text-slate-800 tracking-tight">
                Rolande Raimondi
              </span>
              <span className="text-xs text-slate-500 font-medium">Research Nurse</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="md:hidden p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conversations Section matching screenshot */}
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between px-2 mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Conversations
            </span>
            <button
              type="button"
              className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-500 transition-colors cursor-pointer"
              title="Add channel"
              aria-label="Add conversation"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Channel list */}
          <div className="space-y-1.5">
            {channels.map((chan) => {
              const isActive = chan.id === activeChannelId;
              return (
                <button
                  key={chan.id}
                  type="button"
                  onClick={() => {
                    onSelectChannel(chan.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#4d8bf5] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs font-mono ${
                      isActive
                        ? 'bg-blue-400/40 text-white'
                        : 'bg-slate-100 text-slate-400 group-hover:text-slate-600'
                    }`}
                  >
                    <Hash className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate flex-1">{chan.name}</span>
                </button>
              );
            })}
          </div>

          {/* Team members list preview */}
          <div className="mt-8 pt-4 border-t border-slate-100">
            <div className="px-2 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Team Members ({USER_LIST.length})
            </div>
            <div className="space-y-1">
              {USER_LIST.map((user) => {
                const color = getUserColor(user);
                const initials = getUserInitials(user);
                return (
                  <div
                    key={user}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-xs text-slate-700 transition-colors"
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${color.bg} ${color.text}`}
                    >
                      {initials}
                    </div>
                    <span className="font-medium text-slate-700">{user}</span>
                    <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 text-center">
          Socket.IO Real-time Chat (JavaScript)
        </div>
      </aside>
    </>
  );
}
