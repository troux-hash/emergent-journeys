import { useEffect, useRef, useState } from "react";
import { Globe } from "lucide-react";

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

const languages = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "zh-CN", label: "中文" },
  { code: "pt", label: "Português" },
  { code: "rw", label: "Kinyarwanda" },
];

const LanguageSwitcher = () => {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Google Translate script
    if (document.getElementById("google-translate-script")) {
      setReady(true);
      return;
    }

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,fr,zh-CN,pt,rw",
          autoDisplay: false,
        },
        "google_translate_element"
      );
      setReady(true);
    };

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const switchLanguage = (langCode: string) => {
    const select = document.querySelector(
      ".goog-te-combo"
    ) as HTMLSelectElement | null;
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event("change"));
    }
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      {/* Hidden Google Translate element */}
      <div id="google_translate_element" className="hidden" />

      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 font-label text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors p-2"
        aria-label="Change language"
      >
        <Globe size={15} strokeWidth={1.5} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 bg-parchment border border-border shadow-md min-w-[140px] z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLanguage(lang.code)}
              className="w-full text-left px-4 py-2.5 font-body text-sm text-foreground hover:bg-parchment-dark transition-colors"
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
