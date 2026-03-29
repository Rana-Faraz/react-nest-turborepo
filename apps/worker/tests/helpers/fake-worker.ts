export type WorkerListener = (...args: unknown[]) => void;

export function createFakeWorkerEventTarget() {
  const events: string[] = [];
  const listeners = new Map<string, WorkerListener>();

  return {
    events,
    listeners,
    target: {
      on(event: string, listener: WorkerListener) {
        events.push(event);
        listeners.set(event, listener);
        return this;
      },
    },
  };
}
