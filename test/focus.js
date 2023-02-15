import { queryFocusAssistState } from "../lib/index.js";

const state = await queryFocusAssistState({translate: true });
console.log(state);