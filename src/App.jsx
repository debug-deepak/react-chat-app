import React, { useState } from 'react';
import { DEFAULT_CHANNELS } from './constants.js';
import { useSocketChat } from './hooks/useSocketChat.js';
import { Sidebar } from './components/Sidebar.jsx';
import { ChatHeader } from './components/ChatHeader.jsx';
import { MessageList } from './components/MessageList.jsx';
import { ChatInput } from './components/ChatInput.jsx';

export default function App() {
  const [channels] = useState(DEFAULT_CHANNELS);
  const [activeChannelId, setActiveChannelId] = useState('introductions');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const {
    messages,
    isConnected,
    onlineCount,
    typingUsers,
    sendMessage,
    likeMessage,
    sendTypingStatus,
    simulateIncomingMessage,
  } = useSocketChat(activeChannelId);

  const activeChannel =
    channels.find((c) => c.id === activeChannelId) || DEFAULT_CHANNELS[1];

  // Filter messages for current channel, falling back to show general messages in 'introductions'
  const filteredMessages = messages.filter(
    (msg) => !msg.channelId || msg.channelId === activeChannelId
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f4f6f8] font-sans antialiased text-slate-800">
      {/* Sidebar matching screenshot */}
      <Sidebar
        channels={channels}
        activeChannelId={activeChannelId}
        onSelectChannel={(id) => setActiveChannelId(id)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Chat Thread Area */}
      <main className="flex-1 flex flex-col h-full min-w-0 bg-white shadow-xs">
        {/* Chat Header */}
        <ChatHeader
          channel={activeChannel}
          onlineCount={onlineCount}
          isConnected={isConnected}
          onSimulateMessage={simulateIncomingMessage}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        {/* Message Thread above the textbox */}
        <MessageList
          messages={filteredMessages}
          typingUsers={typingUsers}
          onLikeMessage={likeMessage}
        />

        {/* Chat Input at bottom */}
        <ChatInput
          onSendMessage={(text, manualUser, mentions) =>
            sendMessage(text, manualUser, activeChannelId, mentions)
          }
          onTyping={(isTyping) => sendTypingStatus(isTyping)}
        />
      </main>
    </div>
  );
}
