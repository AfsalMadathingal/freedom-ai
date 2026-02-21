import { useEffect } from "react";
import { useParams } from "react-router-dom";
import SideBar from "../components/layout/SideBar.jsx";
import TopBar from "../components/layout/TopBar.jsx";
import Chats from "../components/chat/Chats.jsx";
import Reply from "../components/chat/Reply.jsx";
import { useChat } from "../context/ChatContext.jsx";

function Chat({ isPinned, setIsPinned }) {
  const { id } = useParams();
  const { setActiveConversationId } = useChat();

  useEffect(() => {
    if (id) {
      setActiveConversationId(id);
    }
  }, [id, setActiveConversationId]);

  return (
    <div className="min-h-screen bg-[#21201C] text-text1 font-sans selection:bg-[#D97757] selection:text-white overflow-hidden">
      <SideBar isPinned={isPinned} setIsPinned={setIsPinned} />

      <div className={`transition-all duration-300 ${isPinned ? "ml-72" : "ml-16"} h-screen flex flex-col`}>
        <TopBar isPinned={isPinned} />

        <div className="flex-1 overflow-y-auto w-full relative scroll-smooth">
          <div className="w-full max-w-3xl mx-auto px-4 pt-20 pb-32">
            <Chats />
          </div>
        </div>

        <Reply isPinned={isPinned} />
      </div>
    </div>
  );
}
export default Chat;
