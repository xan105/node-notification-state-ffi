/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import { shouldWindows } from "@xan105/is/assert";
import { load } from "./ffi.js";

shouldWindows();
const call = load("shell32.dll");
const SHQueryUserNotificationState = call("SHQueryUserNotificationState", "long", ["*int32"]);

const QUERY_USER_NOTIFICATION_STATE = {
  1: "QUNS_NOT_PRESENT", //A screen saver is displayed, the machine is locked, or a nonactive Fast User Switching session is in progress
  2: "QUNS_BUSY", //A fullscreen application is running or Presentation Settings are applied
  3: "QUNS_RUNNING_D3D_FULL_SCREEN", //A fullscreen (exclusive mode) Direct3D application is running
  4: "QUNS_PRESENTATION_MODE", //The user has activated Windows presentation settings to block notifications and pop-up messages
  5: "QUNS_ACCEPTS_NOTIFICATIONS", //None of the other states are found, notifications can be freely sent
  6: "QUNS_QUIET_TIME", //The current user is in 'quiet time', which is the first hour after a new user logs into his or her account for the first time after an operating system upgrade or clean installation
  7: "QUNS_APP" //A Windows Store app is running fullscreen
};

export { 
  SHQueryUserNotificationState, 
  QUERY_USER_NOTIFICATION_STATE 
};