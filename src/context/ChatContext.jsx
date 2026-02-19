import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { sendMessage } from '../api.js';

const ChatContext = createContext();

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
  const [streamingThinking, setStreamingThinking] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  // User Settings
  const [userName, setUserName] = useState(() => localStorage.getItem('claude-username') || '');
  const [proxyPort, setProxyPort] = useState(() => localStorage.getItem('claude-proxy-port') || '8080');
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('claude-model') || '');
  const [isProxyAvailable, setIsProxyAvailable] = useState(true);
  const [isCheckingProxy, setIsCheckingProxy] = useState(true);

  // Smooth Streaming Refs
  const targetTextRef = useRef('');
  const currentTextRef = useRef('');
  const streamingIntervalRef = useRef(null);

  const baseUrl = `http://localhost:${proxyPort}`;

  const fetchModels = useCallback(async () => {
    if (!proxyPort) return;
    setIsCheckingProxy(true);
    try {
      const response = await fetch(`${baseUrl}/v1/models`);
      if (!response.ok) throw new Error('Proxy not responding correctly');
      const data = await response.json();

      const models = data.data.map(m => {
        let name = m.description || m.id;
        const hasThinkingInId = m.id.toLowerCase().includes('thinking');

        if (!hasThinkingInId && name.toLowerCase().includes('thinking')) {
          name = name.replace(/\s*\(Thinking\)\s*/gi, '').trim();
          name = name.replace(/\s+Thinking\s*/gi, '').trim();
        }

        return {
          id: m.id,
          name: name
        };
      }).sort((a, b) => a.name.localeCompare(b.name));

      setAvailableModels(models);
      setIsProxyAvailable(true);

      const savedModel = localStorage.getItem('claude-model');
      if (models.length > 0) {
        if (!savedModel || !models.find(m => m.id === savedModel)) {
          setSelectedModel(models[0].id);
        } else {
          setSelectedModel(savedModel);
        }
      }
    } catch (err) {
      console.error('Error fetching models:', err);
      setIsProxyAvailable(false);
      setAvailableModels([]);
    } finally {
      setIsCheckingProxy(false);
    }
  }, [baseUrl, proxyPort]);

  useEffect(() => {
    if (userName && proxyPort) {
      fetchModels();
    }
  }, [fetchModels, userName, proxyPort]);

  useEffect(() => {
    localStorage.setItem('claude-username', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('claude-proxy-port', proxyPort);
  }, [proxyPort]);

  useEffect(() => {
    if (selectedModel) {
      localStorage.setItem('claude-model', selectedModel);
    }
  }, [selectedModel]);

  // Smooth Delivery Effect
  useEffect(() => {
    if (isStreaming) {
      streamingIntervalRef.current = setInterval(() => {
        if (currentTextRef.current.length < targetTextRef.current.length) {
          // Determine how many characters to add for smoothness
          // If we are lagging far behind, catch up faster
          const diff = targetTextRef.current.length - currentTextRef.current.length;
          const jump = diff > 50 ? 5 : diff > 10 ? 2 : 1;

          currentTextRef.current = targetTextRef.current.slice(0, currentTextRef.current.length + jump);
          setStreamingText(currentTextRef.current);
        }
      }, 15);
    } else {
      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
        streamingIntervalRef.current = null;
      }
      // Ensure final text matches target exactly when done
      if (currentTextRef.current !== targetTextRef.current) {
        setStreamingText(targetTextRef.current);
      }
    }

    return () => {
      if (streamingIntervalRef.current) clearInterval(streamingIntervalRef.current);
    };
  }, [isStreaming]);

  const abortControllerRef = useRef(null);
  const conversationsRef = useRef(conversations);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

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
    async (conversationId) => {
      setError(null);
      setIsStreaming(true);
      setStreamingText('');
      setStreamingThinking('');
      targetTextRef.current = '';
      currentTextRef.current = '';

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
            if (update.text !== undefined) {
              targetTextRef.current = update.text;
            }
            if (update.thinking !== undefined) setStreamingThinking(update.thinking);
          },
          controller.signal,
          baseUrl
        );

        const { text: fullText, thinking: fullThinking } = finalResult || {};

        // Wait for smooth delivery to finish catch-up
        while (currentTextRef.current.length < targetTextRef.current.length) {
          await new Promise(r => setTimeout(r, 20));
        }

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
                    thinking: fullThinking || '',
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
    [updateConversations, selectedModel, baseUrl]
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
        proxyPort,
        setProxyPort,
        availableModels,
        selectedModel,
        setSelectedModel,
        isProxyAvailable,
        isCheckingProxy,
        fetchModels,
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
