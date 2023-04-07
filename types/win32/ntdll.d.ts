export function queryFocusAssistState(option?: {
  translate?: boolean,
  stateError?: boolean
}): Promise<number | string>;

export function focusAssist(enable: boolean, option?: {
  checkSuccess?: boolean
}): Promise<void>;
