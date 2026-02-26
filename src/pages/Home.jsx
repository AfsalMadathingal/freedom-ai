import { useEffect, useState } from "react";
import StartChat from "../components/chat/StartChat.jsx";
import SideBar from "../components/layout/SideBar.jsx"; // Moved file failed so it's in src
import { useChat } from "../context/ChatContext.jsx";
import FreedomLogo from "../components/common/FreedomLogo.jsx";

// Import new CSS
import "../index.css";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function Home({ isPinned, setIsPinned }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { userName, setUserName, proxyPort, setProxyPort } = useChat();
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [tempName, setTempName] = useState("");
  const [tempPort, setTempPort] = useState("8080");

  useEffect(() => {
    setIsLoaded(true);
    if (!userName) {
      setShowNamePrompt(true);
      setTempName(userName);
      setTempPort(proxyPort || "8080");
    }
  }, [userName, proxyPort]);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (tempName.trim()) {
      setUserName(tempName.trim());
      setProxyPort(tempPort.trim() || "8080");
      setShowNamePrompt(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#21201C] text-text1 font-sans selection:bg-[#D97757] selection:text-white overflow-hidden relative">
      <SideBar isPinned={isPinned} setIsPinned={setIsPinned} />

      <div className={`transition-all duration-300 w-full md:w-auto ${isPinned ? "md:ml-72" : "md:ml-16"} h-screen overflow-y-auto`}>
        <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-4xl mx-auto px-6 py-12">

          <div className={`transition-all duration-700 ease-out transform ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="w-16 h-16 bg-[#D97757] rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6">
              <FreedomLogo className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif-logo font-medium text-center text-text1 mb-8">
              {getGreeting()}{userName ? `, ${userName.split(' ')[0]}` : ''}
            </h1>
          </div>

          <StartChat />
        </div>
      </div>

      {/* Name & Port Prompt Modal */}
      {showNamePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[#2C2B28] p-8 rounded-2xl shadow-2xl border border-[#3A3933] w-full max-w-md animate-in fade-in zoom-in duration-300">
            <h2 className="text-xl font-serif-logo font-bold text-text1 mb-2">Welcome to Freedom AI</h2>
            <p className="text-text2 mb-6">Setup your profile and proxy to get started.</p>
            <form onSubmit={handleNameSubmit} className="space-y-4">
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

              <button
                type="submit"
                disabled={!tempName.trim()}
                className="w-full bg-[#D97757] text-white font-medium py-3 rounded-lg disabled:opacity-50 hover:bg-[#C56545] transition-colors mt-2"
              >
                Continue
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default Home;
