import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { sendMessage } from '../api.js';

const ChatContext = createContext();

export const AVAILABLE_MODELS = [
  { id: 'claude-sonnet-4-5-thinking', name: 'Claude Sonnet 4.5 (Thinking)' },
  { id: 'claude-opus-4-6-thinking', name: 'Claude Opus 4.6 (Thinking)' },
  { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6 (Thinking)' },
  { id: 'claude-sonnet-4-5', name: 'Claude Sonnet 4.5' },
  { id: 'gemini-3-flash', name: 'Gemini 3 Flash' },
  { id: 'gemini-3-pro-high', name: 'Gemini 3 Pro (High)' },
  { id: 'gemini-3-pro-low', name: 'Gemini 3 Pro (Low)' },
  { id: 'gemini-3-pro-image', name: 'Gemini 3 Pro Image' },
  { id: 'gemini-2.5-flash-thinking', name: 'Gemini 2.5 Flash (Thinking)' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite' },
];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function loadConversations() {
  try {
    const data = localStorage.getItem('claude-conversations');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveConversations(conversations) {
  localStorage.setItem('claude-conversations', JSON.stringify(conversations));
}

export function ChatProvider({ children }) {
  const [conversations, setConversations] = useState(loadConversations);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [streamingText, setStreamingText] = useState('');
  const [streamingThinking, setStreamingThinking] = useState(''); // New state for thinking
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  // User Settings
  const [userName, setUserName] = useState(() => localStorage.getItem('claude-username') || '');
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('claude-model') || 'claude-sonnet-4-5-thinking');

  const abortControllerRef = useRef(null);
  const conversationsRef = useRef(conversations);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  // Persist settings
  useEffect(() => {
    localStorage.setItem('claude-username', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('claude-model', selectedModel);
  }, [selectedModel]);

  const updateConversations = useCallback((updater) => {
    const prev = conversationsRef.current;
    const next = typeof updater === 'function' ? updater(prev) : updater;
    conversationsRef.current = next;
    saveConversations(next);
    setConversations(next);
  }, []);

  const createConversation = useCallback(
    (firstMessage, attachments = []) => {
      const id = generateId();
      const textContent = typeof firstMessage === 'string' ? firstMessage : '';
      const title = textContent.slice(0, 50) + (textContent.length > 50 ? '...' : '');

      let content = firstMessage;
      if (attachments && attachments.length > 0) {
        content = [
          { type: 'text', text: firstMessage },
          ...attachments
        ];
      }

      const conversation = {
        id,
        title,
        messages: [{ role: 'user', content, timestamp: Date.now() }],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      updateConversations((prev) => [conversation, ...prev]);
      setActiveConversationId(id);
      return id;
    },
    [updateConversations]
  );

  const addUserMessage = useCallback(
    (conversationId, text, attachments = []) => {
      let content = text;
      if (attachments && attachments.length > 0) {
        content = [
          { type: 'text', text: text },
          ...attachments
        ];
      }

      updateConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? {
              ...c,
              messages: [...c.messages, { role: 'user', content, timestamp: Date.now() }],
              updatedAt: Date.now(),
            }
            : c
        )
      );
    },
    [updateConversations]
  );

  const sendChatMessage = useCallback(
    async (conversationId, contentOverride = null) => {
      setError(null);
      setIsStreaming(true);
      setStreamingText('');
      setStreamingThinking(''); // Reset thinking

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const conv = conversationsRef.current.find((c) => c.id === conversationId);
        if (!conv || conv.messages.length === 0) {
          throw new Error('Conversation not found or has no messages');
        }

        const messagesToSend = conv.messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const finalResult = await sendMessage(
          messagesToSend,
          selectedModel,
          (update) => {
            // Handle both text and thinking updates
            if (update.text !== undefined) setStreamingText(update.text);
            if (update.thinking !== undefined) setStreamingThinking(update.thinking);
          },
          controller.signal
        );

        // The final result from sendMessage is expected to be an object { text, thinking }
        const { text: fullText, thinking: fullThinking } = finalResult || {};

        updateConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? {
                ...c,
                messages: [
                  ...c.messages,
                  {
                    role: 'assistant',
                    content: fullText || '',
                    thinking: fullThinking || '', // Store thinking in message
                    timestamp: Date.now()
                  },
                ],
                updatedAt: Date.now(),
              }
              : c
          )
        );

        setStreamingText('');
        setStreamingThinking('');
        setIsStreaming(false);
      } catch (err) {
        if (err.name === 'AbortError') {
          setStreamingText('');
          setStreamingThinking('');
        } else {
          setError(err.message);
          updateConversations((prev) =>
            prev.map((c) =>
              c.id === conversationId
                ? {
                  ...c,
                  messages: [
                    ...c.messages,
                    {
                      role: 'assistant',
                      content: `Error: ${err.message}`,
                      timestamp: Date.now(),
                      isError: true,
                    },
                  ],
                  updatedAt: Date.now(),
                }
                : c
            )
          );
        }
        setIsStreaming(false);
      }
    },
    [updateConversations, selectedModel]
  );

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const deleteConversation = useCallback(
    (id) => {
      updateConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
      }
    },
    [activeConversationId, updateConversations]
  );

  const renameConversation = useCallback(
    (id, newTitle) => {
      updateConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
      );
    },
    [updateConversations]
  );

  const retryLastMessage = useCallback(
    async (conversationId) => {
      updateConversations((prev) =>
        prev.map((c) => {
          if (c.id !== conversationId) return c;
          const msgs = [...c.messages];
          if (msgs.length > 0 && msgs[msgs.length - 1].role === 'assistant') {
            msgs.pop();
          }
          return { ...c, messages: msgs };
        })
      );

      await sendChatMessage(conversationId);
    },
    [sendChatMessage, updateConversations]
  );

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        activeConversationId,
        setActiveConversationId,
        streamingText,
        streamingThinking,
        isStreaming,
        error,
        userName,
        setUserName,
        selectedModel,
        setSelectedModel,
        createConversation,
        addUserMessage,
        sendChatMessage,
        stopStreaming,
        deleteConversation,
        renameConversation,
        retryLastMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
}
