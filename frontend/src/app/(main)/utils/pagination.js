export const getVisiblePages = (current, total) => {
  // If pages are small, show everything
  if (total < 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  // Always show first, last, current and neighbor pages
  const pages = [1];

  if (current > 3) {
    pages.push("...");
  }

  // Calculate pages around the current page
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  // Add the pages around the current page
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  // Add dots if current page isn't close to the last page
  if (current < total - 2) {
    pages.push("...");
  }

  // last page
  pages.push(total);

  return pages;
};
