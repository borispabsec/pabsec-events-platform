import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0B1E3D",
          light: "#132848",
          dark:  "#070F20",
        },
        pabsec: {
          DEFAULT: "#1A5FA8",
          dark:    "#154d8a",
          light:   "#2472bf",
        },
        gold: {
          DEFAULT: "#C9A84C",
          light:   "#e0c070",
          dark:    "#a88630",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #070F20 0%, #0B1E3D 50%, #132848 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
