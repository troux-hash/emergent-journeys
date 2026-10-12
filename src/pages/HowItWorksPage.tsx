import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import HowItWorksSection from "@/components/HowItWorksSection";
import OperatorSignupSection from "@/components/OperatorSignupSection";
import Footer from "@/components/Footer";

const HowItWorksPage = () => (
  <div className="grain-overlay">
    <Helmet>
      <title>How Fichua works for lodges | Fichua</title>
      <meta name="description" content="Three steps: tell us about your lodge, get verified, go live for direct bookings at 7%." />
      <link rel="canonical" href="https://fichua.co/how-it-works" />
    </Helmet>
    <Navbar />
    <div className="bg-earth-dark pt-28" />
    <HowItWorksSection />
    <OperatorSignupSection />
    <Footer />
  </div>
);

export default HowItWorksPage;
