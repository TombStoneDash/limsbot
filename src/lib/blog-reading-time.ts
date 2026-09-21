export function estimateReadingTime(
  text: string,
  wordsPerMinute: number = 200,
): { minutes: number; label: string } {
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = words === 0 ? 0 : Math.max(1, Math.ceil(words / wordsPerMinute));

  return { minutes, label: `${minutes} min read` };
}

// An excerpt alone undercounts full-post length; this estimates only the excerpt.
export function estimateFromExcerpt(excerpt: string): ReturnType<typeof estimateReadingTime> {
  return estimateReadingTime(excerpt);
}
