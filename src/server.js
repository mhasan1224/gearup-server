
import "dotenv/config";

import createApp from "./app.js";
import connectDatabase from "./config/database.js";
import createAuth from "./config/auth.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDatabase();

    const auth = createAuth();
    const app = createApp(auth);

    app.listen(PORT, () => {
      console.log(`GearUp API server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
