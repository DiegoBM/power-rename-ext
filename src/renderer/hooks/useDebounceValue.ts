import { useState, useEffect } from 'react';

export function useDebounceValue<T>(
  initialValue: T,
  onDebounceChange: (newValue: T) => void,
  delay: number = 500
) {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    const id = setTimeout(() => {
      onDebounceChange(value);
    }, delay);

    return () => clearTimeout(id);
  }, [value, delay]);

  return [value, setValue] as const;
}
