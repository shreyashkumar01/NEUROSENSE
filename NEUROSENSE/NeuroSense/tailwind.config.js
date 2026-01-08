import tailwindAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./views/**/*.{js,ts,jsx,tsx}",
        "./App.tsx",
    ],
    theme: {
        screens: {
            'xs': '360px',
            // => @media (min-width: 360px) { ... }
            'sm': '640px',
            // => @media (min-width: 640px) { ... }
            'md': '768px',
            // => @media (min-width: 768px) { ... }
            'lg': '1024px',
            // => @media (min-width: 1024px) { ... }
            'xl': '1280px',
            // => @media (min-width: 1280px) { ... }
            '2xl': '1536px',
            // => @media (min-width: 1536px) { ... }
        },
        extend: {
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                chart: {
                    cyan: "hsl(var(--chart-cyan))",
                    blue: "hsl(var(--chart-blue))",
                    green: "hsl(var(--chart-green))",
                    orange: "hsl(var(--chart-orange))",
                    red: "hsl(var(--chart-red))",
                    purple: "hsl(var(--chart-purple))",
                    yellow: "hsl(var(--chart-yellow))",
                },
                status: {
                    good: "hsl(var(--status-good))",
                    warning: "hsl(var(--status-warning))",
                    critical: "hsl(var(--status-critical))",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
        },
    },
    plugins: [tailwindAnimate],
};
