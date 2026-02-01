import React, { useState, useEffect, useRef } from 'react';

export interface CalendarEvent {
  UID: string;
  HumanStart: string;
  Summary: string;
  Description: string;
}

interface ToastProps {
  event: CalendarEvent;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ event, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);
  const exitTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Auto-dismiss after 5 seconds
    exitTimerRef.current = setTimeout(() => {
      setIsExiting(true);
    }, 5000);

    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  const handleAnimationEnd = (e: React.AnimationEvent) => {
    // Ensure we only close on the slide-out animation
    if (e.animationName === 'slide-out-right') {
      onClose();
    }
  };

  const triggerManualClose = () => {
    setIsExiting(true);
  };

  return (
    <div 
      onAnimationEnd={handleAnimationEnd}
      className={`neo-border neo-shadow-lg p-4 bg-white dark:bg-neo-dark mb-4 w-80 pointer-events-auto relative
        ${isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'}
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="bg-neo-purple text-white dark:bg-neo-pink dark:text-black px-2 py-0.5 text-xs font-black uppercase tracking-tight truncate max-w-[200px]">
          {event.HumanStart}
        </span>
        <button 
          onClick={triggerManualClose} 
          className="text-xl leading-none hover:scale-110 transition-transform px-1 font-black cursor-pointer"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
      <h3 className="font-black uppercase mb-1 leading-tight">{event.Summary}</h3>
      <p className="text-sm font-bold opacity-80 line-clamp-3">{event.Description}</p>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<(CalendarEvent & { id: string })[]>([]);
  const toastLimit = 10; // Prevent DOM explosion

  useEffect(() => {
    const showEventsHandler = (events: CalendarEvent[]) => {
      if (!Array.isArray(events)) return;
      
      events.forEach((event, index) => {
        setTimeout(() => {
          setToasts(prev => {
            // Avoid duplicates by UID if present
            const id = `${event.UID || 'evt'}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const newToasts = [{ ...event, id }, ...prev];
            // Keep only the latest N toasts
            return newToasts.slice(0, toastLimit);
          });
        }, index * 200); // Faster staggered entry (200ms)
      });
    };

    (window as any).showEvents = showEventsHandler;
    
    return () => {
      delete (window as any).showEvents;
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="fixed top-24 right-6 z-[100] flex flex-col items-end pointer-events-none">
      {toasts.map(toast => (
        <Toast 
          key={toast.id} 
          event={toast} 
          onClose={() => removeToast(toast.id)} 
        />
      ))}
    </div>
  );
};
