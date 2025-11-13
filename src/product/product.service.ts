/* 
  - i need here when create a product i can add his stock as optional 
    "stock" : [
      {
        
        "branch_id" : "UUID",
        "if i pass the all_branches" : true , add to the all this كميه and dont' required the branch_id becuae you will add the all كميه to the all branches on thsi project
        "الكميه" : "",
      }
    ]

    and this is my entity in product (// product.entity.ts
import { Entity, Column, OneToMany, Index, JoinColumn, ManyToOne } from 'typeorm';
import { CoreEntity } from './core.entity';
import { Stock } from './stock.entity';
import { Sale } from './sale.entity';
import { Brand } from './brand.entity';
import { Category } from './category.entity';
import { Project } from './project.entity';

@Entity('products')
@Index(['brand', 'category'])
export class Product extends CoreEntity {
  @Column()
  name: string;
  
  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discount: number; // ✅ نسبة الخصم من 0 إلى 100

  @Column({ nullable: true })
  model: string;

  @Column({ nullable: true })
  sku: string;

  @Column({ nullable: true })
  image_url: string;

  @Column({ default: false })
  is_high_priority: boolean;

  @Column({ default: true })
  is_active: boolean;


  @ManyToOne(() => Project, project => project.products)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => Brand, brand => brand.products)
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @ManyToOne(() => Category, category => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => Stock, stock => stock.product)
  stock: Stock[];

  @OneToMany(() => Sale, sale => sale.product)
  sales: Sale[];
}
)
- you should also when he send branch_id you  should check if this branch exist on this branch

-and this is my stock (import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Branch } from './branch.entity';
import { Product } from './product.entity';
import { CoreEntity } from './core.entity';
 
@Entity('stocks')
@Unique(['product', 'branch'])
export class Stock extends CoreEntity {
  @Column('int')
  quantity: number;

  @Column()
  model: string;

  @ManyToOne(() => Branch, branch => branch.stock, { eager: true })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ManyToOne(() => Product, product => product.stock, { eager: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
) 

*/

import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductDto, UpdateProductDto } from 'dto/product.dto';
import { Branch } from 'entities/branch.entity';
import { Brand } from 'entities/products/brand.entity';
import { Category } from 'entities/products/category.entity';
import { Product } from 'entities/products/product.entity';
import { Project } from 'entities/project.entity';
import { Stock } from 'entities/products/stock.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    public productRepository: Repository<Product>,
    @InjectRepository(Project)
    public projectRepository: Repository<Project>,
    @InjectRepository(Brand)
    public brandRepository: Repository<Brand>,
    @InjectRepository(Category)
    public categoryRepository: Repository<Category>,
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const [brand, category, project] = await Promise.all([dto.brand_id ? this.brandRepository.findOne({ where: { id: dto.brand_id } }) : undefined, this.categoryRepository.findOne({ where: { id: dto.category_id } }), this.projectRepository.findOne({ where: { id: dto.project_id }, relations: ['branches'] })]);

    if (dto.brand_id && !brand) throw new NotFoundException(`Brand with ID ${dto.brand_id} not found`);
    if (!category) throw new NotFoundException(`Category with ID ${dto.category_id} not found`);
    if (!project) throw new NotFoundException(`Project with ID ${dto.project_id} not found`);

    // 🔒 Check for existing product name in this project
    const existingProduct = await this.productRepository.findOne({
      where: {
        name: dto.name,
        project: { id: project.id },
      },
    });
    if (existingProduct) {
      throw new ConflictException(`Product name "${dto.name}" already exists in this project`);
    }

    const product = this.productRepository.create({
      ...dto,
      brand,
      category,
      project,
    });

    const savedProduct = await this.productRepository.save(product);

    // ➕ Handle Stock
    if (dto.stock?.length) {
      const stockToInsert: Partial<Stock>[] = [];

      for (const stockItem of dto.stock) {
        if (stockItem.all_branches) {
          for (const branch of project.branches) {
            stockToInsert.push({
              branch,
              product: savedProduct,
              quantity: stockItem.quantity,
            });
          }
        } else {
          if (!stockItem.branch_id) {
            throw new BadRequestException('branch_id is required unless all_branches is true');
          }

          const branch = await this.branchRepository.findOne({
            where: { id: stockItem.branch_id, project: { id: project.id } },
          });

          if (!branch) {
            throw new NotFoundException(`Branch with ID ${stockItem.branch_id} not found in this project`);
          }

          stockToInsert.push({
            branch,
            product: savedProduct,
            quantity: stockItem.quantity,
          });
        }
      }

      await this.stockRepository.save(stockToInsert);
    }

    return savedProduct;
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['brand', 'category', 'stock', 'project'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    if (dto.brand_id) {
      const brand = await this.brandRepository.findOne({ where: { id: dto.brand_id } });
      if (!brand) throw new NotFoundException(`Brand with ID ${dto.brand_id} not found`);
      product.brand = brand;
    }

    if (dto.category_id) {
      const category = await this.categoryRepository.findOne({ where: { id: dto.category_id } });
      if (!category) throw new NotFoundException(`Category with ID ${dto.category_id} not found`);
      product.category = category;
    }

    // 🔐 Check uniqueness before updating name
    if (dto.name && dto.name !== product.name) {
      const exists = await this.productRepository.findOne({
        where: {
          name: dto.name,
          project: { id: product.project.id },
        },
      });
      if (exists && exists.id !== product.id) {
        throw new ConflictException(`Another product with name "${dto.name}" already exists in this project`);
      }
    }

    this.productRepository.merge(product, dto);
    return this.productRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  async getProductsByProject(projectId: number, page = 1, limit = 10) {
    const project = await this.projectRepository.findOne({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const [data, total] = await this.productRepository.findAndCount({
      where: { project: { id: projectId } },
      relations: ['brand', 'category', 'stock', 'stock.branch'],
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      total_records: total,
      current_page: page,
      per_page: limit,
      records: data,
    };
  }
  async getProductsByCategory(categoryId: number, page = 1, limit = 10) {
    const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    const [data, total] = await this.productRepository.findAndCount({
      where: { category: { id: categoryId } },
      relations: ['brand', 'category', 'stock', 'stock.branch'],
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      total_records: total,
      current_page: page,
      per_page: limit,
      records: data,
    };
  }
  async getProductsByBrand(brandId: number, page = 1, limit = 10) {
    const brand = await this.brandRepository.findOne({ where: { id: brandId } });
    if (!brand) {
      throw new NotFoundException(`Brand with ID ${brandId} not found`);
    }

    const [data, total] = await this.productRepository.findAndCount({
      where: { brand: { id: brandId } },
      relations: ['brand', 'category', 'stock', 'stock.branch'],
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      total_records: total,
      current_page: page,
      per_page: limit,
      records: data,
    };
  }
}
