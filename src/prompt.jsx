function Prompt({ value, isHidden, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        ${isHidden ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"} 
        flex-1 min-w-[200px] cursor-pointer 
        bg-[#2C2B28] hover:bg-[#3A3933] 
        border border-[#3A3933] hover:border-[#52514B] 
        rounded-xl px-4 py-3 text-sm text-text1 
        transition-all duration-200 ease-out group
      `}
    >
      <div className="font-medium text-[15px]">{value}</div>
      <div className="text-text2 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
        Prompt &rarr;
      </div>
    </div>
  );
}
export default Prompt;
