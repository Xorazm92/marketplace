import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    UnauthorizedException,
} from "@nestjs/common";
import { AdminService } from "../admin/admin.service";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { ResponseFields } from "../types";
import { Response } from "express";
import * as bcrypt from "bcrypt";
import { AdminSignInDto, CreateAdminDto } from "../admin/dto";
import { MailService } from "../mail/mail.service";

@Injectable()
export class AuthService {
    constructor(
        private readonly adminService: AdminService,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService,
        private readonly prismaService: PrismaService
    ) {}
    
    
    //===============================| For Admin |==========================================//

    async adminSignUp(createAdminDto: CreateAdminDto) {
        const condiate = await this.adminService.findByEmail(
            createAdminDto.email
        );
        if (condiate) {
            throw new BadRequestException("Admin olready exists");
        }
        const newAdmin = await this.adminService.create(createAdminDto);

        try {
            await this.mailService.sendAdminMail(newAdmin);
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException("Error sending message");
        }
        const response = {
            message:
                "Congratulations, you have joined the system. We have sent an activation message to your email.",
            adminId: newAdmin.id,
        };

        return response;
    }

    async adminSignIn(
        adminSignInDto: AdminSignInDto,
        res: Response
    ): Promise<ResponseFields> {
        const { email, password } = adminSignInDto;

        if (!email || !password) {
            throw new BadRequestException();
        }

        const admin = await this.adminService.findByEmail(email);

        if (!admin) {
            throw new UnauthorizedException("Invalid Email or password");
        }
        if (!admin.is_active) {
            throw new UnauthorizedException("admin is not activate");
        }
        const validPassword = await bcrypt.compare(
            adminSignInDto.password,
            admin.hashed_password
        );
        if (!validPassword) {
            throw new UnauthorizedException("Invalid Email or password");
        }

        const tokens = await this.adminService.getToken(admin);

        const hashed_refresh_token = await bcrypt.hash(tokens.refresh_token, 7);

        const updateAdmin = await this.adminService.updateRefreshToken(
            admin.id,
            hashed_refresh_token
        );
        if (!updateAdmin) {
            throw new InternalServerErrorException("Tokenni saqlashda xatolik");
        }
        res.cookie("refresh_token", tokens.refresh_token, {
            maxAge: +process.env.COOKIE_TIME!,
            httpOnly: true,
        });
        const response = {
            id: admin.id,
            access_token: tokens.access_token,
        };

        return response;
    }

    async AdminSignOut(refreshToken: string, res: Response) {
        const adminData = await this.jwtService.verify(refreshToken, {
            secret: process.env.REFRESH_TOKEN_KEY,
        });
        if (!adminData) {
            throw new ForbiddenException("Admin not verified");
        }
        const hashed_refresh_token = null;
        await this.adminService.updateRefreshToken(
            adminData.id,
            hashed_refresh_token
        );

        res.clearCookie("refresh_token");

        const response = {
            message: "Admin logged out successfully",
        };
        return response;
    }

    async AdminRefreshToken(
        id: number,
        refreshToken: string,
        res: Response
    ): Promise<ResponseFields> {
        const decodedToken = await this.jwtService.decode(refreshToken);        
        if (id != decodedToken!["id"]) {
            throw new BadRequestException("Not allowed");
        }

        const admin = await this.adminService.findOne(+id);
        if (!admin || !admin.hashed_refresh_token) {
            throw new BadRequestException("Admin not found");
        }

        const tokenMatch = await bcrypt.compare(
            refreshToken,
            admin.hashed_refresh_token
        );

        if (!tokenMatch) {
            throw new ForbiddenException("Forbidden");
        }

        const tokens = await this.adminService.getToken(admin);

        const hashed_refresh_token = await bcrypt.hash(tokens.refresh_token, 7);

        await this.adminService.updateRefreshToken(
            admin.id,
            hashed_refresh_token
        );

        res.cookie("refresh_token", tokens.refresh_token, {
            maxAge: +process.env.COOKIE_TIME!,
            httpOnly: true,
        });
        const response = {
            id: admin.id,
            access_token: tokens.access_token,
        };
        return response;
    }

    
    async activateAdmin(link: string) {
        if (!link) {
            throw new BadRequestException("Activation link not found");
        }
        const admin = await this.prismaService.admin.findUnique({
            where: { activation_link: link },
        });
        if (!admin) {
            throw new BadRequestException("Admin not found");
        }
        if (admin.is_active) {
            throw new BadRequestException("Admin already activates");
        }
        const updateAdmin = await this.prismaService.admin.update({
            where: {
                activation_link: link,
            },
            data: { is_active: true },
        });

        if (!updateAdmin) {
            throw new BadRequestException("Admin already activates");
        }
        const response = {
            message: "Admin activated successfully",
            is_active: updateAdmin.is_active,
        };

        return response;
    }

    //===============================| Google OAuth |==========================================//

    async validateGoogleUser(googleUser: any) {
        const { googleId, email, firstName, lastName, picture } = googleUser;

        try {
            // Check if user already exists with this Google ID
            let user = await this.prismaService.user.findFirst({
                where: {
                    OR: [
                        { google_id: googleId },
                        { email: { some: { email } } }
                    ]
                },
                include: {
                    email: true,
                    phone_number: true
                }
            });

            if (user) {
                // Update Google ID if user exists but doesn't have it
                if (!user.google_id) {
                    user = await this.prismaService.user.update({
                        where: { id: user.id },
                        data: { google_id: googleId },
                        include: {
                            email: true,
                            phone_number: true
                        }
                    });
                }
                return user;
            }

            // Create new user if doesn't exist
            const newUser = await this.prismaService.user.create({
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    google_id: googleId,
                    profile_img: picture,
                    password: await bcrypt.hash(Math.random().toString(36), 10), // Random password for Google users
                    is_active: true,
                    email: {
                        create: {
                            email,
                            is_verified: true, // Google emails are pre-verified
                            is_main: true
                        }
                    }
                },
                include: {
                    email: true,
                    phone_number: true
                }
            });

            return newUser;
        } catch (error) {
            console.error('Error validating Google user:', error);
            throw new InternalServerErrorException('Failed to process Google authentication');
        }
    }

    async generateTokensForUser(user: any) {
        const payload = {
            sub: user.id,
            email: user.email?.[0]?.email || '',
            first_name: user.first_name,
            last_name: user.last_name,
        };

        const accessToken = this.jwtService.sign(payload, {
            secret: process.env.ACCESS_TOKEN_KEY,
            expiresIn: process.env.ACCESS_TOKEN_TIME || '15m',
        });

        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.REFRESH_TOKEN_KEY,
            expiresIn: process.env.REFRESH_TOKEN_TIME || '7d',
        });

        // Update user's refresh token
        await this.prismaService.user.update({
            where: { id: user.id },
            data: {
                hashed_refresh_token: await bcrypt.hash(refreshToken, 10)
            }
        });

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email?.[0]?.email || '',
                profile_img: user.profile_img,
                is_active: user.is_active
            }
        };
    }
}
