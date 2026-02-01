import React from "react";

interface ConfProps {
  upcomingDays: number;
  setUpcomingDays: (val: number) => void;
  limit: number;
  setLimit: (val: number) => void;
}

export const ConfigInputs: React.FC<ConfProps> = ({
  upcomingDays,
  setUpcomingDays,
  limit,
  setLimit,
}) => {
  return (
    <div className="z-40 neo-border bg-neo-purple text-white dark:bg-neo-pink dark:text-black p-4  mb-8 grid grid-rows-2 grid-cols-1 md:grid-cols-2 md:grid-rows-1 gap-6 items-center shadow-lg transition-colors">
      <div className="flex items-center gap-3">
        <label className="w-full flex space-beetween font-black uppercase text-sm">
          Days ahead to scan for events:
        </label>
        <input
          type="number"
          value={upcomingDays}
          onChange={(e) => setUpcomingDays(parseInt(e.target.value) || 0)}
          className="neo-input w-20 py-1"
        />
      </div>
      <div className="flex items-center gap-3">
        <label className="w-full font-black uppercase text-sm">
          Limit how many events to list:
        </label>
        <input
          type="number"
          value={limit}
          onChange={(e) => setLimit(parseInt(e.target.value) || 0)}
          className="neo-input w-20 py-1"
        />
      </div>
    </div>
  );
};
