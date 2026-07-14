export interface WorkbookReadCoordinator {
  beginRead(): number;
  isActive(readId: number): boolean;
  requestConsent(
    readId: number,
    headers: readonly string[],
    onRequest: (headers: readonly string[]) => void,
  ): Promise<boolean>;
  resolveConsent(readId: number, confirmed: boolean): boolean;
  finishRead(readId: number): void;
  invalidate(): void;
}

interface PendingConsent {
  readId: number;
  resolve: (confirmed: boolean) => void;
}

export function createWorkbookReadCoordinator(): WorkbookReadCoordinator {
  let activeReadId = 0;
  let pendingConsent: PendingConsent | undefined;

  function cancelPendingConsent() {
    const pending = pendingConsent;
    pendingConsent = undefined;
    pending?.resolve(false);
  }

  return {
    beginRead() {
      activeReadId += 1;
      cancelPendingConsent();
      return activeReadId;
    },
    isActive(readId) {
      return readId === activeReadId;
    },
    requestConsent(readId, headers, onRequest) {
      if (readId !== activeReadId) return Promise.resolve(false);
      cancelPendingConsent();
      onRequest([...headers]);
      return new Promise((resolve) => {
        if (readId !== activeReadId) {
          resolve(false);
          return;
        }
        pendingConsent = { readId, resolve };
      });
    },
    resolveConsent(readId, confirmed) {
      if (readId !== activeReadId || pendingConsent?.readId !== readId) return false;
      const pending = pendingConsent;
      pendingConsent = undefined;
      pending.resolve(confirmed);
      return true;
    },
    finishRead(readId) {
      if (readId !== activeReadId) return;
      activeReadId += 1;
      cancelPendingConsent();
    },
    invalidate() {
      activeReadId += 1;
      cancelPendingConsent();
    },
  };
}
