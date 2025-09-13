import { PartialType } from '@nestjs/swagger';
import { CreateDistrictDto } from './create-district.dto';

export class UpdateDistrictDto extends PartialType(CreateDistrictDto) {}
