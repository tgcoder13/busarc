/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                gold: {
                    400: "#e5c158",
                    500: "#d4af37",
                    600: "#b89628",
                },
            },
            fontFamily: {
                cinzel: ["var(--font-cinzel)"],
                inter: ["var(--font-inter)"],
            },
            boxShadow: {
                glass: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 24px 60px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
                gold: "0 8px 20px -4px rgba(212, 175, 55, 0.4)",
            },
        },
    },
    plugins: [],
};
