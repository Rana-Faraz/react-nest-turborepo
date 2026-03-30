import type { WorkerEventName, WorkerEventTarget } from "../../src/worker";

type RegisteredWorkerListener = (...args: unknown[]) => void;

export function createFakeWorkerEventTarget() {
  const events: WorkerEventName[] = [];
  const listeners = new Map<WorkerEventName, RegisteredWorkerListener>();

  const target: WorkerEventTarget = {
    on(event, listener) {
      events.push(event);
      listeners.set(event, listener as RegisteredWorkerListener);
      return this;
    },
  };

  return {
    events,
    listeners,
    target,
  };
}
