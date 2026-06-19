import React from "react";
import { Flame } from "lucide-react";

export const Hotness = ({ value = 4, size = "md", testid }) => {
  const filled = Math.max(0, Math.min(5, Number(value) || 0));
  const px = size === "lg" ? 18 : 14;
  return (
    <div
      data-testid={testid || "hotness"}
      className="inline-flex items-center gap-1 bg-white border-2 border-[#121212] rounded-full px-2.5 py-1 pp-shadow-xs"
    >
      <Flame size={px} strokeWidth={2.5} fill="#FF3B30" color="#121212" />
      <span className="text-[12px] font-bold leading-none">{filled}/5</span>
    </div>
  );
};

export default Hotness;
