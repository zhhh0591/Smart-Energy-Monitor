"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { EnergyReading } from "@/hooks/useMqtt";
import { MQTT_CONFIG } from "@/hooks/useMqtt";
import { useMockData } from "@/hooks/useMockData";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const dataSourceLabel = "Mock data";
const accentColor = "#FF5A5F";

const metrics: Array<{ key: keyof EnergyReading; label: string; unit: string; precision: number }> = [
  { key: "voltage", label: "Voltage", unit: "V", precision: 2 },
  { key: "current", label: "Current", unit: "mA", precision: 1 },
  { key: "power", label: "Power", unit: "mW", precision: 1 },
  { key: "energy", label: "Energy", unit: "Wh", precision: 3 },
];

export default function DashboardPage() {
  // 当前阶段使用模拟数据。之后接入硬件时，只需要把这里替换成 useMqtt()。
  const { latest, powerHistory } = useMockData();

  const chartData = {
    labels: powerHistory.map((point) => point.time),
    datasets: [
      {
        label: "Power (mW)",
        data: powerHistory.map((point) => point.value),
        borderColor: accentColor,
        backgroundColor: "rgba(255, 90, 95, 0.10)",
        pointBackgroundColor: accentColor,
        pointBorderColor: "#FFFFFF",
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2.5,
        tension: 0.38,
        fill: true,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-[#222222]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
        <header className="flex flex-col gap-8 rounded-2xl bg-white px-6 py-7 shadow-soft transition duration-300 sm:px-8 sm:py-9 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#FF5A5F]">IoT Energy Monitor</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#222222] sm:text-5xl lg:text-6xl">
              Home Energy Dashboard
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#717171] sm:text-lg">
              A calm, real-time view of your device readings. This version uses local mock data and is ready to switch to MQTT over WebSocket for topic{" "}
              <span className="rounded-full bg-[#FFF1F1] px-2.5 py-1 font-mono text-sm text-[#D94A4F]">{MQTT_CONFIG.topic}</span>.
            </p>
          </div>

          <div className="w-full rounded-2xl bg-[#FAFAFA] p-5 shadow-inner-soft sm:w-auto sm:min-w-56">
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF5A5F] shadow-[0_0_0_6px_rgba(255,90,95,0.12)]" />
              <div>
                <p className="text-sm text-[#717171]">Data source</p>
                <p className="mt-1 text-lg font-semibold text-[#222222]">{dataSourceLabel}</p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <article
              key={metric.key}
              className="rounded-2xl bg-white p-6 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-soft-lg sm:p-7"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-[#717171]">{metric.label}</p>
                <span className="rounded-full bg-[#FFF1F1] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#FF5A5F]">Live</span>
              </div>
              <div className="mt-8 flex items-baseline gap-2">
                <span className="font-mono text-4xl font-semibold tabular-nums tracking-[-0.04em] text-[#222222] transition-all duration-300 sm:text-5xl">
                  {latest[metric.key].toFixed(metric.precision)}
                </span>
                <span className="text-base font-medium text-[#717171]">{metric.unit}</span>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-soft sm:p-8 lg:p-10">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#FF5A5F]">Real-time trend</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#222222] sm:text-4xl">Power over time</h2>
            </div>
            <p className="text-sm leading-6 text-[#717171]">Showing the latest {Math.min(powerHistory.length, 60)} of 60 readings</p>
          </div>

          <div className="h-[320px] w-full sm:h-[430px]">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 450 },
                interaction: { mode: "index", intersect: false },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    mode: "index",
                    intersect: false,
                    backgroundColor: "rgba(34, 34, 34, 0.92)",
                    titleColor: "#FFFFFF",
                    bodyColor: "#FFFFFF",
                    padding: 12,
                    cornerRadius: 12,
                    displayColors: false,
                  },
                },
                scales: {
                  x: {
                    border: { display: false },
                    grid: { color: "rgba(113, 113, 113, 0.08)" },
                    ticks: { color: "#717171", maxTicksLimit: 8, padding: 10 },
                  },
                  y: {
                    border: { display: false },
                    grid: { color: "rgba(113, 113, 113, 0.08)" },
                    ticks: { color: "#717171", padding: 10 },
                    title: { display: true, text: "mW", color: "#717171" },
                  },
                },
              }}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
