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
        time: new Date().toLocaleTimeString("en-US", { hour12: false }),
        value: action.payload.power,
      };

      // Keep the chart focused on the latest 60 readings.
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

  // Added Wh per second = mW / 1000 / 3600.
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

    // Show one reading immediately, then continue at the planned 1 second hardware cadence.
    pushMockReading();
    const timerId = window.setInterval(pushMockReading, 1000);

    return () => window.clearInterval(timerId);
  }, []);

  return state;
}
