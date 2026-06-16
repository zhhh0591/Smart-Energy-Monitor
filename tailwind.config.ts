import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./hooks/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        panel: "#FFFFFF",
        steel: "#86868B",
      },
      boxShadow: {
        apple: "0 22px 70px rgba(29, 29, 31, 0.08)",
        "apple-lg": "0 28px 90px rgba(29, 29, 31, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
