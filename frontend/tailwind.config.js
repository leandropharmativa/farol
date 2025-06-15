// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.css",
  ],
  theme: {
    extend: {
      colors: {
        farol: {
          primary: '#d4674c', //laranja
          secondary:'#67727e', //cinza
          focus: '#dde5e7', //cinza claro
	  linecolor: '#1791b1', //azul
	  solidos:'#d5a6bd',
          semisolidos:'#d9d2e9',
	  saches:'#f6b26b',
	  loc1:'#980000',
	  loc2:'#ffc8aa',
          loc3:'#bfe1f6',
	  loc4:'#ffe5a0',
	  loc5:'#e6cff2',
	  loc5:'#d4edbc',
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
