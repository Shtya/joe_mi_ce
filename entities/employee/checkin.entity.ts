import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { Journey } from './journey.entity';
import { CoreEntity } from 'entities/core.entity';
import { GeoLocation } from 'entities/geo.embeddable';
import { User } from 'entities/user.entity';

@Entity('check_ins')
export class CheckIn extends CoreEntity {
  @OneToOne(() => Journey, journey => journey.checkin, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'journey_id' })
  journey: Journey;

  @ManyToOne(() => User, user => user.checkins, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'timestamp', nullable: true })
  checkInTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  checkOutTime: Date;

  @Column(() => GeoLocation)
  geo: GeoLocation;

  @Column({ nullable: true })
  image: string;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ default: false })
  isWithinRadius: boolean;
}
