import { Inter } from "next/font/google";
import Link from "next/link";
import collections from "../data-sources/heroCollections.js";

const inter = Inter({
  subsets: ["latin"],
});

export default function Collections() {
  return (
    <section
      className={`py-20 px-10 bg-(--lightSilver) space-y-14 text-center font-medium ${inter.className}`}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
        {collections.map((collection, index) => (
          <div key={index} className="space-y-4">
            <Link
              href={collection.path}
              className="block aspect-5/7 cursor-pointer"
            >
              <img
                src={collection.img}
                alt={collection.title}
                className="w-full h-full object-cover rounded-lg"
              />
            </Link>
            <p className="">{collection.title}</p>
          </div>
        ))}
      </div>
      <Link
        href="/shop"
        className="inline-block hover:underline underline-offset-4 decoration-2 tracking-wide cursor-pointer"
      >
        View all &rarr;
      </Link>

      <div className="max-w-200 bg-(--softAsh) text-(--textColor) p-10 mx-auto my-10">
        <p>
          Hair is more than a style, it's a form of expression. Every texture,
          length, and silhouette tells a story about confidence, identity, and
          how you choose to show up in the world.
        </p>
      </div>
    </section>
  );
}
