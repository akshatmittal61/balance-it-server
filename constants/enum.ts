import { T_NODE_ENV, T_USER_STATUS } from "../types";
import { getEnumeration } from "../utils";

export const USER_STATUS = getEnumeration<T_USER_STATUS>(["INVITED", "JOINED"]);

export const NODE_ENV = getEnumeration<T_NODE_ENV>([
	"development",
	"test",
	"production",
]);
