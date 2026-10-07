import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import SolutionSection from "@/components/SolutionSection";
import ComparisonSection from "@/components/ComparisonSection";
import OtaSection from "@/components/OtaSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import ValuesSection from "@/components/ValuesSection";
import PricingSection from "@/components/PricingSection";
import OperatorSignupSection from "@/components/OperatorSignupSection";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

const Index = () => {
  return (
    <div className="grain-overlay">
      <Navbar />
      <HeroSection />
      <ComparisonSection />
      <OtaSection />
      <ProblemSection />
      <SolutionSection />
      <PricingSection />
      <HowItWorksSection />
      <ValuesSection />
      <FaqSection />
      <OperatorSignupSection />
      <Footer />
      <ChatWidget />
    </div>
  );
};

export default Index;
