'use client';

import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { FiSearch, FiSun, FiCloud, FiCloudRain } from 'react-icons/fi';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { Engine } from '@tsparticles/engine';

type WeatherData = {
  name: string;
  main: { temp: number; humidity: number };
  weather: { main: string; description: string }[];
  wind: { speed: number };
};

type ForecastData = {
  [date: string]: {
    temperature: number;
    precipitation: number;
    humidity: number;
    condition: 'sunny' | 'cloudy' | 'raining';
  };
};

export default function Home() {
  const [location, setLocation] = useState('London');
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
  const backendUrl = 'https://weather-app-tr3b.onrender.com/predict';

  // Initialize particles
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  // Fetch current weather
  const fetchCurrentWeather = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`
      );
      setCurrentWeather(res.data);
    } catch (error) {
      console.error('Error fetching current weather:', error);
    }
    setLoading(false);
  };

  // Fetch 7-day forecast for Mandi
  const fetchForecast = async () => {
    try {
      const res = await axios.post(backendUrl, {
        date: new Date().toISOString().split('T')[0],
      });
      setForecast(res.data);
    } catch (error) {
      console.error('Error fetching forecast:', error);
    }
  };

  useEffect(() => {
    fetchCurrentWeather();
    fetchForecast();
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCurrentWeather();
  };

  // Determine background based on condition
  const getBackground = () => {
    if (!currentWeather || !currentWeather.weather[0]) return 'bg-blue-500';
    const condition = currentWeather.weather[0].main.toLowerCase();
    if (condition.includes('rain')) return 'bg-gradient-to-b from-gray-700 to-blue-900';
    if (condition.includes('cloud')) return 'bg-gradient-to-b from-gray-400 to-gray-600';
    return 'bg-gradient-to-b from-yellow-300 to-blue-500';
  };

  return (
    <div className={`min-h-screen ${getBackground()} text-white flex flex-col md:flex-row relative`}>
      {currentWeather?.weather?.[0]?.main.includes('Rain') && (
        <Particles
          id="tsparticles"
          {...{ init: particlesInit } as any}
          options={{
            particles: {
              number: { value: 100 },
              move: { direction: 'bottom', speed: 5 },
              size: { value: 3 },
              opacity: { value: 0.5 },
            },
            interactivity: { events: { onHover: { enable: false } } },
            background: { color: 'transparent' },
          }}
        />
      )}
      {/* Left Panel: Current Weather */}
      <div className="md:w-1/3 p-6 bg-opacity-50 bg-black">
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex items-center border-b border-white py-2">
            <FiSearch className="mr-2" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location"
              className="bg-transparent outline-none w-full text-white placeholder-white"
            />
          </div>
        </form>
        {loading && <p>Loading...</p>}
        {currentWeather && (
          <div>
            <h2 className="text-2xl">{currentWeather.name}</h2>
            <div className="flex items-center my-4">
              {currentWeather.weather[0].main.includes('Rain') && <FiCloudRain size={40} />}
              {currentWeather.weather[0].main.includes('Cloud') && <FiCloud size={40} />}
              {currentWeather.weather[0].main.includes('Clear') && <FiSun size={40} />}
              <p className="ml-4 text-4xl">{Math.round(currentWeather.main.temp)}°C</p>
            </div>
            <p>Humidity: {currentWeather.main.humidity}%</p>
            <p>Wind: {currentWeather.wind.speed} m/s</p>
            <p>Condition: {currentWeather.weather[0].description}</p>
          </div>
        )}
      </div>

      {/* Right Panel: 7-Day Forecast */}
      <div className="md:w-2/3 p-6">
        <h2 className="text-2xl mb-6">7-Day Forecast for Mandi</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {forecast &&
            Object.entries(forecast).map(([date, data]: [string, any]) => (
              <div key={date} className="bg-white bg-opacity-20 p-4 rounded-lg relative">
                <p className="font-bold">{new Date(date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                <div className="flex items-center my-2">
                  {data.condition === 'sunny' && (
                    <div className="relative">
                      <FiSun size={30} className="text-yellow-400" />
                      <div className="absolute top-0 left-0 w-8 h-8 rounded-full bg-yellow-300 opacity-30 animate-pulse"></div>
                    </div>
                  )}
                  {data.condition === 'cloudy' && <FiCloud size={30} />}
                  {data.condition === 'raining' && <FiCloudRain size={30} />}
                  <p className="ml-2">{data.condition}</p>
                </div>
                <p>Temp: {Math.round(data.temperature)}°C</p>
                <p>Precip: {data.precipitation} mm</p>
                <p>Humidity: {data.humidity}%</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}