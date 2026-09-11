# Backoffice API

## Access (RBAC)

### GET /backoffice/access/permissions

**List Permissions**

Perm: `roles.manage`. The permission catalog grouped for the panel picker.

- auth: (inherits collection default: Bearer {{accessToken}})

### GET /backoffice/access/roles

**List Roles**

Perm: `roles.manage`. → `[{ id, title, slug, isSystem, userCount, permissions[] }]`

- auth: (inherits collection default: Bearer {{accessToken}})

### POST /backoffice/access/roles

**Create Role**

Perm: `roles.manage`. Body: `createRoleSchema`.

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "title": "مدیر محتوا",
  "slug": "content-manager",
  "description": "مدیریت وبلاگ و نظرات",
  "permissions": ["articles.manage", "comments.moderate"]
}
```

### PATCH /backoffice/access/roles/{{roleId}}

**Update Role**

Perm: `roles.manage`. Body: `updateRoleSchema` (partial). Replaces the permission set.

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "permissions": ["articles.manage"]
}
```

### DELETE /backoffice/access/roles/{{roleId}}

**Delete Role**

Perm: `roles.manage`. 204. Fails on a system role or a role with users.

- auth: (inherits collection default: Bearer {{accessToken}})

## Users

### GET /backoffice/users?skip=0&take=20

**List Users**

Perm: `users.view`. Query: `listUsersQuerySchema`. → `{ items, total, skip, take }`.

- auth: (inherits collection default: Bearer {{accessToken}})
- query:
  - `skip=0`
  - `take=20`

### GET /backoffice/users/{{userId}}

**Get User By ID**

Perm: `users.view`.

- auth: (inherits collection default: Bearer {{accessToken}})

### PATCH /backoffice/users/{{userId}}

**Update User**

Perm: `users.manage`. Body: `updateUserSchema` (partial). `roleId` assigns a role.

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "fullName": "کاربر نمونه",
  "roleId": "{{customerRoleId}}",
  "isActive": true
}
```

## Categories

### GET /backoffice/categories?skip=0&take=20&search&isActive

**List Categories**

- auth: (inherits collection default: Bearer {{accessToken}})
- query:
  - `skip=0`
  - `take=20`

### GET /backoffice/categories/tree

**Category Tree**

- auth: (inherits collection default: Bearer {{accessToken}})

### POST /backoffice/categories

**Create Category**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "title": "ابزار بادی",
  "slug": "pneumatic-tools",
  "parentId": "{{categoryId}}",
  "sortOrder": 0,
  "isActive": true
}
```

### PATCH /backoffice/categories/{{categoryId}}

**Update Category**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "title": "ابزار بادی و برقی",
  "sortOrder": 1
}
```

### DELETE /backoffice/categories/{{categoryId}}

**Delete Category**

- auth: (inherits collection default: Bearer {{accessToken}})

### GET /backoffice/categories/{{categoryId}}/attribute-groups

**List Attribute Groups**

- auth: (inherits collection default: Bearer {{accessToken}})

### POST /backoffice/categories/{{categoryId}}/attribute-groups

**Create Attribute Group**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "title": "مشخصات فنی"
}
```

### PATCH /backoffice/attribute-groups/{{attributeGroupId}}

**Update Attribute Group**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "title": "مشخصات فنی کامل"
}
```

### DELETE /backoffice/attribute-groups/{{attributeGroupId}}

**Delete Attribute Group**

- auth: (inherits collection default: Bearer {{accessToken}})

### POST /backoffice/attribute-groups/{{attributeGroupId}}/attributes

**Create Attribute**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "title": "گشتاور",
  "unit": "نیوتن‌متر",
  "inputType": "number",
  "options": [],
  "sortOrder": 0
}
```

### PATCH /backoffice/attributes/{{attributeId}}

**Update Attribute**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "title": "گشتاور کاری",
  "options": []
}
```

### DELETE /backoffice/attributes/{{attributeId}}

**Delete Attribute**

- auth: (inherits collection default: Bearer {{accessToken}})

## Brands

### GET /backoffice/brands

**List Brands**

- auth: (inherits collection default: Bearer {{accessToken}})

### POST /backoffice/brands

**Create Brand**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "title": "تکنورکس",
  "slug": "puma-air",
  "logoUrl": "https://cdn.example.com/puma.png",
  "isExclusiveDistributor": true,
  "authenticityNote": "نمایندگی انحصاری ابزار بادی پوما"
}
```

### PATCH /backoffice/brands/{{brandId}}

