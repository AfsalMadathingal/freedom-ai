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

  return (
    <div
      className={`fixed z-30 top-0 left-0 h-screen bg-[#1A1915] border-r border-[#2C2B28] flex flex-col transition-all duration-300 ${isPinned ? "w-72" : "w-16"}`}
    >
      {/* --- COLLAPSED STATE --- */}
      {!isPinned && (
        <div className="flex flex-col items-center py-3 h-full w-full">
          {/* Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="p-2 mb-6 text-[#A6A39A] hover:text-text1 hover:bg-[#2C2B28] rounded-md transition-colors"
            title="Open Sidebar"
          >
            <LuPanelLeftOpen className="text-xl" />
          </button>

          {/* Actions */}
          <div className="flex flex-col gap-4 mb-6">
            <Link to="/" className="p-2 text-[#A6A39A] hover:text-text1 hover:bg-[#2C2B28] rounded-md transition-colors flex justify-center">
              <LuPlus className="text-xl" />
            </Link>
            <button className="p-2 text-[#A6A39A] hover:text-text1 hover:bg-[#2C2B28] rounded-md transition-colors">
              <LuSearch className="text-xl" />
            </button>
          </div>

          {/* Navigation Icons */}
          <div className="flex flex-col gap-4">
            <button className="p-2 bg-[#2C2B28]/50 text-text1 rounded-md transition-colors">
              <LuMessageSquare className="text-xl" />
            </button>
            <button className="p-2 text-[#A6A39A] hover:text-text1 hover:bg-[#2C2B28] rounded-md transition-colors">
              <LuBriefcase className="text-xl" />
            </button>
            <button className="p-2 text-[#A6A39A] hover:text-text1 hover:bg-[#2C2B28] rounded-md transition-colors">
              <LuPackage className="text-xl" />
            </button>
            <button className="p-2 text-[#A6A39A] hover:text-text1 hover:bg-[#2C2B28] rounded-md transition-colors">
              <LuCode className="text-xl" />
            </button>
          </div>

          <div className="mt-auto mb-4">
            <div
              onClick={handleNameClick}
              className="w-8 h-8 rounded-full bg-[#D97757] text-[#1A1915] flex items-center justify-center text-xs font-bold ring-2 ring-[#1A1915] cursor-pointer hover:opacity-90"
            >
              {initials}
            </div>
          </div>
        </div>
      )}

      {/* --- EXPANDED STATE --- */}
      {isPinned && (
        <div className="flex flex-col h-full w-full">
          {/* Header */}
          <div className="px-3 py-3 flex items-center justify-between mb-2">
            <button className="px-2 py-1 rounded-md hover:bg-[#2C2B28] text-text1 font-serif-logo text-xl tracking-tight flex items-center gap-2">
              <span className="font-bold">Freedom AI</span>
            </button>

            <button
              onClick={toggleSidebar}
              className="text-text2 hover:text-text1 p-2 rounded-md hover:bg-[#2C2B28]"
            >
              <LuPanelLeftClose className="text-xl" />
            </button>
          </div>

          {/* New Chat & Search */}
          <div className="px-3 mb-2">
            <Link to="/" className="flex items-center justify-between w-full bg-[#2C2B28] hover:bg-[#3A3933] text-text1 px-3 py-2 rounded-lg transition-colors group mb-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center shadow-sm">
                  <LuPlus className="text-xs" />
                </div>
                <span>New chat</span>
              </div>
              <LuPenLine className="text-text2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text2 group-focus-within:text-text1">
                <LuSearch className="text-sm" />
              </div>
              <input
                type="text"
                placeholder="Search"
                className="w-full bg-transparent border border-transparent hover:border-[#3A3933] focus:bg-[#2C2B28] focus:border-[#3A3933] rounded-lg pl-9 pr-2 py-1.5 text-sm text-text1 outline-none transition-all placeholder-[#757575]"
              />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="px-2 flex flex-col mb-4 space-y-0.5">
            {['Chats', 'Projects', 'Artifacts', 'Code'].map(item => {
              const iconMap = {
                'Chats': LuMessageSquare,
                'Projects': LuBriefcase,
                'Artifacts': LuPackage,
                'Code': LuCode
              };
              const Icon = iconMap[item];

              return (
                <a href="#" key={item} className={`px-3 py-2 text-sm rounded-md flex items-center gap-3 ${item === 'Chats' ? 'bg-[#2C2B28] text-text1 font-medium' : 'text-text2 hover:text-text1 hover:bg-[#2C2B28]'}`}>
                  <Icon className="text-lg w-5" />
                  {item}
                </a>
              );
            })}
          </div>

          {/* Recents List */}
          <div className="flex-1 overflow-y-auto px-2 min-h-0">
            <h3 className="px-3 text-xs font-semibold text-text2 mb-2 uppercase tracking-wider">Recents</h3>
            <div className="space-y-0.5">
              {recentConversations.map((conv) => (
                <Link
                  key={conv.id}
                  to={`/chat/${conv.id}`}
                  className={`block px-3 py-2 text-sm truncate rounded-md transition-colors ${location.pathname === `/chat/${conv.id}` ? 'bg-[#2C2B28] text-text1' : 'text-text2 hover:bg-[#2C2B28] hover:text-text1'}`}
                >
                  {conv.title}
                </Link>
              ))}
            </div>
          </div>

          {/* User Profile */}
          <div className="p-3 mt-auto border-t border-[#2C2B28]">
            <div
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#2C2B28] cursor-pointer transition-colors"
              onClick={handleNameClick}
            >
              <div className="w-8 h-8 rounded-full bg-[#D97757] text-[#1A1915] flex items-center justify-center text-xs font-bold shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                {isEditingName && isPinned ? (
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default SideBar;
