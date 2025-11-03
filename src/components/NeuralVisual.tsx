import { motion } from "framer-motion";
import brainVisual from "@/assets/brain-neural-visual.png";

export function NeuralVisual() {
  return (
    <motion.div
      className="fixed top-0 right-[-150px] w-[900px] xl:w-[1000px] opacity-80 pointer-events-none z-[8] hidden lg:block"
      initial={{ opacity: 0, y: -20, rotate: -2 }}
      animate={{ 
        opacity: [0.7, 0.95, 0.7],
        y: [0, -30, 0],
        rotate: [-2, 2, -2],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <img 
        src={brainVisual} 
        alt="" 
        className="w-full h-auto drop-shadow-[0_0_80px_rgba(168,85,247,0.9)]"
        style={{
          filter: "brightness(1.3) contrast(1.4) saturate(1.2)",
          mixBlendMode: "screen"
        }}
      />
    </motion.div>
  );
}
