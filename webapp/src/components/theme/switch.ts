import { defineStyleConfig } from "@chakra-ui/react";

export const switchTheme = defineStyleConfig({
  baseStyle: {
    thumb: {
      borderRadius: "6px",
      _checked: {
        "&::after": {
          content: '"✓"',
          color: "success",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translateX(-50%)translateY(-50%)",
        },
      },
    },
    track: {
      borderRadius: "8px",
      _checked: {
        bg: "success",
      },
    },
  },
});
