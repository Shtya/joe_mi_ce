import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateStockDto, UpdateStockDto } from 'dto/stock.dto';
import { Branch } from 'entities/branch.entity';
import { Product } from 'entities/products/product.entity';
import { Stock } from 'entities/products/stock.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Stock) public stockRepo: Repository<Stock>,
    @InjectRepository(Product) public productRepo: Repository<Product>,
    @InjectRepository(Branch) public branchRepo: Repository<Branch>
  ) {}

  async createOrUpdate(createStockDto: CreateStockDto): Promise<Stock> {
    const { product_id, branch_id, quantity } = createStockDto;

    // 🔍 Find product with project relation
    const product = await this.productRepo.findOne({
      where: { id: product_id },
      relations: ['project'],
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${product_id} not found`);
    }

    // 🔍 Find branch with project relation
    const branch = await this.branchRepo.findOne({
      where: { id: branch_id },
      relations: ['project'],
    });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${branch_id} not found`);
    }

    // ❌ Ensure both belong to the same project
    if (product.project?.id !== branch.project?.id) {
      throw new BadRequestException('Product and Branch must belong to the same project');
    }

    // 🔄 Check if stock already exists
    let stock = await this.stockRepo.findOne({
      where: {
        product: { id: product_id },
        branch: { id: branch_id },
      },
      relations: ['product', 'branch'],
    });

    if (stock) {
      // ✅ Replace quantity instead of adding
      stock.quantity = quantity;
    } else {
      // ✅ Create new stock
      stock = this.stockRepo.create({
        quantity,
        product,
        branch,
      });
    }

    return this.stockRepo.save(stock);
  }

  async getStocksByBranch(branchId: string): Promise<Stock[]> {
    const branch = await this.branchRepo.findOne({ where: { id: branchId } });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    return this.stockRepo.find({
      where: { branch: { id: branchId } },
      relations: ['product', 'branch'],
    });
  }

  async getStocksByProduct(productId: string): Promise<Stock[]> {
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    return this.stockRepo.find({
      where: { product: { id: productId } },
      relations: ['branch', 'product'],
    });
  }
}
