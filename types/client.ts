import { AuthMapping, Expense, Group, Member, Split, User } from "./models";
import { UpdateModel } from "./parser";

export type IUser = User;
export type UpdateUser = Omit<UpdateModel<User>, "email">;
export type IAuthMapping = Omit<AuthMapping, "user"> & { user: IUser | null };
export type IMember = Omit<Member, "user"> & { user: IUser };
export type IGroup = Omit<Group, "author"> & { author: IUser };
export type IExpense = Omit<Expense, "author" | "group"> & {
	author: IUser;
	group?: IGroup;
};
export type ISplit = Omit<Split, "expense" | "user"> & {
	expense: IExpense;
	user: IUser;
};
