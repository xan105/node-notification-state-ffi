/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import koffi from "koffi";
import { dlopen, pointer } from "@xan105/ffi/koffi";
import { Failure, errorLookup, attempt } from "@xan105/error";
import { shouldObj } from "@xan105/is/assert";
import { asBoolean } from "@xan105/is/opt";

const { SHQueryUserNotificationState } = dlopen("shell32.dll", {
  "SHQueryUserNotificationState": {
    result: "HRESULT",
    parameters: [
      pointer("ENUM", "out")
    ],
    nonblocking: true
  }
}, { abi: "stdcall", ignoreMissingSymbol: true });

async function queryUserNotificationState(option = {}){

  if(!SHQueryUserNotificationState) throw new Failure("Missing API in library", { 
    code: "FFI_MISSING_SYMBOL", 
    info: { symbol: "SHQueryUserNotificationState", lib: "shell32" }
  });
  
  shouldObj(option);
  const options = {
    translate: asBoolean(option.translate) ?? true
  };

  const QUERY_USER_NOTIFICATION_STATE = {
    1: "QUNS_NOT_PRESENT", //A screen saver is displayed, the machine is locked, or a nonactive Fast User Switching session is in progress
    2: "QUNS_BUSY", //A fullscreen application is running or Presentation Settings are applied
    3: "QUNS_RUNNING_D3D_FULL_SCREEN", //A fullscreen (exclusive mode) Direct3D application is running
    4: "QUNS_PRESENTATION_MODE", //The user has activated Windows presentation settings to block notifications and pop-up messages
    5: "QUNS_ACCEPTS_NOTIFICATIONS", //None of the other states are found, notifications can be freely sent
    6: "QUNS_QUIET_TIME", //The current user is in 'quiet time', which is the first hour after a new user logs into his or her account for the first time after an operating system upgrade or clean installation
    7: "QUNS_APP" //A Windows Store app is running fullscreen
  };

  const pquns = Buffer.alloc(koffi.sizeof("ENUM"));
  const hr = await SHQueryUserNotificationState(pquns);
  if (hr < 0) throw new Failure(...errorLookup(hr, "hresult"));
  
  const state = koffi.decode(pquns, "ENUM");
  return options.translate ? QUERY_USER_NOTIFICATION_STATE[state] ?? state : state;
}

async function isFullscreenAppRunning(){
  const [ state, err ] = await attempt(queryUserNotificationState, [{ translate: false }]);
  if(err) return false;
  return [2, 3, 4, 7].includes(state);
}

export {
  queryUserNotificationState,
  isFullscreenAppRunning
};