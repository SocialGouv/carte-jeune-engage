/* theme.ts */
import {
  StyleFunctionProps,
  extendTheme,
  theme as defaultTheme,
  defineStyle,
  defineStyleConfig,
} from "@chakra-ui/react";
import localFont from "next/font/local";
import { checkboxTheme } from "~/components/theme/checkbox";
import { modalTheme } from "~/components/theme/modal";
import { textareaTheme } from "~/components/theme/textarea";

export const Marianne = localFont({
  src: [
    {
      path: "../styles/fonts/Marianne-Thin.woff2",
      weight: "100",
      style: "normal",
    },
    {
      path: "../styles/fonts/Marianne-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../styles/fonts/Marianne-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../styles/fonts/Marianne-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../styles/fonts/Marianne-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../styles/fonts/Marianne-ExtraBold.woff2",
      weight: "900",
      style: "normal",
    },
  ],
});

export const dottedPattern = (bgColor: string) => ({
  _after: {
    content: `""`,
    position: "absolute",
    bottom: -2, // Adjust this value as needed to align with your design
    left: 0,
    right: 0,
    height: "40px", // This is the height of the pseudo-element
    backgroundImage: `radial-gradient(circle, ${bgColor} 8px, rgba(0, 0, 0, 0) 8px)`, // The color should be the same as the border color
    backgroundSize: "23px 17px", // Adjust the size of the dots
    backgroundRepeat: "repeat-x",
    backgroundPosition: "bottom",
  },
});

const activeLabelStyles = {
  transform: "scale(1) translateY(-14px)",
  fontSize: "xs",
};

export const theme = extendTheme({
  components: {
    Button: {
      sizes: {
        lg: {
          borderRadius: "2.25xl",
          py: 8,
          fontWeight: "bold",
        },
        md: {
          borderRadius: "2.25xl",
          py: 7,
          fontWeight: 800,
        },
        sm: {
          borderRadius: "lg",
          py: 12,
          fontWeight: "medium",
          whiteSpace: "normal",
        },
      },
      defaultProps: {
        size: "lg",
        colorScheme: "blackBtn",
      },
      variants: {
        solid: (props: StyleFunctionProps) => ({
          "@media(hover: none)": {
            _hover: {
              bg: defaultTheme.components.Button.variants?.solid(props).bg,
            },
          },
        }),
      },
    },
    Form: {
      variants: {
        floating: {
          container: {
            _focusWithin: {
              label: {
                ...activeLabelStyles,
              },
            },
            "input:not(:placeholder-shown) + label, .chakra-select__wrapper + label, .chakra-autocomplete-has-value + label, textarea:not(:placeholder-shown) ~ label":
              {
                ...activeLabelStyles,
              },
            label: {
              top: 0,
              left: 0,
              zIndex: 2,
              position: "absolute",
              pointerEvents: "none",
              mx: 5,
              my: 5,
              transformOrigin: "left top",
            },
          },
        },
      },
    },
    Textarea: textareaTheme,
    Modal: modalTheme,
    Checkbox: checkboxTheme,
  },
  styles: {
    global: () => ({
      html: {
        height: "100%",
      },
      body: {
        height: "100%",
        bg: "white",
      },
      main: {
        height: "100%",
      },
      "#__next": {
        height: "100%",
      },
    }),
  },
  colors: {
    primary: "#1698FC",
    primaryShades: {
      "50": "#edf8ff",
      "100": "#d6f0fe",
      "200": "#b5e3fe",
      "300": "#83d4fd",
      "400": "#47bcfd",
      "500": "#1698fc",
      "600": "#067bf6",
      "700": "#0f64d2",
      "800": "#1351aa",
      "900": "#154685",
      "950": "#122b51",
    },
    errorShades: {
      "50": "#fef3f1",
      "100": "#fde2de",
      "200": "#fbc9c2",
      "300": "#f8a498",
      "400": "#f5705d",
      "500": "#f13c22",
      "600": "#db361e",
      "700": "#ac2815",
      "800": "#8e2415",
      "900": "#742419",
      "950": "#400f08",
    },
    whiteBtn: {
      "50": "#FFFFFF",
      "100": "#FFFFFF",
      "200": "#FFFFFF",
      "300": "#FFFFFF",
      "400": "#FFFFFF",
      "500": "#FFFFFF",
      "600": "#FFFFFF",
      "700": "#FFFFFF",
      "800": "#FFFFFF",
      "900": "#FFFFFF",
    },
    blackBtn: {
      "50": "#20202C",
      "100": "#20202C",
      "200": "#20202C",
      "300": "#20202C",
      "400": "#20202C",
      "500": "#20202C",
      "600": "#20202C",
      "700": "#20202C",
      "800": "#20202C",
      "900": "#20202C",
    },
    "cje-gray": {
      "50": "#f6f7f9",
      "100": "#c5c7cb",
      "200": "#cfd1d5",
      "300": "#d9dbdf",
      "400": "#e3e5e9",
      "500": "#edeff3",
      "600": "#f7f9fd",
      "700": "#ffffff",
      "800": "#ffffff",
      "900": "#ffffff",
    },
    success: "#459F00",
    successLight: "#E9F6DF",
    error: "#F13C22",
    errorLight: "#FFE8E8",
    bgWhite: "#F7F7F7",
    bgGray: "#F2F2F8",
    disabled: "#8585AD",
    secondaryText: "#5C5C70",
    borderGray: "#B5BBBD",
    blackLight: "#20202C",
    frontBlack: "#1D1C25",
  },
  shadows: {
    "landing-phone-number-component":
      "0px 4px 9.9px 0px rgba(177, 177, 177, 0.25)",
    "landing-qr-code-desktop": "0px 0px 24.2px 0px rgba(145, 145, 145, 0.25)",
    default: "0px 24px 24px -10px #00000040",
    "default-wallet":
      "0px 24px 24px -10px #00000040, 0px -6px 24px -10px #00000040",
  },
  radii: {
    "2lg": "0.625rem",
    "1.5xl": "0.875rem",
    "2.25xl": "1.125rem",
    "2.5xl": "1.25rem",
    "4xl": "2rem",
    "5xl": "2.5rem",
  },
  fonts: {
    heading: Marianne.style.fontFamily,
    body: Marianne.style.fontFamily,
  },
  fontSizes: {
    xss: "0.7rem",
  },
  space: {
    "5.5": "1.375rem",
    18: "4.5rem",
  },
  sizes: {
    "18": "4.5rem",
  },
});
