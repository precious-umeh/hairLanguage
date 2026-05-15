import { notFound } from "next/navigation";
import server from "../../utils/axiosClient";
import ProductDetailsPage from "../../components/productComponents/productDetails";
import RecommendedProducts from "../../components/productComponents/recommededProducts";
import Newsletter from "../../sections/newsletter";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    // Fetch just enough data for the title
    const response = await server.get(`/api/products/slug/${slug}`);
    const product = response.data.product;

    return {
      title: `${product.productName} | Hair Language`,
      description: product.description.substring(0, 160),
    };
  } catch (e) {
    return {
      title: "Product not found",
    };
  }
}

export default async function ProductPage({ params }) {
  const { slug } = await params;

  let product = null;

  try {
    const response = await server.get(`/api/products/slug/${slug}`);
    product = response.data.product;
  } catch (error) {
    return notFound();
  }

  return (
    <>
      <ProductDetailsPage product={product} />

      <div className="px-[5vw]">
        <RecommendedProducts currentProduct={product} />

        <Newsletter />
      </div>
    </>
  );
}
