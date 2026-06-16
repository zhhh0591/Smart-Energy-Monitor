import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./hooks/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ios: {
          bg: "#F2F2F7",
          card: "#FFFFFF",
          ink: "#1D1D1F",
          muted: "#8E8E93",
          green: "#34C759",
          red: "#FF3B30",
        },
      },
      boxShadow: {
        "ios-soft": "0 4px 24px rgba(0, 0, 0, 0.06)",
        "ios-soft-hover": "0 8px 32px rgba(0, 0, 0, 0.08)",
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", '"SF Pro Display"', '"Segoe UI"', "sans-serif"],
      },
      keyframes: {
        "card-in": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "card-in": "card-in 360ms ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
