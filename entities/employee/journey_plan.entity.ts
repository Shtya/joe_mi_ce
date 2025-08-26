import { Branch } from 'entities/branch.entity';
import { User } from 'entities/user.entity';
import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
 import { CoreEntity } from 'entities/core.entity';
import { Shift } from './shift.entity';

 
@Entity()
export class JourneyPlan extends CoreEntity {
  @ManyToOne(() => User, { eager: true })
  user: User;

  @ManyToOne(() => Branch, { eager: true })
  branch: Branch;

  @ManyToOne(() => Shift, { eager: true })
  shift: Shift;

  @ManyToOne(() => User, { nullable: false, eager: true })
  createdBy: User;

  @Column({ type: 'date' })
  fromDate: string;

  @Column({ type: 'date' })
  toDate: string;

  @Column({ type: 'text', array: true })
  days: string[];
}