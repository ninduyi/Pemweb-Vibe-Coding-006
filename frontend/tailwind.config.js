/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0A1A44',
          soft: '#22346C',
        },
        gold: '#F4C430',
        success: '#3EB489',
        lightGray: '#F6F7FA',
      },
    },
  },
  plugins: [],
}
