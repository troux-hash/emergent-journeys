import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProductMockup from "@/components/ProductMockup";
import AudienceSection from "@/components/AudienceSection";
import OtaSection from "@/components/OtaSection";
import PricingSection from "@/components/PricingSection";
import ValuesSection from "@/components/ValuesSection";
import OperatorSignupSection from "@/components/OperatorSignupSection";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

const Index = () => (
  <div className="grain-overlay">
    <Navbar />
    <HeroSection />
    <ProductMockup />
    <AudienceSection />
    <OtaSection />
    <PricingSection />
    <ValuesSection />
    <OperatorSignupSection />
    <Footer />
    <ChatWidget />
  </div>
);

export default Index;
