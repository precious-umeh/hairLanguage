import BestSellers from "./sections/bestSellers";
import Collections from "./sections/collections";
import HairConsultation from "./sections/hairConsultation";
import HeroSection from "./sections/hero";
import Newsletter from "./sections/newsletter";
import OurServices from "./sections/ourServices";
import Testimonials from "./sections/testimonials";
import ScrollReveal from "./components/ScrollReveal";

export default function Home() {
  return (
    <main>
      <HeroSection />

      <OurServices />

      <ScrollReveal>
        <BestSellers />
      </ScrollReveal>

      <Collections />

      <ScrollReveal>
        <HairConsultation />
      </ScrollReveal>

      <ScrollReveal>
        <Testimonials />
      </ScrollReveal>

      <Newsletter />
    </main>
  );
}
