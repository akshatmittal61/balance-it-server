import {
	T_EXPENSE_TYPE,
	T_MEMBER_ROLE,
	T_MEMBER_STATUS,
	T_USER_STATUS,
} from "./enum";
import { Model } from "./parser";

export type AuthMapping = Model<{
	identifier: string;
	providerId: string;
	providerName: string;
	misc?: any;
	user: string | null;
}>;
export type User = Model<{
	name?: string;
	email: string;
	phone?: string;
	avatar?: string;
	status: T_USER_STATUS;
	invitedBy?: string;
}>;

export type Expense = Model<{
	title: string;
	amount: number;
	author: string;
	timestamp: string;
	group?: string;
	tags?: string[];
	icon?: string;
	type: T_EXPENSE_TYPE;
	method?: string;
}>;

export type Split = Model<{
	expense: string;
	user: string;
	pending: number;
	completed: number;
}>;

export type Group = Model<{
	name: string;
	icon?: string;
	banner?: string;
	tags?: string[];
	author: string;
}>;

export type Member = Model<{
	user: string;
	group: string;
	status: T_MEMBER_STATUS;
	role: T_MEMBER_ROLE;
}>;
