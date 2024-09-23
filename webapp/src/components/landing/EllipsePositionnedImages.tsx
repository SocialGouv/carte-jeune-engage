import { Image, useBreakpointValue } from "@chakra-ui/react";
import React from "react";

const EllipsePositionnedImages = ({
  images,
  radiusX,
  radiusY,
}: {
  images: string[];
  radiusX: number;
  radiusY: number;
}) => {
  const imageSize = 100; // Image size
  const totalImages = images.length;

  // Image position for each index
  const calculatePosition = (index: number) => {
    const offsetAngle = -(120 * Math.PI) / 180; // Décalage de 75°
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
      <Image
        key={src}
        src={src}
        boxSize={`${imageSize}px`}
        position="absolute"
        left={`calc(50% + ${x}px - ${imageSize / 2}px)`}
        top={`calc(50% + ${y}px - ${imageSize / 2}px)`}
      />
    );
  });
};

export default EllipsePositionnedImages;
