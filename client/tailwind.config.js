/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        cursive: ['Dancing Script', 'cursive'],
      },
      colors: {
        ink: '#0f172a',
        surface: '#1e293b',
        elevated: '#334155',
        accent: '#0891b2',
        'accent-hover': '#0e7490',
        cream: '#f8fafc',
        'custom-background': '#ebf3fa',
        'primary': '#7b10b0',
        'secondary': '#be5fed',
        'tertiary': '#bb80d9',
        "custom-light-purple": "#718EBF",
        "custom-purple": "#123288",
        "custom-bright-purple": "#1814F3",
        "custom-pink-red": "#FE5C73",
        "custom-greenish": "#16DBAA",
        "custom-light-grey": "#DFEAF2",
        "custom-light-dark": "#232323",
        "custom-faint-white": "#F4F5F7",
        "background": "#F5F7FA",
        "custom-light-orange": "#FFF5D9",
        "custom-light-blue": "#E7EDFF",
        "custom-light-teal": "#DCFAF8",
      }
    },
  },
  plugins: [],
}

