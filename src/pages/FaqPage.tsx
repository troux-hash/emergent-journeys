import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import FaqSection from "@/components/FaqSection";
import OperatorSignupSection from "@/components/OperatorSignupSection";
import Footer from "@/components/Footer";

const FaqPage = () => (
  <div className="grain-overlay">
    <Helmet>
      <title>FAQ for lodge owners | Fichua</title>
      <meta name="description" content="Answers for independent lodges: Fichua pricing, payouts, verification, countries and guest data." />
      <link rel="canonical" href="https://fichua.co/faq" />
    </Helmet>
    <Navbar />
    <div className="bg-earth-dark pt-28" />
    <FaqSection />
    <OperatorSignupSection />
    <Footer />
  </div>
);

export default FaqPage;
