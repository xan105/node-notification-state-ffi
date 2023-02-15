declare interface Option {
  translate?: boolean,
}

export function queryUserNotificationState(option?: Option): Promise<number | string>
export function isFullscreenAppRunning(): Promise<boolean>
export function queryFocusAssistState(option?: Option): Promise<number | string>