import RevealSection from "./RevealSection";
import safariLodge from "@/assets/safari-lodge.jpg";

const problems = [
  {
    number: "01",
    title: "Not visible",
    description: "AI search engines can't find you. When travellers ask ChatGPT or Google for lodges — you don't exist.",
  },
  {
    number: "02",
    title: "Losing guests",
    description: "They discover you on social media, DM you on WhatsApp — then book a chain hotel because you have no way to close.",
  },
  {
    number: "03",
    title: "Losing money",
    description: "OTAs take 20% of every booking. You're paying to be invisible while middlemen profit from your property.",
  },
];

const ProblemSection = () => {
  return (
    <section id="problem" className="bg-earth-dark text-earth-light py-16 md:py-20 px-6 md:px-12 lg:px-20">
      <div className="max-w-5xl mx-auto text-center">
        <RevealSection>
          <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-4">The Problem</p>
          <h2 className="font-display text-3xl md:text-5xl font-medium leading-tight mb-6">
            Extraordinary places exist.<br />
            <em className="text-gold">They are simply unfindable.</em>
          </h2>
        </RevealSection>

        {/* Image */}
        <RevealSection delay={0.1}>
          <div className="my-10 md:my-14 overflow-hidden">
            <img
              src={safariLodge}
              alt="Luxury safari lodge in the African savanna at golden hour"
              className="w-full h-48 md:h-72 object-cover"
              loading="lazy"
              width={1280}
              height={720}
            />
          </div>
        </RevealSection>

        {/* 3 Folds */}
        <div className="grid md:grid-cols-3 gap-8 text-left">
          {problems.map((item, i) => (
            <RevealSection key={item.number} delay={i * 0.1}>
              <div>
                <span className="font-display text-4xl font-semibold text-gold/30">{item.number}</span>
                <h3 className="font-display text-xl md:text-2xl font-medium text-gold mt-2 mb-3">{item.title}</h3>
                <p className="font-body text-sm text-earth-light/70 leading-relaxed">{item.description}</p>
              </div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
