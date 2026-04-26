/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  corePlugins: {
    // disable Tailwind's preflight so it does not conflict with Ant Design.
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
};
