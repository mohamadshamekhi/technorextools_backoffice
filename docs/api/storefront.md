# Storefront API

## Catalog

### GET /storefront/catalog/categories

**Category Tree**

- auth: (inherits collection default: Bearer {{accessToken}})

### GET /storefront/catalog/brands

**List Brands**

- auth: (inherits collection default: Bearer {{accessToken}})

### GET /storefront/catalog/products?skip=0&take=20&search&category=pneumatic-tools&brand&minPrice&maxPrice&isAmazingDeal=true&sort=newest&attrs

**List Products**

- auth: (inherits collection default: Bearer {{accessToken}})
- query:
  - `skip=0`
  - `take=20`
  - `category=pneumatic-tools`
  - `isAmazingDeal=true`
  - `sort=newest`

### GET /storefront/catalog/products/{{productSlug}}

**Product Detail**

- auth: (inherits collection default: Bearer {{accessToken}})

### GET /storefront/catalog/products/{{productSlug}}/comments?skip=0&take=10

**Product Comments**

- auth: (inherits collection default: Bearer {{accessToken}})
- query:
  - `skip=0`
  - `take=10`

### GET /storefront/catalog/bundles

**List Bundles**

- auth: (inherits collection default: Bearer {{accessToken}})

### GET /storefront/catalog/bundles/{{bundleSlug}}

**Bundle Detail**

- auth: (inherits collection default: Bearer {{accessToken}})

### POST /storefront/catalog/products/{{productSlug}}/comments

**Post Product Comment**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "rating": 5,
  "body": "کیفیت عالی بود"
}
```

## Cart

### GET /storefront/cart

**Get Cart**

- auth: (inherits collection default: Bearer {{accessToken}})

### POST /storefront/cart/items

**Add Item**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "variantId": "{{cartVariantId}}",
  "qty": 1
}
```

### PATCH /storefront/cart/items/{{cartItemId}}

**Update Item Qty**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "qty": 2
}
```

### DELETE /storefront/cart/items/{{cartItemId}}

**Remove Item**

- auth: (inherits collection default: Bearer {{accessToken}})

### DELETE /storefront/cart

**Clear Cart**

- auth: (inherits collection default: Bearer {{accessToken}})

### POST /storefront/cart/bundles

**Add Bundle To Cart**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "bundleId": "{{bundleId}}",
  "qty": 1
}
```

## Content

### GET /storefront/content/articles?skip=0&take=12

**List Articles**

- auth: (inherits collection default: Bearer {{accessToken}})
- query:
  - `skip=0`
  - `take=12`

### GET /storefront/content/articles/{{articleSlug}}

**Article Detail**

- auth: (inherits collection default: Bearer {{accessToken}})

### GET /storefront/content/branches

**List Branches**

- auth: (inherits collection default: Bearer {{accessToken}})

### GET /storefront/content/branches/{{branchId}}

**Branch Detail**

- auth: (inherits collection default: Bearer {{accessToken}})

### GET /storefront/content/seo?entityType=product&entityId={{productId}}

**SEO Meta**

- auth: (inherits collection default: Bearer {{accessToken}})
- query:
  - `entityType=product`
  - `entityId={{productId}}`

### GET /storefront/content/settings/public

**Public Settings**

- auth: (inherits collection default: Bearer {{accessToken}})

## Shipping

### GET /storefront/shipping/methods

**List Shipping Methods**

- auth: (inherits collection default: Bearer {{accessToken}})

## Warranty

### GET /storefront/warranty/verify?serial={{warrantySerial}}

**Verify Warranty**

- auth: (inherits collection default: Bearer {{accessToken}})
- query:
  - `serial={{warrantySerial}}`

## Addresses

### GET /storefront/addresses

**List Addresses**

- auth: (inherits collection default: Bearer {{accessToken}})

### POST /storefront/addresses

**Create Address**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "receiverName": "علی رضایی",
  "receiverMobile": "09121234567",
  "province": "تهران",
  "city": "تهران",
  "fullAddress": "خیابان آزادی، پلاک ۱",
  "postalCode": "1234567890",
  "isDefault": true
}
```

### PATCH /storefront/addresses/{{addressId}}

**Update Address**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "city": "کرج"
}
```

### DELETE /storefront/addresses/{{addressId}}

**Delete Address**

- auth: (inherits collection default: Bearer {{accessToken}})

## Wishlist

### GET /storefront/wishlist

**List Wishlist**

- auth: (inherits collection default: Bearer {{accessToken}})

### POST /storefront/wishlist

**Add To Wishlist**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "productId": "{{productId}}"
}
```

### DELETE /storefront/wishlist/{{productId}}

**Remove From Wishlist**

- auth: (inherits collection default: Bearer {{accessToken}})

## Checkout

### POST /storefront/checkout/quote

**Checkout Quote**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "shippingMethodId": "{{shippingMethodId}}",
  "discountCode": "{{discountCode}}",
  "redeemPoints": 0
}
```

### POST /storefront/checkout

**Start Checkout**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "addressId": "{{addressId}}",
  "shippingMethodId": "{{shippingMethodId}}",
  "redeemPoints": 0
}
```

### POST /storefront/checkout/{{orderNumber}}/pay

**Retry Payment**

- auth: (inherits collection default: Bearer {{accessToken}})

## Orders

### GET /storefront/orders?skip=0&take=20

**List My Orders**

- auth: (inherits collection default: Bearer {{accessToken}})
- query:
  - `skip=0`
  - `take=20`

### GET /storefront/orders/{{orderNumber}}

**Order Detail**

- auth: (inherits collection default: Bearer {{accessToken}})

## Discounts

### POST /storefront/discounts/validate

**Validate Discount**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "code": "{{discountCode}}"
}
```

## Loyalty

### GET /storefront/loyalty?skip=0&take=20

**Loyalty Summary**

- auth: (inherits collection default: Bearer {{accessToken}})
- query:
  - `skip=0`
  - `take=20`

### GET /storefront/loyalty/referrals

**My Referrals**

- auth: (inherits collection default: Bearer {{accessToken}})

## Tickets

### GET /storefront/tickets?skip=0&take=20

**List Tickets**

- auth: (inherits collection default: Bearer {{accessToken}})
- query:
  - `skip=0`
  - `take=20`

### POST /storefront/tickets

**Create Ticket**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "subject": "سوال درباره گارانتی",
  "body": "سلام، گارانتی این محصول چند ساله است؟"
}
```

### GET /storefront/tickets/{{ticketId}}

**Ticket Detail**

- auth: (inherits collection default: Bearer {{accessToken}})

### POST /storefront/tickets/{{ticketId}}/messages

**Reply Ticket**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "body": "ممنون از پاسخ"
}
```

## Repairs

### GET /storefront/repairs?skip=0&take=20

**List Repair Requests**

- auth: (inherits collection default: Bearer {{accessToken}})
- query:
  - `skip=0`
  - `take=20`

### POST /storefront/repairs

**Create Repair Request**

- auth: (inherits collection default: Bearer {{accessToken}})

```json
{
  "issueDescription": "دستگاه روشن نمی‌شود و صدای غیرعادی دارد",
  "warrantySerial": "{{warrantySerial}}"
}
```

### GET /storefront/repairs/{{repairId}}

**Repair Request Detail**

- auth: (inherits collection default: Bearer {{accessToken}})
