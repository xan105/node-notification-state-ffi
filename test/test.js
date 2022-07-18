import { isFullscreenAppRunning } from "../lib/promises.js";

const state = await isFullscreenAppRunning();
console.log("Fullscreen:", state ? "yes": "no");