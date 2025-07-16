import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ColorsService 
{
  constructor(private readonly prismaService: PrismaService) {}

  async create(createColorDto: CreateColorDto) 
  {
    const existingColor = await this.prismaService.color.findUnique
    (
      {
        where: 
        { 
          name: createColorDto.name 
        },
      }
    );

    if (existingColor) throw new BadRequestException(`${createColorDto.name} nomli rang allaqachon mavjud!`);

    return this.prismaService.color.create
    (
      { 
        data: createColorDto 
      }
    );
  }

  async findAll() 
  {
    return this.prismaService.color.findMany();
  }

  async findOne(id: number) 
  {
    const color = await this.prismaService.color.findUnique
    (
      { 
        where: 
        { 
          id 
        } 
      }
    );

    if (!color) throw new NotFoundException(`Rang topilmadi (id: ${id})`);

    return color;
  }

  async update(id: number, updateColorDto: UpdateColorDto) 
  {
    const color = await this.prismaService.color.findUnique
    (
      { 
        where: 
        { 
          id 
        } 
      }
    );

    if (!color) throw new NotFoundException(`Rang topilmadi (id: ${id})`);

    if (updateColorDto.name && updateColorDto.name !== color.name) 
    {
      const existingColor = await this.prismaService.color.findUnique
      (
        {
          where: 
          { 
            name: updateColorDto.name 
          },
        }
      );

      if (existingColor) throw new BadRequestException(`"${updateColorDto.name}" nomli rang allaqachon mavjud!`);
    }

    return this.prismaService.color.update
    (
      {
        where: 
        { 
          id 
        }, 
        data: updateColorDto 
      }
    );
  }


  async remove(id: number) 
  {
    const color = await this.prismaService.color.findUnique
    (
      { 
        where: 
        { 
          id 
        } 
      }
    );

    if (!color) throw new NotFoundException(`Rang topilmadi (id: ${id})`);

    return this.prismaService.color.delete
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
