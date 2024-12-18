import {
	T_EXPENSE_TYPE,
	T_MEMBER_ROLE,
	T_MEMBER_STATUS,
	T_USER_STATUS,
} from "./enum";

export type AuthMapping = {
	identifier: string;
	providerId: string;
	providerName: string;
	misc?: any;
	user: string | null;
};
export type User = {
	name?: string;
	email: string;
	phone?: string;
	avatar?: string;
	status: T_USER_STATUS;
	invitedBy?: string;
};

export type Expense = {
	title: string;
	amount: number;
	author: string;
	timestamp: string;
	group?: string;
	tags?: string[];
	type: T_EXPENSE_TYPE;
	method?: string;
};

export type Split = {
	expense: string;
	user: string;
	pending: number;
	completed: number;
};

export type Group = {
	name: string;
	icon?: string;
	banner?: string;
	tags?: string[];
	createdBy: string;
};

export type Member = {
	user: string;
	group: string;
	status: T_MEMBER_STATUS;
	role: T_MEMBER_ROLE;
};
