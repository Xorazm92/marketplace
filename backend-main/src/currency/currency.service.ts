import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CurrencyService 
{
  constructor(private readonly prismaService: PrismaService) {}

  async create(createCurrencyDto: CreateCurrencyDto) 
  {
    const existingCurrency = await this.prismaService.currency.findUnique
    (
      {
        where: 
        { 
          name: createCurrencyDto.name 
        }, 
      }
    );

    if (existingCurrency) throw new BadRequestException(`${createCurrencyDto.name} bunaqa nomli valyuta allaqachon mavjud!`);

    return this.prismaService.currency.create
    (
      { 
        data: createCurrencyDto 
      }
    );
  }

  async findAll() 
  {
    return this.prismaService.currency.findMany();
  }

  async findOne(id: number) 
  {
    const currency = await this.prismaService.currency.findUnique
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
    const currency = await this.prismaService.currency.findUnique
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
      const existingCurrency = await this.prismaService.currency.findUnique
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

    return this.prismaService.currency.update
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
    const currency = await this.prismaService.currency.findUnique
    (
      { 
        where: 
        { 
          id 
        } 
      }
    );

    if (!currency) throw new NotFoundException(`Valyuta topilmadi (id: ${id})`);

    return this.prismaService.currency.delete
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
