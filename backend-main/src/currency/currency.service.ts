// @ts-nocheck
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CurrencyService 
{
  constructor(private readonly prismaService: PrismaService) {}

  async create(createCurrencyDto: CreateCurrencyDto) 
  {
    const existingCurrency = await // @ts-ignore
    this.prismaService.currency.findUnique
    (
      {
        where: 
        { 
          name: createCurrencyDto.name 
        }, 
      }
    );

    if (existingCurrency) throw new BadRequestException(`${createCurrencyDto.name} bunaqa nomli valyuta allaqachon mavjud!`);

    return // @ts-ignore
    this.prismaService.currency.create
    (
      { 
        data: createCurrencyDto 
      }
    );
  }

  async findAll() 
  {
    return // @ts-ignore
    this.prismaService.currency.findMany();
  }

  async findOne(id: number) 
  {
    const currency = await // @ts-ignore
    this.prismaService.currency.findUnique
    (
      {
        where: 
        { 
          id 
        } 
      }
    );

    if (!currency) throw new NotFoundException(`Valyuta topilmadi (id: ${id})`);

    return currency;
  }

  async update(id: number, updateCurrencyDto: UpdateCurrencyDto) 
  {
    const currency = await // @ts-ignore
    this.prismaService.currency.findUnique
    (
      { 
        where: 
        { 
          id 
        }
      }
    );

    if (!currency) throw new NotFoundException(`Valyuta topilmadi (id: ${id})`);

    if (updateCurrencyDto.name && updateCurrencyDto.name !== currency.name) 
    {
      const existingCurrency = await // @ts-ignore
    this.prismaService.currency.findUnique
      (
        {
          where: 
          { 
            name: updateCurrencyDto.name 
          },
        }
      );

      if (existingCurrency) throw new BadRequestException(`"${updateCurrencyDto.name}" nomli valyuta allaqachon mavjud!`);
    }

    return // @ts-ignore
    this.prismaService.currency.update
    (
      { 
        where: 
        { 
          id 
        }, 
        data: updateCurrencyDto 
      }
    );
  }

  async remove(id: number) 
  {
    const currency = await // @ts-ignore
    this.prismaService.currency.findUnique
    (
      { 
        where: 
        { 
          id 
        } 
      }
    );

    if (!currency) throw new NotFoundException(`Valyuta topilmadi (id: ${id})`);

    return // @ts-ignore
    this.prismaService.currency.delete
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
