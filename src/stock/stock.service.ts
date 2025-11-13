import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateStockDto, UpdateStockDto } from 'dto/stock.dto';
import { Branch } from 'entities/branch.entity';
import { Product } from 'entities/products/product.entity';
import { Stock } from 'entities/products/stock.entity';
import { In, LessThanOrEqual, Repository } from 'typeorm';

type OutOfStockItem = {
  product: any; // Product entity (with ما يلزم من علاقات)
  branch?: any | null; // Branch entity أو null في الـ aggregate
  quantity: number; // في per-branch = stock.quantity، في aggregate = totalQuantity
};

type OutOfStockResponse = {
  mode: 'per-branch' | 'aggregate';
  threshold: number;
  branchId?: number;
  productId?: number;
  items: OutOfStockItem[];
  count: number;
};

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Stock) public stockRepo: Repository<Stock>,
    @InjectRepository(Product) public productRepo: Repository<Product>,
    @InjectRepository(Branch) public branchRepo: Repository<Branch>,
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

  async getStocksByBranch(branchId: number): Promise<Stock[]> {
    const branch = await this.branchRepo.findOne({ where: { id: branchId } });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    return this.stockRepo.find({
      where: { branch: { id: branchId } },
      relations: ['product', 'branch'],
    });
  }

  async getStocksByProduct(productId: number): Promise<Stock[]> {
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    return this.stockRepo.find({
      where: { product: { id: productId } },
      relations: ['branch', 'product'],
    });
  }

  // stock.service.ts
  async getOutOfStockSmart(opts: { branchId?: number; productId?: number; threshold?: number }): Promise<OutOfStockResponse> {
    const { branchId, productId, threshold = 0 } = opts;
    if (productId) {
      return this.getOutOfStock({ branchId, productId, threshold });
    }
    return this.getOutOfStockAggregated({ branchId, threshold });
  }

  async getOutOfStock(opts: { branchId?: number; productId?: number; threshold?: number }): Promise<OutOfStockResponse> {
    const { branchId, productId, threshold = 0 } = opts;

    if (branchId) {
      const branch = await this.branchRepo.findOne({ where: { id: branchId } });
      if (!branch) throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }
    if (productId) {
      const product = await this.productRepo.findOne({ where: { id: productId } });
      if (!product) throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const where: any = { quantity: LessThanOrEqual(threshold) };
    if (branchId) where.branch = { id: branchId };
    if (productId) where.product = { id: productId };

    const stocks = await this.stockRepo.find({
      where,
      relations: ['product', 'branch'],
      order: { quantity: 'ASC' },
    });

    const items = stocks.map(s => ({
      product: s.product,
      branch: s.branch,
      quantity: s.quantity,
    }));

    return {
      mode: 'per-branch',
      threshold,
      branchId,
      productId,
      items,
      count: items.length,
    };
  }

  async getOutOfStockAggregated(opts: { branchId?: number; threshold?: number }): Promise<OutOfStockResponse> {
    const { branchId, threshold = 0 } = opts;

    // تجميعة آمنة بلا سحب stock.id
    const qb = this.productRepo.createQueryBuilder('product').leftJoin('product.stock', 'stock').leftJoin('stock.branch', 'branch').select('product.id', 'product_id').addSelect('product.name', 'product_name').addSelect('COALESCE(SUM(stock.quantity), 0)', 'total_qty').groupBy('product.id').addGroupBy('product.name').having('COALESCE(SUM(stock.quantity), 0) <= :thr', { thr: threshold }).orderBy('total_qty', 'ASC');

    if (branchId) {
      qb.andWhere('branch.id = :branchId', { branchId });
    }

    const rows = await qb.getRawMany(); // [{ product_id, product_name, total_qty }]
    if (rows.length === 0) {
      return {
        mode: 'aggregate',
        threshold,
        branchId,
        items: [],
        count: 0,
      };
    }

    // حمّل المنتجات مع stocks + branches (لنفس شكل الإخراج)
    const productIds = rows.map(r => r.product_id);
    const products = await this.productRepo.find({
      where: { id: In(productIds) },
      relations: ['stock', 'stock.branch'],
    });
    const byId = new Map(products.map(p => [p.id, p]));

    const items = rows.map(r => {
      const product = byId.get(r.product_id)!;

      // لو عايز تقتصر stocks داخل المنتج على فرع معين (للمعاينة فقط)، ممكن تفعّل السطر ده:
      const productScoped = branchId ? { ...product, stock: (product.stock ?? []).filter((s: any) => s.branch?.id === branchId) } : product;

      return {
        product: productScoped,
        branch: null, // موحّد مع per-branch (لكن هنا aggregate)
        quantity: Number(r.total_qty), // نفس المفتاح "quantity" في الحالتين
      };
    });

    return {
      mode: 'aggregate',
      threshold,
      branchId,
      items,
      count: items.length,
    };
  }
}
