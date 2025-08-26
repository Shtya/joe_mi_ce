import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateCountryDto, CreateCityDto, CreateRegionDto, CreateChainDto, BulkCreateCountriesDto, BulkCreateCitiesDto, BulkCreateRegionsDto, BulkCreateChainsDto } from 'dto/locations.dto';
import { PaginationQueryDto } from 'dto/pagination.dto';
import { CRUD } from 'common/crud.service';

@Controller('')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  // Bulk Create Endpoints
  @Post('countries')
  bulkCreateCountries(@Body() dto: BulkCreateCountriesDto) {
    return this.locationsService.bulkCreateCountries(dto);
  }

  @Post('regions')
  bulkCreateRegions(@Body() dto: BulkCreateRegionsDto) {
    return this.locationsService.bulkCreateRegions(dto);
  }

  @Post('cities')
  bulkCreateCities(@Body() dto: BulkCreateCitiesDto) {
    return this.locationsService.bulkCreateCities(dto);
  }

  // Get Regions by Country
  @Get('countries/:countryId/regions')
  getRegionsByCountry(@Param('countryId') countryId: string , @Query() query: PaginationQueryDto) {
    return CRUD.findAll(
      this.locationsService.regionRepo,
      'region',
      query.search,
      query.page,
      query.limit,
      query.sortBy,
      query.sortOrder,
      ["country"],
      ['name'],
      { country: { id: countryId }},
    );
  }
 
  // Get Cities by Region
  @Get('regions/:regionId/cities')
  getCitiesByRegion(@Param('regionId') regionId: string , @Query() query: PaginationQueryDto) {
    return CRUD.findAll(
      this.locationsService.cityRepo,
      'city',
      query.search,
      query.page,
      query.limit,
      query.sortBy,
      query.sortOrder,
      ["region"],
      ['name'],
      { region: { id: regionId }},
    );
  }

  // Country
  @Get('countries')
  findAllCountries(@Query() query: PaginationQueryDto) {
    return CRUD.findAll(
      this.locationsService.countryRepo,
      'country',
      query.search,
      query.page,
      query.limit,
      query.sortBy,
      query.sortOrder,
      ['regions'],
      ['name'],
      query.filters,
    );
  }

  @Delete('countries/:id')
  deleteCountry(@Param('id') id: string) {
    return CRUD.delete(this.locationsService.countryRepo, 'country', id);
  }

  // Regions
  @Get('regions')
  findAllRegions(@Query() query) {
    return CRUD.findAll(
      this.locationsService.regionRepo,
      'region',
      query.search,
      query.page,
      query.limit,
      query.sortBy,
      query.sortOrder,
      ['country'],
      ['name'],
      query.filters,
    );
  }

  @Delete('regions/:id')
  deleteRegion(@Param('id') id: string) {
    return CRUD.delete(this.locationsService.regionRepo, 'region', id);
  }

  // Cities
  @Get('cities')
  findAllCities(@Query() query: PaginationQueryDto) {
    return CRUD.findAll(
      this.locationsService.cityRepo,
      'city',
      query.search,
      query.page,
      query.limit,
      query.sortBy,
      query.sortOrder,
      [],
      ['name'],
      query.filters,
    );
  }

  @Delete('cities/:id')
  deleteCity(@Param('id') id: string) {
    return CRUD.delete(this.locationsService.cityRepo, 'city', id);
  }

  // Chains
  @Post('chains')
  bulkCreateChains(@Body() dto: BulkCreateChainsDto) {
    return this.locationsService.bulkCreateChains(dto);
  }

  @Get('chains')
  findAllChains(@Query() query: PaginationQueryDto) {
    return CRUD.findAll(
      this.locationsService.chainRepo,
      'chain',
      query.search,
      query.page,
      query.limit,
      query.sortBy,
      query.sortOrder,
      [],
      ['name'],
      query.filters,
    );
  }

  @Delete('chains/:id')
  deleteChain(@Param('id') id: string) {
    return CRUD.delete(this.locationsService.chainRepo, 'chain', id);
  }
}
