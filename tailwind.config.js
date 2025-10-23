import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coral: {
          DEFAULT: "#FF6B6B",
          light: "#FF8787",
          dark: "#E85555",
          darker: "#CC4444",
        },
        gunmetal: {
          DEFAULT: "#2A2D34",
          light: "#3A3D44",
          dark: "#1A1D24",
          darker: "#0A0D14",
        },
        silver: {
          DEFAULT: "#C5C6C7",
          light: "#D5D6D7",
          dark: "#B5B6B7",
        },
        paynesgray: {
          DEFAULT: "#4A5A6A",
          light: "#5A6A7A",
          dark: "#3A4A5A",
          darker: "#2A3A4A",
        },
      },
      fontFamily: {
        lato: ["Lato", "sans-serif"],
        fenix: ["Fenix", "serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
