import React, { useState } from "react";
import type { SVGProps } from "react";
import { ConfigInputs } from "./ConfigInputs";

export const UrlInputForm: React.FC = () => {
  const [urls, setUrls] = useState<string[]>([""]);
  const [upcomingDays, setUpcomingDays] = useState(7);
  const [limit, setLimit] = useState(0);
  const [loading, setLoading] = useState(false);

  const addUrl = () => {
    if (urls.length < 5) {
      setUrls([...urls, ""]);
    }
  };

  const removeUrl = (index: number) => {
    setUrls(urls.filter((_, i) => i !== index));
  };

  const updateUrl = (index: number, val: string) => {
    const newUrls = [...urls];
    newUrls[index] = val;
    setUrls(newUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/process-urls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          urls: urls.filter((u) => u.trim() !== ""),
          options: { upcomingDays, limit },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.length === 0) {
          alert(
            "No upcoming events found for these calendars in the given range.",
          );
        } else if ((window as any).showEvents) {
          (window as any).showEvents(data);
        }
      } else {
        alert(`Error: ${data.error || "Unknown error"}`);
      }
    } catch (err: any) {
      alert(`Failed to process URLs: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <ConfigInputs
        upcomingDays={upcomingDays}
        setUpcomingDays={setUpcomingDays}
        limit={limit}
        setLimit={setLimit}
      />

      <div className="mb-8 p-6 neo-border bg-white/50 dark:bg-neo-dark/50 text-black dark:text-white">
        <p className="font-bold mb-4 italic text-sm md:text-base">
          If you have no URL to an .ics file at hand and you can't be bothered
          to look for one, here's some:
        </p>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-3 bg-white dark:bg-neo-dark neo-border border-2">
            <span className="font-black uppercase text-xs">🌕 Moon Phases</span>
            <code className="text-[10px] md:text-xs truncate bg-gray-100 dark:bg-zinc-700 p-1 flex-grow mx-2">
              https://mooncal.ch/mooncal.ics
            </code>
            <button
              type="button"
              onClick={() => {
                const newUrls = [...urls];
                const emptyIdx = newUrls.findIndex((u) => u === "");
                if (emptyIdx !== -1)
                  newUrls[emptyIdx] =
                    "https://mooncal.ch/mooncal.ics?created=65885508461&lang=en&phases[full]=true&phases[new]=false&phases[quarter]=false&phases[daily]=false&style=withDescription&events[lunareclipse]=true&events[solareclipse]=true&events[moonlanding]=true&before=P6M&after=P2Y&zone=Europe/London";
                else if (newUrls.length < 5)
                  newUrls.push(
                    "https://mooncal.ch/mooncal.ics?created=65885508461&lang=en&phases[full]=true&phases[new]=false&phases[quarter]=false&phases[daily]=false&style=withDescription&events[lunareclipse]=true&events[solareclipse]=true&events[moonlanding]=true&before=P6M&after=P2Y&zone=Europe/London",
                  );
                setUrls(newUrls);
              }}
              className="neo-button py-1 px-3 min-w-32 text-[10px] bg-neo-purple text-white dark:bg-neo-pink dark:text-black"
            >
              Copy to form
            </button>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-3 bg-white dark:bg-neo-dark neo-border border-2">
            <span className="font-black uppercase text-xs">🇬🇧 UK Holidays</span>
            <code className="text-[10px] md:text-xs truncate bg-gray-100 dark:bg-zinc-700 p-1 flex-grow mx-2">
              https://calendar.google.com/calendar/ical...
            </code>
            <button
              type="button"
              onClick={() => {
                const newUrls = [...urls];
                const target =
                  "https://calendar.google.com/calendar/ical/en.uk%23holiday%40group.v.calendar.google.com/public/basic.ics";
                const emptyIdx = newUrls.findIndex((u) => u === "");
                if (emptyIdx !== -1) newUrls[emptyIdx] = target;
                else if (newUrls.length < 5) newUrls.push(target);
                setUrls(newUrls);
              }}
              className="neo-button py-1 px-3 min-w-32 text-[10px] bg-neo-purple text-white dark:bg-neo-pink dark:text-black"
            >
              Copy to form
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col gap-4">
          <label className="text-2xl font-black uppercase">Calendar URLs</label>
          {urls.map((url, index) => (
            <div key={index} className="flex gap-4">
              <input
                type="url"
                value={url}
                onChange={(e) => updateUrl(index, e.target.value)}
                className="neo-input flex-grow"
                placeholder="https://example.com/cal.ics"
                required
              />
              {urls.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeUrl(index)}
                  className="neo-button bg-red-500 text-white px-4"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          {urls.length < 5 && (
            <button
              type="button"
              onClick={addUrl}
              className="neo-button bg-white text-back dark:bg-neo-purple dark:text-white self-start"
            >
              + Add URL
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`neo-button w-full text-2xl py-6 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-white text-black dark:bg-neo-purple dark:text-white  hover:opacity-90"}`}
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
            "Fetch Calendars"
          )}
        </button>
      </form>
    </div>
  );
};
