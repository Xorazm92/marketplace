import { Module } from '@nestjs/common';
import { HierarchicalCategoryController } from './hierarchical-category.controller';
import { HierarchicalCategoryService } from './hierarchical-category.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HierarchicalCategoryController],
  providers: [HierarchicalCategoryService],
  exports: [HierarchicalCategoryService],
})
export class HierarchicalCategoryModule {}
