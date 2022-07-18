/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import ref from "ref-napi";
import { Failure, errorLookup } from "@xan105/error";
import { asBoolean } from "@xan105/is/opt";
import { SHQueryUserNotificationState, QUERY_USER_NOTIFICATION_STATE } from "./util/shellapi.js";

function queryUserNotificationState(option = {}){

  const options = {
    translate: asBoolean(option.translate) ?? true
  };

  let pquns = ref.alloc(ref.types.int32); //allocate 4 bytes for the output data
  const hr = SHQueryUserNotificationState(pquns);
  if (hr < 0) throw new Failure(...errorLookup(hr));
  const state = pquns.deref(); //get the actual number
  const result = options.translate ? QUERY_USER_NOTIFICATION_STATE[state] ?? state : state;
  return result;
}

function isFullscreenAppRunning(){
  try{
    const state = queryUserNotificationState({translate: false});
    return [2, 3, 4, 7].includes(state);
  }catch{
    return false;
  }
}

export {
  queryUserNotificationState,
  isFullscreenAppRunning
};