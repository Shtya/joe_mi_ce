import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res } from '@nestjs/common';
import { ExportService, ModuleName } from './export.service';
import { CRUD } from 'common/crud.service';

@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get()
  async exportData(
    @Query('module') module: ModuleName,
    @Res() res: any,
    @Query('limit') limit?: string,  
  ) {
    return this.exportService.exportEntityToExcel(
      this.exportService.dataSource,
      module,
      res,
      { exportLimit: limit }, 
    );
  }
}
