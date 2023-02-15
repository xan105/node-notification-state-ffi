About
=====

Get the current state of "Focus Assist" / "Quiet Hours" and/or check the state of the computer for the current user to determine whether sending a notification is appropriate.<br/>

This is a [FFI](https://en.wikipedia.org/wiki/Foreign_function_interface) wrapper to the Windows win32 shell API [SHQueryUserNotificationState](https://docs.microsoft.com/en-us/windows/win32/api/shellapi/nf-shellapi-shqueryusernotificationstate) and the undocumented WNF (Windows Notification Facility) API NtQueryWnfStateData.

Example
=======

```js
import { queryUserNotificationState } from "notification-state-ffi";

const state = queryUserNotificationState();
console.log(state); 
//QUNS_ACCEPTS_NOTIFICATIONS (notifications can be freely sent) 

//If you prefer the raw data instead:

const state = queryUserNotificationState({translate: false});
console.log(state); 
//5 (notifications can be freely sent)
```

You can use this to easily know if an application is currently running in fullscreen (_main monitor_):

```js
import { isFullscreenAppRunning } from "notification-state-ffi";

if (isFullscreenAppRunning()){
  //Do something
}
```

Focus assist / quiet hours

```js
import { queryFocusAssistState } from "notification-state-ffi";

const state = await queryFocusAssistState({translate: true});
console.log(state);
//PRIORITY_ONLY
```

Installation
============

```
npm install notification-state-ffi
```

API
===

⚠️ This module is only available as an ECMAScript module (ESM)<br />

## Named export

### `queryUserNotificationState(option?: object): Promise<number | string`>

Checks the state of the computer for the current user to determine whether sending a notification is appropriate.

⚙️ Options:

- translate?: boolean (true)

When a value is known it will be 'translated' to its string equivalent value otherwise its integer value.<br/>
If you want the raw data only set it to false.

Return value:

✔️ If this function succeeds, it returns [QUERY_USER_NOTIFICATION_STATE](https://docs.microsoft.com/en-us/windows/win32/api/shellapi/ne-shellapi-query_user_notification_state).<br/>
❌ Otherwise, it throws with the corresponding HRESULT error code.

Example:

```js
queryUserNotificationState({translate: true}) //QUNS_BUSY (string)
queryUserNotificationState({translate: false}) //2 (number)
```

### `isFullscreenAppRunning(): Promise<boolean>`

Uses `queryUserNotificationState()` to easily know if an application is currently running in fullscreen on the user's primary display.

Return value:

✔️ Returns whether an application is currently running in fullscreen.<br/>
If `queryUserNotificationState()` fails then `false` is assumed.

### `queryFocusAssistState(option?: object): Promise<number | string`>

Get the current state of "Focus Assist" / "Quiet Hours".

> ⚠ WNF (Windows Notification Facility) is an undocumented Windows API !
> This API can change/break at any time in the future.

⚙️ Options:

- translate?: boolean (true)

When a value is known it will be 'translated' to its string equivalent value otherwise its integer value.<br/>
If you want the raw data only set it to false.

Return value:

✔️ If this function succeeds, it returns the current state.<br/>
❌ Otherwise, it throws with the corresponding NTSTATUS error code.

Example:

```js
queryFocusAssistState({translate: true}) //PRIORITY_ONLY (string)
queryFocusAssistState({translate: false}) //1 (number)
```