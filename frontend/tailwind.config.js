/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090B",
        'surface-primary': "#0F1117",
        'surface-secondary': "#111318",
        'surface-elevated': "#151923",
        border: "#27272A",
        'border-subtle': "#1D2028",
        'brand-purple': "#7C3AED",
        'brand-purple-bright': "#8B5CF6",
        'brand-purple-light': "#A78BFA",
        'accent-blue': "#38BDF8",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        'text-primary': "#F8FAFC",
        'text-secondary': "#CBD5E1",
        'text-muted': "#94A3B8",
        'text-disabled': "#64748B",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 10px 40px rgba(0, 0, 0, 0.25)',
        'purple-glow': '0 0 15px rgba(124, 58, 237, 0.15)',
      }
    },
  },
  plugins: [],
}
