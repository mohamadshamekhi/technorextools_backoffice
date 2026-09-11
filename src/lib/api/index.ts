export { api, ApiError } from "./http";
export type { ApiErrorBody, Paginated } from "./http";
export { guarded, guardedResource } from "./guard";

// بخش auth (docs/api/auth.md)
export * as authApi from "./auth";

// بخش backoffice — تفکیک بر اساس دامنه (docs/api/backoffice.md)
export * as usersApi from "./backoffice/users";
export * as productsApi from "./backoffice/products";
export * as ordersApi from "./backoffice/orders";
export * as settingsApi from "./backoffice/settings";
export * as reportsApi from "./backoffice/reports";
export * as brandsApi from "./backoffice/brands";
export * as categoriesApi from "./backoffice/categories";
export * as discountsApi from "./backoffice/discounts";
export * as bundlesApi from "./backoffice/bundles";
export * as contentApi from "./backoffice/content";
export * as commentsApi from "./backoffice/comments";
export * as ticketsApi from "./backoffice/tickets";
export * as warrantiesApi from "./backoffice/warranties";
export * as shippingApi from "./backoffice/shipping";
export * as inventoryApi from "./backoffice/inventory";
export * as loyaltyApi from "./backoffice/loyalty";
export * as accessApi from "./backoffice/access";
export * as paymentsApi from "./backoffice/payments";
export * as mediaApi from "./backoffice/media";
