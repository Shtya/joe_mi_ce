import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';
import { CoreEntity } from './core.entity';

@Entity()
export class Survey extends CoreEntity {
  @Column()
  name: string;

  @Column({ default: 'active' })
  status: 'active' | 'inactive';

  @OneToMany(() => SurveyQuestion, question => question.survey ,  { cascade: true, eager: true })
  questions: SurveyQuestion[];
}
 


@Entity()
export class SurveyQuestion extends CoreEntity {
  @Column()
  text: string;

  @Column()
  type: string;

  @Column('jsonb', { nullable: true })
  options: string[];

  // Relationships
  @ManyToOne(() => Survey, survey => survey.questions)
  survey: Survey;
}

