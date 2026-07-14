import { runBackgroundWorker } from "./background.worker.js";

// Compatibilidade com o entrypoint antecipado da sprint anterior.
// O processamento real agora passa pelo registry com handlers isolados.
export const runNotificationWorker = runBackgroundWorker;
