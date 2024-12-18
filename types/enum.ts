export type T_URL = "db" | "frontend" | "backend";
export type T_USER_STATUS = "JOINED" | "INVITED";
export type T_EXPENSE_TYPE = "PAID" | "RECEIVED" | "CASHBACK" | "SELF";
export type T_MEMBER_STATUS = "JOINED" | "PENDING" | "LEFT" | "INVITED";
export type T_MEMBER_ROLE = "OWNER" | "ADMIN" | "MEMBER";
export type T_NODE_ENV = "development" | "test" | "production";

export type LOG_LEVEL =
	| "log"
	| "info"
	| "warn"
	| "error"
	| "debug"
	| "verbose"
	| "silly"
	| "http";
