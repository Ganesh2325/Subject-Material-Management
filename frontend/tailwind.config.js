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
        acosBorder: 'rgba(148, 163, 184, 0.35)',
        primary: {
          100: '#DBEAFE',
          400: '#3B82F6',
          500: '#2563EB',
          600: '#1E3A8A'
        },
        acad: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          sidebar: '#0F172A',
          border: '#E2E8F0',
          text: '#0F172A',
          muted: '#64748B',
          success: '#16A34A',
          danger: '#DC2626'
        }
      },
      fontFamily: {
        display: ['"DM Sans"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'acos-soft': '0 22px 45px rgba(15,23,42,0.55)',
        'acad-card': '0 18px 40px rgba(15, 23, 42, 0.12)'
      },
      transitionProperty: {
        'colors-transform':
          'background-color, border-color, color, fill, stroke, box-shadow, transform'
      },
      transitionDuration: {
        200: '200ms',
        250: '250ms',
        300: '300ms'
      },
      transitionTimingFunction: {
        'soft-out': 'cubic-bezier(0.16, 0.84, 0.44, 1)'
      }
    }
  },
  plugins: []
};

