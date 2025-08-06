import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
} from "@nestjs/common";
import { AddressService } from "./address.service";
import { CreateAddressDto } from "./dto/create-address.dto";
import { UpdateAddressDto } from "./dto/update-address.dto";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { UserGuard } from "../guards/user.guard";
import { GetCurrentUserId } from "../decorators/get-current-user-id.decorator";
import { UserSelfGuard } from "../guards/user-self.guard";
import { FindAddressDto } from "./dto/findAddress.dto";

@ApiTags('Address')
@ApiBearerAuth('inbola')
@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @UseGuards(UserGuard, UserSelfGuard)
  @Post("/byUser/:id")
  @ApiOperation({ summary: 'Create a new address' })
  @ApiBody({ type: CreateAddressDto })
  @ApiResponse({ status: 201, description: 'Address successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  create(@Body() createAddressDto: CreateAddressDto, @Param('id', ParseIntPipe) id: number,) {
    return this.addressService.create({...createAddressDto, user_id: id});
  }

  @UseGuards(UserGuard)
  @Get('byUser/:id')
  @ApiOperation({ summary: 'Get all addresses' })
  @ApiResponse({ status: 200, description: 'List of all addresses.' })
  findAll(@GetCurrentUserId() id: number) {
    return this.addressService.findAll(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get address by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Address ID' })
  @ApiResponse({ status: 200, description: 'Address found.' })
  @ApiResponse({ status: 404, description: 'Address not found.' })
  findOne(@Param('id') id: string) {
    return this.addressService.findOne(+id);
  }

  @UseGuards(UserGuard)
  @Post("getByUser/:user_id")
  @ApiOperation({ summary: "Get address by region, district and user" })
  @ApiParam({ name: 'user_id', type: Number, description: 'User ID' })
  @ApiBody({ type: FindAddressDto })
  @ApiResponse({ status: 200, description: "Address found." })
  @ApiResponse({ status: 404, description: "Address not found." })
  findAddressByRegionDistrictAndUser(@Param('user_id', ParseIntPipe) user_id: number, @Body() findAddressDto: FindAddressDto,) {
    return this.addressService.findAddressByRegionIdAndDistrictId(user_id, findAddressDto);
  }

  @UseGuards(UserGuard, UserSelfGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update an address by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Address ID' })
  @ApiBody({ type: UpdateAddressDto })
  @ApiResponse({ status: 200, description: 'Address updated successfully.' })
  @ApiResponse({ status: 404, description: 'Address not found.' })
  update(@Param('id') id: string, @Body() updateAddressDto: UpdateAddressDto) {
    return this.addressService.update(+id, updateAddressDto);
  }

  @UseGuards(UserGuard, UserSelfGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an address by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Address ID' })
  @ApiResponse({ status: 200, description: 'Address deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Address not found.' })
  remove(@Param('id') id: number, @Query('addressId') addressId: number) {
    return this.addressService.remove(+id, addressId);
  }
}
