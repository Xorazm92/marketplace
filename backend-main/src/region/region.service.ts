// @ts-nocheck
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RegionService 
{
  constructor(private readonly prismaService: PrismaService) {}

  async create(createRegionDto: CreateRegionDto) 
  {
    const existingRegion = await // @ts-ignore
    this.prismaService.region.findFirst
    (
      {
        where: 
        { 
          name: createRegionDto.name 
        },
      }
    );

    if (existingRegion) 
    {
      throw new BadRequestException(`${createRegionDto.name} nomli region allaqachon mavjud!`);
    }

    return // @ts-ignore
    this.prismaService.region.create
    (
      { 
        data: createRegionDto 
      }
    );
  }

  findAll() 
  {
    return // @ts-ignore
    this.prismaService.region.findMany(
      {
        include:{
          district: true
        }
      }
    );
  }

  async findOne(id: number) 
  {
    const region = await // @ts-ignore
    this.prismaService.region.findUnique
    (
      { 
        where: 
        { 
          id 
        },
        include:{
          district: true
        }
      }
    );

    if (!region) throw new NotFoundException(`Region topilmadi (id: ${id})`);

    return region;
  }

  async update(id: number, updateRegionDto: UpdateRegionDto) 
  {
    const region = await // @ts-ignore
    this.prismaService.region.findUnique
    (
      { 
        where: 
        { 
          id 
        } 
      }
    );

    if (!region) throw new NotFoundException(`Region topilmadi (id: ${id})`);

    if (updateRegionDto.name && updateRegionDto.name !== region.name) 
    {
      const existingRegion = await // @ts-ignore
    this.prismaService.region.findFirst
      (
        {
          where: 
          { 
            name: updateRegionDto.name 
          },
        }
      );

      if (existingRegion) throw new BadRequestException(`"${updateRegionDto.name}" nomli region allaqachon mavjud!`);
    }

    return // @ts-ignore
    this.prismaService.region.update
    (
      { 
        where: 
        { 
          id 
        }, 
        data: updateRegionDto 
      }
    );
  }

  remove(id: number) 
  {
    return // @ts-ignore
    this.prismaService.region.delete
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
