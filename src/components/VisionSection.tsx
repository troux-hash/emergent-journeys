import RevealSection from "./RevealSection";

const milestones = [
  { year: "2026", title: "Pilot Proven", desc: "50 operators. First direct bookings. RDB endorsement locked." },
  { year: "2027", title: "Platform Established", desc: "300 operators. $540K ARR. Commission stream activates." },
  { year: "2028", title: "Regional Scale", desc: "500+ operators. 5 countries. $1.16M ARR." },
  { year: "2030", title: "Category Creation", desc: "Fichua = the identity layer for Africa's entire tourism economy." },
];

const team = [
  {
    name: "Teddy Roux",
    role: "Founder",
    desc: "15+ years across governments and private sector. MIT Sloan Fellows MBA 2026 · Johns Hopkins SAIS · Archbishop Tutu Fellow.",
    placeholder: false,
  },
  {
    name: "TBD",
    role: "Co-Founder & CTO",
    desc: "Actively recruiting via MIT CSAIL and MIT AI+Africa. Deep AI/ML · LLM infrastructure · pricing systems.",
    placeholder: true,
  },
  {
    name: "TBD",
    role: "Chief Commercial Officer",
    desc: "Actively recruiting. Deeply rooted in Africa's T&H ecosystem. Operator networks and DMO relationships.",
    placeholder: true,
  },
];

const VisionSection = () => {
  return (
    <section id="vision" className="bg-parchment py-24 md:py-32 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        {/* Timeline */}
        <RevealSection>
          <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-4">The Vision</p>
          <h2 className="font-display text-3xl md:text-5xl font-medium leading-tight text-foreground mb-16">
            In 5 years, Fichua is<br />
            <em className="text-gold">the default operating layer<br />for African tourism.</em>
          </h2>
        </RevealSection>

        {/* Gold thread timeline */}
        <div className="relative mb-24">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gold/30" />
          <div className="space-y-12">
            {milestones.map((m, i) => (
              <RevealSection key={m.year} delay={i * 0.1}>
                <div className={`relative flex flex-col md:flex-row gap-4 md:gap-12 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  <div className={`md:w-1/2 ${i % 2 === 0 ? "md:text-right md:pr-12" : "md:pl-12"} pl-12 md:pl-0`}>
                    <p className="font-display text-2xl font-semibold text-gold">{m.year}</p>
                    <h3 className="font-display text-xl font-medium text-foreground mb-1">{m.title}</h3>
                    <p className="font-body text-sm text-muted-foreground">{m.desc}</p>
                  </div>
                  <div className="absolute left-4 md:left-1/2 top-1 w-3 h-3 rounded-full bg-gold -translate-x-1/2 border-2 border-parchment" />
                  <div className="md:w-1/2" />
                </div>
              </RevealSection>
            ))}
          </div>
        </div>

        {/* Team */}
        <RevealSection>
          <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-4">The Team</p>
          <h2 className="font-display text-2xl md:text-4xl font-medium text-foreground mb-12">
            Propelled by MIT.<br />
            <em className="text-gold">Anchored in Africa.</em>
          </h2>
        </RevealSection>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {team.map((member, i) => (
            <RevealSection key={member.role} delay={i * 0.1}>
              <div className={`border p-8 ${member.placeholder ? "border-dashed border-border" : "border-border bg-parchment-dark"}`}>
                <h3 className="font-display text-xl font-medium text-foreground mb-1">{member.name}</h3>
                <p className="font-label text-xs tracking-[0.15em] uppercase text-gold mb-4">{member.role}</p>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{member.desc}</p>
                {member.placeholder && (
                  <p className="font-label text-[10px] tracking-[0.2em] uppercase text-gold/50 mt-6">Recruiting</p>
                )}
              </div>
            </RevealSection>
          ))}
        </div>

        {/* Institutions */}
        <RevealSection>
          <div className="flex flex-wrap gap-4 justify-center mb-12">
            {["MIT Sloan Fellows MBA 2026", "Martin Trust Center", "MIT Sandbox Fund", "E14 Fund", "CSAIL", "Archbishop Tutu Fellowship"].map((inst) => (
              <span key={inst} className="font-label text-[10px] tracking-[0.15em] uppercase text-muted-foreground border border-border px-4 py-2">
                {inst}
              </span>
            ))}
          </div>
        </RevealSection>
      </div>
    </section>
  );
};

export default VisionSection;
