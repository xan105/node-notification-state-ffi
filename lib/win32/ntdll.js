/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import { setTimeout } from "node:timers/promises";
import koffi from "koffi";
import { dlopen, pointer, alloc } from "@xan105/ffi/koffi";
import { Failure, errorLookup } from "@xan105/error";
import { 
  shouldWin10orGreater,
  shouldBoolean,
  shouldObj, 
  shouldSizeArrayOfIntegerPositiveOrZero 
} from "@xan105/is/assert";
import { asBoolean } from "@xan105/is/opt";

/*
⚠ WNF (Windows Notification Facility) is an undocumented Windows API !
This API can change/break at any time in the future.

- NtQueryWnfStateData:

  Credits to
    - Rafael Rivera (https://gist.github.com/riverar/980120d7e3a13ed8b1d665cf974c8e31)
    - bitdisaster/windows-focus-assist (MIT | Copyright (c) 2018 Jan Hannemann)
  
  This is a FFI "port" of their findings.
  
- ZwUpdateWnfStateData:

  cf: https://stackoverflow.com/questions/55477041/toggling-focus-assist-mode-in-win-10-programmatically/62602601#62602601
*/

const WNF_STATE_NAME = koffi.struct("WNF_STATE_NAME",{
  Data: koffi.array("ulong", 2)
});

const { 
  NtQueryWnfStateData,
  ZwUpdateWnfStateData 
} = dlopen("ntdll.dll", {
  NtQueryWnfStateData: {
    result: "NTSTATUS",
    parameters: [
      pointer(WNF_STATE_NAME),
      pointer("void"),
      pointer("void"),
      pointer("ulong", "out"),
      pointer("DWORD", "out"),
      pointer("ulong", "inout")
    ],
    nonblocking: true
  },
  ZwUpdateWnfStateData: {
    result: "NTSTATUS",
    parameters: [
      pointer(WNF_STATE_NAME),
      pointer("u32"),
      "u32",
      pointer("void"),
      pointer("void"),
      pointer("void"),
      pointer("void")
    ],
    nonblocking: true
  },
},{ 
  abi: "stdcall",
  errorAtRuntime: true 
});

async function queryFocusAssistState(option = {}){

  shouldWin10orGreater();
  shouldObj(option);
  
  const options = {
    translate: asBoolean(option.translate) ?? true,
    stateError: asBoolean(option.stateError) ?? false
  };

  const STATES = {
    "-2": "NOT_SUPPORTED",
    "-1": "FAILED",
    "0": "OFF",
    "1": "PRIORITY_ONLY",
    "2": "ALARMS_ONLY"
  };
  
  const WNF_SHEL_QUIETHOURS_ACTIVE_PROFILE_CHANGED = { //signaled whenever active quiet hours profile / mode changes
    Data: [ 0xA3BF1C75, 0xD83063E ] //active profile restrictive level (unique per profile)
  }; 
  
  const buffer = alloc("DWORD");
  const status = await NtQueryWnfStateData(
    WNF_SHEL_QUIETHOURS_ACTIVE_PROFILE_CHANGED, 
    null, 
    null, 
    [], 
    buffer.pointer,
    [buffer.pointer.length]
  );
  if (status < 0) throw new Failure(...errorLookup(status, "ntstatus"));

  const state = buffer.get();
  if (options.stateError && state < 0) throw new Failure("Failed to query focus assist state", { 
    code: state === -2 ? "ERR_UNSUPPORTED" : "ERR_UNEXPECTED"
  });
  
  return options.translate ? STATES[state] ?? state : state;
}

async function updateFocusAssistState(mode){

  shouldWin10orGreater();

  const WNF_SHEL_QUIET_MOMENT_SHELL_MODE_CHANGED = {
    Data: [ 0xA3BF5075, 0xD83063E ]
  };

  shouldSizeArrayOfIntegerPositiveOrZero(mode, 4);
  /*
    No idea how this undocumented API actually works.
    Clearly there is a correlation with which automatic rules are enabled and 
    to which mode they are set to (priority only / alarms only).
    
    I thought that it was a bitwise with some flags or something like that.
    But after bruteforcing all 0x00 to 0xFF FF FF FF values to try to figure it out.
    I settled on just using the max value which yields to 
    "enabled" (so priority list / alarm depending on what the auto rules are set to) 
    most of the time with the most auto rules combo.
     
    But yeah this is kinda unreliable tho it (can) works.
    
    0x01 00 00 00: game
    0x02 00 00 00: fullscreen
    0x03 00 00 00: game+fullscreen
    0x05 00 00 00: game+fullscreen+duplicating
    0x06 00 00 00: game+fullscreen
    0x15 10 10 15: game+fullscreen+duplicating
    0x15 15 15 15: game+fullscreen+duplicating
    ... and many more
    
    NB: "During these times" auto rule doesn't seem to affect any of the above.
  */
  
  const buffer = Buffer.from(mode);
  const status = await ZwUpdateWnfStateData(
    WNF_SHEL_QUIET_MOMENT_SHELL_MODE_CHANGED, 
    buffer, 
    buffer.length, 
    null, 
    null,
    null,
    null
  );
  if (status < 0) throw new Failure(...errorLookup(status, "ntstatus"));
}

async function focusAssist(enable, option = {}){

  shouldBoolean(enable);
  shouldObj(option);
  
  const options = {
    checkSuccess: asBoolean(option.checkSuccess) ?? true
  };
  
  const state = await queryFocusAssistState({ 
    translate: false, 
    stateError: true 
  });
  if ((enable && state > 0) || (!enable && state === 0)) return; //nothing to do
  await updateFocusAssistState(enable ?
    //see updateFocusAssistState() for details
    [0xFF, 0xFF, 0xFF, 0xFF] : 
    [0x00, 0x00, 0x00, 0x00]
  );

  if(options.checkSuccess) {
    await setTimeout(100); //Better safe than sorry
    const state = await queryFocusAssistState({ 
      translate: false, 
      stateError: true 
    });
    if ((enable && state === 0) || (!enable && state > 0)) 
      throw new Failure("Failed to change focus assist state", "ERR_UNKNOWN");
  }
}

export { queryFocusAssistState, focusAssist };