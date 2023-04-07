export function queryUserNotificationState(option?: {
  translate?: boolean
}): Promise<number | string>;

export function isFullscreenAppRunning(): Promise<boolean>;
