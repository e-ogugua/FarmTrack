'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useDatabase } from '@/contexts/DatabaseContext';

// Dynamic import for weather content to enable code splitting
const WeatherContent = dynamic(() => import('@/components/weather/WeatherContent'), {
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        <p className="text-muted-foreground font-medium">Loading weather data...</p>
      </div>
    </div>
  ),
  ssr: false // Disable SSR for client-side weather functionality
});

type WeatherData = {
  id: string;
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  icon: string;
  forecast: Array<{
    date: string;
    temp: number;
    condition: string;
  }>;
};

export default function WeatherPage() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { add, getAll } = useDatabase();

  const loadStoredWeather = useCallback(async () => {
    // Async weather data loading to prevent blocking main thread
    try {
      const stored = await getAll('weather');
      if (stored.length > 0) {
        setWeather(stored[0] as WeatherData);
      }
    } catch {
      // Error handled silently
    }
  }, [getAll]);

  useEffect(() => {
    loadStoredWeather();
  }, [loadStoredWeather]);

  return <WeatherContent
    weather={weather}
    location={location}
    setLocation={setLocation}
    loading={loading}
    setLoading={setLoading}
    error={error}
    setError={setError}
    add={add}
    setWeather={setWeather}
  />;
}
