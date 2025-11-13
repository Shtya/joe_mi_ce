import { IsUUID, IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class FeedbackAnswerDto {
  questionId: number;

  @IsString()
  answer: string;
}

export class CreateSurveyFeedbackDto {
  userId: number;

  branchId: number;

  surveyId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeedbackAnswerDto)
  answers: FeedbackAnswerDto[];
}
