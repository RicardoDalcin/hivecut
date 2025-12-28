import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function mapToObject<
  Key extends string | number | symbol = string,
  Value = unknown,
  Item = unknown,
>(
  array: Item[],
  iterator: (item: Item) => {
    key: Key;
    value: Value;
  }
) {
  return array.reduce(
    (acc, item) => {
      const { key, value } = iterator(item);
      acc[key as Key] = value;
      return acc;
    },
    {} as Record<Key, Value>
  );
}
