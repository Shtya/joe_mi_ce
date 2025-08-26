import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { Country } from 'entities/locations/country.entity';
import { City } from 'entities/locations/city.entity';
import { Region } from 'entities/locations/region.entity';
import { Chain } from 'entities/locations/chain.entity';
 
@Module({
  imports: [TypeOrmModule.forFeature([Country, City, Region, Chain])],
  providers: [LocationsService],
  controllers: [LocationsController],
  exports: [LocationsService], // Optional: Export if used elsewhere
})
export class LocationsModule {}