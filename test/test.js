import { isFullscreenAppRunning } from "../lib/index.js";

setTimeout( async()=>{

const state = await isFullscreenAppRunning();
console.log("Fullscreen:", state ? "yes": "no");

}, 2 * 1000);

