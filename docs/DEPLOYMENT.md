# Deployment Guide

## Production Deployment

FarmTrack supports multiple deployment platforms for production environments. Choose the deployment method that best fits your infrastructure requirements.

### Deployment Platforms

#### 1. Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard
NEXT_PUBLIC_DB_NAME=farmtrack-db
NEXT_PUBLIC_DB_VERSION=1
NODE_ENV=production
```

#### 2. Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=out
```

#### 3. Docker Container
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t farmtrack .
docker run -p 3000:3000 farmtrack
```

### Environment Configuration

#### Production Environment Variables
```env
# Database Configuration
NEXT_PUBLIC_DB_NAME=farmtrack-prod
NEXT_PUBLIC_DB_VERSION=1

# Application Settings
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Analytics (optional)
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id

# Monitoring (optional)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

#### Environment-Specific Configuration
```typescript
// lib/config/environment.ts
export const config = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  databaseName: process.env.NEXT_PUBLIC_DB_NAME || 'farmtrack-dev',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
};
```

## Performance Optimization

### Build Optimization
```bash
# Analyze bundle size
npm install -g @next/bundle-analyzer
npm run analyze

# Optimize images
npm install -g sharp
# Images are automatically optimized by Next.js
```

### CDN Configuration
```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['your-cdn-domain.com'],
    loader: 'custom',
    path: 'https://your-cdn-domain.com/_next/image'
  }
}
```

### Caching Strategy
```javascript
// Cache configuration for better performance
export const CACHE_CONFIG = {
  static: {
    maxAge: 31536000, // 1 year
    immutable: true
  },
  dynamic: {
    maxAge: 3600, // 1 hour
    revalidate: true
  }
};
```

## Monitoring and Analytics

### Error Tracking
```bash
# Install Sentry
npm install @sentry/nextjs

# Configure in production
SENTRY_DSN=your-sentry-dsn
```

### Performance Monitoring
```bash
# Install Web Vitals
npm install web-vitals

# Configure monitoring
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

### Health Checks
```typescript
// lib/health.ts
export async function healthCheck() {
  try {
    // Check database connectivity
    await storage.getAll('inventory');

    // Check API endpoints
    const response = await fetch('/api/health');

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        api: response.ok ? 'healthy' : 'error'
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}
```

## Security Considerations

### HTTPS Configuration
```nginx
# Nginx configuration for HTTPS
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Security Headers
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  }
}
```

### Data Security
- All sensitive data stored locally in browser
- No server-side data storage by default
- Optional cloud synchronization with encryption
- User-controlled data export and deletion

## Scaling Considerations

### Database Scaling
```typescript
// For large datasets, implement pagination
const getInventoryPage = async (page: number, pageSize: number = 50) => {
  const allItems = await storage.getAll('inventory');
  const start = page * pageSize;
  const end = start + pageSize;
  return {
    items: allItems.slice(start, end),
    total: allItems.length,
    page,
    pageSize,
    totalPages: Math.ceil(allItems.length / pageSize)
  };
};
```

### Performance Monitoring
```typescript
// Performance tracking
const trackPerformance = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    console.log('Page Load Time:', perfData.loadEventEnd - perfData.fetchStart);
  }
};
```

## Backup and Recovery

### Data Backup
```typescript
// Export all data for backup
const createBackup = async () => {
  const data = {
    inventory: await storage.getAll('inventory'),
    sales: await storage.getAll('sales'),
    expenses: await storage.getAll('expenses'),
    activities: await storage.getAll('activities'),
    labour: await storage.getAll('labour'),
    weather: await storage.getAll('weather'),
    taxRecords: await storage.getAll('tax-records'),
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  };

  return JSON.stringify(data, null, 2);
};
```

### Data Recovery
```typescript
// Import backup data
const restoreFromBackup = async (backupData: string) => {
  try {
    const data = JSON.parse(backupData);

    // Validate backup structure
    if (!data.version || !data.timestamp) {
      throw new Error('Invalid backup format');
    }

    // Restore each data store
    for (const [storeName, items] of Object.entries(data)) {
      if (Array.isArray(items) && storeName !== 'timestamp' && storeName !== 'version') {
        await storage.clear(storeName);
        for (const item of items) {
          await storage.add(storeName, item);
        }
      }
    }

    return { success: true, restoredStores: Object.keys(data).filter(k => k !== 'timestamp' && k !== 'version') };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
```

## Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

#### Database Issues
```bash
# Reset database
# Access browser console and run:
localStorage.clear();
indexedDB.deleteDatabase('farmtrack-db');
location.reload();
```

#### Performance Issues
```bash
# Check bundle size
npm run analyze

# Optimize images
npm install sharp
```

### Debug Mode
```typescript
// Enable debug logging
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Debug info:', { data, timestamp: Date.now() });
}
```

## Support and Maintenance

### Regular Maintenance
- Monitor bundle sizes and performance metrics
- Update dependencies regularly
- Review and optimize database queries
- Test accessibility features periodically

### Update Process
```bash
# Update dependencies
npm update

# Test updates
npm run type-check
npm run lint
npm run build
npm run test
```

---

**Developed by CEO – Chukwuka Emmanuel Ogugua**

*FarmTrack – An EmmanuelOS Agricultural Module*
