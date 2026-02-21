import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useChat } from "../../context/ChatContext.jsx";
import Question from "./Question.jsx";
import Answer from "./Answer.jsx";

function Chats() {
  const { id } = useParams();
  const { activeConversation, streamingText, streamingThinking, isStreaming, error, retryLastMessage, selectedModel, isUserTyping } = useChat();
  const bottomRef = useRef(null);
  const containerRef = useRef(null);

  const showThinkingUI = selectedModel?.toLowerCase().includes('thinking');

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeConversation?.messages?.length, streamingText, streamingThinking, error]);

  if (!activeConversation) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-text2 space-y-3">
        <div className="claude-spinner">
          <i className="nf nf-fa-sun_o"></i>
        </div>
      </div>
    );
  }

  const messages = activeConversation.messages || [];

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[50vh] transition-opacity duration-300 ${isUserTyping ? 'opacity-0' : 'opacity-100'}`}>
        <div className="w-16 h-16 bg-[#D97757]/10 rounded-2xl flex items-center justify-center mb-6">
          <i className="nf nf-md-robot text-[#D97757] text-3xl"></i>
        </div>
        <h2 className="text-2xl font-serif-logo font-medium text-text1 mb-2">
          {activeConversation.agentName ? `${activeConversation.agentName} Agent` : 'Freedom AI'}
        </h2>
        <p className="text-text2 text-center max-w-sm">
          Enter the matter you want to do with this agent below to get started.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col items-center space-y-6 w-full pb-32">
      {messages.map((msg, index) => {
        const isLastAssistant = msg.role === "assistant" && index === messages.length - 1;

        if (msg.role === "user") {
          return <Question key={`${id}-${index}`} value={msg.content} />;
        }

        if (msg.role === "assistant") {
          return (
            <Answer
              key={`${id}-${index}`}
              value={msg.content}
              thinking={msg.thinking}
              isError={msg.isError}
              onRetry={isLastAssistant ? () => retryLastMessage(id) : undefined}
              showThinkingUI={showThinkingUI}
            />
          );
        }
        return null;
      })}

      {isStreaming && (
        <Answer
          value={streamingText}
          thinking={streamingThinking}
          error={error}
          isStreaming={true}
          isError={!!error}
          showThinkingUI={showThinkingUI}
        />
      )}

      <div ref={bottomRef} />
    </div>
  );
}
export default Chats;
