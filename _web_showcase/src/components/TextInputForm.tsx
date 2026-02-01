import React, { useState } from "react";
import { ConfigInputs } from "./ConfigInputs";

export const TextInputForm: React.FC = () => {
  const [text, setText] = useState("");
  const [upcomingDays, setUpcomingDays] = useState(7);
  const [limit, setLimit] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/process-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          options: { upcomingDays, limit },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.length === 0) {
          alert(
            "No upcoming events found for this calendar in the given range.",
          );
        } else if ((window as any).showEvents) {
          (window as any).showEvents(data);
        }
      } else {
        alert(`Error: ${data.error || "Unknown error"}`);
      }
    } catch (err: any) {
      alert(`Failed to process text: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <ConfigInputs
        upcomingDays={upcomingDays}
        setUpcomingDays={setUpcomingDays}
        limit={limit}
        setLimit={setLimit}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col gap-2">
          <label className="text-2xl font-black uppercase">
            Raw iCal Content
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="neo-input min-h-[300px] font-mono text-sm"
            placeholder="BEGIN:VCALENDAR..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`neo-button w-full text-2xl py-6 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-white text-black dark:bg-neo-pink hover:opacity-90"}`}
        >
          {loading ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="inline mr-2"
            >
              <circle cx="18" cy="12" r="0" fill="currentColor">
                <animate
                  attributeName="r"
                  begin="0.67"
                  calcMode="spline"
                  dur="1.5s"
                  keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8"
                  repeatCount="indefinite"
                  values="0;2;0;0"
                />
              </circle>
              <circle cx="12" cy="12" r="0" fill="currentColor">
                <animate
                  attributeName="r"
                  begin="0.33"
                  calcMode="spline"
                  dur="1.5s"
                  keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8"
                  repeatCount="indefinite"
                  values="0;2;0;0"
                />
              </circle>
              <circle cx="6" cy="12" r="0" fill="currentColor">
                <animate
                  attributeName="r"
                  begin="0"
                  calcMode="spline"
                  dur="1.5s"
                  keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8"
                  repeatCount="indefinite"
                  values="0;2;0;0"
                />
              </circle>
            </svg>
          ) : (
            "Process Calendar"
          )}
        </button>
      </form>
    </div>
  );
};
