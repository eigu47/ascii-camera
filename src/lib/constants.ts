import { CameraSettings } from "@/lib/types";
import { getCharMap } from "@/lib/utils";

export const INITIAL_STATE: CameraSettings = {
  asciiMode: true,
  color: "#0f0",
  facingMode: "user",
  res: 1,
  chars: "detailed",
  contrast: 200,
  brightness: 200,
} as const;

export const CAMERA_RES = {
  width: 1280,
  height: 720,
};

export const CHAR_RES = {
  width: 10,
  height: 10,
};

export const ASCII_CHARS = {
  detailed: `$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,"^'. `,
  block: "█▓▒░ ",
  minimal: "@%#*+=-:. ",
};

export const CHAR_MAP = (
  Object.entries(ASCII_CHARS) as [keyof typeof ASCII_CHARS, string][]
).reduce(
  (acc, [type, chars]) => {
    acc[type] = getCharMap(chars);
    return acc;
  },
  {} as Record<keyof typeof ASCII_CHARS, string[]>,
);

// export const BRIGHTNESS_ALGOS = {
//   average: (r: number, g: number, b: number) => Math.floor((r + g + b) / 3),
//   luminosity: (r: number, g: number, b: number) =>
//     Math.floor(0.2126 * r + 0.7152 * g + 0.0722 * b),
//   minMaxAverage: (r: number, g: number, b: number) =>
//     Math.floor((Math.max(r, g, b) + Math.min(r, g, b)) / 2),
// };
