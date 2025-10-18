'use client';

import { useState, useEffect, useCallback } from 'react';
import { Cloud, Sun, CloudRain, Thermometer, Eye, Wind, MapPin, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useDatabase } from '@/contexts/DatabaseContext';
import Image from 'next/image';

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

  const fetchWeather = async (loc: string) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call - replace with real weather API
      const response = await fetch(`/api/weather?location=${encodeURIComponent(loc)}`);
      if (!response.ok) throw new Error('Failed to fetch weather');
      const data = await response.json();

      const weatherData: WeatherData = {
        id: Date.now().toString(),
        location: loc,
        temperature: data.current.temp,
        condition: data.current.condition.text,
        humidity: data.current.humidity,
        windSpeed: data.current.wind_kph,
        visibility: data.current.vis_km,
        icon: data.current.condition.icon,
        forecast: data.forecast.forecastday.slice(0, 3).map((day: { date: string; day: { avgtemp_c: number; condition: { text: string } } }) => ({
          date: day.date,
          temp: day.day.avgtemp_c,
          condition: day.day.condition.text,
        })),
      };

      setWeather(weatherData);
      await add('weather', weatherData);
    } catch {
      setError('Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      fetchWeather(location);
    }
  };

  const getWeatherIcon = (condition: string) => {
    if (condition.toLowerCase().includes('sunny')) return <Sun className="h-8 w-8 text-yellow-500" />;
    if (condition.toLowerCase().includes('rain')) return <CloudRain className="h-8 w-8 text-blue-500" />;
    return <Cloud className="h-8 w-8 text-gray-500" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Weather Forecast</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => weather && fetchWeather(weather.location)}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Enter Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              placeholder="Enter city or zip code..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Get Weather'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {weather && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid gap-6 md:grid-cols-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getWeatherIcon(weather.condition)}
                Current Weather - {weather.location}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-4xl font-bold flex items-center gap-2">
                {weather.temperature}°C
                <Image src={weather.icon} alt={weather.condition} width={48} height={48} />
              </div>
              <Badge variant="secondary">{weather.condition}</Badge>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-blue-500" />
                  Humidity: {weather.humidity}%
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="h-4 w-4 text-green-500" />
                  Wind: {weather.windSpeed} km/h
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-purple-500" />
                  Visibility: {weather.visibility} km
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3-Day Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {weather.forecast.map((day, index) => (
                  <motion.div
                    key={day.date}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{new Date(day.date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600">{day.condition}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{day.temp}°C</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
