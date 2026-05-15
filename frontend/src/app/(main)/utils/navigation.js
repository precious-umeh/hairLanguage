export const isActive = (item, pathname) => {
  if (!item.path) return;

  // Home
  if (item.path === "/") {
    return pathname === "/";
  }

  if (item.path && pathname.startsWith(item.path)) return true;

  return false;
};
