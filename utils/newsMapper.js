/* ================= CONSTANTS ================= */

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1543357480-c60d40007a3f";

/* ================= MAIN MAPPER ================= */

function mapNewsItem(article) {
  if (!article) return null;

  return {
    id: article.url || generateId(),

    title: safeString(article.title, "Untitled"),

    excerpt: safeString(article.description, ""),

    source: safeString(
      article.source?.name,
      "Unknown"
    ),

    url: safeString(article.url, "#"),

    time: formatTime(
      article.publishedAt
    ),

    // for sorting
    publishedAt:
      article.publishedAt || null,

    // ALWAYS GUARANTEE IMAGE
    image:
      article.image ||
      FALLBACK_IMAGE,

    category:
      detectCategory(article),

    tags: extractTags(article),

    featured: false,
  };
}

/* ================= HELPERS ================= */

function safeString(
  value,
  fallback = ""
) {
  return typeof value === "string"
    ? value
    : fallback;
}

function generateId() {
  return Math.random()
    .toString(36)
    .substring(2, 10);
}

/* ================= CATEGORY ================= */

function detectCategory(article) {
  const text = `${
    article.title || ""
  } ${
    article.description || ""
  }`.toLowerCase();

  if (text.includes("injury"))
    return "injuries";

  if (
    text.includes("transfer") ||
    text.includes("sign")
  )
    return "transfers";

  if (
    text.includes("interview") ||
    text.includes("says")
  )
    return "interviews";

  if (
    text.includes("press") ||
    text.includes("conference")
  )
    return "press";

  if (
    text.includes("rumor") ||
    text.includes("linked")
  )
    return "rumors";

  return "breaking";
}

/* ================= TAG EXTRACTION ================= */

function extractTags(article) {
  const text = `${
    article.title || ""
  } ${
    article.description || ""
  }`.toLowerCase();

  const keywords = [
    "fifa",
    "world cup",
    "argentina",
    "brazil",
    "england",
    "france",
    "germany",
    "spain",
    "italy",
    "netherlands",
    "portugal",
    "belgium",
    "croatia",
    "uruguay",
    "mexico",
    "usa",
    "canada",
    "morocco",
    "japan",
    "south korea",
  ];

  return keywords
    .filter((k) =>
      text.includes(k)
    )
    .map((k) =>
      normalizeTag(k)
    )
    .filter(
      (v, i, arr) =>
        arr.indexOf(v) === i
    );
}

/* ================= NORMALIZATION ================= */

function normalizeTag(tag) {
  if (tag === "fifa")
    return "FIFA";

  if (tag === "world cup")
    return "World Cup";

  if (tag === "argentina")
    return "Argentina";

  if (tag === "brazil")
    return "Brazil";

  if (tag === "england")
    return "England";

  if (tag === "france")
    return "France";

  if (tag === "germany")
    return "Germany";

  if (tag === "spain")
    return "Spain";

  if (tag === "italy")
    return "Italy";

  if (tag === "netherlands")
    return "Netherlands";

  if (tag === "portugal")
    return "Portugal";

  if (tag === "belgium")
    return "Belgium";

  if (tag === "croatia")
    return "Croatia";

  if (tag === "uruguay")
    return "Uruguay";

  if (tag === "mexico")
    return "Mexico";

  if (tag === "usa")
    return "USA";

  if (tag === "canada")
    return "Canada";

  if (tag === "morocco")
    return "Morocco";

  if (tag === "japan")
    return "Japan";

  if (tag === "south korea")
    return "South Korea";

  return tag;
}

/* ================= TIME ================= */

function formatTime(
  dateString
) {
  if (!dateString) return "";

  const diff =
    Date.now() -
    new Date(
      dateString
    ).getTime();

  const hours = Math.floor(
    diff / (1000 * 60 * 60)
  );

  if (hours < 1)
    return "Just now";

  if (hours < 24)
    return `${hours}h ago`;

  const days = Math.floor(
    hours / 24
  );

  return `${days}d ago`;
}

module.exports = {
  mapNewsItem,
};