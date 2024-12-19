import { AuthController, UserController } from "../controllers";
import { router, wrapper } from "./base";

router.post("/oauth/google/verify", AuthController.verifyOAuthSignIn);
router.post("/oauth/google/continue", AuthController.continueOAuthWithGoogle);
router.get("/auth/verify", AuthController.verifyLoggedInUser);
router.get("/auth/logout", AuthController.logout);

router.route("/profile").patch(UserController.updateUserProfile);

export const apiRouter = wrapper(router);
