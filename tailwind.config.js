/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{ts,tsx,js,jsx,mdx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './state/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      heading: ['Space Grotesk', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      mono: ['Noto Sans Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
    },
    extend: {},
  },
  plugins: [],
};
