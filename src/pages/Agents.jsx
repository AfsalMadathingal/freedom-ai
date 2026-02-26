import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "../components/layout/SideBar.jsx";
import { useChat } from "../context/ChatContext.jsx";
import { LuSparkles, LuMail, LuMessageSquare, LuLanguages, LuUser, LuPlus, LuArrowLeft, LuUpload } from "react-icons/lu";
import { sendMessage } from "../api/api.js";
import FreedomLogo from "../components/common/FreedomLogo.jsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/atom-one-dark.css";
import { CodeBlock } from "../components/chat/Answer.jsx";

const AGENTS = [
  {
    id: "grammar",
    name: "Grammar Correction",
    description: "Perfect your grammar and spelling",
    icon: <LuSparkles className="w-6 h-6" />,
    color: "bg-blue-500/20 text-blue-400",
    systemPrompt: "You are a grammar correction assistant. Correct the grammar and spelling of the user's input, making it sound more natural and professional. Only provide the corrected text without any preamble or explanation."
  },
  {
    id: "polite-email",
    name: "Polite Email",
    description: "Make your emails professional and kind",
    icon: <LuMail className="w-6 h-6" />,
    color: "bg-green-500/20 text-green-400",
    systemPrompt: "You are an assistant that rewrites emails to be more polite and professional. Maintain the original meaning but improve the tone to be respectful and professional. Provide the rewritten email."
  },
  {
    id: "polite-message",
    name: "Polite Message",
    description: "Friendly and professional chat messages",
    icon: <LuMessageSquare className="w-6 h-6" />,
    color: "bg-purple-500/20 text-purple-400",
    systemPrompt: "You are an assistant that rewrites short messages to be more polite and professional. Keep it concise and friendly while maintaining a professional tone."
  },
  {
    id: "cs-email",
    name: "Customer Service Email",
    description: "Professional CS responses and translations",
    icon: <LuLanguages className="w-6 h-6" />,
    color: "bg-orange-500/20 text-orange-400",
    systemPrompt: "You are a customer service specialist. Rewrite the user's request into a professional customer service email. If the input is in a different language, translate it to English while maintaining a professional CS tone."
  }
];

