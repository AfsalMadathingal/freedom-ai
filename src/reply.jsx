import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useChat } from "./context/ChatContext.jsx";

function Reply({ isPinned }) {
  const [text, setText] = useState("");
  const [showModels, setShowModels] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const { id } = useParams();
  const { addUserMessage, sendChatMessage, isStreaming, stopStreaming, selectedModel, setSelectedModel, availableModels } = useChat();
  const textareaRef = useRef(null);
  const modelMenuRef = useRef(null);
  const fileInputRef = useRef(null);

  const hasContent = text.trim().length > 0 || attachments.length > 0;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [text]);

  const handleSend = async () => {
    if (!hasContent || isStreaming) return;
    const msgText = text.trim();
    const msgsToSend = [...attachments];

    setText("");
    setAttachments([]);

    addUserMessage(id, msgText, msgsToSend);
    await new Promise((r) => setTimeout(r, 50));
    sendChatMessage(id);
    setTimeout(() => textareaRef.current?.focus(), 10);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
    <div className={`fixed bottom-0 right-0 z-20 flex flex-col items-center bg-transparent pointer-events-none transition-all duration-300 ${isPinned ? "left-72" : "left-16"}`}>

      {/* Gradient Fade Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#21201C] via-[#21201C] to-transparent pointer-events-none -z-10"></div>

      <div className="w-full max-w-[48rem] pointer-events-auto px-4 mb-6 relative z-10">
        <div className="relative flex flex-col w-full bg-[#2F2F2D] border border-[#3A3933] rounded-[1.2rem] shadow-xl transition-colors hover:border-[#45443F]">

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
            ref={textareaRef}
            placeholder="Reply to Freedom AI..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            autoFocus
            className="w-full bg-transparent text-text1 placeholder-[#757575] text-[15px] resize-none outline-none overflow-hidden py-3 px-4 min-h-[52px] max-h-[200px]"
          />

          <div className="flex justify-between items-center px-2 pb-2 mt-1 relative">
            <div className="flex items-center">
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
            </div>

            <div className="flex items-center gap-3">
              <div className="relative" ref={modelMenuRef}>
                <button
                  onClick={() => setShowModels(!showModels)}
                  className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-[#A6A39A] hover:text-text1 hover:bg-[#3A3933] rounded-md transition-all"
                >
                  <span>{currentModelName}</span>
                  <i className="nf nf-cod-chevron_down text-[10px] opacity-70"></i>
                </button>

                {showModels && (
                  <div className="absolute bottom-full mb-2 right-0 w-64 bg-[#2F2F2D] border border-[#3A3933] rounded-lg shadow-xl overflow-hidden py-1 z-30">
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

              {isStreaming ? (
                <button
                  onClick={stopStreaming}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#D97757]/20 text-[#D97757] hover:bg-[#D97757]/30 transition-colors"
                >
                  <div className="w-2.5 h-2.5 bg-[#D97757] rounded-[1px]"></div>
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!hasContent}
                  className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${hasContent ? 'bg-[#D97757] text-white hover:bg-[#C56545]' : 'bg-[#3A3933] text-[#6b6b6b]'}`}
                >
                  <i className="nf nf-fa-arrow_up text-sm"></i>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="text-center py-2.5">
          <p className="text-[11px] text-[#74736e]">Freedom AI is AI and can make mistakes. Please double-check responses.</p>
        </div>
      </div>
    </div>
  );
}
export default Reply;
