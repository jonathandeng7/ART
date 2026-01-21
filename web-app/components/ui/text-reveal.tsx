"use client";

import { motion } from "framer-motion";
import { FC } from "react";

import { cn } from "@/lib/utils";

interface TextRevealByWordProps {
  text: string;
  className?: string;
}

const TextRevealByWord: FC<TextRevealByWordProps> = ({ text, className }) => {
  const words = text.split(" ");

  return (
    <div className={cn("relative z-0", className)}>
      <div className="mx-auto flex items-center justify-center bg-transparent py-8">
        <p className="flex flex-wrap justify-center text-lg font-body text-gray-400 md:text-xl lg:text-2xl">
          {words.map((word, i) => {
            return (
              <Word key={i} delay={i * 0.2}>
                {word}
              </Word>
            );
          })}
        </p>
      </div>
    </div>
  );
};

interface WordProps {
  children: string;
  delay: number;
}

const Word: FC<WordProps> = ({ children, delay }) => {
  return (
    <span className="relative mx-1 lg:mx-1.5">
      <span className="absolute opacity-20">{children}</span>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay }}
        className="text-gray-900"
      >
        {children}
      </motion.span>
    </span>
  );
};

export { TextRevealByWord };
