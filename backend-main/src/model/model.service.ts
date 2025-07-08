import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ModelService 
{
  constructor(private readonly prismaService: PrismaService) {}

  async create(createModelDto: CreateModelDto) 
  {
    const existingModel = await this.prismaService.model.findFirst
    (
      {
        where: 
        { 
          name: createModelDto.name 
        },
      }
    );

    if (existingModel) throw new BadRequestException(`${createModelDto.name} nomli model allaqachon mavjud!`);
    
    return this.prismaService.model.create
    (
      { 
        data: createModelDto 
      }
    );
  }

  findAll() 
  {
    return this.prismaService.model.findMany();
  }

  async findOne(id: number) 
  {
    const model = await this.prismaService.model.findUnique
    (
      { 
        where: 
        { 
          id 
        } 
      }
    );

    if (!model) throw new NotFoundException(`Model topilmadi (id: ${id})`);

    return model;
  }

  async update(id: number, updateModelDto: UpdateModelDto) 
  {
    const model = await this.prismaService.model.findUnique
    (
      { 
        where: 
        { 
          id 
        } 
      }
    );
    if (!model) throw new NotFoundException(`Model topilmadi (id: ${id})`);

    if (updateModelDto.name && updateModelDto.name !== model.name) 
    {
      const existingModel = await this.prismaService.model.findFirst
      (
        {
          where: 
          { 
            name: updateModelDto.name 
          },
        }
      );

      if (existingModel) throw new BadRequestException(`"${updateModelDto.name}" nomli model allaqachon mavjud!`);
    }

    return this.prismaService.model.update
    (
      { 
        where: 
        { 
          id 
        }, 
        data: updateModelDto 
      }
    );
  }

  remove(id: number) 
  {
    return this.prismaService.model.delete
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
