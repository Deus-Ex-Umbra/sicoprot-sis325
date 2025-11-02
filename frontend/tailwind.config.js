import { defineConfig } from "tailwindcss";

export default defineConfig({
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--colors-background)",
        foreground: "var(--colors-foreground)",
        card: {
          DEFAULT: "var(--colors-card)",
          foreground: "var(--colors-card-foreground)",
        },
        popover: {
          DEFAULT: "var(--colors-popover)",
          foreground: "var(--colors-popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--colors-primary)",
          foreground: "var(--colors-primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--colors-secondary)",
          foreground: "var(--colors-secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--colors-muted)",
          foreground: "var(--colors-muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--colors-accent)",
          foreground: "var(--colors-accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--colors-destructive)",
          foreground: "var(--colors-destructive-foreground)",
        },
        border: "var(--colors-border)",
        input: "var(--colors-input)",
        ring: "var(--colors-ring)",
        chart: {
          1: "var(--colors-chart-1)",
          2: "var(--colors-chart-2)",
          3: "var(--colors-chart-3)",
          4: "var(--colors-chart-4)",
          5: "var(--colors-chart-5)",
        },
      },
    },
  },
  plugins: [
    require("tw-animate-css"),
  ],
});