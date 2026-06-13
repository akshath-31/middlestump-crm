/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        surface: '#FFFFFF',
        surface2: '#F1F5F9',
        border: '#E2E8F0',
        'text-primary': '#0F172A',
        'text-secondary': '#64748B',
        'text-muted': '#94A3B8',
        primary: '#16A34A',
        'primary-hover': '#15803D',
        'primary-light': '#DCFCE7',
        amber: '#D97706',
        'amber-light': '#FEF3C7',
        danger: '#DC2626',
        'danger-light': '#FEE2E2',
        info: '#2563EB',
        'info-light': '#DBEAFE',
        sidebar: '#0F172A',
        'sidebar-active': '#1E293B',
      }
    },
  },
  plugins: [],
}
