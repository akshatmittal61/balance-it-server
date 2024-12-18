import { service, url } from "../config";

export const frontendBaseUrl = url.frontend;
export const dbUri = url.db;
export const logsBaseUrl: string = "logs";
export const serviceName = service;

export const fallbackAssets = Object.freeze({
	avatar: `${frontendBaseUrl}/vectors/user.svg`,
	groupIcon: `${frontendBaseUrl}/images/group-icon.png`,
	banner: `${frontendBaseUrl}/images/banner.png`,
});
