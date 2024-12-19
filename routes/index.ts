import { UserController } from "../controllers";
import { router, wrapper } from "./base";

router.route("/profile").patch(UserController.updateUserProfile);

export const apiRouter = wrapper(router);
