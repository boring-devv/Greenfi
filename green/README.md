# GreenFi - Stake-to-Plant Protocol

A premium dark-themed landing page for GreenFi, a revolutionary climate finance platform that connects crypto staking with verified environmental projects.

## Features

- 🌙 **Dark Theme** - Premium black gradient background with neon green accents
- ✨ **Animated Hexagons** - Floating geometric shapes with Framer Motion
- 🎯 **Smooth Scrolling** - Reveal animations on scroll
- 📊 **Impact Stats** - Animated counters showing real-time metrics
- 🎨 **Modern UI** - Built with TailwindCSS and shadcn/ui components
- 🚀 **Performance** - Optimized with Next.js 14

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Components**: shadcn/ui
- **Language**: TypeScript

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
greenfi/
├── app/
│   ├── globals.css       # Global styles and Tailwind config
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/
│   ├── ui/
│   │   └── button.tsx    # Button component
│   ├── Navbar.tsx        # Navigation bar
│   ├── HeroSection.tsx   # Hero with animated background
│   ├── HexagonBackground.tsx  # Animated hexagon grid
│   ├── HowItWorks.tsx    # Feature cards
│   ├── ImpactStats.tsx   # Animated counters
│   ├── AboutSection.tsx  # Mission statement
│   └── Footer.tsx        # Footer with links
├── lib/
│   └── utils.ts          # Utility functions
└── public/               # Static assets

```

## Customization

### Colors

The neon green accent color can be customized in `tailwind.config.ts`:

```typescript
neon: {
  green: '#00FF88',
},
```

### Animations

Framer Motion animations can be adjusted in each component. Key animations include:
- Floating hexagons in `HexagonBackground.tsx`
- Counter animations in `ImpactStats.tsx`
- Scroll reveal effects throughout

## Deployment

This project can be deployed to:
- Vercel (recommended for Next.js)
- Netlify
- Any platform supporting Node.js

## License

MIT

## Built With ❤️ for the Planet

Powered by Hedera blockchain technology.
