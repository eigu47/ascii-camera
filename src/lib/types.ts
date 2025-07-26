import { Dispatch, StateUpdater } from "preact/hooks";

export type SetState<T> = Dispatch<StateUpdater<T>>;
export type UseState<T> = [T, SetState<T>];

export interface Photo {
  url: string;
  timestamp: string;
}
