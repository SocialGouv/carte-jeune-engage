import React, { useEffect, useRef, useState } from "react";
import { Box } from "@chakra-ui/react";

const animationSpeed = 150; // from 0 to 200

export const ScrollAnimatedPerspectiveBox = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [rotation, setRotation] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (boxRef.current) {
        const parent = boxRef.current.parentElement;
        if (parent) {
          const rect = parent.getBoundingClientRect();
          const scrollPercentage =
            Math.abs(rect.top) / (window.innerHeight + rect.height);
          const newRotation = Math.min(
            animationSpeed,
            Math.max(0, scrollPercentage * animationSpeed)
          );
          setRotation(newRotation);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Box
      ref={boxRef}
      transform={`perspective(800px) rotateX(${rotation}deg)`}
      transformOrigin="50% 100%"
      transition="transform 0.1s ease-out"
      w="full"
    >
      {children}
    </Box>
  );
};
