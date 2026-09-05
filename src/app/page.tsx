import { Hero } from "@/components/home/Hero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { CustomHighlight } from "@/components/home/CustomHighlight";
import { Gallery } from "@/components/home/Gallery";
import { InstagramSection } from "@/components/home/InstagramSection";
import { CTASection } from "@/components/home/CTASection";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export default function Home() {
  return (
    <ErrorBoundary>
      <Hero />
      <CategoryGrid />
      <FeaturedProducts />
      <CustomHighlight />
      <Gallery />
      <InstagramSection />
      <CTASection />
    </ErrorBoundary>
  );
}
