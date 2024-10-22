import { Box } from "@chakra-ui/react";
import NextImage, { ImageProps as NextImageProps } from "next/image";
import { CSSProperties, useState } from "react";

interface ImageProps extends NextImageProps {
  imageStyle?: CSSProperties;
}

const Image = (props: ImageProps) => {
  const { imageStyle, ...nextImageProps } = props;

  return (
    <Box>
      <NextImage
        {...nextImageProps}
        placeholder="blur"
        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP89OlHPQAJFwNd45bXHQAAAABJRU5ErkJggg=="
        style={imageStyle}
      />
    </Box>
  );
};

export default Image;
