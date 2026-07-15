import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Light theme — premium SaaS (subtle blue-tinted whites, indigo accents)
        bg: {
          primary: "#FAFBFF",
          secondary: "#F0F2FB",
          card: "#FFFFFF",
          elevated: "#F5F7FD",
          hover: "#EAEDF9",
        },
        accent: {
          DEFAULT: "#6366F1",
          hover: "#4F46E5",
          light: "#818CF8",
        },
        success: "#16A34A",
        warning: "#F59E0B",
        error: "#DC2626",
        text: {
          primary: "#0F172A",
          secondary: "#475569",
          muted: "#94A3B8",
          disabled: "#CBD5E1",
        },
        border: "rgba(99,102,241,0.10)",
        // Dark theme — premium AI (deep navy with indigo glow)
        dark: {
          bg: {
            primary: "#0A0F1E",
            secondary: "#0F1525",
            card: "#141B2D",
            elevated: "#1A2138",
            hover: "#1E2640",
          },
          accent: {
            DEFAULT: "#818CF8",
            hover: "#6366F1",
          },
          text: {
            primary: "#F1F5F9",
            secondary: "#94A3B8",
            muted: "#64748B",
            disabled: "#475569",
          },
          border: "rgba(129,140,248,0.12)",
        },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(99,102,241,0.04), 0 1px 2px rgba(0,0,0,0.03)',
        'card-hover': '0 8px 24px -4px rgba(99,102,241,0.10), 0 2px 8px -2px rgba(0,0,0,0.04)',
        'glow': '0 0 20px rgba(99,102,241,0.15)',
        'glow-lg': '0 0 40px rgba(99,102,241,0.20)',
      },
      animation: {
        "fade-up": "fadeUp 0.4s ease both",
        shimmer: "shimmer 1.8s infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "none" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
