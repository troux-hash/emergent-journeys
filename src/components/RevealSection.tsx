import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, forwardRef } from "react";

interface RevealSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const RevealSection = forwardRef<HTMLDivElement, RevealSectionProps>(
  ({ children, className = "", delay = 0 }, _forwardedRef) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-80px" });

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: "easeOut", delay }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }
);

RevealSection.displayName = "RevealSection";

export default RevealSection;
