// i need here when a pormoter make audit on product on branch
// - cannot make audit in the same daay again
// - if there an promoter will mke audit on the

import { Controller, Post, Get, Patch, Delete, Param, Body, Query, ParseUUIDPipe } from '@nestjs/common';

import { CreateAuditDto, QueryAuditsDto, UpdateAuditDto, UpdateAuditStatusDto } from 'dto/audit.dto';
import { Audit } from 'entities/audit.entity';
import { AuditsService } from './audit.service';
import { CRUD } from 'common/crud.service';

@Controller('audits')
export class AuditsController {
  constructor(private readonly service: AuditsService) {}

  @Post()
  create(@Body() dto: CreateAuditDto) {
    return this.service.create(dto);
  }

  @Get('')
  async getAudit(@Query() query) {
    return CRUD.findAll(
      this.service.repo,
      'audit',
      query.search,
      query.page,
      query.limit,
      query.sortBy,
      query.sortOrder,
      [], // search
      [], // relation
      {}, // filter
    );
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return CRUD.findOne(this.service.repo, 'audit', id, ['product']);
  }

  @Patch(':id')
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateAuditDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateAuditStatusDto) {
    return this.service.updateStatus(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return CRUD.softDelete(this.service.repo, 'audit', id);
  }

  // في audits.controller.ts
  @Get('by-product/:productId')
  byProduct(@Param('productId', new ParseUUIDPipe()) productId: string, @Query() query: any) {
    return CRUD.findAll(
      this.service.repo,
      'audit',
      query.search,
      query.page,
      query.limit,
      query.sortBy,
      query.sortOrder,
      [], // relation
      [], // search
      { productId }, // filter
    );
  }

  
  @Get('by-branch/:branchId')
  byBranch(@Param('branchId', new ParseUUIDPipe()) branchId: string, @Query() query:any) {
    return CRUD.findAll(
      this.service.repo,
      'audit',
      query.search,
      query.page,
      query.limit,
      query.sortBy,
      query.sortOrder,
      [], // relation
      [], // search
      { branchId}, // filter
    );

    // return this.service.findByBranch(branchId, q);
  }

  // GET بحسب المروّج
  @Get('by-promoter/:promoterId')
  byPromoter(@Param('promoterId', new ParseUUIDPipe()) promoterId: string, @Query() query: any) {
    return CRUD.findAll(
      this.service.repo,
      'audit',
      query.search,
      query.page,
      query.limit,
      query.sortBy,
      query.sortOrder,
      [], // relation
      [], // search
      { promoterId}, // filter
    );
  }
}
