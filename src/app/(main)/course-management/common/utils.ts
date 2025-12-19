export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export const formatDuration = (minutes: number): string => {
  if (!minutes || minutes < 0) return "0p";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}p` : `${m}p`;
};

export const generateTempId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const getLabelFromValue = <T = string>(
  value: T,
  options: { label: string; value: T }[],
  eq?: (a: T, b: T) => boolean
): string => {
  const found = options.find((opt) =>
    eq ? eq(opt.value, value) : opt.value === value
  );
  return found ? found.label : String(value);
};

export const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  try {
    if (typeof err === "string") return err;
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
};

export function debounce<F extends (...args: any[]) => unknown>(
  func: F,
  wait: number
) {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  return function (this: ThisParameterType<F>, ...args: Parameters<F>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args as any), wait);
  } as (...args: Parameters<F>) => void;
}
