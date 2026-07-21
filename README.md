# stock-management

A professional inventory and stock management system built with Next.js, Prisma, and PostgreSQL.

## Features

- Dashboard with real-time KPIs and charts
- Warehouse management
- Material/product catalog with SKU tracking
- Stock levels monitoring with low-stock alerts
- Batch/lot tracking with expiry management
- Sales orders and purchase orders
- Shipment method management
- Supplier/wholesaler management
- Employee management with work hours tracking
- Stock movement audit trail
- Reports & analytics with CSV export
- Barcode/QR code scanner
- Role-based access control (Admin, Warehouse Staff, User, Viewer)
- Responsive design for mobile, tablet, and desktop

## Tech Stack

- **Framework:** Next.js 16
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** NextAuth.js v4
- **UI:** shadcn/ui + Tailwind CSS v4
- **Charts:** Recharts

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+

### Local Development

```bash
npm install
cp .env.example .env
# Edit .env with your database credentials
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Docker Deployment

```bash
docker compose up -d
# Run migrations inside the container
docker compose exec app npx prisma migrate deploy
docker compose exec app npx prisma db seed
```

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `NEXTAUTH_SECRET` | Secret for JWT signing | - |
| `NEXTAUTH_URL` | Base URL for auth callbacks | `http://localhost:3000` |

### Default Login

- **Email:** admin@stockpro.com
- **Password:** password123

## License

MIT
