const taglines = [
  // Warm & friendly
  "Brewing up something good",
  "One cup at a time",
  "Your daily grind, tracked",
  "Fresh pours, fresh starts",
  "Keeping tabs on your tabs",
  "Every order tells a story",
  "The daily pour",
  "Crafted with care",
  // Goofy ones
  "Whatcha BREWin'?!",
  "Espresso yourself",
  "Thanks a latte",
  "Bean there, tracked that",
  "Deja brew",
  "Rise and grind",
];

const STORAGE_KEY = 'sideorder-tagline';

/**
 * Get the tagline for this browser session.
 * Picks a random one on first call (or after force reload),
 * then returns the same one for the rest of the session.
 */
export function getTagline(): string {
  // Check if we already have a tagline for this session
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored) {
    return stored;
  }

  // Pick a random tagline
  const randomIndex = Math.floor(Math.random() * taglines.length);
  const tagline = taglines[randomIndex];

  // Store it for the rest of the session
  sessionStorage.setItem(STORAGE_KEY, tagline);

  return tagline;
}
