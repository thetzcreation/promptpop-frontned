import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

export const CopyButton = ({ text, label = "Copy", testid, variant = "primary", icon = true }) => {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(text || "");
    } catch {
      // Fallback
      const t = document.createElement("textarea");
      t.value = text || "";
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      document.body.removeChild(t);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const base =
    "inline-flex items-center gap-2 font-semibold border-2 border-[#121212] rounded-full px-4 py-2 text-sm pp-shadow-sm pp-press transition-colors";
  const styles = copied
    ? "bg-[#34C759] text-white"
    : variant === "secondary"
    ? "bg-white text-[#121212] hover:bg-[#F2F2F2]"
    : "bg-[#FF6B35] text-white hover:bg-[#E55A2B]";

  return (
    <button
      data-testid={testid || "copy-button"}
      onClick={onClick}
      className={`${base} ${styles}`}
      type="button"
    >
      {icon && (copied ? <Check size={16} strokeWidth={2.8} /> : <Copy size={16} strokeWidth={2.8} />)}
      {copied ? "Copied!" : label}
    </button>
  );
};

export default CopyButton;
