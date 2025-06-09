import { heroui } from "@heroui/react";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      layout: {
        dividerWeight: "1px",
        disabledOpacity: 0.45,
        fontSize: {
          tiny: "0.75rem", // 12px
          small: "0.875rem", // 14px
          medium: "0.9375rem", // 15px
          large: "1.125rem", // 18px
        },
        lineHeight: {
          tiny: "1rem",
          small: "1.25rem",
          medium: "1.5rem",
          large: "1.75rem",
        },
        radius: {
          small: "4px",
          medium: "8px",
          large: "12px",
        },
        borderWidth: {
          small: "1px",
          medium: "1px",
          large: "2px",
        },
      },
      themes: {
        light: {
          colors: {
            background: {
              DEFAULT: "#FFFFFF",
            },
            content1: {
              DEFAULT: "#FFFFFF",
              foreground: "#202124",
            },
            content2: {
              DEFAULT: "#F5F5F5",
              foreground: "#202124",
            },
            content3: {
              DEFAULT: "#E8EAED",
              foreground: "#202124",
            },
            content4: {
              DEFAULT: "#DADCE0",
              foreground: "#202124",
            },
            divider: {
              DEFAULT: "rgba(0, 0, 0, 0.12)",
            },
            focus: {
              DEFAULT: "#4285F4",
            },
            foreground: {
              50: "#F8F9FA",
              100: "#F5F5F5",
              200: "#E8EAED",
              300: "#DADCE0",
              400: "#BDC1C6",
              500: "#9AA0A6",
              600: "#5F6368",
              700: "#3C4043",
              800: "#202124",
              900: "#171717",
              DEFAULT: "#202124",
            },
            overlay: {
              DEFAULT: "#000000",
            },
            danger: {
              50: "#FEECEB",
              100: "#FDD9D7",
              200: "#FBB3AF",
              300: "#F98D87",
              400: "#F7665F",
              500: "#EA4335", // Google Red
              600: "#D33C2F",
              700: "#B33228",
              800: "#8D2820",
              900: "#661D18",
              DEFAULT: "#EA4335",
              foreground: "#FFFFFF",
            },
            default: {
              50: "#F8F9FA",
              100: "#F5F5F5",
              200: "#E8EAED",
              300: "#DADCE0",
              400: "#BDC1C6",
              500: "#9AA0A6",
              600: "#5F6368",
              700: "#3C4043",
              800: "#202124",
              900: "#171717",
              DEFAULT: "#DADCE0",
              foreground: "#202124",
            },
            primary: {
              50: "#E8F0FE",
              100: "#D2E3FC",
              200: "#A6C7FF",
              300: "#79ABFF",
              400: "#4D8EFC",
              500: "#4285F4", // Google Blue
              600: "#3B77DB",
              700: "#3367D6",
              800: "#2A56C6",
              900: "#1E3A8A",
              DEFAULT: "#4285F4",
              foreground: "#FFFFFF",
            },
            secondary: {
              50: "#F3E8FD",
              100: "#E9D2FD",
              200: "#D7AEFB",
              300: "#C58AF9",
              400: "#AF5CF7",
              500: "#A142F4",
              600: "#853FB3",
              700: "#693C9E",
              800: "#4E2A7A",
              900: "#331C51",
              DEFAULT: "#A142F4",
              foreground: "#FFFFFF",
            },
            success: {
              50: "#E6F4EA",
              100: "#CEEAD6",
              200: "#9DD5AC",
              300: "#6DC083",
              400: "#3CAB59",
              500: "#34A853", // Google Green
              600: "#2E974A",
              700: "#287E3E",
              800: "#206432",
              900: "#174D26",
              DEFAULT: "#34A853",
              foreground: "#FFFFFF",
            },
            warning: {
              50: "#FEF7E0",
              100: "#FEEFC3",
              200: "#FDE293",
              300: "#FDD663",
              400: "#FCC934",
              500: "#FBBC04", // Google Yellow
              600: "#E2A904",
              700: "#B58803",
              800: "#896603",
              900: "#5C4402",
              DEFAULT: "#FBBC04",
              foreground: "#202124",
            },
          },
        },
      },
    }),
  ],
};
export default config;
