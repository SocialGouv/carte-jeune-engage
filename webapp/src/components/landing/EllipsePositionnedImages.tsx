import { Image, useBreakpointValue } from "@chakra-ui/react";
import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";

const EllipsePositionnedImages = ({
  images,
  parentRef,
  isPlayingAnimation,
}: {
  images: string[];
  parentRef: React.RefObject<HTMLDivElement>;
  isPlayingAnimation?: boolean;
}) => {
  const [degreeOffset, setDegreeOffset] = useState(
    useBreakpointValue({ base: 75, lg: 120 }, { ssr: false })
  );

  const isMobile = useBreakpointValue(
    { base: true, lg: false },
    { ssr: false }
  );

  const totalImages = images.length;
  const defaultImageSize = useBreakpointValue({ base: 85, lg: 150 }) || 100;
  const defaultAdjustedImageSize =
    useBreakpointValue({ base: 90, lg: 125 }) || 100;
  const defaultRadiusX = useBreakpointValue({ base: 2.25, lg: 2 }) || 2;
  const defaultRadiusY = useBreakpointValue({ base: 1.3, lg: 1.1125 }) || 1;

  useEffect(() => {
    if (isMobile || !isPlayingAnimation) return;
    const interval = setInterval(() => {
      // rotate by 0.5 image every 2 seconds
      setDegreeOffset((prev) =>
        prev !== undefined ? (prev - 360 / (totalImages * 2)) % 360 : prev
      );
    }, 2000);
    return () => clearInterval(interval);
  }, [isPlayingAnimation]);

  const getImagesRender = useCallback(() => {
    return images.map((src, index) => {
      const { x, y, imageSize } = calculatePosition(index);
      return (
        <motion.div
          key={src}
          initial={{
            opacity: 0,
            x: -imageSize / 2,
            y: -imageSize / 2,
            width: defaultImageSize,
            height: defaultImageSize,
          }}
          animate={{
            opacity: 1,
            x: x - imageSize / 2,
            y: y - imageSize / 2,
            width: imageSize,
            height: imageSize,
          }}
          transition={{
            duration: 0.7,
            ease: "easeInOut",
            delay: 0.2,
          }}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            rotate: index % 2 === 0 ? 5 : -7.5,
          }}
        >
          <Image src={src} boxSize={"full"} />
        </motion.div>
      );
    });
  }, [images, degreeOffset]);

  if (!parentRef.current) {
    return null;
  }

  // get radiusX and radiusY from parentRef
  const parentWidth = isMobile
    ? parentRef.current.clientWidth * 1.2
    : parentRef.current.clientWidth || 0;
  const parentHeight = isMobile
    ? parentRef.current.clientHeight * 1.1
    : parentRef.current.clientHeight || 0;
  const radiusX = parentWidth / defaultRadiusX;
  const radiusY = parentHeight / defaultRadiusY;

  // Image position for each index
  const calculatePosition = (index: number) => {
    if (degreeOffset === undefined) return { x: 0, y: 0, imageSize: 0 };
    const offsetAngle = -(degreeOffset * Math.PI) / 180;
    const angle = (index / totalImages) * 2 * Math.PI + offsetAngle;
    const x = radiusX * Math.cos(angle);
    const y = radiusY * Math.sin(angle);

    const perspectiveFactor = (y + radiusY) / (2 * radiusY); // Valeur entre 0 et 1
    const imageSize =
      defaultAdjustedImageSize + perspectiveFactor * (defaultImageSize * 0.5);

    return {
      x: x,
      y: y,
      imageSize:
        imageSize < defaultAdjustedImageSize
          ? defaultAdjustedImageSize
          : imageSize,
    };
  };

  return getImagesRender();
};

export default EllipsePositionnedImages;
