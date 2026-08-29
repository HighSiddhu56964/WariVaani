"use client";

import { useEffect, useState } from "react";
import { wariWsManager, WariEvent, WariEventType } from "../services/websocket";

export function useWariVaaniSocket(eventType?: WariEventType | "*", onEvent?: (event: WariEvent) => void) {
  const [lastEvent, setLastEvent] = useState<WariEvent | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    wariWsManager.connect();

    const targetType = eventType || "*";
    const unsubscribe = wariWsManager.subscribe(targetType, (event) => {
      setLastEvent(event);
      if (onEvent) {
        onEvent(event);
      }
    });

    setIsConnected(true);

    return () => {
      unsubscribe();
    };
  }, [eventType, onEvent]);

  return { lastEvent, isConnected };
}
