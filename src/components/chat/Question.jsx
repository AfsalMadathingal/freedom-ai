import { useState } from "react";

function Question({ value }) {
  let content = [];
  if (Array.isArray(value)) {
    content = value;
  } else {
    content = [{ type: 'text', text: value }];
  }

  const textPart = content.find(c => c.type === 'text')?.text;
  const attachments = content.filter(c => c.type !== 'text');

  return (
    <div className="flex justify-end w-full max-w-3xl Md:max-w-[23rem] py-4">
      <div className="flex flex-col items-end gap-2 max-w-[85%]">
        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-end mb-1">
            {attachments.map((att, idx) => (
              <div key={idx} className="bg-[#2C2B28] rounded-lg p-2 border border-[#3A3933] flex items-center gap-2">
                {att.type === 'image' ? (
                  <div className="flex items-center gap-2">
                    <i className="nf nf-fa-image text-[#A6A39A]"></i>
                    <span className="text-xs text-text1 max-w-[100px] truncate">Image</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <i className="nf nf-fa-file_text_o text-[#A6A39A]"></i>
                    <span className="text-xs text-text1 max-w-[100px] truncate">Document</span>
                  </div>
                )}
                {att.fileName && <span className="text-xs text-[#757575]">{att.fileName}</span>}
              </div>
            ))}
          </div>
        )}

        {/* Text content */}
        {textPart && (
          <div className="bg-[#2C2B28] text-text1 px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed border border-[#3A3933]">
            {textPart}
          </div>
        )}
      </div>
    </div>
  );
}
export default Question;
