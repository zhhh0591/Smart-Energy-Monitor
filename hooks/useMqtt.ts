"use client";

import mqtt, { MqttClient } from "mqtt";
import { useEffect, useReducer, useRef } from "react";

// 浏览器只能连接 MQTT over WebSocket。请把 brokerUrl 改成你的 WebSocket 地址，不能使用 1883 TCP 端口。
export const MQTT_CONFIG = {
  brokerUrl: "wss://broker.emqx.io:8084/mqtt",
  topic: "your/topic/here",
  clientId: `smart-energy-dashboard-${Math.random().toString(16).slice(2)}`,
  reconnectPeriod: 3000,
};

export type EnergyReading = {
  voltage: number;
  current: number;
  power: number;
  energy: number;
};

export type ConnectionStatus = "connected" | "disconnected" | "reconnecting";

type PowerPoint = {
  time: string;
  value: number;
};

type MqttState = {
  status: ConnectionStatus;
  latest: EnergyReading;
  powerHistory: PowerPoint[];
  error?: string;
};

type MqttAction =
  | { type: "STATUS"; status: ConnectionStatus; error?: string }
  | { type: "MESSAGE"; payload: EnergyReading };

const initialReading: EnergyReading = {
  voltage: 0,
  current: 0,
  power: 0,
  energy: 0,
};

const initialState: MqttState = {
  status: "disconnected",
  latest: initialReading,
  powerHistory: [],
};

function reducer(state: MqttState, action: MqttAction): MqttState {
  switch (action.type) {
    case "STATUS":
      return { ...state, status: action.status, error: action.error };
    case "MESSAGE": {
      const nextPoint = {
        time: new Date().toLocaleTimeString("zh-CN", { hour12: false }),
        value: action.payload.power,
      };

      // 只保留最近 60 秒左右的数据，避免图表持续膨胀影响浏览器性能。
      const powerHistory = [...state.powerHistory, nextPoint].slice(-60);

      return {
        ...state,
        latest: action.payload,
        powerHistory,
        error: undefined,
      };
    }
    default:
      return state;
  }
}

function normalizeReading(input: unknown): EnergyReading | null {
  if (!input || typeof input !== "object") return null;

  const maybeReading = input as Partial<Record<keyof EnergyReading, unknown>>;
  const voltage = Number(maybeReading.voltage);
  const current = Number(maybeReading.current);
  const power = Number(maybeReading.power);
  const energy = Number(maybeReading.energy);

  if ([voltage, current, power, energy].some((value) => Number.isNaN(value))) {
    return null;
  }

  return { voltage, current, power, energy };
}

export function useMqtt() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const clientRef = useRef<MqttClient | null>(null);

  useEffect(() => {
    const client = mqtt.connect(MQTT_CONFIG.brokerUrl, {
      clientId: MQTT_CONFIG.clientId,
      clean: true,
      connectTimeout: 8000,
      reconnectPeriod: MQTT_CONFIG.reconnectPeriod,
    });

    clientRef.current = client;
    dispatch({ type: "STATUS", status: "reconnecting" });

    client.on("connect", () => {
      dispatch({ type: "STATUS", status: "connected" });
      client.subscribe(MQTT_CONFIG.topic, (error) => {
        if (error) {
          dispatch({ type: "STATUS", status: "disconnected", error: error.message });
        }
      });
    });

    client.on("reconnect", () => dispatch({ type: "STATUS", status: "reconnecting" }));
    client.on("close", () => dispatch({ type: "STATUS", status: "disconnected" }));
    client.on("offline", () => dispatch({ type: "STATUS", status: "disconnected" }));
    client.on("error", (error) => dispatch({ type: "STATUS", status: "disconnected", error: error.message }));

    client.on("message", (_topic, payload) => {
      try {
        const parsed = JSON.parse(payload.toString());
        const reading = normalizeReading(parsed);
        if (reading) dispatch({ type: "MESSAGE", payload: reading });
      } catch {
        // 非 JSON 消息会被忽略，避免单条异常数据导致仪表盘崩溃。
      }
    });

    return () => {
      client.end(true);
      clientRef.current = null;
    };
  }, []);

  return state;
}
