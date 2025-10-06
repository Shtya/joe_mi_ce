// export.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Branch } from 'entities/branch.entity';
import { Product } from 'entities/products/product.entity';
import { Sale } from 'entities/products/sale.entity';
import { Stock } from 'entities/products/stock.entity';
import { User } from 'entities/user.entity';
import { CheckIn } from 'entities/employee/checkin.entity';
import { Journey } from 'entities/employee/journey.entity';
import { JourneyPlan } from 'entities/employee/journey_plan.entity';
import { Shift } from 'entities/employee/shift.entity';
import { Vacation } from 'entities/employee/vacation.entity';
import { Chain } from 'entities/locations/chain.entity';
import { City } from 'entities/locations/city.entity';
import { Country } from 'entities/locations/country.entity';
import { Region } from 'entities/locations/region.entity';
import { Brand } from 'entities/products/brand.entity';
import { Category } from 'entities/products/category.entity';
import { Audit } from 'entities/audit.entity';
import { Competitor } from 'entities/competitor.entity';
import { Permission } from 'entities/permissions.entity';
import { Role } from 'entities/role.entity';
import { SurveyFeedback } from 'entities/survey-feedback.entity';
import { Survey } from 'entities/survey.entity';

export enum ModuleName {
  SALE = 'sale',
  PRODUCT = 'product',
  STOCK = 'stock',
  BRANCH = 'branch',
  USER = 'user',

  CHECKIN = 'checkin',
  JOURNEY = 'journey',
  JOURNEYPLAN = 'journeyplan',
  SHIFT = 'shift',
  VACATION = 'vacation',

  CHAIN = 'chain',
  CITY = 'city',
  COUNTRY = 'country',
  REGION = 'region',

  BRAND = 'brand',
  CATEGORY = 'category',

  AUDIT = 'audit',
  COMPETITOR = 'competitor',

  PERMISSION = 'permission',
  ROLE = 'role',

  SURVEYFEEDBACK = 'surveyfeedback',
  SURVEY = 'survey',
}

export const moduleRepoMap: Record<ModuleName, any> = {
  [ModuleName.SALE]: Sale,
  [ModuleName.PRODUCT]: Product,
  [ModuleName.STOCK]: Stock,
  [ModuleName.BRANCH]: Branch,
  [ModuleName.USER]: User,

  [ModuleName.CHECKIN]: CheckIn,
  [ModuleName.JOURNEY]: Journey,
  [ModuleName.JOURNEYPLAN]: JourneyPlan,
  [ModuleName.SHIFT]: Shift,
  [ModuleName.VACATION]: Vacation,

  [ModuleName.CHAIN]: Chain,
  [ModuleName.CITY]: City,
  [ModuleName.COUNTRY]: Country,
  [ModuleName.REGION]: Region,

  [ModuleName.BRAND]: Brand,
  [ModuleName.CATEGORY]: Category,

  [ModuleName.AUDIT]: Audit,
  [ModuleName.COMPETITOR]: Competitor,

  [ModuleName.PERMISSION]: Permission,
  [ModuleName.ROLE]: Role,

  [ModuleName.SURVEYFEEDBACK]: SurveyFeedback,
  [ModuleName.SURVEY]: Survey,
};

@Injectable()
export class ExportService {
  constructor(public readonly dataSource: DataSource) {}

  async exportEntityToExcel(
    dataSource: DataSource,
    moduleName: string,
    res: any,
    options: {
      // نقبل 'all' أو رقم كنص أو رقم فعلاً
      exportLimit?: number | string;
      columns?: { header: string; key: string; width?: number }[];
    } = {},
  ) {
    // ✅ Normalize module
    const normalized = (moduleName || '').toLowerCase().trim() as ModuleName;

    const entityClass = moduleRepoMap[normalized];
    if (!entityClass) {
      const allowed = Object.values(ModuleName);
      throw new BadRequestException({
        message: `Invalid module "${moduleName}". Allowed modules are: ${allowed.join(', ')}`,
        allowedModules: allowed,
      });
    }

    const repository: Repository<any> = dataSource.getRepository(entityClass);

    // ✅ Parse limit: يدعم 'all' أو رقم
    const rawLimit = options.exportLimit;
    let take: number | undefined;

    if (rawLimit === 'all' || (typeof rawLimit === 'string' && rawLimit.toLowerCase().trim() === 'all')) {
      take = undefined; // بدون take => نزّل الكل
    } else if (rawLimit === undefined || rawLimit === null || rawLimit === '') {
      take = 10; // Default
    } else {
      const n = typeof rawLimit === 'number' ? rawLimit : Number(rawLimit);
      take = Number.isFinite(n) && n > 0 ? Math.floor(n) : 10;
    }

    // ✅ اجلب البيانات (لو take undefined هينزّل الكل)
    const findOptions: any = {};
    if (take !== undefined) findOptions.take = take;

    const data = await repository.find(findOptions);

    // 🎯 بناء ملف الإكسل (كما هو مع تحسين بسيط في الاستبعاد)
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');

    const columns =
      options.columns ??
      (data.length > 0
        ? Object.keys(data[0])
            .filter(key => key !== 'updated_at' && key !== 'deleted_at')
            .map(key => ({ header: key, key, width: 20 }))
        : []);

    worksheet.columns = columns;

    data.forEach(item => {
      const rowData: any = { ...item };
      delete rowData.updated_at;
      delete rowData.deleted_at;

      const row = worksheet.addRow(rowData);
      row.eachCell(cell => {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });
    });

    worksheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCCCCC' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    worksheet.columns.forEach(column => {
      let maxLength = 10;
      column.eachCell({ includeEmpty: true }, cell => {
        const cellValue = cell.value ? cell.value.toString() : '';
        if (cellValue.length > maxLength) maxLength = cellValue.length;
      });
      column.width = maxLength + 2;
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${normalized}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  }
}
