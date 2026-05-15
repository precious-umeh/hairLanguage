// Create length ranges
const LENGTH_GROUPS = {
  short: { min: 8, max: 14 },
  medium: { min: 16, max: 20 },
  long: { min: 22, max: Infinity },
};

// Calculate Total Stock
const calculateTotalStock = (product) => {
  if (!product.lengths || product.lengths.length === 0) {
    return Number(product.inventory) || 0;
  }

  return product.lengths.reduce(
    (acc, curr) => acc + (Number(curr.inventory) || 0),
    0,
  );
};

// Individual filter handlers
const filterHandlers = {
  category: (product, value) => product.category === value,

  texture: (product, value) => product.texture === value,

  type: (product, value) => product.wigType === value,

  length: (product, value) => {
    const range = LENGTH_GROUPS[value];
    if (!range) return true;

    return (
      product.lengths.some((l) => {
        // Access the .size property of the object
        const num = Number(l.size);
        return num >= range.min && num <= range.max;
      }) || false
    );
  },
};

// Sorting Logic
const getEffectivePrice = (product) => {
  if (!Array.isArray(product?.lengths) || product.lengths.length === 0) {
    return Number(product?.price) || 0;
  }

  const visibleLengthPrices = product.lengths
    .map((len) => Number(len?.price))
    .filter((value) => Number.isFinite(value));

  if (visibleLengthPrices.length === 0) {
    return Number(product?.price) || 0;
  }

  return Math.min(...visibleLengthPrices);
};

const sortProducts = (products, sortBy) => {
  if (!sortBy) return products;

  return [...products].sort((a, b) => {
    const priceA = getEffectivePrice(a);
    const priceB = getEffectivePrice(b);

    switch (sortBy) {
      case "low-high":
        return priceA - priceB;
      case "high-low":
        return priceB - priceA;
      case "a-z":
        return a.productName.localeCompare(b.productName);
      case "z-a":
        return b.productName.localeCompare(a.productName);
      case "old-new":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "new-old":
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return 0;
    }
  });
};

// Main Export
export function ApplyFiltersAndSort(products = [], params) {
  if (!products || !Array.isArray(products)) return [];

  const { minPrice, maxPrice, sort, hideOutOfStock } = params;

  // Dynamic Filters
  let filtered = [...products];

  // Out of stock filters
  if (hideOutOfStock === "true" || hideOutOfStock === true) {
    filtered = filtered.filter((product) => calculateTotalStock(product) > 0);
  }

  Object.entries(filterHandlers).forEach(([key, handler]) => {
    const value = params[key];
    if (value) {
      filtered = filtered.filter((product) => handler(product, value));
    }
  });

  // Price Filter
  if (minPrice || maxPrice) {
    const min = minPrice ? Number(minPrice) : 0;
    const max = maxPrice ? Number(maxPrice) : Infinity;

    filtered = filtered.filter((product) => {
      const productPrice = Number(product.price);
      return productPrice >= min && productPrice <= max;
    });
  }

  // Sort
  return sortProducts(filtered, sort);
}

// length: (product, value) => {
//     const range = LENGTH_GROUPS[value];
//     if (!range) return true;

//     return (
//       product.lengths.some((l) => {
//         const num = Number(l);
//         return num >= range.min && num <= range.max;
//       }) || false
//     );
//   },
