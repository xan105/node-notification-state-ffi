/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import koffi from "koffi";
import { dlopen, pointer } from "@xan105/ffi/koffi";
import { Failure, errorLookup } from "@xan105/error";
import { shouldObj } from "@xan105/is/assert";
import { asBoolean } from "@xan105/is/opt";

/*
⚠ WNF (Windows Notification Facility) is an undocumented Windows API !
This API can change/break at any time in the future.

Credits to
  - Rafael Rivera
  - bitdisaster/windows-focus-assist
  
This is a FFI "port" of their findings.
*/

const WNF_STATE_NAME = koffi.struct("WNF_STATE_NAME",{
  Data: koffi.array(koffi.types.ulong, 2)
});

const { NtQueryWnfStateData } = dlopen("ntdll.dll", {
  "NtQueryWnfStateData": {
    result: koffi.types.long, //"NTSTATUS"
    parameters: [
      pointer(WNF_STATE_NAME),
      pointer("void"),
      pointer("void"),
      pointer(koffi.types.ulong, "out"),
      pointer("DWORD", "out"),
      pointer(koffi.types.ulong, "inout")
    ],
    nonblocking: true
  }
},{ abi: "stdcall", ignoreMissingSymbol: true });

async function queryFocusAssistState(option = {}){

  if(!NtQueryWnfStateData) throw new Failure("Missing NtQueryWnfStateData in library", 2);
  
  shouldObj(option);
  const options = {
    translate: asBoolean(option.translate) ?? true
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
  
  const bufferSize = koffi.sizeof("DWORD");
  const buffer = Buffer.alloc(bufferSize);

  const NTSTATUS = await NtQueryWnfStateData(
    WNF_SHEL_QUIETHOURS_ACTIVE_PROFILE_CHANGED, 
    null, 
    null, 
    [], 
    buffer, 
    [bufferSize]
  );
  if (NTSTATUS < 0) throw new Failure(...errorLookup(NTSTATUS));
  
  const state = koffi.decode(buffer, "DWORD");
  return options.translate ? STATES[state] ?? state : state;
}

export { queryFocusAssistState };