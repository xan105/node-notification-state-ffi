declare interface IOption {
  translate?: boolean,
}

export function queryUserNotificationState(option?: IOption): number | string
export function isFullscreenAppRunning(): boolean

export * as promises from "./promises.d.ts"