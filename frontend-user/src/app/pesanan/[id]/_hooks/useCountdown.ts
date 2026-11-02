import { useState, useEffect } from "react";

export const useCountdown = (startTime: string | undefined) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!startTime) return;

    const timer = setInterval(() => {
      const expiry = new Date(startTime).getTime() + 24 * 60 * 60 * 1000;
      const dist = expiry - Date.now();

      if (dist < 0) {
        clearInterval(timer);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          hours: Math.floor((dist % 86400000) / 3600000),
          minutes: Math.floor((dist % 3600000) / 60000),
          seconds: Math.floor((dist % 60000) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  return timeLeft;
};
