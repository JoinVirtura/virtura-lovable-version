import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
		fontFamily: {
			sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
			display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
			heading: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
		},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
			primary: {
				DEFAULT: 'hsl(var(--primary))',
				dark: 'hsl(var(--primary-dark))',
				blue: 'hsl(var(--primary-blue))',
				magenta: 'hsl(var(--primary-magenta))',
				foreground: 'hsl(var(--primary-foreground))'
			},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
		backgroundImage: {
			'gradient-primary': 'var(--gradient-primary)',
			'gradient-secondary': 'var(--gradient-secondary)',
			'gradient-hero': 'var(--gradient-hero)',
			'gradient-card': 'var(--gradient-card)',
			'gradient-text': 'var(--gradient-text)'
		},
		boxShadow: {
			'violet-glow': 'var(--shadow-violet-glow)',
			'blue-glow': 'var(--shadow-blue-glow)',
			'neon': 'var(--shadow-neon)',
			'card': 'var(--shadow-card)'
		},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'breathe': {
					'0%, 100%': {
						transform: 'scale(1)'
					},
					'50%': {
						transform: 'scale(1.02)'
					}
				},
				'gentle-sway': {
					'0%, 100%': {
						transform: 'translateX(0) rotate(0deg)'
					},
					'25%': {
						transform: 'translateX(1px) rotate(0.3deg)'
					},
					'75%': {
						transform: 'translateX(-1px) rotate(-0.3deg)'
					}
				},
				'micro-bounce': {
					'0%, 100%': {
						transform: 'translateY(0)'
					},
					'50%': {
						transform: 'translateY(-2px)'
					}
				},
			'alive': {
				'0%': {
					transform: 'scale(1) translateX(0) rotate(0deg)'
				},
				'25%': {
					transform: 'scale(1.01) translateX(0.5px) rotate(0.2deg)'
				},
				'50%': {
					transform: 'scale(1.02) translateX(0) rotate(0deg)'
				},
				'75%': {
					transform: 'scale(1.01) translateX(-0.5px) rotate(-0.2deg)'
				},
				'100%': {
					transform: 'scale(1) translateX(0) rotate(0deg)'
				}
			},
			'neon-pulse': {
				'0%, 100%': { boxShadow: '0 0 20px hsl(270 100% 70% / 0.3)' },
				'50%': { boxShadow: '0 0 40px hsl(270 100% 70% / 0.6)' }
			},
			'glow-text': {
				'0%, 100%': { textShadow: '0 0 10px hsl(270 100% 70% / 0.5)' },
				'50%': { textShadow: '0 0 20px hsl(270 100% 70% / 0.8)' }
			},
			'particle-float': {
				'0%, 100%': { transform: 'translateY(0) translateX(0)', opacity: '0.3' },
				'50%': { transform: 'translateY(-20px) translateX(10px)', opacity: '0.8' }
			}
			},
		animation: {
			'accordion-down': 'accordion-down 0.2s ease-out',
			'accordion-up': 'accordion-up 0.2s ease-out',
			'breathe': 'breathe 3s ease-in-out infinite',
			'gentle-sway': 'gentle-sway 4s ease-in-out infinite',
			'micro-bounce': 'micro-bounce 2s ease-in-out infinite',
			'alive': 'alive 5s ease-in-out infinite',
			'neon-pulse': 'neon-pulse 3s ease-in-out infinite',
			'glow-text': 'glow-text 2s ease-in-out infinite',
			'particle-float': 'particle-float 4s ease-in-out infinite'
		}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
