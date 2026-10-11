'use client';

import { useEffect, useState } from 'react';

const LOCATION_STORAGE_KEY = 'user_location';
const LOCATION_EXPIRY_DAYS = 20;

type UserLocation = {
  country: string;
  city: string;
  timestamp: number;
};

const getStoredLocation = (): UserLocation | null => {
  const storedData = localStorage.getItem(LOCATION_STORAGE_KEY);

  if (!storedData) return null;

  try {
    const parsedData: UserLocation = JSON.parse(storedData);

    const expiryTime = LOCATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    const isExpired = Date.now() - parsedData.timestamp > expiryTime;

    if (isExpired) {
      localStorage.removeItem(LOCATION_STORAGE_KEY);
      return null;
    }

    return parsedData;
  } catch {
    localStorage.removeItem(LOCATION_STORAGE_KEY);
    return null;
  }
};

const useLocationTracking = () => {
  const [location, setLocation] = useState<UserLocation | null>(null);

  useEffect(() => {
    const storedLocation = getStoredLocation();

    if (storedLocation) {
      setLocation(storedLocation);
      return;
    }

    fetch('http://ip-api.com/json/')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch location');
        }

        return res.json();
      })
      .then((data) => {
        if (data.status === 'fail') {
          throw new Error(data.message || 'Location lookup failed');
        }

        const newLocation: UserLocation = {
          country: data.country,
          city: data.city,
          timestamp: Date.now(),
        };

        localStorage.setItem(
          LOCATION_STORAGE_KEY,
          JSON.stringify(newLocation),
        );

        setLocation(newLocation);
      })
      .catch((error) => {
        console.error('Failed to get location:', error);
      });
  }, []);

  return location;
};

export default useLocationTracking;
