// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.css",
  ],
  safelist: [
    'bg-farol-loc1',
    'bg-farol-loc2',
    'bg-farol-loc3',
    'bg-farol-loc4',
    'bg-farol-loc5',
    'bg-farol-loc6',
    'text-white', // necessário se não houver uso estático
  ],
  theme: {
    extend: {
      colors: {
        farol: {
          primary: '#d4674c',
          secondary:'#67727e',
          focus: '#dde5e7',
          linecolor: '#1791b1',
          solidos:'#d5a6bd',
          semisolidos:'#d9d2e9',
          saches:'#f6b26b',
          loc1:'#980000',
          loc2:'#ffc8aa',
          loc3:'#bfe1f6',
          loc4:'#ffe5a0',
          loc5:'#e6cff2',
          loc6:'#d4edbc',
          loc7:'#6aa84f',
          loc8:'#6fa8dc',
          loc9:'#f9cb9c',
          loc10:'#dd7e6b',
        },
      },
      fontFamily: {
        sans: ['Lato', 'sans-serif'],
        pacifico: ['Pacifico', 'cursive'],
      },
    },
  },
  plugins: [],
}
