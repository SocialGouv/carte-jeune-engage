import { Image, useBreakpointValue } from "@chakra-ui/react";
import React from "react";
import { motion } from "framer-motion";

const EllipsePositionnedImages = ({
  images,
  parentRef,
}: {
  images: string[];
  parentRef: React.RefObject<HTMLDivElement>;
}) => {
  const imageSize = 100; // Image size
  const totalImages = images.length;
  const degreeOffset = useBreakpointValue({ base: 75, lg: 120 }) || 75;

  if (!parentRef.current) {
    return null;
  }

  // get radiusX and radiusY from parentRef
  const parentWidth = parentRef.current.clientWidth || 0;
  const parentHeight = parentRef.current.clientHeight || 0;
  const radiusX = parentWidth / 2;
  const radiusY = parentHeight / 1.25;

  // Image position for each index
  const calculatePosition = (index: number) => {
    const offsetAngle = -(degreeOffset * Math.PI) / 180; // Décalage de 75°
    const angle = (index / totalImages) * 2 * Math.PI + offsetAngle;
    const x = radiusX * Math.cos(angle);
    const y = radiusY * Math.sin(angle);
    let adjustedX = x;
    let adjustedY = y;
    // if (Math.abs(x) > radiusX * 0.8) {
    //   adjustedX = (x / Math.abs(x)) * radiusX * 0.95;
    //   adjustedY = (y / Math.abs(y)) * radiusY * 0.7;
    // }
    return { x: adjustedX, y: adjustedY };
  };

  return images.map((src, index) => {
    const { x, y } = calculatePosition(index);
    return (
      <motion.div
        key={src}
        initial={{ opacity: 0, x: -imageSize / 2, y: -imageSize / 2 }}
        animate={{ opacity: 1, x: x - imageSize / 2, y: y - imageSize / 2 }}
        transition={{ duration: 0.7, ease: "easeInOut", delay: 0.2 }}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%)`,
        }}
      >
        <Image
          src={src}
          boxSize={`${imageSize}px`} // Use the provided image size
        />
      </motion.div>
    );
  });
};

export default EllipsePositionnedImages;
