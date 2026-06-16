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

const statusCopy: Record<ConnectionStatus, { label: string; dot: string; text: string }> = {
  connected: { label: "已连接", dot: "bg-emerald-400 shadow-emerald-400/60", text: "text-emerald-300" },
  disconnected: { label: "断开", dot: "bg-red-500 shadow-red-500/60", text: "text-red-300" },
  reconnecting: { label: "重连中", dot: "bg-amber-400 shadow-amber-400/60", text: "text-amber-200" },
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
        borderColor: "#22d3ee",
        backgroundColor: "rgba(34, 211, 238, 0.14)",
        pointBackgroundColor: "#67e8f9",
        pointBorderWidth: 0,
        pointRadius: 2,
        borderWidth: 2,
        tension: 0.35,
        fill: true,
      },
    ],
  };

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0 -z-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.24),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.92),rgba(2,6,23,1))]" />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-cyan-400/10 bg-slate-900/70 p-5 shadow-glow backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">IoT Energy Monitor</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">电能监测仪表盘</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              纯前端通过 MQTT over WebSocket 订阅实时设备数据，当前 Topic：
              <span className="font-mono text-cyan-200">{MQTT_CONFIG.topic}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
            <span className={`h-3 w-3 rounded-full shadow-[0_0_14px] ${statusInfo.dot}`} />
            <div>
              <p className="text-xs text-slate-500">MQTT Status</p>
              <p className={`font-semibold ${statusInfo.text}`}>{statusInfo.label}</p>
            </div>
          </div>
        </header>

        {error ? (
          <div className="rounded-2xl border border-red-400/20 bg-red-950/30 px-4 py-3 text-sm text-red-200">连接提示：{error}</div>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <article key={metric.key} className="rounded-3xl border border-white/10 bg-slate-900/75 p-5 shadow-xl backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-400">{metric.label}</p>
                <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-xs text-cyan-200">LIVE</span>
              </div>
              <div className="mt-5 flex items-end gap-2">
                <span className="font-mono text-4xl font-semibold tabular-nums tracking-tight text-white transition-all duration-300 md:text-5xl">
                  {latest[metric.key].toFixed(metric.precision)}
                </span>
                <span className="pb-2 text-sm text-slate-400">{metric.unit}</span>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-2xl backdrop-blur sm:p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-cyan-300/70">Realtime Trend</p>
              <h2 className="mt-1 text-2xl font-semibold text-white">Power 实时功率曲线</h2>
            </div>
            <p className="text-sm text-slate-400">最近 {Math.min(powerHistory.length, 60)} / 60 个数据点</p>
          </div>

          <div className="h-[320px] w-full sm:h-[420px]">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 450 },
                plugins: {
                  legend: { display: false },
                  tooltip: { mode: "index", intersect: false },
                },
                scales: {
                  x: { grid: { color: "rgba(148, 163, 184, 0.12)" }, ticks: { color: "#94a3b8", maxTicksLimit: 8 } },
                  y: { grid: { color: "rgba(148, 163, 184, 0.12)" }, ticks: { color: "#94a3b8" }, title: { display: true, text: "mW", color: "#67e8f9" } },
                },
              }}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
