import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/atom-one-dark.css";
import FreedomLogo from "../common/FreedomLogo.jsx";

const LOADING_PHRASES = [
  "Conceptualizing...",
  "Thinking...",
  "Analyzing...",
  "Imagining...",
  "Processing...",
  "Synthesizing...",
  "Connecting dots...",
  "Reviewing..."
];

// Custom Code Block Component with Copy
const CodeBlock = ({ children, className, node, ...props }) => {
  // Try to find the language from the child <code> element
  const childProps = children?.props || {};
  const childClassName = childProps.className || "";
  const match = /language-(\w+)/.exec(childClassName);

  // Extract text content for copy
  const codeContent = String(childProps.children || children).replace(/\n$/, '');

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // If it's a code block (has language class or is likely a block), render frame
  // Note: react-markdown renders <pre><code>...</code></pre>. We are replacing <pre>.
  if (match) {
    return (
      <div className="relative my-4 rounded-lg border border-[#3A3933] bg-[#272622] overflow-hidden group">
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#2C2B28] border-b border-[#3A3933] select-none">
          <span className="text-xs text-[#A6A39A] font-medium lowercase font-sans">
            {match[1]}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-[#A6A39A] hover:text-text1 transition-colors px-1.5 py-0.5 rounded hover:bg-[#3A3933]"
          >
            {copied ? (
              <>
                <i className="nf nf-fa-check text-[#D97757]"></i>
                <span>Copied</span>
              </>
            ) : (
              <>
                <i className="nf nf-fa-clipboard"></i>
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          {/* Re-render the original code element (children) inside */}
          {/* We add !bg-transparent to override prose pre styles if they leak */}
          <pre className="!my-0 !p-4 !bg-transparent !border-0 font-mono text-sm font-medium leading-relaxed" {...props}>
            {children}
          </pre>
        </div>
      </div>
    );
  }

  // Fallback for non-highlighted blocks (terminal output, etc)
  return (
    <div className="relative my-4 rounded-lg border border-[#3A3933] bg-[#272622] overflow-hidden">
      {/* Optional header for generic code blocks? Maybe just pure content */}
      <div className="overflow-x-auto custom-scrollbar p-0">
        <pre className="!my-0 !p-4 !bg-transparent !border-0 font-mono text-sm" {...props}>
          {children}
        </pre>
      </div>
    </div>
  );
};

function Answer({ value, thinking, error, isStreaming, isError, onRetry, onCopy, showThinkingUI = true }) {
  const [copied, setCopied] = useState(false);
  const [loadingPhrase, setLoadingPhrase] = useState(LOADING_PHRASES[0]);
  const [isThinkingOpen, setIsThinkingOpen] = useState(false);

  useEffect(() => {
    if (isStreaming && !value && !error) {
      const interval = setInterval(() => {
        setLoadingPhrase(prev => {
          const idx = LOADING_PHRASES.indexOf(prev);
          return LOADING_PHRASES[(idx + 1) % LOADING_PHRASES.length];
        });
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isStreaming, value, error]);

  let displayError = error;
  if (isError && !displayError) {
    try {
      if (value.trim().startsWith('{') && value.includes('"error"')) {
        const parsed = JSON.parse(value);
        displayError = parsed.error?.message || value;
      } else if (value.includes('RESOURCE_EXHAUSTED')) {
        displayError = value.replace(/.*message":\s*"(.*)".*/s, "$1");
      } else {
        displayError = value;
      }
    } catch (e) { displayError = value; }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(value || "").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    onCopy?.();
  };

  return (
    <div className={`relative px-0 py-2 text-text1 w-full max-w-3xl Md:max-w-[23rem]`}>

      {/* Thinking Block */}
      {showThinkingUI && thinking && (
        <div className="mb-4">
          <div
            onClick={() => setIsThinkingOpen(!isThinkingOpen)}
            className="flex items-center gap-2 text-xs text-[#A6A39A] cursor-pointer hover:text-text1 transition-colors select-none"
          >
            <i className={`nf nf-cod-chevron_right transition-transform ${isThinkingOpen ? 'rotate-90' : ''}`}></i>
            <span className={`font-medium ${isStreaming ? 'animate-pulse' : ''} transition-all`}>
              Thinking Process
            </span>
          </div>

          {isThinkingOpen && (
            <div className="mt-2 text-sm text-[#A6A39A] bg-[#2C2B28] rounded-md p-3 border-l-2 border-[#3A3933] overflow-x-auto font-mono whitespace-pre-wrap leading-relaxed opacity-90 animate-in fade-in slide-in-from-top-1">
              {thinking}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      {!isError && value && (
        <div className="prose prose-invert max-w-none prose-pre:bg-[#1A1915] prose-pre:border prose-pre:border-[#2C2B28] prose-code:text-[#D97757] break-words text-[15px] leading-relaxed relative">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              pre: CodeBlock,
              p: ({ children }) => <p className="mb-4 last:mb-0 inline">{children}</p>
            }}
          >
            {value}
          </ReactMarkdown>
        </div>
      )}

      {/* Error Block */}
      {displayError && (
        <div className="border border-red-500/40 bg-red-500/10 rounded-xl p-4 my-2 text-red-200 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start gap-3">
            <i className="nf nf-fa-exclamation_circle text-red-400 mt-0.5"></i>
            <div className="flex-1">
              <p className="font-medium text-sm text-red-300 mb-1">Error</p>
              <p className="text-sm leading-relaxed opacity-90">{displayError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isStreaming && !value && !thinking && !error && (
        <div className="flex items-center gap-2 text-[#A6A39A] text-sm mt-1">
          <FreedomLogo className="w-5 h-5 animate-spin-slow" />
          <span className="animate-pulse">{loadingPhrase}</span>
        </div>
      )}

      {isStreaming && (value || thinking) && !error && (
        <div className="mt-2 text-[#D97757] flex items-center gap-1.5">
          <FreedomLogo className="w-4 h-4 animate-pulse" />
        </div>
      )}

      {!isStreaming && !displayError && value && (
        <div className="flex items-center gap-2 mt-3 select-none">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-1 text-xs text-text2 hover:text-text1 hover:bg-[#2C2B28] rounded-md transition-colors"
          >
            <i className={`nf ${copied ? "nf-fa-check" : "nf-fa-clipboard"} text-[10px]`}></i>
            {copied ? "Copied" : "Copy"}
          </button>

          <button className="p-1.5 text-text2 hover:text-text1 hover:bg-[#2C2B28] rounded-md transition-colors">
            <i className="nf nf-fa-thumbs_o_up text-[10px]"></i>
          </button>
        </div>
      )}
    </div>
  );
}
export default Answer;
