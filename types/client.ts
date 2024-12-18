import { Expense, Group, Member, Split, User } from "./models";

export type IUser = User;
export type IGroup = Omit<Group, "author"> & { author: IUser };
export type IExpense = Omit<Expense, "author" | "group"> & {
	author: IUser;
	group?: IGroup;
};
export type IMember = Omit<Member, "user" | "group"> & {
	user: IUser;
	group: IGroup;
};
export type ISplit = Omit<Split, "expense" | "user"> & {
	expense: IExpense;
	user: IUser;
};
