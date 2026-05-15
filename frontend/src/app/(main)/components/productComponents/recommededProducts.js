import Link from "next/link";
import { formatPrice } from "../../utils/formatPrice";
import server from "../../utils/axiosClient";

export default async function RecommendedProducts({ currentProduct }) {
  let products = [];

  try {
    const response = await server.get("/api/products");
    products = response.data.products || [];
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return null;
  }

  const otherProducts = products.filter((p) => p.id !== currentProduct.id);

  const sameCategory = otherProducts.filter(
    (p) => p.category === currentProduct.category,
  );

  const shuffleProducts = (arr) => [...arr].sort(() => 0.5 - Math.random());

  let recommended = shuffleProducts(sameCategory).slice(0, 4);

  if (recommended.length < 4) {
    const needed = 4 - recommended.length;
    const remaining = otherProducts
      .filter((p) => !recommended.some((r) => r.id === p.id))
      .slice(0, needed);
    recommended = [...recommended, ...remaining];
  }

  return (
    <main className="mt-20 md:mt-30">
      <h2 className="text-2xl font-semibold mb-4 capitalize">
        You may also like
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-[13px] md:text-[15px] font-medium">
        {recommended.map((product) => {
          const firstImage = product.images[0];
          const secondImage = product.images[1];
          const BASE_URL = "http://127.0.0.1:5500";

          return (
            <div key={product.id} className="w-full group cursor-pointer">
              <Link href={`/shop/${product.id}`} className="block">
                <div className={`w-full aspect-square rounded-lg relative`}>
                  <img
                    src={`${BASE_URL}${firstImage}`}
                    alt={product.productName}
                    className="w-full h-full rounded-lg object-cover"
                  />

                  {secondImage && (
                    <div
                      className={`absolute inset-0 rounded-lg scale-95 opacity-0 md:group-hover:scale-100 
                      md:group-hover:opacity-100 transition-all duration-300`}
                    >
                      <img
                        src={`${BASE_URL}${secondImage}`}
                        alt={product.productName}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="md:group-hover:underline underline-offset-4 transition-all duration-300">
                    {product.productName}
                  </p>

                  <p>{formatPrice(product.price)}</p>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </main>
  );
}

/*
  const recommended = useMemo(() => {
    // Filter out the currentProduct
    const otherProducts = products.filter((p) => p.id !== currentProduct.id);

    // Prefer products from the same category
    const sameCategory = otherProducts.filter(
      (p) => p.category === currentProduct.category,
    );

    // Shuffle products array
    const shuffleProducts = (arr) => {
      return [...arr].sort(() => 0.5 - Math.random());
    };

    // Pick 4 products from same category
    let recommendedProducts = shuffleProducts(sameCategory).slice(0, 4);

    // Fill with other random products if recommendedProducts isn't enough
    if (recommendedProducts.length < 4) {
      const needed = 4 - recommendedProducts.length;

      Look through all other products, remove the ones we already recommended, 
         shuffle the rest randomly, and pick only the number of products we still 
         need.
      
      const remaining = shuffleProducts(otherProducts)
        .filter((p) => !recommendedProducts.some((r) => r.id === p.id))
        .slice(0, needed);

      recommendedProducts = [...recommendedProducts, ...remaining];
    }

    return recommendedProducts;
  }, [currentProduct.id, currentProduct.category, products]);
*/
