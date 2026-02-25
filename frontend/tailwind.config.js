/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        acosBg: '#020617',
        acosAccent: '#22c55e',
        acosAccentSoft: '#16a34a',
        acosPanel: '#020617',
        acosBorder: 'rgba(148, 163, 184, 0.35)'
      },
      fontFamily: {
        display: ['"DM Sans"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'acos-soft': '0 22px 45px rgba(15,23,42,0.55)'
      }
    }
  },
  plugins: []
};

