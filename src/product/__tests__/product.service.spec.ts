import { ProductService } from "../product.service";
import { createProductServiceTestingModule } from "./product.service.spec-setup";

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(async () => {
    ({ service } = await createProductServiceTestingModule());
  });
  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});