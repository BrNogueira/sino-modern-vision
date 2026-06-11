import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import PropertyCarousel from "@/components/PropertyCarousel";
import CategoriesCarousel from "@/components/CategoriesCarousel";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <CategoriesCarousel />
      <PropertyCarousel />
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
