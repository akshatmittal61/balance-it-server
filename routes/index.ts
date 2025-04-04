import {
	AuthController,
	UserController,
	WalletController,
} from "../controllers";
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

router
	.route("/users/invite")
	.post(authenticatedRoute, UserController.inviteUser);
router
	.route("/users/search")
	.post(authenticatedRoute, UserController.searchForUsers);
router
	.route("/users/search/bulk")
	.post(authenticatedRoute, UserController.searchInBulk);
router
	.route("/users/friends")
	.get(authenticatedRoute, UserController.getUserFriends);

router
	.route("/wallet/expenses")
	.get(authenticatedRoute, WalletController.getExpensesForUser)
	.post(authenticatedRoute, WalletController.createExpense);
router
	.route("/wallet/expenses/:id")
	.delete(authenticatedRoute, WalletController.deleteExpense);
router
	.route("/wallet/expenses/summary")
	.get(authenticatedRoute, WalletController.getExpensesSummary);

export const apiRouter = wrapper(router);
