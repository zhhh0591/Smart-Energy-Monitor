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
import { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import type { EnergyReading } from "@/hooks/useMqtt";
import { MQTT_CONFIG } from "@/hooks/useMqtt";
import { useMockData } from "@/hooks/useMockData";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const dataSourceLabel = "Mock Data";
const appleGreen = "#34C759";
const appleRed = "#FF3B30";
const appleMuted = "#8E8E93";

const metrics: Array<{ key: keyof EnergyReading; label: string; unit: string; precision: number }> = [
  { key: "voltage", label: "Voltage", unit: "V", precision: 2 },
  { key: "current", label: "Current", unit: "mA", precision: 1 },
  { key: "power", label: "Power", unit: "mW", precision: 1 },
  { key: "energy", label: "Energy", unit: "Wh", precision: 3 },
];

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(query.matches);

    const handleChange = () => setPrefersReducedMotion(query.matches);
    query.addEventListener("change", handleChange);

    return () => query.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

function easeOutCubic(progress: number) {
  return 1 - Math.pow(1 - progress, 3);
}

function AnimatedMetricNumber({ value, precision }: { value: number; precision: number }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [displayValue, setDisplayValue] = useState(value);
  const previousValueRef = useRef(value);

  useEffect(() => {
    if (prefersReducedMotion) {
      previousValueRef.current = value;
      setDisplayValue(value);
      return;
    }

    const startValue = previousValueRef.current;
    const change = value - startValue;
    const duration = 320;
    const startTime = performance.now();
    let animationFrame = 0;

    const tick = (time: number) => {
      const progress = Math.min((time - startTime) / duration, 1);
      setDisplayValue(startValue + change * easeOutCubic(progress));

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(tick);
      } else {
        previousValueRef.current = value;
      }
    };

    animationFrame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(animationFrame);
  }, [prefersReducedMotion, value]);

  return <>{displayValue.toFixed(precision)}</>;
}

export default function DashboardPage() {
  const { latest, powerHistory } = useMockData();
  const prefersReducedMotion = usePrefersReducedMotion();
  const isConnected = powerHistory.length > 0;
  const isOverload = latest.power >= 1000;
  const chartAccent = isOverload ? appleRed : appleGreen;
  const statusLabel = isConnected ? "Connected" : "Disconnected";
  const systemStateLabel = isOverload ? "Overload" : "Normal";

  const chartData = {
    labels: powerHistory.map((point) => point.time),
    datasets: [
      {
        label: "Power (mW)",
        data: powerHistory.map((point) => point.value),
        borderColor: chartAccent,
        backgroundColor: isOverload ? "rgba(255, 59, 48, 0.08)" : "rgba(52, 199, 89, 0.10)",
        pointBackgroundColor: chartAccent,
        pointBorderColor: "#FFFFFF",
        pointBorderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 3,
        tension: 0.42,
        fill: true,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-ios-bg text-ios-ink">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-7 sm:gap-8 sm:px-8 sm:py-10 lg:px-10 lg:py-14">
        <header className="flex flex-col gap-5 px-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[15px] font-semibold leading-6 text-ios-muted">Smart Energy Monitor</p>
            <h1 className="mt-1 text-4xl font-bold leading-tight tracking-normal text-ios-ink sm:text-5xl">Energy</h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-ios-muted sm:text-base">
              {dataSourceLabel} · MQTT topic {MQTT_CONFIG.topic}
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2.5 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-ios-ink shadow-ios-soft transition duration-300 ease-out motion-safe:hover:scale-[1.02]">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{
                backgroundColor: isConnected ? appleGreen : appleRed,
                boxShadow: `0 0 0 5px ${isConnected ? "rgba(52, 199, 89, 0.12)" : "rgba(255, 59, 48, 0.12)"}`,
              }}
            />
            {statusLabel}
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric, index) => (
            <article
              key={metric.key}
              className="rounded-[20px] bg-white p-6 shadow-ios-soft transition duration-300 ease-out motion-safe:animate-card-in motion-safe:hover:-translate-y-1 motion-safe:hover:scale-[1.01] motion-safe:hover:shadow-ios-soft-hover active:scale-[0.99] sm:p-7"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <div className="flex min-h-8 items-start justify-between gap-4">
                <h2 className="text-[15px] font-semibold leading-6 text-ios-muted">{metric.label}</h2>
                {metric.key === "power" ? (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                    style={{ color: isOverload ? appleRed : appleGreen, backgroundColor: isOverload ? "rgba(255, 59, 48, 0.08)" : "rgba(52, 199, 89, 0.10)" }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: isOverload ? appleRed : appleGreen }} />
                    {systemStateLabel}
                  </span>
                ) : null}
              </div>

              <div className="mt-8 flex items-baseline gap-2">
                <span className="text-[42px] font-bold leading-none tracking-normal text-ios-ink tabular-nums transition-colors duration-300 sm:text-5xl">
                  <AnimatedMetricNumber value={latest[metric.key]} precision={metric.precision} />
                </span>
                <span className="text-base font-semibold leading-6 text-ios-muted">{metric.unit}</span>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-[20px] bg-white p-6 shadow-ios-soft transition duration-300 ease-out motion-safe:animate-card-in motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-ios-soft-hover sm:p-7 lg:p-8" style={{ animationDelay: "320ms" }}>
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[15px] font-semibold leading-6 text-ios-muted">Power Chart</p>
              <h2 className="mt-1 text-3xl font-bold leading-tight tracking-normal text-ios-ink">Power Over Time</h2>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-ios-bg px-3 py-2 text-sm font-semibold text-ios-muted">
              Latest {Math.min(powerHistory.length, 60)} of 60 readings
            </div>
          </div>

          <div className="h-[320px] w-full sm:h-[430px]">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: prefersReducedMotion ? 0 : 360 },
                interaction: { mode: "index", intersect: false },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    mode: "index",
                    intersect: false,
                    backgroundColor: "rgba(29, 29, 31, 0.94)",
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
                    grid: { color: "rgba(142, 142, 147, 0.12)" },
                    ticks: { color: appleMuted, maxTicksLimit: 8, padding: 10 },
                  },
                  y: {
                    border: { display: false },
                    grid: { color: "rgba(142, 142, 147, 0.12)" },
                    ticks: { color: appleMuted, padding: 10 },
                    title: { display: true, text: "mW", color: appleMuted },
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
