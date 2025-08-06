import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from "@nestjs/common";
import { ColorsService } from "./colors.service";
import { CreateColorDto } from "./dto/create-color.dto";
import { UpdateColorDto } from "./dto/update-color.dto";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AdminGuard } from "../guards/admin.guard";

@ApiTags("Colors")
@Controller("colors")
export class ColorsController {
  constructor(private readonly colorsService: ColorsService) {}

  @Post()
  @ApiBearerAuth("inbola")
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: "Create a new color" })
  @ApiResponse({ status: 201, description: "Color created successfully" })
  create(@Body() createColorDto: CreateColorDto) {
    return this.colorsService.create(createColorDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all colors" })
  @ApiResponse({
    status: 200,
    description: "List of colors retrieved successfully",
  })
  findAll() {
    return this.colorsService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a color by ID" })
  @ApiResponse({ status: 200, description: "Color retrieved successfully" })
  @ApiResponse({ status: 404, description: "Color not found" })
  findOne(@Param("id") id: string) {
    return this.colorsService.findOne(+id);
  }

  @Put(":id")
  @ApiBearerAuth("inbola")
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: "Update a color by ID" })
  @ApiResponse({ status: 200, description: "Color updated successfully" })
  update(@Param("id") id: string, @Body() updateColorDto: UpdateColorDto) {
    return this.colorsService.update(+id, updateColorDto);
  }

  @Delete(":id")
  @ApiBearerAuth("inbola")
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: "Delete a color by ID" })
  @ApiResponse({ status: 200, description: "Color deleted successfully" })
  remove(@Param("id") id: string) {
    return this.colorsService.remove(+id);
  }
}
