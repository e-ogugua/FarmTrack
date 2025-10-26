import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, Package, Cloud, Calculator, Activity, Leaf, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMotionPreference } from '@/hooks/use-motion-preference';

interface DashboardStats {
  totalSales: number;
  totalExpenses: number;
  profit: number;
  inventoryItems: number;
}

interface WeatherSummary {
  temperature: number;
  condition: string;
}

interface TaxSummary {
  taxableIncome: number;
  estimatedTax: number;
}

interface DashboardContentProps {
  stats: DashboardStats;
  weather: WeatherSummary | null;
  tax: TaxSummary | null;
}

export default React.memo(function DashboardContent({ stats, weather, tax }: DashboardContentProps) {
  const prefersReducedMotion = useMotionPreference();

  // Memoize expensive calculations for performance
  const profitColor = useMemo(() => stats.profit >= 0 ? 'text-green-600' : 'text-red-600', [stats.profit]);
  const profitBgColor = useMemo(() => stats.profit >= 0 ? 'bg-green-100' : 'bg-red-100', [stats.profit]);
  const profitBorderColor = useMemo(() => stats.profit >= 0 ? 'border-l-green-500' : 'border-l-red-500', [stats.profit]);

  // Enhanced container variants with motion preferences
  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.5,
        when: "beforeChildren",
        staggerChildren: prefersReducedMotion ? 0 : 0.1
      }
    }
  }), [prefersReducedMotion]);

  // Enhanced card variants with motion preferences
  const cardVariants = useMemo(() => ({
    hidden: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.6
      }
    }
  }), [prefersReducedMotion]);

  return (
    <motion.div
      className="container-wide space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="text-center space-y-4"
        variants={cardVariants}
      >
        <h1 className="text-heading-1 text-foreground" data-testid="dashboard-title">
          Farm Dashboard
        </h1>
        <p className="text-body-large text-muted-foreground max-w-2xl mx-auto">
          Monitor your agricultural operations, track performance metrics, and manage your farm efficiently
        </p>
      </motion.div>

      {/* Enhanced stats grid with better responsive design */}
      <div className="card-grid-stats">
        <motion.div
          variants={cardVariants}
          transition={{ delay: prefersReducedMotion ? 0 : 0.1, duration: prefersReducedMotion ? 0 : 0.6 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary bg-gradient-to-br from-card to-card/50 h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-responsive-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
              <div className="p-2 bg-primary/10 rounded-full" aria-hidden="true">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-responsive-3xl font-bold text-foreground">
                ${stats.totalSales.toLocaleString()}
              </div>
              <p className="text-responsive-xs text-muted-foreground mt-1">
                <span className="text-green-600">+20.1%</span> from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={cardVariants}
          transition={{ delay: prefersReducedMotion ? 0 : 0.2, duration: prefersReducedMotion ? 0 : 0.6 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-secondary bg-gradient-to-br from-card to-card/50 h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-responsive-sm font-medium text-muted-foreground">
                Total Expenses
              </CardTitle>
              <div className="p-2 bg-secondary/10 rounded-full" aria-hidden="true">
                <TrendingDown className="h-5 w-5 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-responsive-3xl font-bold text-foreground">
                ${stats.totalExpenses.toLocaleString()}
              </div>
              <p className="text-responsive-xs text-muted-foreground mt-1">
                <span className="text-red-600">+5.2%</span> from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={cardVariants}
          transition={{ delay: prefersReducedMotion ? 0 : 0.3, duration: prefersReducedMotion ? 0 : 0.6 }}
        >
          <Card className={`hover:shadow-lg transition-all duration-300 border-l-4 bg-gradient-to-br from-card to-card/50 h-full ${profitBorderColor}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-responsive-sm font-medium text-muted-foreground">
                Net Profit
              </CardTitle>
              <div className={`p-2 rounded-full ${profitBgColor}`} aria-hidden="true">
                <TrendingUp className={`h-5 w-5 ${profitColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-responsive-3xl font-bold ${profitColor}`}>
                {stats.profit >= 0 ? '+' : ''}${Math.abs(stats.profit).toLocaleString()}
              </div>
              <p className="text-responsive-xs text-muted-foreground mt-1">
                {stats.profit >= 0 ? 'Profit' : 'Loss'} this period
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={cardVariants}
          transition={{ delay: prefersReducedMotion ? 0 : 0.4, duration: prefersReducedMotion ? 0 : 0.6 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-accent bg-gradient-to-br from-card to-card/50 h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-responsive-sm font-medium text-muted-foreground">
                Inventory Items
              </CardTitle>
              <div className="p-2 bg-accent/10 rounded-full" aria-hidden="true">
                <Package className="h-5 w-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-responsive-3xl font-bold text-foreground">
                {stats.inventoryItems}
              </div>
              <p className="text-responsive-xs text-muted-foreground mt-1">
                Items in stock
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Enhanced feature cards grid */}
      <div className="card-grid-responsive">
        <motion.div
          variants={cardVariants}
          transition={{ delay: prefersReducedMotion ? 0 : 0.5, duration: prefersReducedMotion ? 0 : 0.6 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-responsive-lg">
                <div className="p-2 bg-blue-50 rounded-full" aria-hidden="true">
                  <Cloud className="h-5 w-5 text-blue-600" />
                </div>
                Weather Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weather ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-responsive-2xl font-bold text-foreground">
                      {weather.temperature}°C
                    </span>
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200"
                      aria-label={`Current weather condition: ${weather.condition}`}
                    >
                      {weather.condition}
                    </Badge>
                  </div>
                  <p className="text-responsive-sm text-muted-foreground">
                    Environmental conditions data for optimal farming decisions
                  </p>
                </div>
              ) : (
                <p className="text-responsive-sm text-muted-foreground">
                  No weather data available. Enable location services for accurate forecasts.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={cardVariants}
          transition={{ delay: prefersReducedMotion ? 0 : 0.6, duration: prefersReducedMotion ? 0 : 0.6 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-responsive-lg">
                <div className="p-2 bg-purple-50 rounded-full" aria-hidden="true">
                  <Calculator className="h-5 w-5 text-purple-600" />
                </div>
                Tax Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tax ? (
                <div className="space-y-3">
                  <div className="text-responsive-lg font-semibold text-foreground">
                    Taxable Income: <span className="text-primary">${tax.taxableIncome.toLocaleString()}</span>
                  </div>
                  <div className="text-responsive-sm text-muted-foreground">
                    Estimated Tax: <span className="font-medium">${tax.estimatedTax.toLocaleString()}</span>
                  </div>
                  <p className="text-responsive-xs text-muted-foreground">
                    Based on current year financial data
                  </p>
                </div>
              ) : (
                <p className="text-responsive-sm text-muted-foreground">
                  No tax data available for this year. Add income and expense records to see projections.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={cardVariants}
          transition={{ delay: prefersReducedMotion ? 0 : 0.7, duration: prefersReducedMotion ? 0 : 0.6 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-responsive-lg">
                <div className="p-2 bg-green-50 rounded-full" aria-hidden="true">
                  <Leaf className="h-5 w-5 text-green-600" />
                </div>
                Farm Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                  aria-label="Farm systems status: All operational"
                >
                  All Systems Operational
                </Badge>
                <p className="text-responsive-sm text-muted-foreground">
                  System status normal • All sensors reporting healthy data
                </p>
                <div className="flex items-center gap-2 text-responsive-xs text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full" aria-hidden="true"></div>
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Enhanced activity cards */}
      <div className="card-grid-responsive">
        <motion.div
          variants={cardVariants}
          transition={{ delay: prefersReducedMotion ? 0 : 0.8, duration: prefersReducedMotion ? 0 : 0.6 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-responsive-lg">
                <BarChart3 className="h-5 w-5 text-primary" aria-hidden="true" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full" aria-hidden="true"></div>
                  <div>
                    <p className="text-responsive-sm font-medium">No recent activities</p>
                    <p className="text-responsive-xs text-muted-foreground">
                      Activities will appear here as you use the system
                    </p>
                  </div>
                </div>
                <p className="text-responsive-xs text-muted-foreground">
                  Track your daily farm operations and tasks in real-time
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={cardVariants}
          transition={{ delay: prefersReducedMotion ? 0 : 0.9, duration: prefersReducedMotion ? 0 : 0.6 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-responsive-lg">
                <Activity className="h-5 w-5 text-accent" aria-hidden="true" />
                Recent Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                  <div className="w-2 h-2 bg-accent rounded-full" aria-hidden="true"></div>
                  <div>
                    <p className="text-responsive-sm font-medium">No recent sales</p>
                    <p className="text-responsive-xs text-muted-foreground">
                      Sales records will appear here after transactions
                    </p>
                  </div>
                </div>
                <p className="text-responsive-xs text-muted-foreground">
                  Monitor your sales performance and customer trends
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
});
