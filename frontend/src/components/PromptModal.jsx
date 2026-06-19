import React, { useEffect } from "react";
import { X, Sparkles, Lightbulb, Camera, Hash, Ratio, Clock } from "lucide-react";
import { StyleBadge, MicroBadge } from "./StyleBadge";
import { Hotness } from "./Hotness";
import { CopyButton } from "./CopyButton";

export const PromptModal = ({ card, onClose }) => {
  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!card) return null;

  return (
    <div
      data-testid="prompt-modal-overlay"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 pp-rise"
    >
      <div
        data-testid="prompt-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-white border-2 border-[#121212] rounded-3xl pp-shadow-lg w-full max-w-5xl max-h-[92vh] overflow-y-auto flex flex-col md:flex-row relative"
      >
        <button
          data-testid="modal-close-button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 bg-white border-2 border-[#121212] rounded-full p-2 pp-shadow-sm pp-press hover:bg-[#FFBF00]"
        >
          <X size={18} strokeWidth={2.8} />
        </button>

        {/* Left: image */}
        <div className="md:w-2/5 relative border-b-2 md:border-b-0 md:border-r-2 border-[#121212] bg-[#f0f0f0] min-h-[260px]">
          {card.reference_image_url ? (
            <img
              src={card.reference_image_url}
              alt={card.name}
              className="w-full h-full object-cover absolute inset-0"
            />
          ) : (
            <div
              className="w-full h-full absolute inset-0 flex items-center justify-center text-3xl font-black"
              style={{ background: card.signature_color || "#FFE08A" }}
            >
              {card.style}
            </div>
          )}
          <div className="absolute top-4 left-4">
            <StyleBadge style={card.style} signatureColor={card.signature_color} />
          </div>
          <div className="absolute bottom-4 left-4">
            <Hotness value={card.hotness} size="lg" />
          </div>
        </div>

        {/* Right: content */}
        <div className="md:w-3/5 p-6 md:p-8 flex flex-col gap-5">
          <header>
            <div className="flex flex-wrap gap-2 mb-3">
              {(card.micro_badges || []).map((b) => (
                <MicroBadge key={b} label={b} />
              ))}
            </div>
            <h2
              data-testid="modal-prompt-name"
              className="text-3xl md:text-4xl font-black leading-tight"
              style={{ fontFamily: "Outfit" }}
            >
              {card.name}
            </h2>
            <p className="text-[#4A4A4A] mt-2 text-base">{card.vibe}</p>
          </header>

          <div className="flex flex-wrap gap-4 text-xs font-bold text-[#121212]">
            <span className="inline-flex items-center gap-1.5"><Ratio size={14} strokeWidth={2.8} />{card.aspect_ratio || "9:16"}</span>
            {card.duration ? (
              <span className="inline-flex items-center gap-1.5"><Clock size={14} strokeWidth={2.8} />{card.duration}</span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <Camera size={14} strokeWidth={2.8} />
              {card.use_case}
            </span>
            <span className="inline-flex flex-wrap gap-1.5">
              {(card.platforms || []).map((p) => (
                <span
                  key={p}
                  className="px-2 py-0.5 rounded-full border-2 border-[#121212] bg-white text-[10px] uppercase font-bold"
                >
                  {p}
                </span>
              ))}
            </span>
          </div>

          {/* Prompt block */}
          <section>
            <h4 className="flex items-center gap-2 font-bold uppercase tracking-wider text-xs mb-2">
              <Sparkles size={14} strokeWidth={2.8} /> Copy-Paste Prompt
            </h4>
            <div
              data-testid="modal-prompt-text"
              className="bg-[#FAFAFA] border-2 border-[#121212] rounded-xl p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap"
            >
              {card.prompt_text}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <CopyButton text={card.prompt_text} label="Copy Prompt" testid="copy-prompt-button" />
              <CopyButton
                text={(card.tags || []).join(" ")}
                label="Copy Tags"
                variant="secondary"
                testid="copy-tags-button"
              />
            </div>
          </section>

          {/* Reference */}
          {card.reference_guidelines && (
            <section>
              <h4 className="flex items-center gap-2 font-bold uppercase tracking-wider text-xs mb-2">
                <Camera size={14} strokeWidth={2.8} /> Reference Image Guidelines
              </h4>
              <p className="text-sm text-[#121212]">{card.reference_guidelines}</p>
            </section>
          )}

          {/* Remix Tips */}
          {(card.remix_tips || []).length > 0 && (
            <section>
              <h4 className="flex items-center gap-2 font-bold uppercase tracking-wider text-xs mb-2">
                <Lightbulb size={14} strokeWidth={2.8} /> Tips to Remix
              </h4>
              <ul className="list-none flex flex-col gap-2">
                {card.remix_tips.map((tip, i) => (
                  <li
                    key={i}
                    className="bg-[#FFF7E6] border-2 border-[#121212] rounded-xl px-3 py-2 text-sm"
                  >
                    {tip}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Tags */}
          {(card.tags || []).length > 0 && (
            <section>
              <h4 className="flex items-center gap-2 font-bold uppercase tracking-wider text-xs mb-2">
                <Hash size={14} strokeWidth={2.8} /> Tags
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {card.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-full border-2 border-[#121212] bg-white text-xs font-semibold"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptModal;
