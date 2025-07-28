import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCharMap(chars: string) {
  return new Array(256).fill("").map((_, i) => {
    const index = Math.floor((i / 255) * (chars.length - 1));
    return chars[index] ?? " ";
  });
}
