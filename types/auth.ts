import { IUser } from "./client";

export type AuthResponse = {
	user: IUser;
	accessToken: string;
	refreshToken: string;
};
