import React from 'react';
import { Users, Wifi, WifiOff, Sparkles, Menu } from 'lucide-react';

export function ChatHeader({
  channel,
  onlineCount,
  isConnected,
  onSimulateMessage,
  onToggleSidebar,
}) {
  return (
    <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white border-b border-slate-200/90 shadow-2xs">
      {/* Channel info matching screenshot */}
      <div className="flex items-center gap-3 min-w-0">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{channel?.name || 'Introductions'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 truncate">
            {channel?.description || 'This Channel Is For Company Wide Chatter'}
          </p>
        </div>
      </div>

      {/* Right side controls matching screenshot (3 | 100 [users icon]) + socket status */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Simulate message helper */}
        <button
          type="button"
          onClick={() => onSimulateMessage()}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
          title="Simulate an incoming message from Alan, Bob, Carol, Dean, or Elin"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Simulate Incoming</span>
        </button>

        {/* Real-time Socket.io indicator */}
        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${
            isConnected
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-amber-50 border-amber-200 text-amber-700'
          }`}
          title={isConnected ? 'Connected to Socket.IO real-time server' : 'Connecting to Socket.IO server...'}
        >
          {isConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Wifi className="w-3 h-3 hidden sm:inline" />
              <span className="text-[11px]">Live Sync</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-amber-500" />
              <span className="text-[11px]">Syncing</span>
            </>
          )}
        </div>

        {/* Member count matching reference screenshot "3 | 100" and user icon */}
        <div
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80"
          title={`${onlineCount} connected out of 100 team members`}
        >
          <span className="tabular-nums font-semibold text-slate-700">{onlineCount}</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-400">100</span>
          <Users className="w-4 h-4 text-slate-400 ml-0.5" />
        </div>
      </div>
    </div>
  );
}
