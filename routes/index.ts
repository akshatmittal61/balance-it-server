import { AuthController, UserController } from "../controllers";
import { authenticatedRoute } from "../middlewares";
import { router, wrapper } from "./base";

router.post("/oauth/google/verify", AuthController.verifyOAuthSignIn);
router.post("/oauth/google/continue", AuthController.continueOAuthWithGoogle);
router.route("/auth/otp/request").post(AuthController.requestOtp);
router.route("/auth/otp/verify").post(AuthController.verifyOtp);
router.get(
	"/auth/verify",
	authenticatedRoute,
	AuthController.verifyLoggedInUser
);
router.get("/auth/logout", authenticatedRoute, AuthController.logout);

router
	.route("/profile")
	.patch(authenticatedRoute, UserController.updateUserProfile);

export const apiRouter = wrapper(router);
