export interface DrawState {
  ranges: RangeInput[];
  history: number[];
}

export interface RangeInput {
  from: string;
  to: string;
}

export interface ValidRange {
  from: number;
  to: number;
  total: number;
}
