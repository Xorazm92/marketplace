import {
  BadRequestException,
  Injectable,
} from "@nestjs/common";
import { CreateOtpDto } from "./dto/create-otp.dto";
import { UpdateOtpDto } from "./dto/update-otp.dto";
import { UserService } from "../user/user.service";
import { PrismaService } from "../prisma/prisma.service";
import * as otpGenerator from "otp-generator";
import { AddMinutesToDate } from "../utils/otp-crypto/addMinutes";
import { Details } from "./types/details.type";
import { decode, encode } from "../utils/otp-crypto/crypto";
import { VerifyDto } from "./dto/verify-otp.dto";
import { SmsService } from "../common/services/sms.service";

@Injectable()
export class OtpService {
  constructor(
    private userService: UserService,
    private prisma: PrismaService,
    private smsService: SmsService,
  ) {}

  async generateOtp(dto: CreateOtpDto) {
    // recieve phnoe number

    const { phone_number } = dto;

    const phoneExist = await this.prisma.user.findFirst({
      where: { phone_number },
    });

    // Development mode'da har qanday telefon raqamga OTP yuborish mumkin
    if (process.env.NODE_ENV !== 'development' && phoneExist) {
      throw new BadRequestException("Already registred");
    }

    await this.prisma.otp.deleteMany({
      where: { phone_number },
    });

    // generate otp code - 6 raqamli
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const now = new Date();
    const expiration_time = AddMinutesToDate(now, 5);

    // create otp row

    const createdOtp = await this.prisma.otp.create({
      data: {
        code: otp,
        expired_time: expiration_time,
        phone_number,
      },
    });

    // create verification key for check

    const details: Details = {
      timeStamp: now,
      otp_id: createdOtp.id,
      phone_number,
      is_used: false,
    };

    const encodedData = await encode(JSON.stringify(details));

    // Development mode: log OTP to console
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 OTP for ${phone_number}: ${otp}`);
    }

    // SMS yuborish - development mode'da console'da ko'rsatish
    console.log(`📱 [OTP GENERATED] Phone: ${phone_number}, Code: ${otp}`);
    console.log(`📱 [IMPORTANT] SMS template moderation kerak: https://my.eskiz.uz`);

    try {
      if (process.env.NODE_ENV === 'development') {
        // Development mode'da faqat console'da ko'rsatish
        console.log(`📱 [DEV MODE] SMS would be sent to ${phone_number}: ${otp}`);
        console.log(`📱 [DEV MODE] Message: INBOLA Kids Marketplace tasdiqlash kodi: ${otp}`);
      } else {
        // Production mode'da haqiqiy SMS yuborish
        const message = `INBOLA Kids Marketplace tasdiqlash kodi: ${otp}. Kodni hech kimga bermang! Kod 5 daqiqa amal qiladi.`;
        const res = await this.smsService.sendSMS(phone_number, message);
        console.log(`📱 SMS sent to ${phone_number}, ID: ${res}`);
      }
    } catch (error) {
      console.error(`❌ SMS yuborishda xato: ${error.message}`);
      console.log(`📱 [FALLBACK] OTP kodi console'da: ${otp}`);
      // Development mode'da xato bo'lsa ham davom etish
    }

    return { key: encodedData, message: "successfully send otp", status: 200, otp: process.env.NODE_ENV === 'development' ? otp : undefined };
  }

  async verifyOtp(dto: VerifyDto) {
    const { code, verification_key } = dto;

    const currentData = new Date();

    const decodedData = await decode(verification_key);

    // parse it json
    const details: Details = JSON.parse(decodedData);

    const resultOtp = await this.prisma.otp.findUnique({
      where: { id: details.otp_id },
    });

    if (!resultOtp) {
      throw new BadRequestException("Otp not found");
    }

    if (resultOtp.is_used) {
      throw new BadRequestException("Otp already used");
    }

    if (resultOtp.expired_time < currentData) {
      throw new BadRequestException("Otp expired");
    }

    if (resultOtp.code != code) {
      throw new BadRequestException("Otp is not valid");
    }

    await this.prisma.otp.update({
      where: { id: resultOtp.id },
      data: { is_used: true },
    });

    return {
      message: "OTP verified successfully",
      status_code: 200,
      status: true,
    };
  }
}
