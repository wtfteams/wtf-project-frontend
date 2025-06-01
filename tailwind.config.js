/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#192230",
        secondary: "#ffcd00",
        tertiary: "#2c2f38",
        fourth: "#3d474e",
      },
      textColor: {
        textWhite: "#FFFFFF",
        textBlack: "#000000",
        textWhiteShade: "#FFFFFF80",
      },
      fontFamily: {
        "poppins-regular": ["Poppins_400Regular"],
        "poppins-medium": ["Poppins_500Medium"],
        "poppins-semibold": ["Poppins_600SemiBold"],
        "poppins-bold": ["Poppins_700Bold"],
      },
    },
  },
  plugins: [],
};
