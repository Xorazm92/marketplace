import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Product } from '../../product/entities/product.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon?: string;

  @Column({ type: 'int', nullable: true })
  parent_id?: number;

  @Column({ type: 'int', default: 0 })
  level: number; // 0 = root, 1 = subcategory, 2 = sub-subcategory, etc.

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Parent relationship (self-referencing)
  @ManyToOne(() => Category, category => category.children, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_id' })
  parent: Category;

  // Children relationship (self-referencing)
  @OneToMany(() => Category, category => category.parent)
  children: Category[];

  // Products relationship
  @OneToMany(() => Product, product => product.category)
  products: Product[];

  // Virtual fields for frontend (not stored in database)
  hasChildren?: boolean;
  childrenCount?: number;
  fullPath?: string; // e.g., "Kiyim > Ichki kiyim > Yozgi kiyim"
}
