import {
  Dispatch,
  SetStateAction,
  useState,
} from "react";

export interface IState<T> {
  value: T;
  set: Dispatch<SetStateAction<T>>;
}

export function newState<T>(defaultValue: T): IState<T> {
  const [val, setVal] = useState(defaultValue)
  return {
    value: val,
    set: setVal,
  }
}
