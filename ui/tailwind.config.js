/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,html}"],
  theme: {
    extend: {
      colors: {
        "whatsapp-green": "#00a884",
        "whatsapp-green-dark": "#029e76",
        "whatsapp-gray": "#f0f2f5",
        "whatsapp-text": "#111b21",
        "whatsapp-header": "#3b4a54",
      },
    },
  },
  plugins: [],
};
