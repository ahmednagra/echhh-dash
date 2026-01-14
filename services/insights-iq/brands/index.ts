// src/services/insights-iq/brands/index.ts

export { BrandsService, brandsService } from './brands.service';
export type { 
  Brand,
  BrandsResponse,
  ProcessedBrand,
  BrandsRequestOptions,
  BrandsServiceResponse 
} from './types';
export { 
  BRANDS_CACHE_KEY,
  BRANDS_CACHE_DURATION 
} from './types';