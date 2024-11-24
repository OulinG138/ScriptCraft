/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}", // Include the app directory if you're using App Router (Next.js 13+)
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/container-queries'),
  ],
  experimental: {
    containerQueries: true,
  },
}