**Update Brand**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "title": "تکنورکس",
  "isExclusiveDistributor": true
}
```

### DELETE /backoffice/brands/{{brandId}}

**Delete Brand**

- auth: (inherits collection default: Bearer {{accessToken}})

## Products

### GET /backoffice/products?skip=0&take=20&search&categoryId={{categoryId}}&brandId={{brandId}}&isActive&isAmazingDeal

**List Products**

- auth: (inherits collection default: Bearer {{accessToken}})
- query:
  - `skip=0`
  - `take=20`
  - `categoryId={{categoryId}}`
  - `brandId={{brandId}}`

### GET /backoffice/products/{{productId}}

**Get Product**

- auth: (inherits collection default: Bearer {{accessToken}})

### POST /backoffice/products

**Create Product**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "title": "بکس بادی ۱/۲ اینچ پوما",
  "slug": "puma-air-wrench-1-2",
  "categoryId": "{{categoryId}}",
  "brandId": "{{brandId}}",
  "shortDesc": "بکس بادی صنعتی با گشتاور ۶۵۰ نیوتن‌متر",
  "description": "<p>مناسب کارگاه‌های صنعتی…</p>",
  "basePrice": 12500000,
  "isAmazingDeal": false,
  "isActive": true
}
```

### PATCH /backoffice/products/{{productId}}

**Update Product**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "basePrice": 11900000,
  "isAmazingDeal": true
}
```

### DELETE /backoffice/products/{{productId}}

**Delete Product**

- auth: (inherits collection default: Bearer {{accessToken}})

### PUT /backoffice/products/{{productId}}/attribute-values

**Replace Attribute Values**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "values": [
    {
      "attributeId": "{{attributeId}}",
      "value": "۶۵۰"
    }
  ]
}
```

### PUT /backoffice/products/{{productId}}/related

**Replace Related**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "relatedProductIds": []
}
```

### POST /backoffice/products/{{productId}}/variants

**Create Variant**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "sku": "PUMA-AW-12-RED",
  "colorName": "قرمز",
  "stockQty": 10,
  "priceOverride": null,
  "isActive": true
}
```

### PATCH /backoffice/products/{{productId}}/variants/{{variantId}}

**Update Variant**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "colorName": "قرمز متالیک",
  "isActive": true
}
```

## Inventory

### GET /backoffice/inventory/variants?skip=0&take=20&productId={{productId}}&search&lowStock

**List Variants**

- auth: (inherits collection default: Bearer {{accessToken}})
- query:
  - `skip=0`
  - `take=20`
  - `productId={{productId}}`

### PATCH /backoffice/inventory/variants/{{inventoryVariantId}}

**Update Variant Stock/Price**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "stockQty": 25,
  "priceOverride": 11800000
}
```

### PUT /backoffice/inventory/variants/{{inventoryVariantId}}/price-tiers

**Replace Price Tiers**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "tiers": [
    {
      "minQty": 5,
      "unitPrice": 11000000
    },
    {
      "minQty": 10,
      "unitPrice": 10500000
    }
  ]
}
```

## Orders

### GET /backoffice/orders?skip=0&take=20

**List Orders**

- auth: (inherits collection default: Bearer {{accessToken}})
- query:
  - `skip=0`
  - `take=20`

### GET /backoffice/orders/{{orderNumber}}

**Order Detail**

- auth: (inherits collection default: Bearer {{accessToken}})

### PATCH /backoffice/orders/{{orderNumber}}/status

**Set Order Status**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "status": "processing",
  "note": "شروع آماده‌سازی"
}
```

### PATCH /backoffice/orders/{{orderNumber}}/confirm-cash-payment

**Confirm Cash Payment** _(دستی — هنوز در Postman collection نیست، README.md را ببینید)_

Perm: `orders.manage`. بدون body. فقط روی سفارش با `paymentMethod: "cash"` و
`status: "pending_payment"` کار می‌کند؛ روی موفقیت سفارش `paid` می‌شود.

- auth: (inherits collection default: Bearer {{accessToken}})

## Payments

### GET /backoffice/payments?skip=0&take=20

**List Payments**

- auth: (inherits collection default: Bearer {{accessToken}})
- query:
  - `skip=0`
  - `take=20`

## Payment Methods

_(دستی — هنوز در Postman collection نیست، README.md را ببینید)_

دو ردیف پیش‌فرض seed شده‌اند (`code: "online"` و `code: "cash"`)؛ افزودن روش دلخواه هم
مجاز است. `code` فقط هنگام ساخت تعیین می‌شود و بعدش تغییرناپذیر است (در بدنه‌ی PATCH
ارسال نمی‌شود).

### GET /backoffice/payment-methods

**List Payment Methods**

Perm: `payment-methods.manage`.

- auth: (inherits collection default: Bearer {{accessToken}})

### GET /backoffice/payment-methods/{{id}}

**Payment Method Detail**

Perm: `payment-methods.manage`.

- auth: (inherits collection default: Bearer {{accessToken}})

### POST /backoffice/payment-methods

