import { useNavigate } from "react-router-dom";
import SideBar from "../components/layout/SideBar.jsx";
import { useChat } from "../context/ChatContext.jsx";
import { LuSparkles, LuMail, LuMessageSquare, LuLanguages, LuUser } from "react-icons/lu";

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
  const { createConversation, sendChatMessage } = useChat();

  const handleAgentClick = (agent) => {
    const id = createConversation('', [], agent.systemPrompt, agent.name);
    navigate(`/chat/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#21201C] text-text1 font-sans overflow-hidden relative">
      <SideBar isPinned={isPinned} setIsPinned={setIsPinned} />

      <div className={`transition-all duration-300 ${isPinned ? "ml-72" : "ml-16"} h-screen overflow-y-auto`}>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <header className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#D97757]/10 rounded-lg">
                <LuUser className="w-6 h-6 text-[#D97757]" />
              </div>
              <h1 className="text-3xl font-serif-logo font-bold">Agents</h1>
            </div>
            <p className="text-text2 text-lg">Specialized AI assistants for specific tasks.</p>
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
        </div>
      </div>
    </div>
  );
}

export default Agents;
