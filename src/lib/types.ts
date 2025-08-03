import { ASCII_CHARS } from "@/lib/constants";
import { Dispatch, StateUpdater } from "preact/hooks";

export type SetState<T> = Dispatch<StateUpdater<T>>;
export type UseState<T> = [T, SetState<T>];

export interface Photo {
  url: string;
  timestamp: string;
}

export interface CameraSettings {
  asciiMode: boolean;
  color: string | undefined;
  facingMode: "user" | "environment";
  res: number;
  chars: keyof typeof ASCII_CHARS;
  contrast: number;
  brightness: number;
}
