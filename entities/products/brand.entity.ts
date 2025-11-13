import { Entity, Column, OneToMany } from 'typeorm';
 import { Product } from './product.entity';
import { CoreEntity } from 'entities/core.entity';

@Entity('brands')
export class Brand extends CoreEntity {
  // @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  logo_url: string;

  @OneToMany(() => Product, product => product.brand)
  products: Product[];
}