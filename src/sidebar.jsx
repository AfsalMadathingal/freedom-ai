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
  LuPenLine,
  LuCircleHelp
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
    { label: 'Chats', icon: LuMessageSquare, id: 'chats', to: '/' },
    { label: 'Projects', icon: LuBriefcase, id: 'projects', to: '#' },
    { label: 'Artifacts', icon: LuPackage, id: 'artifacts', to: '#' },
    { label: 'Code', icon: LuCode, id: 'code', to: '#' }
  ];

  return (
    <div
      className={`fixed z-30 top-0 left-0 h-screen bg-[#2D2C28] border-r border-[#3A3933] flex flex-col transition-all duration-300 ease-in-out ${isPinned ? "w-72" : "w-16"}`}
    >
      {/* Header Area */}
      <div className={`flex items-center h-14 shrink-0 relative overflow-hidden ${isPinned ? "px-4 justify-between" : "justify-center"}`}>
        {isPinned && (
          <div className="text-text1 font-serif-logo text-xl font-bold tracking-tight truncate ml-1 animate-in fade-in duration-300">
            Freedom AI
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 text-text2 hover:text-text1 rounded-md hover:bg-[#3A3933] transition-colors shrink-0"
          title={isPinned ? "Close Sidebar" : "Open Sidebar"}
        >
          {isPinned ? <LuPanelLeftClose size={20} /> : <LuPanelLeftOpen size={20} />}
        </button>
      </div>

      {/* Main Actions */}
      <div className="px-3 mt-2 flex flex-col space-y-2">
        <Link
          to="/"
          className={`flex items-center h-10 rounded-lg transition-all group overflow-hidden relative ${isPinned ? "w-full bg-[#3A3933]" : "w-10 bg-transparent"}`}
          title="New Chat"
        >
          <div className="absolute left-0 w-10 h-10 flex items-center justify-center shrink-0">
            <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center shadow-sm">
              <LuPlus size={12} />
            </div>
          </div>
          {isPinned && <span className="ml-11 text-sm font-medium whitespace-nowrap animate-in fade-in duration-300">New chat</span>}
          {isPinned && <LuPenLine size={16} className="absolute right-3 text-text2 opacity-0 group-hover:opacity-100 transition-opacity" />}
        </Link>

        <div className={`relative flex items-center h-10 rounded-lg transition-all group overflow-hidden ${isPinned ? "w-full" : "w-10"}`}>
          <div className="absolute left-0 w-10 h-10 flex items-center justify-center text-text2 shrink-0 group-hover:text-text1 transition-colors cursor-pointer">
            <LuSearch size={18} />
          </div>
          {isPinned && (
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-[#3A3933] border border-transparent hover:border-[#45443F] focus:bg-[#3A3933] focus:border-[#45443F] rounded-lg pl-11 pr-2 py-2 text-sm text-text1 outline-none transition-all placeholder-[#757575]"
            />
          )}
        </div>
      </div>

      {/* Nav Links */}
      <div className="mt-4 px-3 flex flex-col space-y-1">
        {navItems.map(item => {
          const isActive = item.id === 'chats' && location.pathname === '/';
          return (
            <Link
              to={item.to}
              key={item.id}
              className={`flex items-center h-10 rounded-lg transition-all relative overflow-hidden ${isActive ? 'bg-[#1A1915] text-text1 font-medium' : 'text-text2 hover:text-text1 hover:bg-[#3A3933]'}`}
              title={!isPinned ? item.label : ""}
            >
              <div className="absolute left-0 w-10 h-10 flex items-center justify-center shrink-0">
                <item.icon size={18} />
              </div>
              {isPinned && <span className="ml-11 text-sm truncate animate-in fade-in slide-in-from-left-2 duration-300">{item.label}</span>}
            </Link>
          );
        })}
      </div>

      {/* Recents */}
      {isPinned && (
        <div className="mt-6 flex-1 overflow-y-auto px-3 min-h-0 animate-in fade-in duration-500">
          <h3 className="px-2 text-xs font-semibold text-text2 mb-2 uppercase tracking-wider">Recents</h3>
          <div className="space-y-0.5">
            {recentConversations.map((conv) => {
              const isCurrentChat = location.pathname === `/chat/${conv.id}`;
              return (
                <Link
                  key={conv.id}
                  to={`/chat/${conv.id}`}
                  className={`block px-3 py-2 text-sm truncate rounded-lg transition-colors ${isCurrentChat ? 'bg-[#1A1915] text-text1' : 'text-text2 hover:bg-[#3A3933] hover:text-text1'}`}
                >
                  {conv.title}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Profile */}
      <div className="mt-auto border-t border-[#3A3933] p-3 flex flex-col space-y-1">
        <Link
          to="/guide"
          className={`flex items-center h-10 rounded-lg text-text2 hover:text-text1 hover:bg-[#3A3933] transition-all relative overflow-hidden ${isPinned ? "w-full" : "w-10 justify-center mx-auto"}`}
          title="Setup Guide"
        >
          <div className="absolute left-0 w-10 h-10 flex items-center justify-center shrink-0">
            <LuCircleHelp size={18} />
          </div>
          {isPinned && <span className="ml-11 text-sm animate-in fade-in duration-300">Setup Guide</span>}
        </Link>

        <div
          className={`flex items-center h-10 rounded-lg hover:bg-[#3A3933] cursor-pointer transition-all relative overflow-hidden ${isPinned ? "w-full" : "w-10 justify-center mx-auto"}`}
          onClick={handleNameClick}
          title={!isPinned ? displayName : ""}
        >
          <div className="absolute left-0 w-10 h-10 flex items-center justify-center shrink-0">
            <div className="w-8 h-8 rounded-full bg-[#D97757] text-[#1A1915] flex items-center justify-center text-xs font-bold shadow-sm">
              {initials}
            </div>
          </div>
          {isPinned && (
            <div className="ml-11 flex-1 min-w-0 pr-2 animate-in fade-in duration-300">
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
                  className="w-full bg-[#1A1915] border border-[#3A3933] text-text1 text-xs rounded px-1 outline-none"
                />
              ) : (
                <>
                  <div className="text-sm font-medium text-text1 truncate">{displayName}</div>
                  <div className="text-[10px] text-text2 uppercase tracking-tighter">Freedom plan</div>
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
