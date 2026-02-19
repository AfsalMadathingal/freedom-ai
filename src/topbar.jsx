import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Button from "./button";
import { useChat } from "./context/ChatContext.jsx";

function TopBar({ isPinned }) {
  const [dropDown, setDropDown] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const ref = useRef();
  const renameRef = useRef();
  const navigate = useNavigate();
  const { id } = useParams();
  const { activeConversation, renameConversation, deleteConversation } = useChat();

  const title = activeConversation?.title || "New Chat";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setDropDown(false);
      }
    };
    document.body.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.body.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isRenaming && renameRef.current) {
      renameRef.current.focus();
      renameRef.current.select();
    }
  }, [isRenaming]);

  const handleRename = () => {
    setDropDown(false);
    setRenameValue(title);
    setIsRenaming(true);
  };

  const handleRenameSubmit = () => {
    const val = renameValue.trim();
    if (val && id) {
      renameConversation(id, val);
    }
    setIsRenaming(false);
  };

  const handleDelete = () => {
    setDropDown(false);
    if (id) {
      deleteConversation(id);
      navigate("/");
    }
  };

  return (
    <div className={`fixed top-0 left-0 w-full h-14 bg-[#21201C] z-10 flex items-center justify-between px-4 border-b border-[#2C2B28] transition-all ${isPinned ? "pl-72" : "pl-20"}`}>

      {/* Title Area */}
      <div ref={ref} className="relative group cursor-pointer hover:bg-[#2C2B28] px-2 py-1 rounded-md transition-colors" onClick={() => setDropDown(!dropDown)}>
        {isRenaming ? (
          <input
            ref={renameRef}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRenameSubmit();
              if (e.key === "Escape") setIsRenaming(false);
            }}
            onBlur={handleRenameSubmit}
            className="bg-[#1A1915] text-text1 text-sm outline-none px-2 py-0.5 rounded border border-[#3A3933] w-64"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text1 max-w-[300px] truncate">{title}</span>
            <i className="nf nf-cod-chevron_down text-xs text-text2 opacity-0 group-hover:opacity-100 transition-opacity"></i>
          </div>
        )}

        {/* Dropdown Menu */}
        {dropDown && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-[#2C2B28] border border-[#3A3933] rounded-lg shadow-xl py-1 z-50">
            <button
              onClick={(e) => { e.stopPropagation(); handleRename(); }}
              className="w-full text-left px-3 py-2 text-sm text-text1 hover:bg-[#3A3933] flex items-center gap-2"
            >
              <i className="nf nf-cod-edit text-xs"></i> Rename
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(); }}
              className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-[#3A3933] flex items-center gap-2"
            >
              <i className="nf nf-cod-trash text-xs"></i> Delete
            </button>
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1">
        <button className="p-1.5 text-text2 hover:text-text1 hover:bg-[#2C2B28] rounded-md transition-colors">
          <i className="nf nf-cod-star_empty text-sm"></i>
        </button>
        <button className="px-3 py-1 bg-[#1A1915] border border-[#3A3933] text-text1 text-xs font-medium rounded-md hover:bg-[#2C2B28] transition-colors">
          Share
        </button>
      </div>
    </div>
  );
}
export default TopBar;