**Create Payment Method**

Perm: `payment-methods.manage`.

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "code": "cod-express",
  "title": "پرداخت در محل (اکسپرس)",
  "description": "...",
  "isActive": true,
  "sortOrder": 3
}
```

### PATCH /backoffice/payment-methods/{{id}}

**Update Payment Method**

Perm: `payment-methods.manage`. `code` را در بدنه ارسال نکنید — تغییرناپذیر است.
`isActive: false` واقعاً در چک‌اوت مشتری اعمال می‌شود (روش از انتخاب سفارش جدید حذف می‌شود).

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "title": "پرداخت آنلاین (زرین‌پال)",
  "description": "...",
  "isActive": true,
  "sortOrder": 1
}
```

### DELETE /backoffice/payment-methods/{{id}}

**Delete Payment Method**

Perm: `payment-methods.manage`.

- auth: (inherits collection default: Bearer {{accessToken}})

## Shipping Methods

### GET /backoffice/shipping-methods

**List Shipping Methods**

- auth: (inherits collection default: Bearer {{accessToken}})

### POST /backoffice/shipping-methods

**Create Shipping Method**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "title": "پست پیشتاز",
  "costType": "flat",
  "cost": 60000,
  "freeOverAmount": 2000000,
  "isActive": true,
  "sortOrder": 1
}
```

### PATCH /backoffice/shipping-methods/{{shippingMethodId}}

**Update Shipping Method**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "cost": 75000
}
```

### DELETE /backoffice/shipping-methods/{{shippingMethodId}}

**Delete Shipping Method**

- auth: (inherits collection default: Bearer {{accessToken}})

## Discounts

### GET /backoffice/discounts?skip=0&take=20

**List Discounts**

- auth: (inherits collection default: Bearer {{accessToken}})
- query:
  - `skip=0`
  - `take=20`

### GET /backoffice/discounts/{{discountId}}

**Discount Detail**

- auth: (inherits collection default: Bearer {{accessToken}})

### GET /backoffice/discounts/{{discountId}}/usages

**Discount Usages**

- auth: (inherits collection default: Bearer {{accessToken}})

### POST /backoffice/discounts

**Create Discount**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "code": "WELCOME10",
  "kind": "multi_product",
  "amountType": "percent",
  "value": 10,
  "maxUsagePerUser": 1,
  "minOrderAmount": 500000,
  "isActive": true,
  "targets": []
}
```

### PATCH /backoffice/discounts/{{discountId}}

**Update Discount**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "isActive": false
}
```

### DELETE /backoffice/discounts/{{discountId}}

**Delete Discount**

- auth: (inherits collection default: Bearer {{accessToken}})

## Comments

### GET /backoffice/comments?status=pending

**List Comments**

- auth: (inherits collection default: Bearer {{accessToken}})
- query:
  - `status=pending`

### PATCH /backoffice/comments/{{commentId}}

**Moderate Comment**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "status": "approved"
}
```

## Tickets

### GET /backoffice/tickets?skip=0&take=20

**List Tickets**

- auth: (inherits collection default: Bearer {{accessToken}})
- query:
  - `skip=0`
  - `take=20`

### GET /backoffice/tickets/{{ticketId}}

**Ticket Detail**

- auth: (inherits collection default: Bearer {{accessToken}})

### POST /backoffice/tickets/{{ticketId}}/messages

**Reply Ticket**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "body": "سلام، گارانتی ۱۸ ماهه است."
}
```

### PATCH /backoffice/tickets/{{ticketId}}/status

**Set Ticket Status**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "status": "closed"
}
```

## Warranties

### GET /backoffice/warranties?orderId={{orderId}}

**List Order Warranties**

- auth: (inherits collection default: Bearer {{accessToken}})
- query:
  - `orderId={{orderId}}`

### POST /backoffice/warranties

**Issue Warranty**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "orderId": "{{orderId}}",
  "orderItemId": "{{orderItemId}}",
  "serialNumber": "SN-0001",
  "startsAt": "2026-01-01",
  "endsAt": "2027-01-01"
}
```

## Repairs

### GET /backoffice/repairs?skip=0&take=20

**List Repair Requests**

- auth: (inherits collection default: Bearer {{accessToken}})
- query:
  - `skip=0`
  - `take=20`

### PATCH /backoffice/repairs/{{repairId}}/status

**Set Repair Status**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "status": "in_progress"
}
```

## Content

### GET /backoffice/content/articles?skip=0&take=20

**List Articles**

- auth: (inherits collection default: Bearer {{accessToken}})
- query:
  - `skip=0`
  - `take=20`

### GET /backoffice/content/articles/{{articleId}}

**Get Article**

- auth: (inherits collection default: Bearer {{accessToken}})

### POST /backoffice/content/articles

**Create Article**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "title": "راهنمای انتخاب دریل",
  "slug": "drill-guide",
  "excerpt": "چطور دریل مناسب بخریم",
  "body": "<p>متن کامل مقاله</p>",
  "publishedAt": "2026-09-01"
}
```

