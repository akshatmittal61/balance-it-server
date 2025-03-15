import {
	T_EXPENSE_TYPE,
	T_MEMBER_ROLE,
	T_MEMBER_STATUS,
	T_OTP_STATUS,
	T_USER_STATUS,
} from "./enum";
import { Model } from "./parser";

/**
 * AuthMapping model
 * @param {string} identifier - Identifier of the user
 * @param {string} providerId - Provider id of auth service
 * @param {string} providerName - Provider name of auth service
 * @param {Object} misc - Misc data of the user (optional)
 * @param {string} user - User id (References User model) (optional - for non-onboarded users)
 */
export type AuthMapping = Model<{
	identifier: string;
	providerId: string;
	providerName: string;
	misc?: any;
	user: string | null;
}>;

/**
 * User model
 * @param {string} name - Name of the user (optional - defaults to email prefix)
 * @param {string} email - Email of the user
 * @param {string} phone - Phone number of the user (optional)
 * @param {string} avatar - Avatar of the user (optional)
 * @param {string} status - Status of the user (Joined, Invited)
 * @param {string} invitedBy - Id of the user who invited the user (References User model) (optional - for invited users)
 */
export type User = Model<{
	name?: string;
	email: string;
	phone?: string;
	avatar?: string;
	status: T_USER_STATUS;
	invitedBy?: string;
}>;

/**
 * Otp model
 * @param {string} email - Email of the user
 * @param {string} otp - OTP of the user
 * @param {string} status - Status of the OTP (Pending, Expired)
 */
export type Otp = Model<{
	email: string;
	otp: string;
	status: T_OTP_STATUS;
}>;

/**
 * Expense model
 * @param {string} title - Title of the expense
 * @param {number} amount - Amount of the expense
 * @param {string} author - Author of the expense (References User model)
 * @param {string} timestamp - Creation time of the expense
 * @param {string} group - Group id (References Group model) (optional - for group expenses)
 * @param {string[]} tags - Tags for the expense (optional)
 * @param {string} icon - Icon of the expense (optional)
 * @param {string} type - Type of the expense (Personal, Group)
 * @param {string} method - Method of the expense (Cash, Card, UPI, Netbanking)
 */
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

/**
 * Split model - When a user splits an expense
 * @param {string} expense - Expense id (References Expense model)
 * @param {string} user - User id (References User model)
 * @param {number} pending - Pending amount
 * @param {number} completed - Completed amount
 */
export type Split = Model<{
	expense: string;
	user: string;
	pending: number;
	completed: number;
}>;

/**
 * Group model
 * @param {string} name - Name of the group
 * @param {string} icon - Icon of the group (optional)
 * @param {string} banner - Banner of the group (optional)
 * @param {string[]} tags - Tags of the group
 * @param {string} author - Author of the group (References User model)
 */
export type Group = Model<{
	name: string;
	icon?: string;
	banner?: string;
	tags?: string[];
	author: string;
}>;

/**
 * Member model - Group Member entity
 * @param {string} user - User id (References User model)
 * @param {string} group - Group id (References Group model)
 * @param {string} status - Status of the member (Joined, Left, Invited, Pending)
 * @param {string} role - Role of the member (Owner, Admin, Member)
 */
export type Member = Model<{
	user: string;
	group: string;
	status: T_MEMBER_STATUS;
	role: T_MEMBER_ROLE;
}>;
