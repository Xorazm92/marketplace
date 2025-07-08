import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAdminDto,UpdateAdminDto, UpdateAdminPasswordDto } from "./dto";
import * as bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { Admin } from "@prisma/client";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AdminService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService
    ) {}

    async create(createAdminDto: CreateAdminDto) {
        const { password, confirm_password, ...data } = createAdminDto;
        
        if (password !== confirm_password) {
            throw new BadRequestException("Passwords did not match");
        }
        const activation_link = uuidv4();
        const hashed_password = await bcrypt.hash(password, 7);

        return this.prismaService.admin.create({
            data: { ...data, hashed_password, activation_link },
        });
    }

    findAll() {
        return this.prismaService.admin.findMany();
    }

    async findOne(id: number) {
        const admin = await this.prismaService.admin.findUnique({
            where: { id },
        });
        if (!admin) {
            throw new NotFoundException(`Admin with ID ${id} not found`);
        }
        return admin;
    }
    
    findByEmail(email: string) {
        return this.prismaService.admin.findUnique({ where: { email } });
    }

    async update(id: number, updateAdminDto: UpdateAdminDto) {
        await this.findOne(id);

        return this.prismaService.admin.update({
            where: { id },
            data: updateAdminDto,
        });
    }
    async updatePassword(id: number, updateAdminPasswordDto: UpdateAdminPasswordDto) {
        await this.findOne(id);
        const { password, confirm_password } = updateAdminPasswordDto;        
        if (password !== confirm_password) {
            throw new BadRequestException("Passwords did not match");
        }

        const hashed_password = await bcrypt.hash(password, 7);

        return this.prismaService.admin.update({
            where: { id },
            data: {hashed_password},
        });
    }


    remove(id: number) {
        return this.prismaService.admin.delete({ where: { id } });
    }
    
    async getToken(admin: Admin) {
        const payload = {
            id: admin.id,
            is_active: admin.is_active,
            is_creator: admin.is_creator,
            email: admin.email,
            role:"admin"
        };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: process.env.ACCESS_TOKEN_KEY,
                expiresIn: process.env.ACCESS_TOKEN_TIME,
            }),
            this.jwtService.signAsync(payload, {
                secret: process.env.REFRESH_TOKEN_KEY,
                expiresIn: process.env.REFRESH_TOKEN_TIME,
            }),
        ]);
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }
    async updateRefreshToken(id: number, hashed_refresh_token: string | null) {
        const updatedAdmin = await this.prismaService.admin.update({
            where: { id },
            data: { hashed_refresh_token },
        });

        return updatedAdmin;
    }
}
