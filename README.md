# FarmTrack - Farm Records Management App

FarmTrack is a modern, offline-first web application designed to help farmers manage their farm records efficiently. It allows tracking of activities, labor, expenses, sales, and inventory without requiring an internet connection.

## Features

- **Dashboard**: Overview of key metrics and recent activities
- **Activities**: Track farm activities with details like date, type, crop, and notes
- **Labor Management**: Record labor hours and wages
- **Expense Tracking**: Log and categorize farm expenses
- **Sales Records**: Track product sales and revenue
- **Inventory Management**: Monitor stock levels of farm inputs and products
- **Reports**: Export data to Excel or PDF
- **Offline-First**: Works without an internet connection
- **Responsive Design**: Works on both mobile and desktop devices

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Recharts](https://recharts.org/) - Charting library
- [SheetJS](https://sheetjs.com/) - Excel export functionality
- [jsPDF](https://parall.ax/products/jspdf) - PDF generation

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/farm-management-app.git
   cd farm-management-app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Dashboard**: Get an overview of your farm's performance
2. **Activities**: Add and track farm activities
3. **Labor**: Record labor hours and manage wages
4. **Expenses**: Track all farm-related expenses
5. **Sales**: Record sales and monitor revenue
6. **Inventory**: Manage farm inputs and product stock
7. **Reports**: Export your data for analysis

## Data Storage

All data is stored locally in your browser using localStorage. This means:
- Your data is private and never leaves your device
- The app works offline
- Data persists between sessions
- You can export your data for backup

## Deployment

To deploy this application, you can use Vercel, Netlify, or any other static hosting service:

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Ffarm-management-app)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

## License

This project is open source and available under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
