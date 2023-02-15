/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import { shouldWindows } from "@xan105/is/assert";

shouldWindows();

export * from "./win32/shell32.js"
export * from "./win32/ntdll.js"