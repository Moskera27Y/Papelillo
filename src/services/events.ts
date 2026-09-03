// ============================================================
// EVENTOS — Pub/Sub simple para notificar cambios entre hooks.
// ============================================================

import type { DataChannel } from "@/types/admin";

type Listener = () => void;

const listeners = new Map<DataChannel, Set<Listener>>();

export function subscribe(channel: DataChannel, listener: Listener): () => void {
  if (!listeners.has(channel)) listeners.set(channel, new Set());
  listeners.get(channel)!.add(listener);
  return () => {
    listeners.get(channel)?.delete(listener);
  };
}

export function emit(channel: DataChannel): void {
  listeners.get(channel)?.forEach((fn) => {
    try {
      fn();
    } catch {
      // ignore
    }
  });
}
