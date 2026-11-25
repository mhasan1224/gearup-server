
import mongoose from "mongoose";

const usersCollection = () =>
  mongoose.connection.db.collection("user");

const getAllUsers = async () => {
  const users = await usersCollection()
    .find(
      {},
      {
        projection: {
          name: 1,
          email: 1,
          image: 1,
          role: 1,
          phone: 1,
          address: 1,
          createdAt: 1,
        },
      },
    )
    .sort({ createdAt: -1 })
    .toArray();

  return {
    users,
    total: users.length,
  };
};

const updateUserRole = async (userId, role, adminEmail) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const error = new Error("Invalid user ID.");
    error.statusCode = 400;
    throw error;
  }

  if (!["customer", "owner"].includes(role)) {
    const error = new Error("Invalid role. Only customer and owner roles are allowed.");
    error.statusCode = 400;
    throw error;
  }

  const targetUser = await usersCollection().findOne({
    _id: new mongoose.Types.ObjectId(userId),
  });

  if (!targetUser) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  if (targetUser.email === adminEmail || targetUser.role === "admin") {
    const error = new Error("Admin accounts cannot be modified.");
    error.statusCode = 403;
    throw error;
  }

  await usersCollection().updateOne(
    { _id: targetUser._id },
    {
      $set: {
        role,
        updatedAt: new Date(),
      },
    },
  );

  return usersCollection().findOne(
    { _id: targetUser._id },
    {
      projection: {
        name: 1,
        email: 1,
        role: 1,
      },
    },
  );
};

export { getAllUsers, updateUserRole };
