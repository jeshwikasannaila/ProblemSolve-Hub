import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function CountdownTimer({ deadline, compact = false }) {
  const calculateTimeLeft = () => {
    const diff = new Date(deadline).getTime() - new Date().getTime();
    if (diff <= 0) {
      return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      expired: false,
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  if (timeLeft.expired) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <Clock className="w-3.5 h-3.5" />
        Closed / Under Review
      </span>
    );
  }

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
        <Clock className="w-3.5 h-3.5" />
        {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
        {timeLeft.hours}h {timeLeft.minutes}m left
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs font-mono">
      <div className="flex flex-col items-center px-2 py-1 bg-slate-800/80 rounded border border-slate-700/60">
        <span className="text-sm font-bold text-white">{timeLeft.days}</span>
        <span className="text-[10px] text-slate-400 uppercase">Days</span>
      </div>
      <span className="text-slate-500 font-bold">:</span>
      <div className="flex flex-col items-center px-2 py-1 bg-slate-800/80 rounded border border-slate-700/60">
        <span className="text-sm font-bold text-white">{timeLeft.hours}</span>
        <span className="text-[10px] text-slate-400 uppercase">Hrs</span>
      </div>
      <span className="text-slate-500 font-bold">:</span>
      <div className="flex flex-col items-center px-2 py-1 bg-slate-800/80 rounded border border-slate-700/60">
        <span className="text-sm font-bold text-white">{timeLeft.minutes}</span>
        <span className="text-[10px] text-slate-400 uppercase">Min</span>
      </div>
      <span className="text-slate-500 font-bold">:</span>
      <div className="flex flex-col items-center px-2 py-1 bg-slate-800/80 rounded border border-slate-700/60">
        <span className="text-sm font-bold text-emerald-400">{timeLeft.seconds}</span>
        <span className="text-[10px] text-slate-400 uppercase">Sec</span>
      </div>
    </div>
  );
}
