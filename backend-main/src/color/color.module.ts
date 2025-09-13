
import { Module } from '@nestjs/common';
import { ColorController } from './color.controller';
import { ColorsModule } from '../colors/colors.module';

@Module({
  imports: [ColorsModule],
  controllers: [ColorController],
  exports: []
})
export class ColorModule {}
