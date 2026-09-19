import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./services/**/*.{js,ts,jsx,tsx,mdx}",
    "./contexts/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /** KBC Trip teal — CTAs, links, focus (distinct from Unotrips orange) */
        primary: "#0f766e",
        /** Cool supporting accent */
        accent: "#134e4a",
        surface: "#f0f4f3",
        ink: "#0f172a",
        success: "#16A34A",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
      },
      fontFamily: {
        /** Matches EaseMyTrip holidays UI (Roboto-first). @see https://www.easemytrip.com/holidays/ */
        sans: [
          "var(--font-roboto)",
          "Roboto",
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        display: [
          "var(--font-playfair-display)",
          "Georgia",
          "Times New Roman",
          "serif",
        ],
        /** Banner script line only. */
        script: ["var(--font-dancing-script)", "cursive"],
        /** Alias — same as `sans` (legacy `font-ease` classes). */
        ease: [
          "var(--font-roboto)",
          "Roboto",
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        glass: "0 8px 32px rgba(15, 23, 42, 0.08)",
        lift: "0 20px 40px -12px rgba(15, 118, 110, 0.22)",
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(135deg, #0b1f36 0%, #134e4a 42%, #0f766e 78%, #14b8a6 100%)",
        "accent-sweep":
          "linear-gradient(90deg, #99f6e4, #14b8a6, #0f766e)",
        "brand-banner":
          "linear-gradient(135deg, #0b1f36 0%, #134e4a 36%, #0f766e 68%, #5eead4 100%)",
      },
      keyframes: {
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        // Short, small-amplitude nudge for invalid form fields. Deliberately
        // subtle: large shakes are unpleasant for people with vestibular
        // sensitivity, and it is only ever applied via `motion-safe:` so it
        // disappears entirely under prefers-reduced-motion.
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%, 60%": { transform: "translateX(-4px)" },
          "40%, 80%": { transform: "translateX(4px)" },
        },
        // Identical to `shake`. Alternating between the two on repeated failed
        // submits changes animation-name, which restarts the animation. Using
        // a React `key` to force a remount would reset these uncontrolled
        // inputs and erase whatever the guest had typed.
        "shake-alt": {
          "0%, 100%": { transform: "translateX(0)" },
          "20%, 60%": { transform: "translateX(-4px)" },
          "40%, 80%": { transform: "translateX(4px)" },
        },
        // Brief tint when a recalculated price lands, so the number visibly
        // "arrives" instead of silently swapping under the reader. Two
        // identical keyframes so the animation can restart by swapping
        // animation-name - never by remounting the node.
        "price-settle": {
          "0%":   { backgroundColor: "rgba(239,102,20,0.16)" },
          "100%": { backgroundColor: "transparent" },
        },
        "price-settle-alt": {
          "0%":   { backgroundColor: "rgba(239,102,20,0.16)" },
          "100%": { backgroundColor: "transparent" },
        },
      },
      animation: {
        "gradient-x": "gradient-x 8s ease infinite",
        float: "float 6s ease-in-out infinite",
        shake: "shake 0.35s ease-in-out 1",
        "shake-alt": "shake-alt 0.35s ease-in-out 1",
        "price-settle": "price-settle 0.7s ease-out 1",
        "price-settle-alt": "price-settle-alt 0.7s ease-out 1",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;