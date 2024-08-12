/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4D4D4D",
      },
      spacing: {
      },
      inset: {
      },
      borderRadius: {
      },
      backgroundImage: {
        'wp-pattern': "linear-gradient(0deg, var(--wallpaper-primary-color) 0%, var(--wallpaper-secondary-color) 100%)",
      },
    },
  },
  plugins: [],
}