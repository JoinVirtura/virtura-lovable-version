import { motion } from "framer-motion";
import brainVisual from "@/assets/brain-neural-visual.png";

export function NeuralVisual() {
  return (
    <motion.div
      className="absolute top-0 right-0 translate-x-[0%] -translate-y-[10%]
                 w-[1000px] md:w-[800px] lg:w-[900px] xl:w-[1100px] 2xl:w-[1200px]
                 opacity-30 md:opacity-35 lg:opacity-40
                 pointer-events-none z-[5]
                 hidden md:block"
      initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
      animate={{ 
        opacity: [0.3, 0.45, 0.3],
        scale: [1, 1.05, 1],
        rotate: [-5, 5, -5],
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <img 
        src={brainVisual} 
        alt="" 
        className="w-full h-auto drop-shadow-[0_0_120px_rgba(168,85,247,0.8)]"
        style={{
          filter: "brightness(1.4) contrast(1.5) saturate(1.3) blur(0.5px)",
          mixBlendMode: "screen"
        }}
      />
    </motion.div>
  );
}
