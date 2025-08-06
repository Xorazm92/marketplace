import * as crypto from "crypto";
import * as dotenv from "dotenv";
dotenv.config();
const password = process.env.crypt_password!;

const ivstring = Buffer.alloc(16);

function sha256(input: Buffer) {
	return crypto.createHash("sha256").update(input).digest();
}

function password_derive_bytes(password: string, salt: string, iterations: number, len: number) {
	let key = Buffer.from(password + salt);
	for (let i = 0; i < iterations; i++) {
		key = sha256(key);
	}
	if (key.length < len) {
		const hx = password_derive_bytes(password, salt, iterations - 1, 20);
		for (let counter = 1; key.length < len; ++counter) {
			key = Buffer.concat([
				key,
				sha256(Buffer.concat([Buffer.from(counter.toString()), hx])),
			]);
		}
	}
	return Buffer.alloc(len, key);
}

export async function encode(str: string) {
	const key = password_derive_bytes(password, "", 100, 32);
	const cipher = crypto.createCipheriv("aes-256-cbc", key, ivstring);
	const part1 = cipher.update(str, "utf8");
	const part2 = cipher.final();
	const encrypted = Buffer.concat([part1, part2]).toString("base64");
	return encrypted;
}

export async function decode(str: string) {
	const key = password_derive_bytes(password, "", 100, 32);
	const decipher = crypto.createDecipheriv("aes-256-cbc", key, ivstring);
	let decrypted = decipher.update(str, "base64", "utf8");
	decrypted += decipher.final();
	return decrypted;
}
