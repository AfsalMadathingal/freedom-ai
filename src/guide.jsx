import SideBar from "./sidebar.jsx";
import FreedomLogo from "./components/FreedomLogo.jsx";

function Guide({ isPinned, setIsPinned }) {
  return (
    <div className="min-h-screen bg-[#21201C] text-text1 font-sans selection:bg-[#D97757] selection:text-white overflow-hidden relative">
      <SideBar isPinned={isPinned} setIsPinned={setIsPinned} />

      <div className={`transition-all duration-300 ${isPinned ? "ml-72" : "ml-16"} h-screen overflow-y-auto`}>
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-[#D97757] rounded-xl flex items-center justify-center shadow-lg">
              <FreedomLogo className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-serif-logo font-bold">Setup Guide</h1>
          </div>

          <section className="space-y-8 prose prose-invert max-w-none">
            <div>
              <h2 className="text-xl font-semibold text-[#D97757] mb-3">1. Prerequisites</h2>
              <p className="text-text2">
                This application requires a local proxy server to communicate with AI models.
                You must have Node.js installed on your machine.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-[#D97757] mb-3">2. Start the Proxy Server</h2>
              <p className="text-text2 mb-4">
                Clone and run the <strong>antigravity-claude-proxy</strong>:
              </p>
              <div className="bg-[#1A1915] p-4 rounded-lg border border-[#3A3933] font-mono text-sm space-y-2">
                <p className="text-text2"># Clone the repo</p>
                <p>git clone https://github.com/badrisnarayanan/antigravity-claude-proxy</p>
                <p className="text-text2"># Navigate and install</p>
                <p>cd antigravity-claude-proxy && npm install</p>
                <p className="text-text2"># Start the server</p>
                <p>node server.js</p>
              </div>
              <p className="text-xs text-text2 mt-2 italic">
                By default, the server runs on port <strong>8080</strong>.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-[#D97757] mb-3">3. Configure Freedom AI</h2>
              <p className="text-text2">
                When you first open Freedom AI, you will be asked for your name and the port where your proxy is running.
                If you haven't changed the proxy settings, use <strong>8080</strong>.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-[#D97757] mb-3">4. Verify Connection</h2>
              <p className="text-text2">
                Once configured, the app will try to fetch available models from your proxy.
                If the proxy is not running or the port is incorrect, you will see a connection error.
              </p>
            </div>

            <div className="pt-8 border-t border-[#3A3933]">
              <p className="text-sm text-text2 text-center">
                Visual clone of claude.ai. Powered by Antigravity models.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Guide;
