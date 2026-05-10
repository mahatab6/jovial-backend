

import app from "./app";
import { envVariable } from "./config/env";
import "./app/workers/ai.worker"; // Initialize background workers

const serverStart = async () => {
  try {
    app.listen(envVariable.PORT, () => {
      console.log(
        `Jovial Ai on http://localhost:${envVariable.PORT}`,
      );
    });
  } catch (error) {
    console.error("server failed to start", error);
  }
};

serverStart();