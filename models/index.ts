import {
	AuthMappingSchema,
	ExpenseSchema,
	GroupSchema,
	MemberSchema,
	SplitSchema,
	UserSchema,
} from "../schema";
import { AuthMapping, Expense, Group, Member, Split, User } from "../types";
import { ModelFactory } from "./base";

export const AuthMappingModel = new ModelFactory<AuthMapping>(
	"AuthMapping",
	AuthMappingSchema
).model;
export const ExpenseModel = new ModelFactory<Expense>("Expense", ExpenseSchema)
	.model;
export const GroupModel = new ModelFactory<Group>("Group", GroupSchema).model;
export const MemberModel = new ModelFactory<Member>("Member", MemberSchema)
	.model;
export const SplitModel = new ModelFactory<Split>("Split", SplitSchema).model;
export const UserModel = new ModelFactory<User>("User", UserSchema).model;
