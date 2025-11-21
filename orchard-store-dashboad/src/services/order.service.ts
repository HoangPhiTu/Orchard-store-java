import http from "@/lib/axios-client";
import { API_ROUTES } from "@/config/api-routes";
import type { OrderSummary } from "@/types/order.types";

export const orderService = {
  list: () => http.get<OrderSummary[]>(API_ROUTES.ORDERS),
};
