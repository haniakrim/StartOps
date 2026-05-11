# StartOps CRM

A comprehensive CRM and business management platform built with React, Supabase, and TypeScript. Supports web, iOS, and Android (via Capacitor).

## Features

- **CRM Core**: Contacts, Companies, Deals, Activities
- **Finance**: Invoices, Expenses, Financial Reports
- **Inventory**: Product tracking, Stock management
- **Projects**: Task management, Timesheets
- **HR**: Employees, Staff Directory
- **Automation**: Workflows, Campaigns
- **Communication**: Email templates, Notifications
- **Planning**: Calendar, Forecasts, Goals
- **Admin**: Organization settings, Security, Audit logs, API management

## Tech Stack

- **Frontend**: React 18, TypeScript, React Router, TanStack Query
- **UI**: shadcn/ui, Tailwind CSS, Framer Motion
- **Backend**: Supabase (Auth, Database, Real-time)
- **Mobile**: Capacitor (iOS/Android)
- **Build**: Vite

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/startops.git
   cd startops
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anon/public key

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:5173](http://localhost:5173)

## Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm build:dev` | Build with development mode |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run tests (Vitest) |
| `pnpm test:coverage` | Run tests with coverage |

### Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts (Auth, Theme)
├── hooks/          # Custom React hooks
├── integrations/   # Third-party integrations (Supabase)
├── lib/            # Utilities and helpers
├── pages/          # Route pages
└── types/          # TypeScript type definitions
```

### Mobile Development (Capacitor)

```bash
# Sync web build to native projects
pnpm cap sync

# Open iOS project in Xcode
pnpm cap open ios

# Open Android project in Android Studio
pnpm cap open android
```

## Testing

Run tests with Vitest:

```bash
pnpm test           # Run tests once
pnpm test:watch     # Watch mode
pnpm test:coverage  # Generate coverage report
```

## Deployment

### Vercel (Recommended)

1. Push to your Git repository
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Manual Build

```bash
pnpm build
pnpm preview  # Test production build locally
```

Deploy the `dist/` folder to your hosting provider.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | Yes |

See `.env.example` for all available options.

## Database Schema

Database migrations and schema are in the `supabase/` directory. Apply migrations via Supabase CLI or dashboard.

## Security

- All API calls use Supabase Row Level Security (RLS)
- Authentication required for protected routes
- Environment variables for sensitive configuration
- Never commit `.env` files

## Contributing

1. Create a feature branch
2. Make changes
3. Run tests and linting
4. Submit a pull request

## License

Proprietary - All rights reserved.
