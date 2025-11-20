import http from "@/lib/axios-client";
import { API_ROUTES } from "@/lib/constants";
import type { ProductDTO } from "@/types/product.types";

export const productService = {
  list: () => http.get<ProductDTO[]>(API_ROUTES.PRODUCTS),
};
