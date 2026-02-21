import { useState } from "react";
import Button from "../components/common/Button.jsx";
import ChatCard from "../components/chat/ChatCard.jsx";
import { useChat } from "../context/ChatContext.jsx";

function getElapsedTime(timestamp) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function RecentChats() {
  const [collapseChats, setCollapseChats] = useState(false);
  const { conversations } = useChat();

  // Show up to 6 recent conversations
  const recentConversations = conversations.slice(0, 6);

  if (recentConversations.length === 0) {
    return null;
  }

  return (
    <div className="flex md:w-screen md:max-w-2xl px-5 flex-col">
      <div className="flex justify-between">
        <div className="flex">
          <p className="text-sm font-bold text-text1">
            <i className="nf nf-md-chat_outline text-btext"></i> &nbsp; Your
            recent chats &nbsp;
          </p>
          <Button
            value={
              <>
                <i
                  className={`nf nf-fa-chevron_up ${collapseChats ? "rotate-180 -top-0.5" : ""} relative inline-block text-xs transition-all duration-300`}
                ></i>
                <span className="text-sm text-text2">
                  {collapseChats && "\u00A0 Show"}
                </span>
              </>
            }
            extraClass="relative  -top-1"
            onClick_function={() => {
              setCollapseChats(!collapseChats);
            }}
          />
        </div>
        <span className="cursor-pointer text-sm text-text2 transition-all hover:text-text1 hover:underline hover:transition-all">
          View all <i className="nf nf-cod-arrow_right"></i>
        </span>
      </div>
      <div
        className={`${collapseChats ? "max-h-0" : "max-h-96 "} transition-all duration-300 grid md:grid-cols-3 gap-3`}
      >
        {recentConversations.map((conv, index) => (
          <ChatCard
            key={conv.id}
            value={conv.title}
            elapsed_time={getElapsedTime(conv.updatedAt || conv.createdAt)}
            isCollapsed={collapseChats}
            delay={index * 50}
            to={`/chat/${conv.id}`}
          />
        ))}
      </div>
    </div>
  );
}
export default RecentChats;
