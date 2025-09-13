import { PartialType } from '@nestjs/swagger';
import { CreateUserAuthDto } from './create-user-auth.dto';

export class UpdateUserAuthDto extends PartialType(CreateUserAuthDto) {}
