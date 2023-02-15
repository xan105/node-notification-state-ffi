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
  - Rafael Rivera (https://gist.github.com/riverar/980120d7e3a13ed8b1d665cf974c8e31)
  - bitdisaster/windows-focus-assist (MIT | Copyright (c) 2018 Jan Hannemann)
  
This is a FFI "port" of their findings.
*/

const WNF_STATE_NAME = koffi.struct("WNF_STATE_NAME",{
  Data: koffi.array("ulong", 2)
});

const { NtQueryWnfStateData } = dlopen("ntdll.dll", {
  "NtQueryWnfStateData": {
    result: "long", //"NTSTATUS"
    parameters: [
      pointer(WNF_STATE_NAME),
      pointer("void"),
      pointer("void"),
      pointer("ulong", "out"),
      pointer("DWORD", "out"),
      pointer("ulong", "inout")
    ],
    nonblocking: true
  }
},{ abi: "stdcall", ignoreMissingSymbol: true });

async function queryFocusAssistState(option = {}){

  if(!NtQueryWnfStateData) throw new Failure("Missing API in library", { 
    code: "FFI_MISSING_SYMBOL", 
    info: { symbol: "NtQueryWnfStateData", lib: "ntdll" }
  });
  
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
  const status = await NtQueryWnfStateData(
    WNF_SHEL_QUIETHOURS_ACTIVE_PROFILE_CHANGED, 
    null, 
    null, 
    [], 
    buffer, 
    [bufferSize]
  );
  if (status < 0) throw new Failure(...errorLookup(status, "ntstatus"));
  
  const state = koffi.decode(buffer, "DWORD");
  return options.translate ? STATES[state] ?? state : state;
}

export { queryFocusAssistState };