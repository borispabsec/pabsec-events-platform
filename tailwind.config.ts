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
          dark: "#070F20",
        },
        pabsec: {
          DEFAULT: "#1A5FA8",
          dark: "#154d8a",
          light: "#2472bf",
        },
        gold: {
          DEFAULT: "#C9A84C",
          light: "#e0c070",
          dark: "#a88630",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        playfair: ["var(--font-playfair)", "Georgia", "serif"],
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(150deg, #070F20 0%, #0B1E3D 60%, #0d2346 100%)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInRight: {
          "0%": { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out both",
        "fade-in-up": "fadeInUp 0.7s ease-out both",
        "fade-in-right": "fadeInRight 0.7s ease-out both",
      },
      boxShadow: {
        card: "0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)",
        "card-hover": "0 8px 30px rgba(0,0,0,0.10), 0 24px 48px rgba(0,0,0,0.06)",
        premium: "0 4px 16px rgba(11,30,61,0.08), 0 16px 40px rgba(11,30,61,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
