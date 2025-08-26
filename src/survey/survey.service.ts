// handle here get all surveys/feedback get by promoter and get by survey id
// and also the user can mke only one survey feedback

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSurveyDto, UpdateSurveyDto } from 'dto/survey.dto';
import { Survey, SurveyQuestion } from 'entities/survey.entity';
import { CreateSurveyFeedbackDto } from 'dto/survey-feedback.dto';
import { SurveyFeedback, SurveyFeedbackAnswer } from 'entities/survey-feedback.entity';

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(Survey) public readonly surveyRepo: Repository<Survey>,

    @InjectRepository(SurveyFeedback) public feedbackRepo: Repository<SurveyFeedback>,
    @InjectRepository(SurveyFeedbackAnswer) public answerRepo: Repository<SurveyFeedbackAnswer>,
    @InjectRepository(SurveyQuestion) public questionRepo: Repository<SurveyQuestion>,
  ) {}

  async create(dto: CreateSurveyDto): Promise<Survey> {
    const survey = this.surveyRepo.create(dto);
    return await this.surveyRepo.save(survey);
  }

  async createFeedback(dto: CreateSurveyFeedbackDto) {
    const survey = await this.surveyRepo.findOne({
      where: { id: dto.surveyId },
      relations: ['questions'],
    });

    if (!survey) throw new NotFoundException('Survey not found');
    if (survey.questions.length === 0) {
      throw new BadRequestException('Survey has no questions');
    }

    // تحقق إذا المستخدم أجاب سابقًا على هذا الاستبيان
    const existingFeedback = await this.feedbackRepo.findOne({
      where: {
        survey: { id: dto.surveyId },
        user: { id: dto.userId },
      },
    });
    if (existingFeedback) {
      throw new BadRequestException('You have already submitted feedback for this survey');
    }

    // التحقق من أن جميع الأسئلة تابعة لنفس الاستبيان
    const validQuestionIds = survey.questions.map(q => q.id);
    for (const ans of dto.answers) {
      if (!validQuestionIds.includes(ans.questionId)) {
        throw new BadRequestException(`Question ${ans.questionId} is not part of this survey`);
      }
    }

    const feedback = this.feedbackRepo.create({
      user: { id: dto.userId } as any,
      branch: { id: dto.branchId } as any,
      survey: { id: dto.surveyId } as any,
      answers: dto.answers.map(ans =>
        this.answerRepo.create({
          question: { id: ans.questionId } as any,
          answer: ans.answer,
        }),
      ),
    });

    return await this.feedbackRepo.save(feedback);
  }

  async getFeedbackByPromoter(promoterId: string) {
    return await this.feedbackRepo.find({
      where: { user: { id: promoterId } },
      relations: ['survey', 'answers', 'answers.question'],
    });
  }

  async getFeedbackBySurvey(surveyId: string) {
    return await this.feedbackRepo.find({
      where: { survey: { id: surveyId } },
      relations: ['user', 'answers', 'answers.question'],
    });
  }

  async findAll(): Promise<Survey[]> {
    return this.surveyRepo.find({ relations: ['questions'] });
  }

  async findOne(id: string): Promise<Survey> {
    const survey = await this.surveyRepo.findOne({ where: { id }, relations: ['questions'] });
    if (!survey) throw new NotFoundException('Survey not found');
    return survey;
  }

  async update(id: string, dto: UpdateSurveyDto): Promise<Survey> {
    const survey = await this.findOne(id);
    Object.assign(survey, dto);
    return this.surveyRepo.save(survey);
  }

  async remove(id: string): Promise<void> {
    const survey = await this.findOne(id);
    await this.surveyRepo.remove(survey);
  }
}
