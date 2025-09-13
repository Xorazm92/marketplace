import * as bcrypt from "bcrypt";

const saltOrRounds = 10;

export class BcryptEncryption {
	static async encrypt(password: string) {
		return await bcrypt.hash(password, saltOrRounds);
	}

	static async compare(password: string, hash: string) {
		return await bcrypt.compare(password, hash);
	}
}
