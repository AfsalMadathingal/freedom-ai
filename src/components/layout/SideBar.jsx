import { Link, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useChat } from "../../context/ChatContext.jsx";
import {
  LuPanelLeftClose,
  LuPanelLeftOpen,
  LuPlus,
  LuSearch,
  LuMessageSquare,
  LuPenLine,
  LuCircleHelp,
  LuUser,
  LuSettings,
  LuGlobe,
  LuArrowUpRight,
  LuGift,
  LuDownload,
  LuLogOut
} from "react-icons/lu";

function SideBar({ isPinned, setIsPinned }) {
  const location = useLocation();
  const { conversations, userName, setUserName, proxyPort, setProxyPort } = useChat();
  const [searchQuery, setSearchQuery] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [tempName, setTempName] = useState("");
  const [tempPort, setTempPort] = useState("");

  const toggleSidebar = () => setIsPinned(!isPinned);
  const displayName = userName || "Set Name";
  const initials = userName
    ? userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : "?";

  // Removed inline edit logic

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 15);

  return (
    <>
      {/* Mobile Backdrop */}
      {isPinned && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden animate-in fade-in"
          onClick={() => setIsPinned(false)}
        />
      )}

      {/* Floating Mobile Toggle (when sidebar is hidden) */}
      {!isPinned && (
        <button
          onClick={toggleSidebar}
          className="md:hidden fixed top-3 left-3 z-20 p-2 bg-[#2D2C28] border border-[#3A3933] text-text2 hover:text-text1 rounded-lg shadow-lg"
        >
          <LuPanelLeftOpen size={20} />
        </button>
      )}

      <div
        className={`fixed z-30 top-0 left-0 h-screen bg-[#2D2C28] border-r border-[#3A3933] flex flex-col transition-all duration-300 ease-in-out
          ${isPinned ? "w-72 translate-x-0" : "-translate-x-full md:translate-x-0 w-16"}
        `}
      >
        {/* Header Area */}
        <div className={`flex items-center h-14 shrink-0 px-3 relative`}>
          {isPinned ? (
            <div className="flex items-center justify-between w-full">
              <div className="text-text1 font-serif-logo text-xl font-bold tracking-tight truncate ml-1 animate-in fade-in duration-300">
                Freedom AI
              </div>
              <button
                onClick={toggleSidebar}
                className="p-2 text-text2 hover:text-text1 rounded-md hover:bg-[#3A3933] transition-colors"
                title="Close Sidebar"
              >
                <LuPanelLeftClose size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full max-md:hidden">
              <button
                onClick={toggleSidebar}
                className="p-2 text-text2 hover:text-text1 rounded-md hover:bg-[#3A3933] transition-colors"
                title="Open Sidebar"
              >
                <LuPanelLeftOpen size={20} />
              </button>
            </div>
          )}
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
                placeholder="Search chats"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#3A3933] border border-transparent hover:border-[#45443F] focus:bg-[#3A3933] focus:border-[#45443F] rounded-lg pl-11 pr-2 py-2 text-sm text-text1 outline-none transition-all placeholder-[#757575]"
              />
            )}
          </div>
        </div>

        {/* Nav Links - Just Chats */}
        <div className="mt-4 px-3 flex flex-col space-y-1">
          <Link
            to="/"
            className={`flex items-center h-10 rounded-lg transition-all relative overflow-hidden ${location.pathname === '/' ? 'bg-[#1A1915] text-text1 font-medium shadow-inner' : 'text-text2 hover:text-text1 hover:bg-[#3A3933]'}`}
            title={!isPinned ? "Chats" : ""}
          >
            <div className="absolute left-0 w-10 h-10 flex items-center justify-center shrink-0">
              <LuMessageSquare size={18} />
            </div>
            {isPinned && <span className="ml-11 text-sm truncate animate-in fade-in duration-300">Chats</span>}
          </Link>

          <Link
            to="/agents"
            className={`flex items-center h-10 rounded-lg transition-all relative overflow-hidden ${location.pathname === '/agents' ? 'bg-[#1A1915] text-text1 font-medium shadow-inner' : 'text-text2 hover:text-text1 hover:bg-[#3A3933]'}`}
            title={!isPinned ? "Agents" : ""}
          >
            <div className="absolute left-0 w-10 h-10 flex items-center justify-center shrink-0">
              <LuUser size={18} />
            </div>
            {isPinned && <span className="ml-11 text-sm truncate animate-in fade-in duration-300">Agents</span>}
          </Link>
        </div>

        {/* Recents */}
        {isPinned && (
          <div className="mt-6 flex-1 overflow-y-auto px-3 min-h-0 animate-in fade-in duration-500 border-t border-[#3A3933] pt-4">
            <h3 className="px-2 text-xs font-semibold text-text2 mb-2 uppercase tracking-wider flex items-center justify-between">
              <span>Recents</span>
              {searchQuery && <span className="text-[10px] lowercase font-normal bg-[#3A3933] px-1.5 py-0.5 rounded text-text2">Filtering</span>}
            </h3>
            <div className="space-y-0.5">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conv) => {
                  const isCurrentChat = location.pathname === `/chat/${conv.id}`;
                  return (
                    <Link
                      key={conv.id}
                      to={`/chat/${conv.id}`}
                      className={`block px-3 py-2 text-sm truncate rounded-lg transition-colors ${isCurrentChat ? 'bg-[#1A1915] text-text1 shadow-inner' : 'text-text2 hover:bg-[#3A3933] hover:text-text1'}`}
                    >
                      {conv.title}
                    </Link>
                  );
                })
              ) : (
                <div className="px-3 py-4 text-xs text-text2 italic text-center">
                  No chats found
                </div>
              )}
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

          <div className="relative">
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className={`absolute bottom-full ${isPinned ? "left-0" : "-right-12"} mb-2 w-[260px] bg-[#2C2B28] border border-[#3A3933] rounded-xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200`}>
                  <div className="px-4 py-2 text-sm text-text2 truncate border-b border-[#3A3933] mb-1">
                    {userName ? `${userName.toLowerCase().replace(/\\s+/g, '')}@freedom.ai` : 'user@freedom.ai'}
                  </div>
                  <button onClick={() => {
                    setTempName(userName);
                    setTempPort(proxyPort);
                    setShowSettingsModal(true);
                    setShowMenu(false);
                  }} className="w-full flex items-center px-4 py-2 hover:bg-[#3A3933] text-sm text-text1 transition-colors">
                    <LuSettings className="mr-3 text-text2" size={16} />Settings
                  </button>
                  <button onClick={() => setShowMenu(false)} className="w-full flex items-center px-4 py-2 hover:bg-[#3A3933] text-sm text-text1 transition-colors">
                    <LuGlobe className="mr-3 text-text2" size={16} />Language
                  </button>
                  <button onClick={() => setShowMenu(false)} className="w-full flex items-center px-4 py-2 hover:bg-[#3A3933] text-sm text-text1 transition-colors">
                    <LuCircleHelp className="mr-3 text-text2" size={16} />Get help
                  </button>
                  <div className="h-px bg-[#3A3933] my-1"></div>
                  <button onClick={() => setShowMenu(false)} className="w-full flex items-center px-4 py-2 hover:bg-[#3A3933] text-sm text-text1 transition-colors">
                    <LuArrowUpRight className="mr-3 text-text2" size={16} />Upgrade plan
                  </button>
                  <button onClick={() => setShowMenu(false)} className="w-full flex items-center px-4 py-2 hover:bg-[#3A3933] text-sm text-text1 transition-colors">
                    <LuGift className="mr-3 text-text2" size={16} />Gift Freedom AI
                  </button>
                  <button onClick={() => setShowMenu(false)} className="w-full flex items-center px-4 py-2 hover:bg-[#3A3933] text-sm text-text1 transition-colors">
                    <LuDownload className="mr-3 text-text2" size={16} />Download for Windows
                  </button>
                  <div className="h-px bg-[#3A3933] my-1"></div>
                  <button onClick={() => {
                    setShowMenu(false);
                    setUserName('');
                  }} className="w-full flex items-center px-4 py-2 hover:bg-[#3A3933] text-sm text-text1 transition-colors hover:text-red-400 group">
                    <LuLogOut className="mr-3 text-text2 group-hover:text-red-400" size={16} />Log out
                  </button>
                </div>
              </>
            )}

            <div
              className={`flex items-center h-10 rounded-lg hover:bg-[#45443F] cursor-pointer transition-all relative overflow-hidden ${isPinned ? "w-full" : "w-10 justify-center mx-auto"}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!isPinned) {
                  setIsPinned(true);
                  setShowMenu(true);
                } else {
                  setShowMenu(!showMenu);
                }
              }}
              title={!isPinned ? displayName : ""}
            >
              <div className="absolute left-0 w-10 h-10 flex items-center justify-center shrink-0">
                <div className="w-8 h-8 rounded-full bg-[#D97757] text-[#1A1915] flex items-center justify-center text-xs font-bold shadow-sm">
                  {initials}
                </div>
              </div>
              {isPinned && (
                <div className="ml-11 flex-1 min-w-0 pr-2 animate-in fade-in duration-300">
                  <div className="text-sm font-medium text-text1 truncate">{displayName}</div>
                  <div className="text-[10px] text-text2 uppercase tracking-tighter">Freedom plan</div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Settings Modal */}
        {showSettingsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-[#2C2B28] p-8 rounded-2xl shadow-2xl border border-[#3A3933] w-full max-w-md animate-in fade-in zoom-in duration-300 mx-4">
              <h2 className="text-xl font-serif-logo font-bold text-text1 mb-2">Freedom AI Settings</h2>
              <p className="text-text2 mb-6">Update your profile and proxy connection.</p>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (tempName.trim()) {
                  setUserName(tempName.trim());
                  setProxyPort(tempPort.trim() || "8080");
                  setShowSettingsModal(false);
                }
              }} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-text2 mb-1 uppercase tracking-wider">Your Name</label>
                  <input
                    autoFocus
                    type="text"
                    placeholder="Enter your name"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full bg-[#1A1915] border border-[#3A3933] text-text1 p-3 rounded-lg outline-none focus:border-[#D97757]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text2 mb-1 uppercase tracking-wider">Proxy Port</label>
                  <input
                    type="text"
                    placeholder="8080"
                    value={tempPort}
                    onChange={(e) => setTempPort(e.target.value)}
                    className="w-full bg-[#1A1915] border border-[#3A3933] text-text1 p-3 rounded-lg outline-none focus:border-[#D97757]"
                  />
                  <p className="text-[10px] text-text2 mt-1 italic">Default is 8080. Ensure antigravity-proxy is running.</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSettingsModal(false)}
                    className="flex-1 bg-transparent border border-[#3A3933] text-text1 font-medium py-3 rounded-lg hover:bg-[#3A3933] transition-colors mt-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!tempName.trim()}
                    className="flex-1 bg-[#D97757] text-white font-medium py-3 rounded-lg disabled:opacity-50 hover:bg-[#C56545] transition-colors mt-2"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default SideBar;
