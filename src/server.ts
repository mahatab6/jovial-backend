

import app from "./app";
import { envVariable } from "./config/env";

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