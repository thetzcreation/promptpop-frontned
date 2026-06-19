import React from "react";
import { getStyleColor, getBadgeColor } from "../lib/style-colors";

export const StyleBadge = ({ style, signatureColor }) => {
  const { bg, text } = signatureColor
    ? { bg: signatureColor, text: "#121212" }
    : getStyleColor(style);
  return (
    <span
      data-testid={`style-badge-${(style || "default").toLowerCase().replace(/\s+/g, "-")}`}
      className="inline-flex items-center border-2 border-[#121212] rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
      style={{ backgroundColor: bg, color: text }}
    >
      {style}
    </span>
  );
};

export const MicroBadge = ({ label }) => {
  const { bg, text } = getBadgeColor(label);
  return (
    <span
      data-testid={`micro-badge-${label.toLowerCase().replace(/\s+/g, "-")}`}
      className="inline-flex items-center border-2 border-[#121212] rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
      style={{ backgroundColor: bg, color: text }}
    >
      {label}
    </span>
  );
};

export default StyleBadge;
