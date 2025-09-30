// @ts-nocheck
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateDistrictDto } from './dto/create-district.dto';
import { UpdateDistrictDto } from './dto/update-district.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DistrictService {
  constructor(private readonly prismaService: PrismaService) {}

 async create(createDistrictDto: CreateDistrictDto) 
 {
  const existingDistrict = await // @ts-ignore
    this.prismaService.district.findFirst
  (
    {
      where: 
      { 
        name: createDistrictDto.name 
      },
    }
  );

  if (existingDistrict) throw new BadRequestException(`${createDistrictDto.name} nomli tuman allaqachon mavjud!`);
  
  return // @ts-ignore
    this.prismaService.district.create
  (
    { 
      data: createDistrictDto 
    }
  );
}

async findAll() 
{
    return // @ts-ignore
    this.prismaService.district.findMany();
}

 async findOne(id: number) 
 {
    const district = await // @ts-ignore
    this.prismaService.district.findUnique
    (
      { 
        where: 
        { 
          id 
        } 
      }
    );

    if (!district) throw new NotFoundException(`Tuman topilmadi (id: ${id})`);
    return district;
 }

 async update(id: number, updateDistrictDto: UpdateDistrictDto) 
 {
  const district = await // @ts-ignore
    this.prismaService.district.findUnique
  (
    { 
      where: 
      { 
        id 
      } 
    }
  );

  if (!district) throw new NotFoundException(`Tuman topilmadi (id: ${id})`);

  if (updateDistrictDto.name && updateDistrictDto.name !== district.name) 
  {
    const existingDistrict = await // @ts-ignore
    this.prismaService.district.findFirst
    (
      {
        where: 
        { 
          name: updateDistrictDto.name 
        },
      }
    );

    if (existingDistrict) throw new BadRequestException(`"${updateDistrictDto.name}" nomli tuman allaqachon mavjud!`);
  }

  return // @ts-ignore
    this.prismaService.district.update
  (
    { where: 
      { 
        id 
      }, 
      data: updateDistrictDto 
    }
  );
}

  async remove(id: number)
  {
    const district = await // @ts-ignore
    this.prismaService.district.findUnique
    (
      { 
        where: 
        { 
          id 
        } 
      }
    );

    if (!district) throw new NotFoundException(`Tuman topilmadi (id: ${id})`);

    return // @ts-ignore
    this.prismaService.district.delete
    (
      { 
        where: 
        { 
          id 
        }
      }
    );
  }
}
