import React from "react";

// Color format: bg-[#fffff]
const Tag: React.FC<{ text: string; color: string }> = ({ text, color }) => {
  return <span className={`${color} p-1 rounded-md font-bold text-white text-xs`}>{text}</span>;
};

export default Tag;
