import React from "react";
import { StyleBadge, MicroBadge } from "./StyleBadge";
import { Hotness } from "./Hotness";
import { ArrowUpRight } from "lucide-react";

export const PromptCard = ({ card, onOpen, index = 0 }) => {
  const slug = (card.name || "").toLowerCase().replace(/\s+/g, "-");
  return (
    <article
      data-testid={`prompt-card-${slug}`}
      className="pp-card pp-rise overflow-hidden flex flex-col group cursor-pointer"
      style={{ animationDelay: `${Math.min(index, 12) * 50}ms` }}
      onClick={() => onOpen(card)}
    >
      <div className="relative h-48 w-full border-b-2 border-[#121212] bg-[#f0f0f0] overflow-hidden">
        {card.reference_image_url ? (
          <img
            src={card.reference_image_url}
            alt={card.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center font-bold text-2xl"
            style={{ background: card.signature_color || "#FFE08A" }}
          >
            {card.style}
          </div>
        )}

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[70%]">
          <StyleBadge style={card.style} signatureColor={card.signature_color} />
        </div>
        <div className="absolute top-3 right-3">
          <Hotness value={card.hotness} testid={`hotness-${slug}`} />
        </div>
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3
            data-testid={`prompt-name-${slug}`}
            className="text-lg font-bold leading-tight"
            style={{ fontFamily: "Outfit" }}
          >
            {card.name}
          </h3>
          <ArrowUpRight
            size={20}
            strokeWidth={2.5}
            className="shrink-0 mt-1 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1"
          />
        </div>

        <p className="text-sm text-[#4A4A4A] line-clamp-2">{card.vibe}</p>

        <div className="flex flex-wrap gap-1.5">
          {(card.micro_badges || []).slice(0, 3).map((b) => (
            <MicroBadge key={b} label={b} />
          ))}
        </div>

        <div className="mt-auto pt-3 border-t-2 border-dashed border-[#121212]/20 flex items-center justify-between text-xs font-semibold text-[#4A4A4A]">
          <span data-testid={`use-case-${slug}`}>{card.use_case}</span>
          <span className="flex gap-1.5">
            {(card.platforms || []).slice(0, 2).map((p) => (
              <span
                key={p}
                className="px-2 py-0.5 rounded-full border-2 border-[#121212] bg-white text-[10px] uppercase font-bold"
              >
                {p}
              </span>
            ))}
          </span>
        </div>
      </div>
    </article>
  );
};

export default PromptCard;
