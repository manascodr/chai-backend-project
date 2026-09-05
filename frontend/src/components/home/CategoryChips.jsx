import React from "react";

export const CATEGORIES = [
  { id: "all", label: "All Creations" },
  { id: "latest", label: "✨ New Releases", sort: "new" },
  { id: "popular", label: "🔥 Top Trending", sort: "views" },
  { id: "music", label: "Music & Audio", query: "music" },
  { id: "gaming", label: "Gaming & Streams", query: "gaming" },
  { id: "tech", label: "Tech & Dev", query: "tech" },
  { id: "podcasts", label: "Podcasts & Talks", query: "podcast" },
  { id: "tutorials", label: "Tutorials & Masterclasses", query: "tutorial" },
];

const CategoryChips = ({ activeCategory, sort, query, onSelectCategory }) => {
  return (
    <div className="sticky top-[64px] z-30 bg-[#09090b]/90 backdrop-blur-2xl px-4 sm:px-6 py-3 border-b border-white/[0.08] mb-6">
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-0.5">
        {CATEGORIES.map((cat) => {
          const isActive =
            (cat.id === "all" && !query && sort === "new" && activeCategory === "all") ||
            (cat.sort && sort === cat.sort && !query) ||
            (cat.query && query.toLowerCase() === cat.query.toLowerCase()) ||
            activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 shadow-sm shadow-amber-500/30 font-bold"
                  : "bg-[#141418] text-zinc-300 hover:text-white hover:bg-[#1c1c22] border border-white/10 hover:border-white/20"
              }`}
              onClick={() => onSelectCategory(cat)}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryChips;
