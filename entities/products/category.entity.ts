import { Entity, Column, OneToMany } from 'typeorm';
 import { Product } from './product.entity';
import { CoreEntity } from 'entities/core.entity';

@Entity('categories')
export class Category extends CoreEntity {
  // @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => Product, product => product.category)
  products: Product[];
}