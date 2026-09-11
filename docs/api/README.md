# API reference (generated)

منبع: `../api/postman/abzar-api.postman_collection.json` — **این فایل‌ها را دستی ویرایش نکنید.**

بازتولید:

```bash
node scripts/gen-api-docs.mjs
```

تعداد endpointها: 144

> ۶ endpoint («تأیید دریافت وجه نقد» + ۵ مورد «روش‌های پرداخت» در `backoffice.md`) هنوز در
> Postman collection نیستند و **دستی** اضافه شده‌اند. با اجرای بعدی `gen:api`، اگر این
> endpointها به collection اضافه نشده باشند حذف می‌شوند — قبل از ری‌ژنریت، collection را
> با آن‌ها هماهنگ کنید یا این یادداشت و بخش‌هایشان را دستی نگه دارید.

## Base URLs

- `baseUrl` = `http://localhost:4000`
- `apiBase` = `http://localhost:4000/api/v1` (همه‌ی مسیرها در INDEX نسبت به این‌اند)

## متغیرهای محیطی Postman

- `{{baseUrl}}` = `http://localhost:4000`
- `{{apiBase}}` = `http://localhost:4000/api/v1`
- `{{mobile}}` = `09120000000`
- `{{otpCode}}`
- `{{serviceToken}}`
- `{{accessToken}}`
- `{{refreshToken}}`
- `{{userId}}`
- `{{roleId}}`
- `{{customerRoleId}}`
- `{{categoryId}}`
- `{{attributeGroupId}}`
- `{{attributeId}}`
- `{{brandId}}`
- `{{productId}}`
- `{{variantId}}`
- `{{inventoryVariantId}}`
- `{{productSlug}}`
- `{{cartToken}}`
- `{{cartItemId}}`
- `{{cartVariantId}}`
- `{{bundleSlug}}`
- `{{articleSlug}}`
- `{{branchId}}`
- `{{warrantySerial}}`
- `{{addressId}}`
- `{{orderNumber}}`
- `{{orderId}}`
- `{{orderItemId}}`
- `{{discountId}}`
- `{{discountCode}}`
- `{{ticketId}}`
- `{{repairId}}`
- `{{commentId}}`
- `{{articleId}}`
- `{{shippingMethodId}}`
- `{{bundleId}}`
- `{{mediaId}}`
