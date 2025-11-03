import { motion } from "framer-motion";
import brainVisual from "@/assets/brain-neural-visual.png";

export function NeuralVisual() {
  return (
    <motion.div
      className="fixed top-20 right-0 w-[500px] opacity-50 pointer-events-none z-[5] hidden lg:block"
      initial={{ opacity: 0, y: -20 }}
      animate={{ 
        opacity: [0.4, 0.6, 0.4],
        y: [0, -15, 0],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <img 
        src={brainVisual} 
        alt="" 
        className="w-full h-auto drop-shadow-[0_0_40px_rgba(168,85,247,0.5)]"
        style={{
          filter: "brightness(1.1) contrast(1.2)",
          mixBlendMode: "screen"
        }}
      />
    </motion.div>
  );
}
