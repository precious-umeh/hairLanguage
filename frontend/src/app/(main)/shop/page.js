"use client";

import { Inter } from "next/font/google";
import FilterSidebar from "../components/filterComponents/filterSidebar";
import FilterSideNav from "../components/filterComponents/filterSidenav";
import Link from "next/link";
import SortDropdown from "../components/filterComponents/sortDropdown";
import ProductGrid from "../components/productComponents/productGrid";
import { getVisiblePages } from "../utils/pagination";
import { ApplyFiltersAndSort } from "../utils/filterProducts";
import useSWR from "swr";
import { fetcher } from "../utils/fetcher";
import { use } from "react";

const inter = Inter({
  subsets: ["latin"],
});

// export default async function ShopPage({ searchParams }) {
// const params = await searchParams;
export default function ShopPage({ searchParams }) {
  const params = use(searchParams);
  const queryParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (!value) return;
    if (key === "page" || key === "sort") return;
    queryParams.set(key, value);
  });

  const apiUrl = queryParams.toString()
    ? `/api/products?${queryParams.toString()}`
    : "/api/products";

  // Use SWR for data fetching and syncing
  const {
    data: products,
    error,
    isLoading,
    isValidating,
  } = useSWR(apiUrl, fetcher, {
    keepPreviousData: true,
  });

  // Handle loading and error states
  if (error)
    return <div className="p-20 text-center">Failed to load products.</div>;
  if (isLoading && !products)
    return <div className="p-20 text-center">Loading products...</div>;

  // Use a fallback if products is undefined
  const allProducts = products || [];

  // let products = [];
  // try {
  //   const response = await server.get("/api/products");
  //   products = response.data.products;
  //   console.log(`Fetched products:`, products);
  // } catch (error) {
  //   console.error(`Failed to fetch products:`, error);
  // }

  const { page } = params;

  // const filteredProducts = ApplyFiltersAndSort(products, params);
  const filteredProducts = ApplyFiltersAndSort(allProducts, {
    sort: params?.sort,
  });

  // --- 3. APPLY PAGINATION ---
  const currentPage = Number(page) || 1;
  const PRODUCTS_PER_PAGE = 12;
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  // Calculate slice positions
  const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const end = start + PRODUCTS_PER_PAGE;

  // Slice products
  const paginatedProducts = filteredProducts.slice(start, end);

  const createPageURL = (pageNumber) => {
    const urlParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value && key !== "page") urlParams.set(key, value);
    });

    urlParams.set("page", pageNumber);

    return `/shop?${urlParams.toString()}`;
  };

  return (
    <main
      className={`px-[5vw] py-15 flex items-start gap-10 ${inter.className} text-(--textColor) font-medium`}
    >
      {/* Filter Sidebar */}
      <aside className="hidden md:block w-64 py-2 sticky top-24 h-fit">
        <FilterSidebar searchParams={params} />
      </aside>

      <section className="w-full flex flex-col gap-6 text-[12px]">
        <div className="flex items-center justify-between">
          <div className="md:opacity-0 md:pointer-events-none">
            <FilterSideNav
              searchParams={params}
              filteredProductsCount={filteredProducts.length}
            />
          </div>

          <div className="flex items-center gap-3">
            <SortDropdown />
            {isValidating && (
              <span className="text-(--textMuted) text-[11px]">
                Updating...
              </span>
            )}

            {/* <p>{filteredProducts.length} products</p> */}
            <p>
              {filteredProducts.length}{" "}
              {filteredProducts.length <= 1 ? "product" : "products"}
            </p>
          </div>
        </div>

        {/* Products Display */}
        {filteredProducts.length > 0 ? (
          <ProductGrid products={paginatedProducts} />
        ) : (
          <p className="text-center">No products available yet</p>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            {/* Previous Button */}
            <Link
              href={createPageURL(Math.max(1, currentPage - 1))}
              scroll={false}
              className={`px-3 py-1 border rounded ${
                currentPage === 1 ? "pointer-events-none opacity-50" : ""
              }`}
            >
              Prev
            </Link>

            {/* Pagination Numbers */}
            {getVisiblePages(currentPage, totalPages).map((page, index) => {
              if (page === "...") {
                return (
                  <span key={`dots-${index}`} className="px-2">
                    ...
                  </span>
                );
              }

              return (
                <Link
                  key={page}
                  href={createPageURL(page)}
                  scroll={false}
                  className={`px-3 border border-(--accent) rounded ${
                    currentPage === page
                      ? "bg-(--accent) text-white"
                      : "hover:bg-(--accent) hover:text-white"
                  }`}
                >
                  {page}
                </Link>
              );
            })}

            {/* Next Button */}
            <Link
              href={createPageURL(Math.min(totalPages, currentPage + 1))}
              scroll={false}
              className={`px-3 py-1 border rounded ${
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : ""
              }`}
            >
              Next
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
