import React, { useState, useRef } from 'react';
import { Send, Smile, AtSign, Dices } from 'lucide-react';
import { EmojiPicker } from './EmojiPicker.jsx';
import { MentionDropdown } from './MentionDropdown.jsx';
import { USER_LIST } from '../constants.js';
import { extractMentions } from '../utils/mentions.js';

export function ChatInput({ onSendMessage, onTyping }) {
  const [text, setText] = useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isMentionOpen, setIsMentionOpen] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [mentionSelectedIndex, setMentionSelectedIndex] = useState(0);
  const [selectedUserMode, setSelectedUserMode] = useState('random');
  const inputRef = useRef(null);
  const typingTimerRef = useRef(null);

  const filteredUsers = Array.from(new Set(USER_LIST)).filter((user) =>
    user.toLowerCase().includes(mentionFilter.toLowerCase())
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setText(value);

    // Typing status
    if (onTyping) {
      onTyping(true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        onTyping(false);
      }, 1500);
    }

    // Check if user is typing a mention
    const cursorPos = e.target.selectionStart || 0;
    const textBeforeCursor = value.slice(0, cursorPos);
    const lastAtIdx = textBeforeCursor.lastIndexOf('@');

    if (lastAtIdx !== -1) {
      const query = textBeforeCursor.slice(lastAtIdx + 1);
      if (!/\s/.test(query)) {
        setMentionFilter(query);
        setMentionSelectedIndex(0);
        setIsMentionOpen(true);
        return;
      }
    }
    setIsMentionOpen(false);
  };

  const handleSelectMention = (username) => {
    if (!inputRef.current) return;
    const cursorPos = inputRef.current.selectionStart || 0;
    const textBeforeCursor = text.slice(0, cursorPos);
    const textAfterCursor = text.slice(cursorPos);
    const lastAtIdx = textBeforeCursor.lastIndexOf('@');

    const prefix = lastAtIdx !== -1 ? textBeforeCursor.slice(0, lastAtIdx) : textBeforeCursor;
    const newText = `${prefix}@${username} ${textAfterCursor}`;
    setText(newText);
    setIsMentionOpen(false);

    // Position cursor after the mention
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const newCursorPos = prefix.length + username.length + 2;
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 10);
  };

  const handleSelectEmoji = (emoji) => {
    if (!inputRef.current) {
      setText((prev) => prev + emoji);
      return;
    }
    const cursorPos = inputRef.current.selectionStart || text.length;
    const newText = text.slice(0, cursorPos) + emoji + text.slice(cursorPos);
    setText(newText);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const nextPos = cursorPos + emoji.length;
        inputRef.current.setSelectionRange(nextPos, nextPos);
      }
    }, 10);
  };

  const handleKeyDown = (e) => {
    // If mention dropdown is open, handle keyboard navigation
    if (isMentionOpen && filteredUsers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionSelectedIndex((prev) => (prev + 1) % filteredUsers.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionSelectedIndex((prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        const selectedUser = filteredUsers[mentionSelectedIndex] || filteredUsers[0];
        if (selectedUser) {
          handleSelectMention(selectedUser);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsMentionOpen(false);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === 'Escape') {
      setIsMentionOpen(false);
      setIsEmojiPickerOpen(false);
    }
  };

  const handleSend = () => {
    if (!text.trim()) return;

    const userToAssign = selectedUserMode === 'random' ? undefined : selectedUserMode;
    const allMentions = extractMentions(text);

    onSendMessage(text, userToAssign, allMentions);
    setText('');
    setIsMentionOpen(false);
    setIsEmojiPickerOpen(false);

    if (onTyping) {
      onTyping(false);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    }

    inputRef.current?.focus();
  };

  const triggerMentionExplicitly = () => {
    setText((prev) => prev + '@');
    setMentionFilter('');
    setMentionSelectedIndex(0);
    setIsMentionOpen(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  const quickEmojis = ['👍', '❤️', '🎉', '🔥', '🚀', '🙌', '✨'];

  return (
    <div className="relative p-3 sm:p-4 bg-white border-t border-slate-200/80">
      {/* Mention Autocomplete Dropdown */}
      <MentionDropdown
        isOpen={isMentionOpen}
        filterText={mentionFilter}
        selectedIndex={mentionSelectedIndex}
        onSelectUser={handleSelectMention}
        onClose={() => setIsMentionOpen(false)}
      />

      {/* Emoji Picker Popover */}
      <EmojiPicker
        isOpen={isEmojiPickerOpen}
        onClose={() => setIsEmojiPickerOpen(false)}
        onSelectEmoji={handleSelectEmoji}
      />

      {/* Helper bar: Random assignment selector & quick emojis */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-1 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 bg-slate-100/90 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
          <Dices className="w-3.5 h-3.5 text-blue-600 animate-spin-slow" />
          <span>Sender assignment:</span>
          <select
            value={selectedUserMode}
            onChange={(e) => setSelectedUserMode(e.target.value)}
            className="bg-white font-medium text-blue-700 text-xs rounded px-1.5 py-0.5 border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
            title="Randomly assigns one of Alan, Bob, Carol, Dean, or Elin for each message sent"
          >
            <option value="random">Randomly pick (Alan, Bob, Carol, Dean, Elin)</option>
            {USER_LIST.map((u) => (
              <option key={u} value={u}>
                Fixed: {u}
              </option>
            ))}
          </select>
        </div>

        {/* Quick emoji reaction bar */}
        <div className="hidden sm:flex items-center gap-1">
          <span className="text-[11px] text-slate-400 mr-1">Quick:</span>
          {quickEmojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleSelectEmoji(emoji)}
              className="text-sm hover:scale-125 transition-transform p-0.5 cursor-pointer"
              title={`Insert ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 flex items-center bg-[#f8fafc] hover:bg-white focus-within:bg-white border border-slate-300 focus-within:border-blue-500 focus-within:ring-3 focus-within:ring-blue-100 rounded-full transition-all duration-150 px-3.5 py-2">
          {/* Quick @ mention button */}
          <button
            type="button"
            onClick={triggerMentionExplicitly}
            className="text-slate-400 hover:text-blue-600 p-1 -ml-1 rounded-full hover:bg-slate-200/50 transition-colors cursor-pointer"
            title="Mention a team member from user_list (@)"
            aria-label="Mention a user"
          >
            <AtSign className="w-4 h-4" />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (use @ to mention users, or click 😊)"
            className="flex-1 bg-transparent px-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden"
          />

          {/* Emoji button inside input field */}
          <button
            type="button"
            onClick={() => setIsEmojiPickerOpen((prev) => !prev)}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              isEmojiPickerOpen
                ? 'text-blue-600 bg-blue-50'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/60'
            }`}
            title="Open emoji picker"
            aria-label="Emoji picker"
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium shadow-sm hover:shadow-md transition-all cursor-pointer shrink-0"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </div>
  );
}
