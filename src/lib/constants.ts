import { CameraSettings } from "@/lib/types";

export const INITIAL_STATE: CameraSettings = {
  asciiMode: true,
  facingMode: "user",
  chars: "detailed",
  res: 1,
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
