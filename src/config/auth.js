import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";
import mongoose from "mongoose";

const createAuth = () => {
  const database = mongoose.connection.db;
  const client = mongoose.connection.getClient();

  if (!database) {
    throw new Error("MongoDB connection is not ready.");
  }

  return betterAuth({
    database: mongodbAdapter(database, { client }),

    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,

    trustedOrigins: [process.env.CLIENT_URL],

    user: {
      additionalFields: {
        role: {
          type: ["customer", "owner"],
          required: false,
          defaultValue: "customer",
          input: true,
        },
        phone: {
          type: "string",
          required: false,
          input: false,
        },
        address: {
          type: "string",
          required: false,
          input: false,
        },
      },
    },

    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      },
    },

    emailAndPassword: {
      enabled: true,
      minPasswordLength: 6,
      requireEmailVerification: false,
    },

    plugins: [jwt()],
  });
};

export default createAuth;
