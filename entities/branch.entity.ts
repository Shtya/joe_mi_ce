// branch.entity.ts
import { Entity, Column, ManyToOne, OneToMany, Index } from 'typeorm';
import { CoreEntity } from './core.entity';
import { Project } from './project.entity';
import { User } from './user.entity';
import { Stock } from './products/stock.entity';
import { Audit } from './audit.entity';
import { Sale } from './products/sale.entity';
import { GeoLocation } from './geo.embeddable';
import { Chain } from './locations/chain.entity';
import { City } from './locations/city.entity';
import { Journey } from './employee/journey.entity';

@Entity('branches')
@Index(['name', 'project'])
export class Branch extends CoreEntity {
  @Column()
  name: string;

  @Column(() => GeoLocation)
  geo: GeoLocation;

  @Column({ default: 500 })
  geofence_radius_meters: number;

  @Column({ nullable: true })
  image_url: string;

  // Relationships
  @ManyToOne(() => Project, project => project.branches)
  project: Project;

  @ManyToOne(() => User, { nullable: true })
  supervisor: User;

  @OneToMany(() => User, user => user.branch)
  team: User[];

  @ManyToOne(() => City, city => city.branches)
  city: City;

  @ManyToOne(() => Chain, chain => chain.branches, { nullable: true })
  chain: Chain;

  @OneToMany(() => Journey, journey => journey.branch)
  journeys: Journey[];

  @OneToMany(() => Stock, stock => stock.branch)
  stock: Stock[];

  @OneToMany(() => Audit, audit => audit.branch)
  audits: Audit[];

  @OneToMany(() => Sale, sale => sale.branch)
  sales: Sale[];
}
