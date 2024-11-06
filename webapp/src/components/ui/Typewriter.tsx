import { motion, Variants } from "framer-motion";
import { HTMLMotionProps } from "framer-motion";
import React, { useState } from "react";
import { useInterval } from "usehooks-ts";

export const sentenceVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.5,
      // duration: 1,
      repeat: Infinity,
      repeatType: "reverse",
      repeatDelay: 2,
    },
  },
};

export const letterVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      opacity: {
        duration: 0,
      },
    },
  },
};

interface TypewriterProps extends Omit<HTMLMotionProps<"p">, "children"> {
  text: string;
}

export const Typewriter: React.FC<TypewriterProps> = ({ text, ...rest }) => {
  const [count, setCount] = useState(0);

  useInterval(() => {
    setCount(count + 1);
  }, 2000);

  return (
    <motion.span
      key={count}
      variants={sentenceVariants}
      initial="hidden"
      animate="visible"
      {...rest}
    >
      {text.split("").map((char, i) => (
        <motion.span key={`${char}-${i}`} variants={letterVariants}>
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
};