### PATCH /backoffice/content/articles/{{articleId}}

**Update Article**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "excerpt": "نسخه ویرایش‌شده"
}
```

### DELETE /backoffice/content/articles/{{articleId}}

**Delete Article**

- auth: (inherits collection default: Bearer {{accessToken}})

### GET /backoffice/content/branches

**List Branches**

- auth: (inherits collection default: Bearer {{accessToken}})

### POST /backoffice/content/branches

**Create Branch**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "title": "شعبه مرکزی",
  "address": "تهران، خیابان جمهوری",
  "phone": "02133445566",
  "workingHours": "۹ تا ۱۸",
  "isWholesalePoint": true
}
```

### PATCH /backoffice/content/branches/{{branchId}}

**Update Branch**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "phone": "02133445599"
}
```

### DELETE /backoffice/content/branches/{{branchId}}

**Delete Branch**

- auth: (inherits collection default: Bearer {{accessToken}})

### GET /backoffice/content/seo?entityType=product&entityId={{productId}}

**Get SEO Meta**

- auth: (inherits collection default: Bearer {{accessToken}})
- query:
  - `entityType=product`
  - `entityId={{productId}}`

### POST /backoffice/content/seo

**Upsert SEO Meta**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "entityType": "product",
  "entityId": "{{productId}}",
  "metaTitle": "عنوان سئو",
  "metaDescription": "توضیح متا",
  "ogImage": null,
  "canonicalUrl": null
}
```

## Settings

### GET /backoffice/settings

**List Settings**

- auth: (inherits collection default: Bearer {{accessToken}})

### PUT /backoffice/settings

**Put Settings**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "entries": [
    {
      "key": "site_title",
      "value": "فروشگاه ابزار تکنورکس"
    },
    {
      "key": "public_support_phone",
      "value": "02100000000"
    }
  ]
}
```

## Bundles

### GET /backoffice/bundles

**List Bundles**

- auth: (inherits collection default: Bearer {{accessToken}})

### GET /backoffice/bundles/{{bundleId}}

**Bundle Detail**

- auth: (inherits collection default: Bearer {{accessToken}})

### POST /backoffice/bundles

**Create Bundle**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "title": "پکیج دریل + مته",
  "slug": "drill-bit-pack",
  "bundlePrice": 3500000,
  "isActive": true,
  "items": [
    {
      "variantId": "{{variantId}}",
      "qty": 1
    }
  ]
}
```

### PATCH /backoffice/bundles/{{bundleId}}

**Update Bundle**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "bundlePrice": 3300000
}
```

### DELETE /backoffice/bundles/{{bundleId}}

**Delete Bundle**

- auth: (inherits collection default: Bearer {{accessToken}})

## Loyalty

### GET /backoffice/loyalty/{{userId}}?skip=0&take=20

**User Loyalty Summary**

- auth: (inherits collection default: Bearer {{accessToken}})
- query:
  - `skip=0`
  - `take=20`

### POST /backoffice/loyalty/{{userId}}/adjust

**Adjust User Points**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "points": 1000,
  "note": "جبران خطای سیستمی"
}
```

## Reports

### GET /backoffice/reports/sales?from=2026-08-01&to=2026-09-09

**Sales Report**

- auth: (inherits collection default: Bearer {{accessToken}})
- query:
  - `from=2026-08-01`
  - `to=2026-09-09`

### GET /backoffice/reports/inventory?threshold=5

**Inventory Report**

- auth: (inherits collection default: Bearer {{accessToken}})
- query:
  - `threshold=5`

### GET /backoffice/reports/admin-logs?skip=0&take=50

**Admin Action Logs**

- auth: (inherits collection default: Bearer {{accessToken}})
- query:
  - `skip=0`
  - `take=50`

## Media

### POST /backoffice/media/upload

**Upload File**

- auth: (inherits collection default: Bearer {{accessToken}})

### GET /backoffice/media?ownerType=PRODUCT&ownerId={{productId}}

**List Media by Owner**

- auth: (inherits collection default: Bearer {{accessToken}})
- query:
  - `ownerType=PRODUCT`
  - `ownerId={{productId}}`

### PATCH /backoffice/media/{{mediaId}}

**Update Media**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "alt": "نمای جانبی",
  "isMain": true,
  "sortOrder": 1,
  "purpose": "GALLERY"
}
```

### DELETE /backoffice/media/{{mediaId}}

**Delete Media**

- auth: (inherits collection default: Bearer {{accessToken}})
