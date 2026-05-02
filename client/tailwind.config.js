/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'barf-brown': '#3A2618',
                'barf-beige': '#E9DCC9',
                'barf-gold': '#D4AF37',
                'barf-sand': '#F5F5DC',
                'barf-dark': '#2A1B11',
                'ui-bg': 'var(--ui-bg)',
                'ui-text': 'var(--ui-text)',
                'ui-muted': 'var(--ui-muted)',
                'ui-border': 'var(--ui-border)',
                'ui-card': 'var(--ui-card)',
                'ui-accent': 'var(--ui-accent)',
                'ui-success': 'var(--ui-success)',
                'ui-warning': 'var(--ui-warning)',
                'ui-danger': 'var(--ui-danger)',
                'ui-nav-bg': 'var(--ui-nav-bg)',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            borderRadius: {
                '2xl': '1rem',
                '3xl': '1.5rem',
            },
        },
    },
    plugins: [],
}
