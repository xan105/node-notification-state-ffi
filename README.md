About
=====

Get the current state of "Focus Assist" and/or check the state of the computer for the current user to determine whether sending a notification is appropriate.<br/>

This is a [FFI](https://en.wikipedia.org/wiki/Foreign_function_interface) wrapper to the Windows win32 shell API [SHQueryUserNotificationState](https://docs.microsoft.com/en-us/windows/win32/api/shellapi/nf-shellapi-shqueryusernotificationstate) and undocumented WNF (Windows Notification Facility) API.

Example
=======

```js
import { queryUserNotificationState } from "notification-state-ffi";

const state = await queryUserNotificationState();
console.log(state); 
//QUNS_ACCEPTS_NOTIFICATIONS (notifications can be freely sent) 

//If you prefer the raw data instead:

const state = await queryUserNotificationState({translate: false});
console.log(state); 
//5 (notifications can be freely sent)
```

You can use `queryUserNotificationState()` to easily know if an application is currently running in fullscreen on the user's primary display

```js
import { isFullscreenAppRunning } from "notification-state-ffi";

if (await isFullscreenAppRunning()){
  //Do something
}
```

Focus assist current state

```js
import { queryFocusAssistState } from "notification-state-ffi";

const state = await queryFocusAssistState({translate: true});
console.log(state);
//PRIORITY_ONLY
```

Disable / enable focus assist

```js
import { focusAssist } from "notification-state-ffi";

console.log("Disabling...");
await focusAssist(false).catch(console.error);

console.log("Enabling...");
await focusAssist(true).catch(console.error);
```

Installation
============

```
npm install notification-state-ffi
```

_Prerequisite: C/C++ build tools to build [koffi](https://www.npmjs.com/package/koffi)._

API
===

⚠️ This module is only available as an ECMAScript module (ESM)<br />

## Named export

### `queryUserNotificationState(option?: object): Promise<number | string>`

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

### `queryFocusAssistState(option?: object): Promise<number | string>`

Get the current state of "Focus Assist".

> ⚠ WNF (Windows Notification Facility) is an undocumented Windows API !
> This API can change/break at any time in the future.

⚙️ Options:

- translate?: boolean (true)

When a value is known it will be 'translated' to its string equivalent value otherwise its integer value.<br/>
If you want the raw data only set it to false.

- stateError?: boolean (false)

When `true` the state `NOT_SUPPORTED` _(-2)_ and `FAILED` _(-1)_ will throw.<br/>
Default to `false` for backwards compatibility.

Return value:

✔️ If this function succeeds, it returns the current state.<br/>
❌ Otherwise, it throws with the corresponding NTSTATUS error code.

Example:

```js
queryFocusAssistState({translate: true}) //PRIORITY_ONLY (string)
queryFocusAssistState({translate: false}) //1 (number)
```

### `focusAssist(enable: boolean, option?: object): Promise<void>`

Tries to enable / disable focus assist.

💡 Works best when user has game and/or fullscreen auto rule(s) enabled and set to priority only.

> ⚠ WNF (Windows Notification Facility) is an undocumented Windows API !
> This API can change/break at any time in the future.

⚙️ Options:

- checkSuccess?: boolean (true)

Whether or not to check if the change operation was successful.

❌ Will throw on error.