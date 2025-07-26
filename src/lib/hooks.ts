import { useAutoAnimate as useAutoAnimateOriginal } from "@formkit/auto-animate/preact";
import { RefObject } from "preact";

export function useAutoAnimate<T extends Element>() {
  return useAutoAnimateOriginal<T>() as [
    RefObject<T>,
    (enabled: boolean) => void,
  ];
}
