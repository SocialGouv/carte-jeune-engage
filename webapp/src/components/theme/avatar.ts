import { avatarAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(avatarAnatomy.keys);

const baseStyle = definePartsStyle({
  container: {
    ...Array.from({ length: 20 }, (_, i) => ({
      [`&:nth-last-child(${i})`]: {
        zIndex: i,
      },
    })).reduce((acc, val) => ({ ...acc, ...val }), {}),
  },
  excessLabel: {
    zIndex: 20,
  },
});

export const avatarTheme = defineMultiStyleConfig({ baseStyle });
