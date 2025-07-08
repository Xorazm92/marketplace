import {
  BadRequestException,
  forwardRef,
  Inject,
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
import { UserAuthService } from "../user-auth/user-auth.service";
import { SmsService } from "../utils/smsService";

@Injectable()
export class OtpService {
  constructor(
    private userService: UserService,
    private prisma: PrismaService,
    @Inject(forwardRef(() => UserAuthService))
    private userAuthService: UserAuthService
  ) {}

  async generateOtp(dto: CreateOtpDto) {
    // recieve phnoe number

    const { phone_number } = dto;

    const phoneExist = await this.prisma.phoneNumber.findFirst({
      where: { is_main: true, phone_number },
    });

    if (phoneExist) {
      throw new BadRequestException("Already registred");
    }

    await this.prisma.otp.deleteMany({
      where: { phone_number },
    });

    // generate otp code
    const otp = otpGenerator.generate(4, {
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

    const res = await SmsService.sendSMS(phone_number, otp);

    return { key: encodedData, message: "successfully send otp", status: 200 };
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
