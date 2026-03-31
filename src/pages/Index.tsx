import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import OpportunitySection from "@/components/OpportunitySection";
import ProblemSection from "@/components/ProblemSection";
import SolutionSection from "@/components/SolutionSection";
import WhoWeAreSection from "@/components/WhoWeAreSection";
import HowItWorksSection from "@/components/HowItWorksSection";

const Index = () => {
  return (
    <div className="grain-overlay">
      <Navbar />
      <HeroSection />
      <OpportunitySection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <WhoWeAreSection />
    </div>
  );
};

export default Index;
