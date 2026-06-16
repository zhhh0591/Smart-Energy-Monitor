"use client";

import { useEffect, useReducer, useRef } from "react";
import type { EnergyReading } from "./useMqtt";

export type PowerPoint = {
  time: string;
  value: number;
};

export type EnergyDataState = {
  latest: EnergyReading;
  powerHistory: PowerPoint[];
};

type EnergyDataAction = { type: "READING_RECEIVED"; payload: EnergyReading };

const initialState: EnergyDataState = {
  latest: {
    voltage: 0,
    current: 0,
    power: 0,
    energy: 0,
  },
  powerHistory: [],
};

function energyDataReducer(state: EnergyDataState, action: EnergyDataAction): EnergyDataState {
  switch (action.type) {
    case "READING_RECEIVED": {
      const nextPoint: PowerPoint = {
        time: new Date().toLocaleTimeString("zh-CN", { hour12: false }),
        value: action.payload.power,
      };

      // 图表只需要滚动展示最近 60 个点，避免运行很久后数组无限增长。
      const powerHistory = [...state.powerHistory, nextPoint].slice(-60);

      return {
        latest: action.payload,
        powerHistory,
      };
    }
  }
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function createMockReading(previousEnergy: number): EnergyReading {
  const voltage = randomBetween(3.6, 3.8);
  const current = randomBetween(100, 300);
  const power = voltage * current;

  // 每秒新增的 Wh = mW / 1000 / 3600，模拟累计电能持续上升。
  const energy = previousEnergy + power / 1000 / 3600;

  return {
    voltage,
    current,
    power,
    energy,
  };
}

export function useMockData() {
  const [state, dispatch] = useReducer(energyDataReducer, initialState);
  const energyRef = useRef(0.01);

  useEffect(() => {
    const pushMockReading = () => {
      const reading = createMockReading(energyRef.current);
      energyRef.current = reading.energy;
      dispatch({ type: "READING_RECEIVED", payload: reading });
    };

    // 首次进入页面立即显示一条数据，之后按硬件计划的 1 秒节奏推送。
    pushMockReading();
    const timerId = window.setInterval(pushMockReading, 1000);

    return () => window.clearInterval(timerId);
  }, []);

  return state;
}
