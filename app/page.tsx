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
import { ConnectionStatus, EnergyReading, MQTT_CONFIG, useMqtt } from "@/hooks/useMqtt";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const appleBlue = "#0071E3";

const statusCopy: Record<ConnectionStatus, { label: string; dot: string; text: string; surface: string }> = {
  connected: {
    label: "Connected",
    dot: "bg-[#34C759] shadow-[0_0_0_6px_rgba(52,199,89,0.14)]",
    text: "text-[#1D1D1F]",
    surface: "bg-[#EAF8EF]",
  },
  disconnected: {
    label: "Disconnected",
    dot: "bg-[#FF3B30] shadow-[0_0_0_6px_rgba(255,59,48,0.14)]",
    text: "text-[#1D1D1F]",
    surface: "bg-[#FFF0EF]",
  },
  reconnecting: {
    label: "Reconnecting",
    dot: "bg-[#FF9500] shadow-[0_0_0_6px_rgba(255,149,0,0.14)]",
    text: "text-[#1D1D1F]",
    surface: "bg-[#FFF6E8]",
  },
};

const metrics: Array<{ key: keyof EnergyReading; label: string; unit: string; precision: number }> = [
  { key: "voltage", label: "Voltage", unit: "V", precision: 2 },
  { key: "current", label: "Current", unit: "mA", precision: 1 },
  { key: "power", label: "Power", unit: "mW", precision: 1 },
  { key: "energy", label: "Energy", unit: "Wh", precision: 3 },
];

export default function DashboardPage() {
  const { status, latest, powerHistory, error } = useMqtt();
  const statusInfo = statusCopy[status];

  const chartData = {
    labels: powerHistory.map((point) => point.time),
    datasets: [
      {
        label: "Power (mW)",
        data: powerHistory.map((point) => point.value),
        borderColor: appleBlue,
        backgroundColor: "rgba(0, 113, 227, 0.10)",
        pointBackgroundColor: appleBlue,
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
    <main className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-12 lg:py-10">
        <header className="sticky top-4 z-10 rounded-[20px] bg-white/72 px-5 py-4 shadow-apple backdrop-blur-2xl transition duration-300 sm:px-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold tracking-[-0.01em] text-[#0071E3]">Smart Energy Monitor</p>
              <h1 className="mt-2 text-3xl font-bold tracking-[-0.045em] text-[#1D1D1F] sm:text-5xl">Energy Dashboard</h1>
            </div>

            <div className={`flex w-full items-center justify-between gap-4 rounded-full px-4 py-3 md:w-auto ${statusInfo.surface}`}>
              <div className="flex items-center gap-3">
                <span className={`h-2.5 w-2.5 rounded-full ${statusInfo.dot}`} />
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#86868B]">MQTT status</p>
                  <p className={`text-sm font-semibold ${statusInfo.text}`}>{statusInfo.label}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="rounded-[20px] bg-white p-7 shadow-apple sm:p-9 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0071E3]">Live home telemetry</p>
              <h2 className="mt-4 text-4xl font-bold leading-[1.05] tracking-[-0.055em] text-[#1D1D1F] sm:text-6xl">
                A quiet view of your device in real time.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#86868B] sm:text-lg">
                The browser connects directly to MQTT over WebSocket and listens for energy readings on topic{" "}
                <span className="rounded-full bg-[#F5F5F7] px-3 py-1 font-mono text-sm text-[#1D1D1F]">{MQTT_CONFIG.topic}</span>.
              </p>
            </div>

            <div className="inline-flex items-center gap-3 rounded-full bg-[#F5F5F7] px-5 py-3 text-sm font-semibold text-[#1D1D1F] transition duration-300 hover:bg-[#E8F2FF]">
              <span className="h-2 w-2 rounded-full bg-[#0071E3] shadow-[0_0_0_6px_rgba(0,113,227,0.12)]" />
              Live stream
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-[18px] bg-white px-5 py-4 text-sm leading-6 text-[#86868B] shadow-apple">
            <span className="font-semibold text-[#1D1D1F]">Connection notice:</span> {error}
          </div>
        ) : null}

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <article
              key={metric.key}
              className="rounded-[20px] bg-white p-7 shadow-apple transition duration-300 hover:-translate-y-1 hover:shadow-apple-lg active:scale-[0.99]"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-[#86868B]">{metric.label}</p>
                <span className="rounded-full bg-[#E8F2FF] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#0071E3]">Live</span>
              </div>
              <div className="mt-9 flex items-baseline gap-2">
                <span className="font-mono text-4xl font-semibold tabular-nums tracking-[-0.05em] text-[#1D1D1F] transition-all duration-300 sm:text-5xl">
                  {latest[metric.key].toFixed(metric.precision)}
                </span>
                <span className="text-base font-semibold text-[#86868B]">{metric.unit}</span>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-[20px] bg-white p-6 shadow-apple sm:p-8 lg:p-10">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0071E3]">Power trend</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.045em] text-[#1D1D1F] sm:text-4xl">Power over time</h2>
            </div>
            <p className="rounded-full bg-[#F5F5F7] px-4 py-2 text-sm font-medium text-[#86868B]">
              Latest {Math.min(powerHistory.length, 60)} of 60 readings
            </p>
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
                    backgroundColor: "rgba(29, 29, 31, 0.92)",
                    titleColor: "#FFFFFF",
                    bodyColor: "#FFFFFF",
                    padding: 12,
                    cornerRadius: 14,
                    displayColors: false,
                  },
                },
                scales: {
                  x: {
                    border: { display: false },
                    grid: { color: "rgba(134, 134, 139, 0.10)" },
                    ticks: { color: "#86868B", maxTicksLimit: 8, padding: 10 },
                  },
                  y: {
                    border: { display: false },
                    grid: { color: "rgba(134, 134, 139, 0.10)" },
                    ticks: { color: "#86868B", padding: 10 },
                    title: { display: true, text: "mW", color: "#86868B" },
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
