import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Put,
  Query,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AdminGuard } from "../guards/admin.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { multerOptions } from "../config/multer.config";
import { GetCurrentUserId } from "../decorators/get-current-user-id.decorator";
import { UserSelfGuard } from "../guards/user-self.guard";
import { UserGuard } from "../guards/user.guard";

@ApiTags("User")
@ApiBearerAuth("inbola")
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AdminGuard)
  @Get()
  @ApiOperation({ summary: "Get all users" })
  @ApiResponse({ status: 200, description: "List of all users" })
  findAll() {
    return this.userService.findAll();
  }

  @UseGuards(AdminGuard)
  @Get("search")
  @ApiOperation({
    summary: "Search users by first name, last name, or phone number",
  })
  @ApiResponse({
    status: 200,
    description: "List of matching users with pagination",
  })
  searchUsers(
    @Query("query") query: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10
  ) {
    return this.userService.searchUsers(query, page, limit);
  }

  @UseGuards(AdminGuard)
  @Get(":id")
  @ApiOperation({ summary: "Get user by ID" })
  @ApiResponse({ status: 200, description: "User found" })
  @ApiResponse({ status: 404, description: "User not found" })
  findOne(@Param("id") id: string) {
    return this.userService.findOne(+id);
  }

  @UseGuards(UserGuard, UserSelfGuard)
  @Put(":id")
  @ApiOperation({ summary: "Update user by ID" })
  @ApiConsumes("multipart/form-data")
  @ApiResponse({ status: 200, description: "User updated successfully" })
  @UseInterceptors(FileInterceptor("image", multerOptions))
  async update(
    @Param("id") id: string,
    @Body() updateUserDto: Record<string, any>,
    @UploadedFile() image: Express.Multer.File
  ) {
    return this.userService.update(+id, updateUserDto, image);
  }

  @UseGuards(AdminGuard)
  @Delete(":id")
  @ApiOperation({ summary: "Delete user by ID" })
  @ApiResponse({ status: 200, description: "User deleted successfully" })
  remove(@Param("id") id: string) {
    return this.userService.remove(+id);
  }

  @UseGuards(UserGuard, AdminGuard)
  @Put(":id/block")
  @ApiOperation({ summary: "Block user by ID" })
  @ApiResponse({ status: 200, description: "User blocked successfully" })
  blockUser(@Param("id") id: string) {
    return this.userService.blockUserById(+id);
  }
}
