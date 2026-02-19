import { useState, useEffect } from "react";
import Chat from "./chat.jsx";
import Home from "./home.jsx";
import Guide from "./guide.jsx";
import { RouterProvider, createHashRouter, Link } from "react-router-dom";
import { ChatProvider, useChat } from "./context/ChatContext.jsx";

function ProxyErrorModal() {
  const { isProxyAvailable, isCheckingProxy, fetchModels, proxyPort, userName } = useChat();
  const [isGuidePage, setIsGuidePage] = useState(window.location.hash.includes("/guide"));

  // Update state when hash changes
  useEffect(() => {
    const handleHashChange = () => {
      setIsGuidePage(window.location.hash.includes("/guide"));
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (!userName || isCheckingProxy || isProxyAvailable || isGuidePage) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#2C2B28] p-8 rounded-2xl shadow-2xl border border-red-500/30 w-full max-w-md text-center animate-in zoom-in duration-300">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="nf nf-fa-server text-red-500 text-2xl"></i>
        </div>
        <h2 className="text-xl font-serif-logo font-bold text-text1 mb-2">Proxy Not Found</h2>
        <p className="text-text2 mb-6">
          Could not connect to the proxy server on port <span className="text-text1 font-mono">{proxyPort}</span>.
          Make sure the <span className="text-[#D97757]">antigravity-proxy</span> is running.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => fetchModels()}
            className="w-full bg-[#D97757] text-white font-medium py-3 rounded-lg hover:bg-[#C56545] transition-colors flex items-center justify-center gap-2"
          >
            <i className="nf nf-md-refresh"></i> Retry Connection
          </button>

          <Link
            to="/guide"
            className="block w-full py-3 text-sm text-text2 hover:text-text1 transition-colors"
          >
            How to setup the proxy?
          </Link>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const [isPinned, setIsPinned] = useState(false);

  const router = createHashRouter([
    {
      path: "/",
      element: <Home isPinned={isPinned} setIsPinned={setIsPinned} />,
    },
    {
      path: "/chat/:id",
      element: <Chat isPinned={isPinned} setIsPinned={setIsPinned} />,
    },
    {
      path: "/guide",
      element: <Guide isPinned={isPinned} setIsPinned={setIsPinned} />,
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
      <ProxyErrorModal />
    </>
  );
}

function App() {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  );
}

export default App;
