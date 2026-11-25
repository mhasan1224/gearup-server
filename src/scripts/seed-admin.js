
import "dotenv/config";
import mongoose from "mongoose";

import connectDatabase from "../config/database.js";

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL?.trim();

    if (!adminEmail) {
      throw new Error("ADMIN_EMAIL is missing from environment variables.");
    }

    await connectDatabase();

    const usersCollection = mongoose.connection.db.collection("user");

    const result = await usersCollection.updateOne(
      { email: adminEmail },
      {
        $set: {
          role: "admin",
        },
      },
    );

    if (result.matchedCount === 0) {
      throw new Error(
        "Admin account not found. Register the account before running this script.",
      );
    }

    console.log(`Admin role assigned successfully to: ${adminEmail}`);
  } catch (error) {
    console.error("Admin seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedAdmin();
