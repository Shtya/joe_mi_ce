import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Country } from 'entities/locations/country.entity';
import { City } from 'entities/locations/city.entity';
import { Region } from 'entities/locations/region.entity';
import { Chain } from 'entities/locations/chain.entity';

import { BulkCreateCountriesDto, BulkCreateCitiesDto, BulkCreateRegionsDto, BulkCreateChainsDto } from 'dto/locations.dto';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Country)
    public readonly countryRepo: Repository<Country>,

    @InjectRepository(Region)
    public readonly regionRepo: Repository<Region>,

    @InjectRepository(City)
    public readonly cityRepo: Repository<City>,

    @InjectRepository(Chain)
    public readonly chainRepo: Repository<Chain>
  ) {}

  // COUNTRY
  async bulkCreateCountries(dto: BulkCreateCountriesDto): Promise<Country[]> {
    const existing = await this.countryRepo.find({
      where: { name: In(dto.countries.map(c => c.name)) },
    });

    if (existing.length > 0) {
      throw new ConflictException(`Countries already exist: ${existing.map(c => c.name).join(', ')}`);
    }

    return this.countryRepo.save(dto.countries);
  }

  // REGION
  async bulkCreateRegions(dto: BulkCreateRegionsDto): Promise<Region[]> {
    const countryIds = [...new Set(dto.regions.map(r => r.countryId))];
    const countries = await this.countryRepo.findBy({ id: In(countryIds) });

    if (countries.length !== countryIds.length) {
      const missing = countryIds.filter(id => !countries.some(c => c.id === id));
      throw new ConflictException(`Countries not found: ${missing.join(', ')}`);
    }

    const existing = await this.regionRepo
      .createQueryBuilder('region')
      .where('region.name IN (:...names)', { names: dto.regions.map(r => r.name) })
      .andWhere('region.countryId IN (:...countryIds)', { countryIds })
      .getMany();

    if (existing.length > 0) {
      throw new ConflictException(`Regions already exist: ${existing.map(r => r.name).join(', ')}`);
    }

    const regions = dto.regions.map(regionDto => ({
      ...regionDto,
      country: countries.find(c => c.id === regionDto.countryId),
    }));

    return this.regionRepo.save(regions);
  }

  // CITY
  async bulkCreateCities(dto: BulkCreateCitiesDto): Promise<City[]> {
    const regionIds = [...new Set(dto.cities.map(c => c.regionId))];
    const regions = await this.regionRepo.findBy({ id: In(regionIds) });

    if (regions.length !== regionIds.length) {
      const missing = regionIds.filter(id => !regions.some(r => r.id === id));
      throw new ConflictException(`Regions not found: ${missing.join(', ')}`);
    }

    const existingCities = await this.cityRepo
      .createQueryBuilder('city')
      .where('city.name IN (:...names)', { names: dto.cities.map(c => c.name) })
      .andWhere('city.regionId IN (:...regionIds)', { regionIds })
      .getMany();

    if (existingCities.length > 0) {
      throw new ConflictException(`Cities already exist: ${existingCities.map(c => c.name).join(', ')}`);
    }

    const cities = dto.cities.map(cityDto => ({
      ...cityDto,
      region: regions.find(r => r.id === cityDto.regionId),
    }));

    return this.cityRepo.save(cities);
  }

  // CHAIN
  async bulkCreateChains(dto: BulkCreateChainsDto): Promise<Chain[]> {
    const existing = await this.chainRepo.find({
      where: { name: In(dto.chains.map(c => c.name)) },
    });

    if (existing.length > 0) {
      throw new ConflictException(`Chains already exist: ${existing.map(c => c.name).join(', ')}`);
    }

    return this.chainRepo.save(dto.chains);
  }
}
