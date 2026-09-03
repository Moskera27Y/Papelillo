import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#FFFDF9",
          soft: "#FFF7E8",
          cream: "#FBF4E3",
        },
        ink: {
          DEFAULT: "#0A0A0A",
          muted: "#4B4B4B",
        },
        brand: {
          red: "#FF2B32",
          yellow: "#FFD000",
          green: "#78D64B",
          blue: "#5274E8",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        sticker: "4px 4px 0 0 rgba(10,10,10,0.9)",
        "sticker-sm": "3px 3px 0 0 rgba(10,10,10,0.85)",
        "sticker-lg": "6px 6px 0 0 rgba(10,10,10,0.9)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-8px) rotate(1.5deg)" },
        },
        "float-gentle": {
          "0%,100%": { transform: "translateY(0) translateX(0) rotate(var(--float-rotate, 0deg))" },
          "25%": { transform: "translateY(-6px) translateX(3px) rotate(calc(var(--float-rotate, 0deg) + 1deg))" },
          "50%": { transform: "translateY(-10px) translateX(-2px) rotate(calc(var(--float-rotate, 0deg) - 0.5deg))" },
          "75%": { transform: "translateY(-4px) translateX(4px) rotate(calc(var(--float-rotate, 0deg) + 0.5deg))" },
        },
        "float-paper": {
          "0%,100%": { transform: "translateY(0) rotate(var(--paper-rotate, 0deg))" },
          "33%": { transform: "translateY(-7px) rotate(calc(var(--paper-rotate, 0deg) + 1.2deg))" },
          "66%": { transform: "translateY(-3px) rotate(calc(var(--paper-rotate, 0deg) - 0.8deg))" },
        },
        wiggle: {
          "0%,100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        "wiggle-soft": {
          "0%,100%": { transform: "rotate(-1.5deg)" },
          "50%": { transform: "rotate(1.5deg)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pop: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "drop-in": {
          "0%": { opacity: "0", transform: "translateY(-20px) rotate(var(--drop-rotate, -8deg)) scale(0.9)" },
          "60%": { opacity: "1", transform: "translateY(4px) rotate(var(--drop-rotate, -8deg)) scale(1.02)" },
          "100%": { opacity: "1", transform: "translateY(0) rotate(var(--drop-rotate, -8deg)) scale(1)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.85)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "draw-line": {
          "0%": { strokeDashoffset: "200" },
          "100%": { strokeDashoffset: "0" },
        },
        bounce: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "pulse-soft": {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "pulse-slow": {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
        "float-bob": {
          "0%,100%": { transform: "translateY(0) rotate(0deg)" },
          "33%": { transform: "translateY(-6px) rotate(1deg)" },
          "66%": { transform: "translateY(-3px) rotate(-0.5deg)" },
        },
        "sticker-peel": {
          "0%": { transform: "rotate(var(--drop-rotate, 0deg)) scale(0.9)", opacity: "0" },
          "50%": { transform: "rotate(var(--drop-rotate, 0deg)) scale(1.03)", opacity: "1" },
          "100%": { transform: "rotate(var(--drop-rotate, 0deg)) scale(1)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "gradient-x": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 9s ease-in-out infinite",
        "float-gentle": "float-gentle 7s ease-in-out infinite",
        "float-paper": "float-paper 5s ease-in-out infinite",
        "float-slower": "float-gentle 11s ease-in-out infinite",
        "float-bob": "float-bob 4s ease-in-out infinite",
        wiggle: "wiggle 4s ease-in-out infinite",
        "wiggle-soft": "wiggle-soft 5s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
        "fade-up": "fade-up 0.7s cubic-bezier(.2,.7,.2,1) both",
        "fade-in": "fade-in 0.6s ease-out both",
        pop: "pop 0.5s cubic-bezier(.2,.7,.2,1) both",
        "slide-in-left": "slide-in-left 0.7s cubic-bezier(.2,.7,.2,1) both",
        "slide-in-right": "slide-in-right 0.7s cubic-bezier(.2,.7,.2,1) both",
        "drop-in": "drop-in 0.8s cubic-bezier(.2,.7,.2,1) both",
        "scale-in": "scale-in 0.5s cubic-bezier(.2,.7,.2,1) both",
        "draw-line": "draw-line 1.2s ease-out both",
        bounce: "bounce 2s ease-in-out infinite",
        "spin-slow": "spin-slow 20s linear infinite",
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
        "pulse-slow": "pulse-slow 8s ease-in-out infinite",
        "sticker-peel": "sticker-peel 0.6s cubic-bezier(.2,.7,.2,1) both",
        shimmer: "shimmer 2s linear infinite",
        "gradient-x": "gradient-x 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
