export class SystemUtils {
	public static isDev(): boolean {
		return process.env.NODE_ENV === "development";
	}
	public static getCurrentTimestamp(): number {
		return new Date().getTime();
	}
}
