import { Branch } from 'entities/branch.entity';
import { User } from 'entities/user.entity';
import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { CheckIn } from './checkin.entity';
import { CoreEntity } from 'entities/core.entity';
import { Shift } from './shift.entity';
import { JourneyPlan } from './journey_plan.entity';

export enum JourneyType {
  PLANNED = 'planned',
  UNPLANNED = 'unplanned',
}

export enum JourneyStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('journeys')
export class Journey extends CoreEntity {
  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Branch)
  branch: Branch;

  @ManyToOne(() => Shift)
  shift: Shift;

  @Column({ type: 'enum', enum: JourneyType , nullable : true })
  type: JourneyType;

  @Column({ type: 'date' , nullable : true })
  date: string;

  @Column({ type: 'enum', enum: JourneyStatus, default: JourneyStatus.PENDING })
  status: JourneyStatus;

  @ManyToOne(() => JourneyPlan, { nullable: true })
  journeyPlan?: JourneyPlan;

  @OneToOne(() => CheckIn, checkin => checkin.journey)
  checkin: CheckIn;
  
  @ManyToOne(() => User)
  createdBy: User;
}
