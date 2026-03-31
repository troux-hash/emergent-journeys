import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import WhyNowSection from "@/components/WhyNowSection";
import SolutionSection from "@/components/SolutionSection";
import BusinessModelSection from "@/components/BusinessModelSection";
import TractionSection from "@/components/TractionSection";
import VisionSection from "@/components/VisionSection";
import FooterCTA from "@/components/FooterCTA";

const Index = () => {
  return (
    <div className="grain-overlay">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <WhyNowSection />
      <SolutionSection />
      <BusinessModelSection />
      <TractionSection />
      <VisionSection />
      <FooterCTA />
    </div>
  );
};

export default Index;
