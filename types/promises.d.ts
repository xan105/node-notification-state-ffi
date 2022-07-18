declare interface IOption {
  translate?: boolean,
}

export function queryUserNotificationState(option?: IOption): Promise<number | string>
export function isFullscreenAppRunning(): Promise<boolean>