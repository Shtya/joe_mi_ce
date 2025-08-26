import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Journey } from './journey.entity';
import { CoreEntity } from 'entities/core.entity';
import { Project } from 'entities/project.entity';

@Entity('shifts')
export class Shift extends CoreEntity {
  @Column()
  name: string;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @ManyToOne(() => Project )
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @OneToMany(() => Journey, journey => journey.shift)
  journeys: Journey[];
}
