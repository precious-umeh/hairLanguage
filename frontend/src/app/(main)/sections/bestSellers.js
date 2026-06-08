import { Playfair_Display, Inter } from "next/font/google";
import bestSellers from "../data-sources/bestSellers";

const playfair = Playfair_Display({
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
});

export default function BestSellers() {
  return (
    <section
      className={`${inter.className} pb-25 px-10 text-center text-(--textColor) font-medium`}
    >
      <main className="max-w-300 mx-auto space-y-15">
        <div className="space-y-4">
          <h2
            className={`${playfair.className} text-4xl md:text-5xl font-semibold  tracking-wider`}
          >
            Our Best Sellers
          </h2>
          <p className="text-lg md:text-xl">
            These hairs have been the languages of over 400+ customers
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {bestSellers.map((bs, id) => (
            <div key={id} className="space-y-4">
              <div className="aspect-5/7 relative group">
                <video
                  muted
                  autoPlay={true}
                  loop
                  playsInline // CRITICAL: This stops the auto-fullscreen on iPhone
                  preload="auto"
                  src={`${bs.video}#t=0.001`} // Appends timeline anchor to force safari frame compilation
                  className="w-full h-full object-cover rounded-lg border-2 border-(--accent)"
                />

                <div
                  className="hidden absolute inset-0 bg-(--softCharcoal)/70 rounded-lg opacity-0 group-hover:opacity-100
                  transition-opacity duration-300 md:flex items-center justify-center px-5"
                >
                  <p className="text-white">{bs.title}</p>
                </div>
              </div>

              <p className="text-[14px] md:hidden">{bs.title}</p>
            </div>
          ))}
        </div>
      </main>
    </section>
  );
}
