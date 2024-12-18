import {
	T_EXPENSE_TYPE,
	T_MEMBER_ROLE,
	T_MEMBER_STATUS,
	T_NODE_ENV,
	T_USER_STATUS,
} from "../types";
import { getEnumeration } from "../utils";

export const USER_STATUS = getEnumeration<T_USER_STATUS>(["INVITED", "JOINED"]);
export const EXPENSE_TYPE = getEnumeration<T_EXPENSE_TYPE>([
	"PAID",
	"RECEIVED",
	"CASHBACK",
	"SELF",
]);

export const MEMBER_STATUS = getEnumeration<T_MEMBER_STATUS>([
	"JOINED",
	"PENDING",
	"LEFT",
	"INVITED",
]);
export const MEMBER_ROLE = getEnumeration<T_MEMBER_ROLE>([
	"OWNER",
	"ADMIN",
	"MEMBER",
]);

export const NODE_ENV = getEnumeration<T_NODE_ENV>([
	"development",
	"test",
	"production",
]);
