import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./button.jsx";
import Prompt from "./prompt.jsx";
import { useChat } from "./context/ChatContext.jsx";

function StartChat() {
  const [hideSuggestions, setHideSuggestions] = useState(false);
  const [text, setText] = useState("");
  const [showModels, setShowModels] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const { createConversation, sendChatMessage, selectedModel, setSelectedModel, availableModels } = useChat();
  const navigate = useNavigate();
  const modelMenuRef = useRef(null);
  const fileInputRef = useRef(null);

  const hasContent = text.trim().length > 0 || attachments.length > 0;

  useEffect(() => {
    setHideSuggestions(Boolean(text) || attachments.length > 0);
  }, [text, attachments]);

  const handleSend = async () => {
    if (!hasContent) return;
    const msgText = text.trim();
    const msgsToSend = [...attachments]; // Copy attachs

    const id = createConversation(msgText, msgsToSend);
    setText("");
    setAttachments([]);
    navigate(`/chat/${id}`);
    await new Promise(r => setTimeout(r, 100));
    sendChatMessage(id);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePromptClick = (value) => {
    const id = createConversation(value);
    navigate(`/chat/${id}`);
    sendChatMessage(id, value);
  };

  const handleFileSelect = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        const base64Data = event.target.result;
        const base64Content = base64Data.split(',')[1];

        const isImage = file.type.startsWith('image/');
        const type = isImage ? 'image' : 'document';

        const newAttachment = {
          type: type,
          source: {
            type: 'base64',
            media_type: file.type,
            data: base64Content
          },
          fileName: file.name,
          preview: isImage ? base64Data : null
        };

        setAttachments(prev => [...prev, newAttachment]);
      };

      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };


  // Close model menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(event.target)) {
        setShowModels(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentModelName = availableModels.find(m => m.id === selectedModel)?.name || selectedModel || "Select Model";

  return (
    <div className="w-full max-w-2xl mx-auto px-4 mt-8">

      {/* Input Box */}
      <div className="relative bg-[#2F2F2D] border border-[#3A3933] rounded-[1.2rem] shadow-lg transition-colors hover:border-[#45443F] mb-8">

        {/* Attachment Previews */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pt-3 pb-1">
            {attachments.map((att, idx) => (
              <div key={idx} className="relative group bg-[#3A3933] rounded-lg p-2 pr-8 flex items-center gap-2 max-w-[200px]">
                {att.type === 'image' ? (
                  <img src={att.preview} alt="preview" className="w-8 h-8 object-cover rounded" />
                ) : (
                  <div className="w-8 h-8 bg-[#45443F] rounded flex items-center justify-center text-[#A6A39A]">
                    <i className="nf nf-fa-file_text_o text-sm"></i>
                  </div>
                )}
                <div className="text-xs text-text1 truncate">{att.fileName}</div>
                <button
                  onClick={() => removeAttachment(idx)}
                  className="absolute top-1 right-1 p-1 text-[#A6A39A] hover:text-white rounded-full hover:bg-[#45443F]"
                >
                  <i className="nf nf-cod-close text-xs"></i>
                </button>
              </div>
            ))}
          </div>
        )}

        <textarea
          placeholder="How can Claude help you today?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full h-32 bg-transparent text-text1 placeholder-[#757575] text-lg resize-none outline-none p-4"
        ></textarea>

        <div className="flex justify-between items-center px-3 pb-3 relative">
          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-[#A6A39A] hover:text-text1 hover:bg-[#3A3933] rounded-lg transition-colors"
              title="Add Attachment"
            >
              <i className="nf nf-md-plus text-lg"></i>
            </button>

            <div className="relative" ref={modelMenuRef}>
              <button
                onClick={() => setShowModels(!showModels)}
                className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-[#A6A39A] hover:text-text1 hover:bg-[#3A3933] rounded-md transition-all"
              >
                <span>{currentModelName}</span>
                <i className="nf nf-cod-chevron_down text-[10px] opacity-70"></i>
              </button>

              {showModels && (
                <div className="absolute top-full mt-2 left-0 w-64 bg-[#2F2F2D] border border-[#3A3933] rounded-lg shadow-xl overflow-hidden py-1 z-30">
                  <div className="px-3 py-2 text-xs font-semibold text-[#757575] uppercase tracking-wider">Select Model</div>
                  {availableModels.length > 0 ? (
                    availableModels.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => { setSelectedModel(model.id); setShowModels(false); }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-[#3A3933] flex items-center justify-between ${selectedModel === model.id ? 'text-[#D97757] font-medium' : 'text-text1'}`}
                      >
                        {model.name}
                        {selectedModel === model.id && <i className="nf nf-fa-check text-xs"></i>}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-xs text-[#757575] italic">No models available</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleSend}
            disabled={!hasContent}
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${hasContent ? 'bg-[#D97757] text-white hover:bg-[#C56545]' : 'bg-[#3A3933] text-[#6b6b6b]'}`}
          >
            <i className="nf nf-fa-arrow_up text-sm"></i>
          </button>
        </div>
      </div>

      {/* Prompts / Recents */}
      {!hideSuggestions && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Prompt value="Extract insights from report" onClick={() => handlePromptClick("Extract insights from report")} />
            <Prompt value="Generate excel formulas" onClick={() => handlePromptClick("Generate excel formulas")} />
            <Prompt value="Generate interview questions" onClick={() => handlePromptClick("Generate interview questions")} />
            <Prompt value="Explain complex code" onClick={() => handlePromptClick("Explain complex code")} />
          </div>
        </div>
      )}
    </div>
  );
}
export default StartChat;
