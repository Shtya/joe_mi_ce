import { Controller, Get, Post, Body, Param, Put, Delete, Query, Patch } from '@nestjs/common';
import { SurveyService } from './survey.service';
import { CreateSurveyDto, UpdateSurveyDto } from 'dto/survey.dto';
import { CreateSurveyFeedbackDto } from 'dto/survey-feedback.dto';
import { CRUD } from 'common/crud.service';

@Controller('surveys')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Post()
  create(@Body() dto: CreateSurveyDto) {
    return this.surveyService.create(dto);
  }

  @Post('feedback')
  async createFeedback(@Body() dto: CreateSurveyFeedbackDto) {
    return this.surveyService.createFeedback(dto);
  }

  @Get('feedback/by-promoter/:promoterId')
  async getByPromoter(@Param('promoterId') promoterId: string) {
    return this.surveyService.getFeedbackByPromoter(promoterId);
  }

  @Get('feedback/by-survey/:surveyId')
  async getBySurvey(@Param('surveyId') surveyId: string) {
    return this.surveyService.getFeedbackBySurvey(surveyId);
  }

  @Get()
  findAll(@Query() query: any) {
    return CRUD.findAll(
      this.surveyService.surveyRepo,
      'survey',
      query.search,
      query.page,
      query.limit,
      query.sortBy,
      query.sortOrder,
      ['questions'], // relation
      [], // search
      {}, // filter
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return CRUD.findOne(this.surveyService.surveyRepo, 'survey', id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSurveyDto) {
    return this.surveyService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return CRUD.softDelete(this.surveyService.surveyRepo, 'survey', id);
  }
}
