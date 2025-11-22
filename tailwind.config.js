/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",],
  theme: {
    extend: {
       screens: {
        'xs': '400px',// extra small devices
        'xs-sm':"500px"   
      },
    },
  },
  plugins: [],
}

