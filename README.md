# Proforma Dashboard

A professional, production-ready home builder deal assessment calculator. This PWA (Progressive Web App) helps builders quickly evaluate property deals based on key financial metrics.

## Features

- **Instant Deal Assessment**: Calculates profit, ROI, and provides deal recommendations (Great/Borderline/Pass)
- **Mobile-First Design**: Optimized for on-site use with numeric keypad support
- **Offline Capable**: Works without internet connection (PWA)
- **Example Data Loaded**: Pre-filled with realistic example for instant "wow factor"
- **Professional UI**: Clean white background with Zoom-blue accents
- **Real-time Calculations**: All metrics update instantly as you type
- **No Backend Required**: 100% client-side, no login, no data storage

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Validation**: Zod
- **PWA**: vite-plugin-pwa + Workbox
- **Testing**: Vitest
- **Styling**: Vanilla CSS with CSS Variables

## Architecture

The project follows production best practices with clear separation of concerns:

```
src/
├── domain/proforma/        # Domain logic (single source of truth)
│   ├── types.ts            # Canonical type definitions
│   ├── validation.ts       # Zod schemas, sanitizers, factory functions
│   ├── calculations.ts     # Pure calculation engine
│   └── __tests__/          # Unit tests
├── components/             # UI components
│   ├── NumberField.tsx     # Reusable formatted input
│   ├── KpiCard.tsx         # Metric display card
│   └── DealBadge.tsx       # Deal assessment indicator
├── utils/                  # Utilities
│   └── formatting.ts       # Currency/percent formatters
└── App.tsx                 # Main application
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

### Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run unit tests
npm run test:ui      # Run tests with UI
npm run test:run     # Run tests once
npm run typecheck    # TypeScript type checking
npm run lint         # Lint code
```

## Deal Assessment Logic

The calculator evaluates deals based on profit percentage:

- **Great**: Profit ≥ 25% of ARV
- **Borderline**: 15% ≤ Profit < 25% of ARV
- **Pass**: Profit < 15% of ARV

### Key Calculations

```typescript
ARV = Quantity × Sq Ft × Sale Price per Sq Ft
Total Build Cost = Quantity × Sq Ft × Build Cost per Sq Ft
Loan Base = Total Build Cost + Land Cost + Closing Cost + Extra Expenses
Total Points = Loan Base × Loan Points Rate
Total Profit = ARV - All Costs
Profit % = Total Profit / ARV
```

## Testing

The project includes comprehensive unit tests that verify calculations against real spreadsheet examples:

```bash
npm run test:run
```

All tests verify:
- Exact calculation accuracy
- Deal badge thresholds
- Edge cases (zero ARV, etc.)
- Interest payment summation
- Extra expenses summation

## PWA Installation

The app can be installed on any device:

1. Visit the app in a browser
2. Click the "Install" prompt (desktop) or "Add to Home Screen" (mobile)
3. Launch from your home screen/desktop
4. Works offline!

## Quality Gates

Before deployment, all of these must pass:

- ✅ `npm run typecheck` - No TypeScript errors
- ✅ `npm run lint` - No ESLint errors
- ✅ `npm run test:run` - All unit tests pass
- ✅ `npm run build` - Production build succeeds

## Example Data

The calculator loads with realistic example data:

- **Property**: 123 Main st
- **Units**: 3 homes
- **Size**: 1,800 sq ft each
- **Build Cost**: $205/sq ft
- **Sale Price**: $361/sq ft
- **Land Cost**: $330,000
- **Expected Results**:
  - ARV: $1,949,400
  - Total Profit: $292,104
  - Profit %: 15.0% (Borderline)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

All modern browsers with ES2020 support.

## License

Proprietary - All rights reserved

## Support

For issues or questions, contact the development team.
