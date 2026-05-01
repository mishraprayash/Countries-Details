# 🌍 World Insights Hub

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

A premium, interactive web application for exploring global demographics, testing geography knowledge, and discovering world insights. Built with a focus on high-performance data visualization and a **Pure Dark** design system.

---

## ✨ Features

### Country Explorer
- Browse and search 250+ countries worldwide
- Detailed country pages with demographics, geography, and more
- Interactive country comparison tools
- Search and filter functionality

### Map Explorer Game
- Interactive geography quiz game
- Select a continent and find famous locations on a map
- Points based on distance accuracy (exponential decay scoring)
- Difficulty levels: Easy and Hard
- Customizable number of places (5-25)
- Combo system for consecutive good guesses
- Achievement system with 14 unlockable milestones
- Daily streak tracking

### Additional Features
- **Country of the Day** - Discover a new country every day
- **Favorites System** - Save countries for quick access (localStorage)
- **Quiz Mode** - Test your geography knowledge
- **Battle Mode** - Competitive country comparisons
- **Life Comparator** - Compare life expectancy across countries
- **Dark/Light Theme** - Toggle between themes

---

## 🚀 Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **UI**: React 19, Tailwind CSS 4
- **Styling**: Custom dark theme with Zinc palette
- **Maps**: [Leaflet](https://leafletjs.com/) + [React Leaflet](https://react-leaflet.js.org/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes)
- **Data Source**: [REST Countries API](https://restcountries.com/)

---

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/mishraprayash/Countries-Details.git

# Navigate to project directory
cd Countries-Details

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## 📂 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── explore/           # Map Explorer game
│   ├── quiz/              # Quiz functionality
│   ├── compare/           # Country comparison
│   ├── favorites/         # Saved favorites
│   └── country/[name]/    # Dynamic country pages
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # API clients
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
├── constants/             # App configuration & constants
└── data/                  # Static data (locations, etc.)
```

### Key Directories

| Directory | Description |
|-----------|-------------|
| `/src/constants` | Game settings, UI config, app-wide values |
| `/src/types` | TypeScript definitions for countries, game, quiz |
| `/src/utils` | Geographic calculations, storage helpers, array ops |
| `/src/hooks` | `useGameStats`, `useFavorites`, `useQuizLeaderboard` |
| `/src/app/explore` | Map Explorer game components |

---

## 🎮 Map Explorer Game

### Scoring System
```
points = 1000 × e^(-distance/500)
```

- Distance < 500km: ~606+ points (Good guess)
- Distance < 1000km: ~135+ points
- Distance > 2500km: 0 points

### Game Flow
1. **Select** - Choose a continent
2. **Settings** - Select difficulty and number of places
3. **Playing** - Click on the map to guess locations
4. **Results** - View score, time per location, and achievements

### Achievements
- **Streaks**: Explorer, Consistent, Dedicated, Geography Master
- **Score-based**: High Scorer, Elite Player
- **Performance**: Perfect!, Hot Streak, On Fire!
- **Progression**: World Traveler, Challenge Accepted
- **Volume**: Regular Player, Veteran, Legend

---

## 🔧 Adding New Features

### Creating a New Component

```typescript
// src/components/features/NewFeature.tsx
"use client";

import { useState } from "react";

interface NewFeatureProps {
  title: string;
}

export default function NewFeature({ title }: NewFeatureProps) {
  const [count, setCount] = useState(0);
  
  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold">{title}</h2>
      <button onClick={() => setCount(c => c + 1)}>
        Clicked {count} times
      </button>
    </div>
  );
}
```

### Adding a Custom Hook

```typescript
// src/hooks/useNewHook.ts
"use client";

import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
```

### Adding Types

```typescript
// src/types/newfeature.ts
export interface NewFeatureData {
  id: string;
  name: string;
  value: number;
}
```

### Adding Constants

```typescript
// src/constants/newfeature.ts
export const NEW_FEATURE_CONFIG = {
  MAX_VALUE: 100,
  MIN_VALUE: 0,
} as const;
```

---

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 🎨 Theme Customization

The app uses Tailwind CSS 4 with CSS variables. The dark theme uses a Zinc-950 palette for a premium "Midnight" aesthetic.

To customize, edit the CSS variables in `src/app/globals.css`.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📸 Screenshots

### 🌑 Premium Dark Theme
A deep, rich zinc-based dark theme designed for focus and elegance.

### 🗺️ Map Explorer
Interactive geography quiz with real-time scoring and achievements.

---

Built with ❤️ by [Prayash Mishra](https://github.com/mishraprayash)