function Agents({ isPinned, setIsPinned }) {
  const navigate = useNavigate();
  const { createConversation, selectedModel, setSelectedModel, availableModels, baseUrl, proxyPort } = useChat();
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [showModels, setShowModels] = useState(false);
  const [creationChat, setCreationChat] = useState([{
    role: 'assistant',
    content: "Hi! I can help you create a custom agent. Tell me what kind of agent you need. For example: 'A coding assistant that only replies in rust code' or 'A sassy pirate that knows about history'."
  }]);
  const [creationInput, setCreationInput] = useState("");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [agentCreated, setAgentCreated] = useState(null);
  const chatBottomRef = useRef(null);
  const modelMenuRef = useRef(null);

  const apiBaseUrl = `http://localhost:${proxyPort}`;

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [creationChat]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(event.target)) {
        setShowModels(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentModelName = availableModels.find(m => m.id === selectedModel)?.name || selectedModel || "Select Model";

  const handleAgentClick = (agent) => {
    const id = createConversation('', [], agent.systemPrompt, agent.name);
    navigate(`/chat/${id}`);
  };

  const handleCreateNewAgentClick = () => {
    setIsCreatingAgent(true);
    setCreationChat([{
      role: 'assistant',
      content: "Hi! I can help you create a custom agent. Tell me what kind of agent you need, its tone, and its purpose."
    }]);
    setAgentCreated(null);
  };

  const synthesizeAgent = async (chatHistory) => {
    setIsSynthesizing(true);

    // We ask the AI to summarize the entire requirement into a single system prompt
    // AND to provide a short name for the agent.

    const extractionPrompt = `
      Based on the following conversation, extract two things:
      1. A highly effective SYSTEM PROMPT for the agent the user wants. Formulate it as instructions to the AI (e.g., "You are a...").
      2. A short, catchy NAME for the agent (max 3-4 words).
      
      Conversation:
      ${chatHistory.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}
      
      Output exactly in this JSON format (no markdown blocks, just raw JSON):
      {
        "name": "Short Name Here",
        "systemPrompt": "You are a..."
      }
    `;

    try {
      const response = await fetch(`${apiBaseUrl}/v1/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': 'test', 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: selectedModel,
          max_tokens: 1000,
          messages: [{ role: 'user', content: extractionPrompt }]
        })
      });

      const data = await response.json();
      const content = data.content[0].text.trim();
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (e) {
        // Fallback if model wraps in markdown
        const match = content.match(/\{[\s\S]*\}/);
        if (match) {
          parsed = JSON.parse(match[0]);
        } else {
          throw new Error("Failed to parse agent data");
        }
      }

      setAgentCreated({
        id: "custom-" + Date.now(),
        name: parsed.name,
        description: "Custom created agent",
        color: "bg-[#D97757]/20 text-[#D97757]",
        systemPrompt: parsed.systemPrompt,
        icon: <LuSparkles className="w-6 h-6" />
      });

    } catch (e) {
      console.error(e);
      setCreationChat(prev => [...prev, { role: 'assistant', content: "Sorry, I had trouble finalizing the agent. Could you provide a bit more detail?" }]);
    }
    setIsSynthesizing(false);
  };


  const handleCreationSend = async () => {
    if (!creationInput.trim()) return;
    const userMsg = creationInput.trim();
    setCreationInput("");

    const newChat = [...creationChat, { role: 'user', content: userMsg }];
    setCreationChat(newChat);
    setIsSynthesizing(true);

    try {
      // Create a temporary conversation context to figure out what the user wants
      let aiResponseText = "";
      const streamPromise = new Promise((resolve, reject) => {
        const controller = new AbortController();
        const apiCall = async () => {
          try {
            // Add a system prompt specifically for the agent creator persona
            const creatorSystem = "You are an expert AI agent architect. Your job is to talk to the user and figure out EXACTLY what kind of AI agent they want to create. Ask clarifying questions if needed. If they give enough detail (purpose, tone, behavior), say 'READY_TO_BUILD' at the very end of your response.";

            await sendMessage(
              newChat,
              selectedModel,
              (chunk) => {
                if (chunk.text !== undefined) {
                  aiResponseText = chunk.text;
                }
              },
              controller.signal,
              apiBaseUrl,
              creatorSystem
            );
            resolve();
          } catch (e) { reject(e); }
        };
        apiCall();
      });

      await streamPromise;

      if (aiResponseText.includes("READY_TO_BUILD")) {
        const cleanResponse = aiResponseText.replace("READY_TO_BUILD", "").trim();
        if (cleanResponse) {
          setCreationChat([...newChat, { role: 'assistant', content: cleanResponse }]);
        }
        await synthesizeAgent([...newChat, { role: 'assistant', content: aiResponseText }]);
      } else {
        setCreationChat([...newChat, { role: 'assistant', content: aiResponseText }]);
        setIsSynthesizing(false);
      }

    } catch (e) {
      console.error(e);
      setCreationChat([...newChat, { role: 'assistant', content: "Sorry, proxy error encountered." }]);
      setIsSynthesizing(false);
    }
  };

  const handleCreationKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreationSend();
    }
  };

  return (
    <div className="min-h-screen bg-[#21201C] text-text1 font-sans overflow-hidden relative">
      <SideBar isPinned={isPinned} setIsPinned={setIsPinned} />

      <div className={`transition-all duration-300 w-full md:w-auto ${isPinned ? "md:ml-72" : "md:ml-16"} h-screen overflow-y-auto`}>
        <div className="max-w-4xl mx-auto px-6 py-12 pb-32 pt-16 md:pt-12">
          {!isCreatingAgent ? (
            <>
              <header className="mb-12 flex justify-between items-end">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-[#D97757]/10 rounded-lg">
                      <LuUser className="w-6 h-6 text-[#D97757]" />
                    </div>
                    <h1 className="text-3xl font-serif-logo font-bold">Agents</h1>
                  </div>
                  <p className="text-text2 text-lg">Specialized AI assistants for specific tasks.</p>
                </div>

                <button
                  onClick={handleCreateNewAgentClick}
                  className="flex items-center gap-2 bg-[#D97757] text-white px-4 py-2 rounded-lg hover:bg-[#C56545] transition-colors shadow-lg"
                >
                  <LuPlus size={18} />
                  <span>Create Agent</span>
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AGENTS.map((agent) => (
                  <div
                    key={agent.id}
                    onClick={() => handleAgentClick(agent)}
                    className="group bg-[#2C2B28] border border-[#3A3933] hover:border-[#D97757]/50 rounded-2xl p-6 transition-all cursor-pointer hover:shadow-xl hover:shadow-[#000]/20 flex flex-col h-full"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${agent.color}`}>
                      {agent.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-[#D97757] transition-colors">{agent.name}</h3>
                    <p className="text-text2 text-sm flex-grow">{agent.description}</p>
                    <div className="mt-6 flex items-center text-[#D97757] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Use this agent <i className="nf nf-fa-arrow_right ml-2"></i>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col h-full max-w-2xl mx-auto">
              <button
                onClick={() => setIsCreatingAgent(false)}
                className="flex items-center gap-2 text-text2 hover:text-text1 mb-6 transition-colors self-start"
              >
                <LuArrowLeft size={16} /> Back to Agents
              </button>

              <h2 className="text-2xl font-serif-logo font-bold mb-6 flex items-center gap-3">
                <LuSparkles className="text-[#D97757]" /> Agent Creator
              </h2>

              {!agentCreated ? (
                <>
                  <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2">
                    {creationChat.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`rounded-2xl px-4 py-3 text-sm ${msg.role === 'user'
                          ? 'bg-[#3A3933] text-white rounded-br-sm max-w-[85%]'
                          : 'bg-[#2C2B28] border border-[#3A3933] text-text1 rounded-bl-sm max-w-full prose prose-invert max-w-none prose-pre:bg-[#1A1915] prose-pre:border prose-pre:border-[#2C2B28] prose-code:text-[#D97757] break-words leading-relaxed'
                          }`}>
                          {msg.role === 'user' ? (
                            msg.content
                          ) : (
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeHighlight]}
                              components={{
                                pre: CodeBlock,
                                p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          )}
                        </div>
                      </div>
                    ))}
                    {isSynthesizing && (
                      <div className="flex justify-start">
                        <div className="bg-[#2C2B28] border border-[#3A3933] rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                          <FreedomLogo className="w-4 h-4" isThinking={true} />
                          <span className="text-sm text-text2 animate-pulse">{agentCreated === null && creationChat.length > 2 ? "Finalizing agent..." : "Thinking..."}</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatBottomRef}></div>
                  </div>

                  <div className="relative bg-[#2F2F2D] border border-[#3A3933] rounded-[1.2rem] shadow-lg transition-colors hover:border-[#45443F] p-2 focus-within:border-[#D97757]/50 mt-auto">
                    <textarea
                      value={creationInput}
                      onChange={(e) => setCreationInput(e.target.value)}
                      onKeyDown={handleCreationKeyDown}
                      disabled={isSynthesizing}
                      placeholder="Describe your agent..."
                      className="w-full bg-transparent text-text1 placeholder-[#757575] text-[15px] resize-none outline-none py-2 px-3 min-h-[50px] max-h-[150px] disabled:opacity-50"
                    />
                    <div className="flex justify-between items-center px-2 pb-1 relative">
                      <div className="relative" ref={modelMenuRef}>
                        <button
                          onClick={() => setShowModels(!showModels)}
                          className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-[#A6A39A] hover:text-text1 hover:bg-[#3A3933] rounded-md transition-all"
                        >
                          <span>{currentModelName}</span>
                          <i className="nf nf-cod-chevron_down text-[10px] opacity-70"></i>
                        </button>

                        {showModels && (
                          <div className="absolute bottom-full mb-2 left-0 w-64 bg-[#2F2F2D] border border-[#3A3933] rounded-lg shadow-xl overflow-hidden py-1 z-30">
                            <div className="px-3 py-2 text-xs font-semibold text-[#757575] uppercase tracking-wider">Select Model</div>
                            {availableModels.length > 0 ? (
                              availableModels.map((model) => (
                                <button
                                  key={model.id}
                                  onClick={() => { setSelectedModel(model.id); setShowModels(false); }}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-[#3A3933] flex items-center justify-between ${selectedModel === model.id ? 'text-[#D97757] font-medium' : 'text-text1'}`}
                                >
                                  {model.name}
                                  {selectedModel === model.id && <i className="nf nf-fa-check text-xs"></i>}
                                </button>
                              ))
                            ) : (
                              <div className="px-3 py-2 text-xs text-[#757575] italic">No models available</div>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={handleCreationSend}
                        disabled={!creationInput.trim() || isSynthesizing}
                        className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${creationInput.trim() && !isSynthesizing
                          ? 'bg-[#D97757] text-white hover:bg-[#C56545]'
                          : 'bg-[#3A3933] text-[#6b6b6b]'
                          }`}
                      >
                        <LuUpload size={14} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 bg-[#D97757]/20 text-[#D97757] rounded-3xl flex items-center justify-center mb-6 border border-[#D97757]/30">
                    <LuSparkles size={36} />
                  </div>
                  <h3 className="text-3xl font-bold mb-2 text-white">{agentCreated.name}</h3>
                  <p className="text-text2 mb-8 max-w-sm">
                    {agentCreated.systemPrompt.slice(0, 80)}...
                  </p>

                  <div className="bg-[#2C2B28] border border-[#3A3933] rounded-xl p-4 w-full mb-8 text-left">
                    <div className="text-xs text-text2 uppercase font-medium tracking-wider mb-2">Generated System Prompt</div>
                    <p className="text-sm font-mono text-[#E5E5E2] whitespace-pre-wrap">{agentCreated.systemPrompt}</p>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setIsCreatingAgent(false)}
                      className="px-6 py-3 rounded-xl border border-[#3A3933] text-text1 hover:bg-[#3A3933] transition-colors font-medium"
                    >
                      Done
                    </button>
                    <button
                      onClick={() => handleAgentClick(agentCreated)}
                      className="px-6 py-3 rounded-xl bg-[#D97757] text-white hover:bg-[#C56545] shadow-lg transition-colors font-medium flex items-center gap-2"
                    >
                      <LuMessageSquare size={18} /> Chat with Agent
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Agents;
