// Per-style signature colors + micro-badge colors.
// Keep in one place so cards, filters, and modal share the same palette.

export const STYLE_COLORS = {
  "Lo-Fi":          { bg: "#FFCBA4", text: "#121212" },
  "Cyberpunk":      { bg: "#FF00FF", text: "#FFFFFF" },
  "Y2K":            { bg: "#A0D8EF", text: "#121212" },
  "Cinematic":      { bg: "#FFBF00", text: "#121212" },
  "Dreamy Pastel":  { bg: "#E6E6FA", text: "#121212" },
  "Anime":          { bg: "#FFD166", text: "#121212" },
};

export const BADGE_COLORS = {
  "Trending":      { bg: "#FF3B30", text: "#FFFFFF" },
  "Viral":         { bg: "#34C759", text: "#FFFFFF" },
  "Quick Remix":   { bg: "#007AFF", text: "#FFFFFF" },
  "Premium Look":  { bg: "#AF52DE", text: "#FFFFFF" },
};

export const getStyleColor = (style) =>
  STYLE_COLORS[style] || { bg: "#FFE08A", text: "#121212" };

export const getBadgeColor = (badge) =>
  BADGE_COLORS[badge] || { bg: "#121212", text: "#FFFFFF" };
