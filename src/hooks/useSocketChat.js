import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { USER_LIST } from '../constants.js';
import { extractMentions } from '../utils/mentions.js';

// Helper to deduplicate messages by id
function deduplicateMessages(list) {
  const seen = new Set();
  const result = [];
  for (const item of list) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      result.push(item);
    }
  }
  return result;
}

export function useSocketChat(currentChannelId = 'introductions') {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(3);
  const [typingUsers, setTypingUsers] = useState([]);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef({});

  useEffect(() => {
    // Connect to current origin with Socket.IO
    const socket = io({
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      timeout: 10000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('chat:init');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('presence:update', (data) => {
      if (typeof data?.onlineCount === 'number') {
        setOnlineCount(Math.max(1, data.onlineCount));
      }
    });

    socket.on('chat:init', (serverMessages) => {
      if (Array.isArray(serverMessages)) {
        setMessages(deduplicateMessages(serverMessages));
      }
    });

    socket.on('chat:message', (newMessage) => {
      setMessages((prev) => {
        // 1. Check if message already exists by ID
        const existingIdx = prev.findIndex((m) => m.id === newMessage.id);
        if (existingIdx !== -1) {
          const updated = [...prev];
          updated[existingIdx] = { ...newMessage, isOptimistic: false };
          return updated;
        }

        // 2. Check if an optimistic message from same user with identical text exists
        const optimisticIdx = prev.findIndex(
          (m) =>
            m.isOptimistic &&
            m.user === newMessage.user &&
            m.text.trim() === newMessage.text.trim()
        );
        if (optimisticIdx !== -1) {
          const updated = [...prev];
          updated[optimisticIdx] = { ...newMessage, isOptimistic: false };
          return updated;
        }

        return [...prev, newMessage];
      });
    });

    socket.on('chat:liked', (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId ? { ...msg, likes: data.likes } : msg
        )
      );
    });

    socket.on('chat:user_typing', (data) => {
      if (!data?.user) return;
      const { user, isTyping } = data;

      if (isTyping) {
        setTypingUsers((prev) => (prev.includes(user) ? prev : [...prev, user]));
        if (typingTimeoutRef.current[user]) {
          clearTimeout(typingTimeoutRef.current[user]);
        }
        typingTimeoutRef.current[user] = setTimeout(() => {
          setTypingUsers((prev) => prev.filter((u) => u !== user));
        }, 3500);
      } else {
        setTypingUsers((prev) => prev.filter((u) => u !== user));
        if (typingTimeoutRef.current[user]) {
          clearTimeout(typingTimeoutRef.current[user]);
        }
      }
    });

    // Fallback: Fetch messages via REST
    fetch('/api/messages')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && Array.isArray(data.messages)) {
          setMessages((current) => {
            const optimisticPending = current.filter((m) => m.isOptimistic);
            return deduplicateMessages([...data.messages, ...optimisticPending]);
          });
        }
      })
      .catch(() => {});

    return () => {
      socket.disconnect();
      socketRef.current = null;
      Object.values(typingTimeoutRef.current).forEach((t) => clearTimeout(t));
    };
  }, []);

  // Send message in JavaScript
  const sendMessage = useCallback(
    (rawText, manualUser, channelId = currentChannelId, explicitMentions) => {
      const text = typeof rawText === 'string' ? rawText.trim() : '';
      if (!text) return;

      const assignedUser =
        manualUser || USER_LIST[Math.floor(Math.random() * USER_LIST.length)];

      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const tempId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      // Store deduplicated mentions
      const mentions = extractMentions(text, explicitMentions || []);

      const optimisticMessage = {
        id: tempId,
        user: assignedUser,
        text,
        timestamp: `${hours}:${minutes}`,
        likes: 0,
        channelId,
        mentions,
        isOptimistic: true,
      };

      // Optimistic local update
      setMessages((prev) => [...prev, optimisticMessage]);

      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('chat:send', {
          id: tempId,
          text,
          user: assignedUser,
          channelId,
          mentions,
        });
      } else {
        fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: tempId,
            text,
            user: assignedUser,
            channelId,
            mentions,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data?.message) {
              setMessages((prev) =>
                prev.map((m) => (m.id === tempId ? { ...data.message, isOptimistic: false } : m))
              );
            }
          })
          .catch((err) => console.error('Failed to post message:', err));
      }
    },
    [currentChannelId]
  );

  // Like message: increments like count
  const likeMessage = useCallback((messageId) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, likes: (msg.likes || 0) + 1 } : msg
      )
    );

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('chat:like', { messageId });
    } else {
      fetch(`/api/messages/${messageId}/like`, { method: 'POST' }).catch((err) =>
        console.error('Failed to like message:', err)
      );
    }
  }, []);

  const sendTypingStatus = useCallback((isTyping, user = 'Alan') => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('chat:typing', { user, isTyping });
    }
  }, []);

  // Simulation helper
  const simulateIncomingMessage = useCallback(
    (customText) => {
      const sampleTexts = [
        "Hey everyone! Just checking in on today's sprint goals.",
        'Could @Alan and @Bob take a look at the PR? 🚀',
        'Great work on the release yesterday! 🎉',
        'Hey @Carol, do you have a minute for a quick huddle? ☕',
        "Don't forget to review standup notes with @Dean! 📝",
        'Awesome presentation @Elin! 👏',
      ];
      const validText =
        typeof customText === 'string' && customText.trim()
          ? customText.trim()
          : sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
      const randomUser = USER_LIST[Math.floor(Math.random() * USER_LIST.length)];
      sendMessage(validText, randomUser, currentChannelId);
    },
    [currentChannelId, sendMessage]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    fetch('/api/messages/clear', { method: 'POST' }).catch(() => {});
  }, []);

  return {
    messages,
    isConnected,
    onlineCount,
    typingUsers,
    sendMessage,
    likeMessage,
    sendTypingStatus,
    simulateIncomingMessage,
    clearMessages,
  };
}
