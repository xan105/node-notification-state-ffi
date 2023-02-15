import { setTimeout } from "node:timers/promises";
import { isFullscreenAppRunning } from "../lib/index.js";

const delay = 3;
console.log(`Will check fullscreen in ${delay} seconds...`);
await setTimeout(delay * 1000);
const state = await isFullscreenAppRunning();
console.log("Fullscreen:", state ? "yes": "no");

