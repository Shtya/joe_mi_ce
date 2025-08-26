import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBrandDto, UpdateBrandDto } from 'dto/brand.dto';
import { Brand } from 'entities/products/brand.entity';
import { Repository } from 'typeorm'; 

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand)
    public brandRepository: Repository<Brand>,
  ) {}

  async create(createBrandDto: CreateBrandDto): Promise<Brand> {
  const existing = await this.brandRepository.findOneBy({ name: createBrandDto.name });

  if (existing) {
    throw new ConflictException('Brand name already exists');
  }

  const brand = this.brandRepository.create(createBrandDto);
  return await this.brandRepository.save(brand);
}

  async findAll(): Promise<Brand[]> {
    return await this.brandRepository.find();
  }

  async findOne(id: string): Promise<Brand> {
    const brand = await this.brandRepository.findOne({ where: { id } });
    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }
    return brand;
  }

  async update(id: string, updateBrandDto: UpdateBrandDto): Promise<Brand> {
    const brand = await this.findOne(id);
    this.brandRepository.merge(brand, updateBrandDto);
    return await this.brandRepository.save(brand);
  }

  async remove(id: string): Promise<void> {
    const brand = await this.findOne(id);
    await this.brandRepository.remove(brand);
  }
}