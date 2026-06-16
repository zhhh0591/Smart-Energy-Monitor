import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./hooks/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        panel: "#FFFFFF",
        steel: "#717171",
      },
      boxShadow: {
        soft: "0 18px 50px rgba(34, 34, 34, 0.07)",
        "soft-lg": "0 24px 70px rgba(34, 34, 34, 0.11)",
        "inner-soft": "inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 10px 30px rgba(34, 34, 34, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
