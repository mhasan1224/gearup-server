
import { fromNodeHeaders } from "better-auth/node";

const authMiddleware = (auth) => {
  return async (req, res, next) => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      if (!session || !session.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required. Please sign in.",
        });
      }

      req.authUser = session.user;
      req.authSession = session.session;

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default authMiddleware;
