import { UserModel } from "../models";
import { IUser, User } from "../types";
import { BaseRepo } from "./base";

class UserRepo extends BaseRepo<User, IUser> {
	protected model = UserModel;
}

export const userRepo = new UserRepo();
