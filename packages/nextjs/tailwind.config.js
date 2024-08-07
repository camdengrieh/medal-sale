/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
    "node_modules/daisyui/dist/**/*.js",
    "node_modules/react-daisyui/dist/**/*.js",
  ],
  plugins: [require("daisyui")],
  darkTheme: "dark",
  darkMode: ["selector", "[data-theme='dark']"],
  // DaisyUI theme colors
  daisyui: {
    themes: [
      {
        light: {
          primary: "#A3C4F3", // Pastel blue
          "primary-content": "#383838", // Dark gray for contrast
          secondary: "#FCB131", // header buttons
          "secondary-content": "#FFFFFF", // Dark gray for contrast
          accent: "#F4A7A3", // Pastel red
          "accent-content": "#383838", // Dark gray for contrast
          neutral: "#383838", // Dark gray
          "neutral-content": "#FFFFFF", // Cream for white content
          "base-100": "#0F0F0F", // Cream for base
          "base-200": "#0F0F0F", // Lighter cream for base
          "base-300": "#242323", // Pastel cream for base
          "base-400": "#E8C298", // Pastel cream for base
          "base-content": "#FFFFFF", // Dark gray for contrast
          info: "#A3C4F3", // Pastel blue
          success: "#A8E3A0", // Pastel green
          warning: "#FAD792", // Pastel yellow
          error: "#F4A7A3", // Pastel red

          "--rounded-btn": "9999rem",

          ".tooltip": {
            "--tooltip-tail": "6px",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "80%",
          },
        },
      },
      {
        dark: {
          primary: "#A3C4F3", // Pastel blue
          "primary-content": "#383838", // Dark gray for contrast
          secondary: "#FCB131", // header buttons
          "secondary-content": "#FFFFFF", // Dark gray for contrast
          accent: "#F4A7A3", // Pastel red
          "accent-content": "#383838", // Dark gray for contrast
          neutral: "#383838", // Dark gray
          "neutral-content": "#FFFFFF", // Cream for white content
          "base-100": "#0F0F0F", // Cream for base
          "base-200": "#0F0F0F", // Lighter cream for base
          "base-300": "#242323", // Pastel cream for base
          "base-400": "#E8C298", // Pastel cream for base
          "base-content": "#FFFFFF", // Dark gray for contrast
          info: "#A3C4F3", // Pastel blue
          success: "#A8E3A0", // Pastel green
          warning: "#FAD792", // Pastel yellow
          error: "#F4A7A3", // Pastel red

          "--rounded-btn": "9999rem",

          ".tooltip": {
            "--tooltip-tail": "6px",
            "--tooltip-color": "oklch(var(--p))",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "80%",
          },
        },
      },
    ],
  },
  theme: {
    extend: {
      boxShadow: {
        center: "0 0 12px -2px rgb(0 0 0 / 0.05)",
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        border: 'border 4s ease infinite',
      },
      keyframes: {
        border: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
};
