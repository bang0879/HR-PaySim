export function isPlainDataRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return false;
  return Object.keys(value).every((key) => isOwnDataProperty(value, key));
}

export function isPlainDataArray(value: unknown): value is unknown[] {
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) return false;
  if (Object.keys(value).length !== value.length) return false;
  return Object.keys(value).every((key) => isOwnDataProperty(value, key));
}

export function cloneSafePlainData<T>(value: T): T {
  if (isPlainDataArray(value)) {
    return value.map((item) => cloneSafePlainData(item)) as T;
  }
  if (isPlainDataRecord(value)) {
    const clone: Record<string, unknown> = {};
    for (const key of Object.keys(value)) {
      Object.defineProperty(clone, key, {
        configurable: true,
        enumerable: true,
        writable: true,
        value: cloneSafePlainData(ownDataValue(value, key)),
      });
    }
    return clone as T;
  }
  return value;
}

export function safePlainDataEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (Array.isArray(left) || Array.isArray(right)) {
    return isPlainDataArray(left)
      && isPlainDataArray(right)
      && left.length === right.length
      && left.every((item, index) => safePlainDataEqual(item, right[index]));
  }
  if (!isPlainDataRecord(left) || !isPlainDataRecord(right)) return false;
  const leftKeys = Object.keys(left).sort(compareCodeUnits);
  const rightKeys = Object.keys(right).sort(compareCodeUnits);
  return leftKeys.length === rightKeys.length
    && leftKeys.every((key, index) => (
      key === rightKeys[index]
      && safePlainDataEqual(ownDataValue(left, key), ownDataValue(right, key))
    ));
}

export function ownDataValue(
  value: Record<string, unknown>,
  key: string,
): unknown {
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  return descriptor && "value" in descriptor ? descriptor.value : undefined;
}

function isOwnDataProperty(value: object, key: string): boolean {
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  return descriptor !== undefined && "value" in descriptor;
}

function compareCodeUnits(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
