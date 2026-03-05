"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";

export default function CalendarPage() {
  const [currentDate] = useState(new Date("2025-02-23T12:00:00")); // Hardcode to match demo dates
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getWeekDates = () => {
    const start = new Date(currentDate);
    start.setDate(currentDate.getDate() - currentDate.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const weekDates = getWeekDates();

  // Demo tasks matching the reference image
  const tasks = {
    "2025-02-23": [
      { id: 1, agent: "Charlie", title: "Optimize web scrapers", color: "bg-blue-500/20", borderColor: "border-blue-500/50", iconTag: "bg-blue-500" },
      { id: 2, agent: "Henry", title: "Draft client proposal", color: "bg-red-500/20", borderColor: "border-red-500/50", iconTag: "bg-red-500" }
    ],
    "2025-02-24": [
      { id: 3, agent: "Scout", title: "Research new trends", color: "bg-green-500/20", borderColor: "border-green-500/50", iconTag: "bg-green-500" }
    ],
    "2025-02-25": [],
    "2025-02-26": [],
    "2025-02-27": [],
    "2025-02-28": [],
    "2025-03-01": []
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-white tracking-tight">Calendar</h1>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/20 text-xs font-medium">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            2 agents online
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-zinc-300 font-medium">
            <button className="p-1.5 hover:bg-zinc-800 rounded-md transition-colors text-zinc-500 hover:text-zinc-300">
              <ChevronLeft size={18} />
            </button>
            <span className="min-w-[140px] text-center">Feb 23 - Mar 1</span>
            <button className="p-1.5 hover:bg-zinc-800 rounded-md transition-colors text-zinc-500 hover:text-zinc-300">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex h-full min-w-[900px]">
          {weekDates.map((date, idx) => {
            const dateKey = date.toISOString().split("T")[0];
            const dayTasks = tasks[dateKey as keyof typeof tasks] || [];

            return (
              <div
                key={dateKey}
                className={`flex-1 flex flex-col border-r border-zinc-800 last:border-r-0 ${idx % 2 === 0 ? 'bg-[#12121a]' : 'bg-[#16161f]'}`}
              >
                {/* Column Header */}
                <div className="p-3 border-b border-zinc-800 flex items-baseline justify-between">
                  <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">
                    {daysOfWeek[date.getDay()]}
                  </span>
                  <span className="text-zinc-300 text-sm font-medium">
                    {date.getDate()}
                  </span>
                </div>

                {/* Column Body */}
                <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                  {dayTasks.map(task => (
                    <div
                      key={task.id}
                      className={`p-3 rounded-lg border ${task.color} ${task.borderColor} flex flex-col gap-2 cursor-pointer hover:brightness-110 transition-all`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-sm flex items-center justify-center text-[8px] font-bold text-white ${task.iconTag}`}>
                          {task.agent.charAt(0)}
                        </div>
                        <span className="text-xs font-medium text-zinc-200">{task.agent}</span>
                      </div>
                      <p className="text-sm text-zinc-300 leading-snug">
                        {task.title}
                      </p>
                    </div>
                  ))}

                  {/* Plus button for empty slot */}
                  <div className="opacity-0 hover:opacity-100 transition-opacity p-2 flex justify-center">
                    <button className="w-full py-1.5 flex items-center justify-center text-zinc-600 hover:bg-zinc-800 hover:text-zinc-400 rounded-md border border-dashed border-zinc-700">
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
