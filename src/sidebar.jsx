import { Link, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useChat } from "./context/ChatContext.jsx";
import {
  LuPanelLeftClose,
  LuPanelLeftOpen,
  LuPlus,
  LuSearch,
  LuMessageSquare,
  LuBriefcase,
  LuPackage,
  LuCode,
  LuPenLine
} from "react-icons/lu";

function SideBar({ isPinned, setIsPinned }) {
  const location = useLocation();
  const { conversations, userName, setUserName } = useChat();
  const recentConversations = conversations.slice(0, 8);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const nameInputRef = useRef(null);

  const toggleSidebar = () => setIsPinned(!isPinned);
  const displayName = userName || "Set Name";
  const initials = userName
    ? userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : "?";

  const handleNameClick = (e) => {
    e.stopPropagation();
    setTempName(userName);
    setIsEditingName(true);
  };

  const handleNameSubmit = () => {
    if (tempName.trim()) {
      setUserName(tempName.trim());
    }
    setIsEditingName(false);
  };

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditingName]);

  const navItems = [
    { label: 'Chats', icon: LuMessageSquare, id: 'chats' },
    { label: 'Projects', icon: LuBriefcase, id: 'projects' },
    { label: 'Artifacts', icon: LuPackage, id: 'artifacts' },
    { label: 'Code', icon: LuCode, id: 'code' }
  ];

  return (
    <div
      className={`fixed z-30 top-0 left-0 h-screen bg-[#2C2B28] border-r border-[#3A3933] flex flex-col transition-all duration-300 ${isPinned ? "w-72" : "w-16"}`}
    >
      {/* Header Area */}
      <div className={`flex items-center h-14 shrink-0 ${isPinned ? "px-4 justify-between" : "justify-center"}`}>
        {isPinned && (
          <div className="text-text1 font-serif-logo text-xl font-bold tracking-tight truncate animate-in fade-in duration-300">
            Freedom AI
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className={`p-2 text-text2 hover:text-text1 rounded-md hover:bg-[#3A3933] transition-colors`}
          title={isPinned ? "Close Sidebar" : "Open Sidebar"}
        >
          {isPinned ? <LuPanelLeftClose size={20} /> : <LuPanelLeftOpen size={20} />}
        </button>
      </div>

      {/* Main Actions */}
      <div className={`px-3 mt-2 flex flex-col ${isPinned ? "" : "items-center"}`}>
        <Link
          to="/"
          className={`flex items-center ${isPinned ? "justify-between w-full" : "justify-center w-10"} bg-[#3A3933] hover:bg-[#45443F] text-text1 h-10 rounded-lg transition-all group mb-2`}
          title="New Chat"
        >
          <div className={`flex items-center gap-2 ${isPinned ? "px-2" : ""}`}>
            <div className={`w-5 h-5 rounded-full bg-white text-black flex items-center justify-center shadow-sm shrink-0`}>
              <LuPlus size={12} />
            </div>
            {isPinned && <span className="text-sm font-medium whitespace-nowrap overflow-hidden">New chat</span>}
          </div>
          {isPinned && <LuPenLine size={16} className="mr-2 text-text2 opacity-0 group-hover:opacity-100 transition-opacity" />}
        </Link>

        <div className={`relative w-full flex ${isPinned ? "" : "justify-center"}`}>
          <div className={`${isPinned ? "absolute left-3 top-1/2 -translate-y-1/2" : ""} text-text2 h-10 flex items-center justify-center ${!isPinned && "w-10 hover:bg-[#3A3933] rounded-lg cursor-pointer"}`}>
            <LuSearch size={18} />
          </div>
          {isPinned && (
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-transparent border border-transparent hover:border-[#3A3933] focus:bg-[#3A3933] focus:border-[#45443F] rounded-lg pl-9 pr-2 py-2 text-sm text-text1 outline-none transition-all placeholder-[#757575]"
            />
          )}
        </div>
      </div>

      {/* Nav Links */}
      <div className={`mt-4 px-3 flex flex-col space-y-1 ${!isPinned && "items-center"}`}>
        {navItems.map(item => (
          <a
            href="#"
            key={item.id}
            className={`flex items-center h-10 rounded-lg transition-all ${!isPinned ? "w-10 justify-center" : "px-2 gap-3"} ${item.id === 'chats' ? 'bg-[#21201C] text-text1 font-medium' : 'text-text2 hover:text-text1 hover:bg-[#3A3933]'}`}
            title={!isPinned ? item.label : ""}
          >
            <item.icon size={18} className="shrink-0" />
            {isPinned && <span className="text-sm truncate">{item.label}</span>}
          </a>
        ))}
      </div>

      {/* Recents */}
      {isPinned && (
        <div className="mt-6 flex-1 overflow-y-auto px-3 min-h-0 animate-in fade-in duration-500">
          <h3 className="px-2 text-xs font-semibold text-text2 mb-2 uppercase tracking-wider">Recents</h3>
          <div className="space-y-0.5">
            {recentConversations.map((conv) => (
              <Link
                key={conv.id}
                to={`/chat/${conv.id}`}
                className={`block px-2 py-2 text-sm truncate rounded-lg transition-colors ${location.pathname === `/chat/${conv.id}` ? 'bg-[#21201C] text-text1' : 'text-text2 hover:bg-[#3A3933] hover:text-text1'}`}
              >
                {conv.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Footer Profile */}
      <div className={`mt-auto border-t border-[#3A3933] p-3 flex ${isPinned ? "" : "justify-center"}`}>
        <div
          className={`flex items-center rounded-lg hover:bg-[#3A3933] cursor-pointer transition-colors ${isPinned ? "p-2 w-full gap-3" : "justify-center w-10 h-10"}`}
          onClick={handleNameClick}
          title={!isPinned ? displayName : ""}
        >
          <div className="w-8 h-8 rounded-full bg-[#D97757] text-[#1A1915] flex items-center justify-center text-xs font-bold shrink-0">
            {initials}
          </div>
          {isPinned && (
            <div className="flex-1 min-w-0">
              {isEditingName ? (
                <input
                  ref={nameInputRef}
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onBlur={handleNameSubmit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleNameSubmit();
                    if (e.key === 'Escape') setIsEditingName(false);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-[#1A1915] border border-[#3A3933] text-text1 text-sm rounded px-1 outline-none"
                />
              ) : (
                <>
                  <div className="text-sm font-medium text-text1 truncate">{displayName}</div>
                  <div className="text-xs text-text2">Freedom plan</div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SideBar;
