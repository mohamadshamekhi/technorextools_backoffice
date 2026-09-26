import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { LinkButton } from "@/components/ui/link-button";
import { DeleteButton } from "@/components/ui/delete-button";
import { productsApi, sparePartsApi, mediaApi, inventoryApi, categoriesApi, guardedResource } from "@/lib/api";
import { formatToman } from "@/lib/format";
import { ProductForm } from "../product-form";
import { ProductGallery } from "../product-gallery";
import { ProductVariants } from "../product-variants";
import { ProductSpecs } from "../product-specs";
import { ProductFiles } from "../product-files";
import { ProductParts } from "../product-parts";
import { ProductHighlights } from "../product-highlights";
import { ProductHotspots } from "../product-hotspots";
import { ProductDocuments } from "../product-documents";
import { loadProductRefs } from "../product-refs";
import { deleteProductAction } from "../actions";
import type { BackofficeProduct, ProductVariant } from "@/lib/api/backoffice/products";
import type { MediaView } from "@/lib/api/backoffice/media";

export const metadata: Metadata = { title: "ویرایش محصول" };

/** `GET /backoffice/products/{id}` گالری را در `images[]` برمی‌گرداند؛ اگر نبود، از دامنه‌ی رسانه می‌خوانیم */
async function resolveImages(product: BackofficeProduct, productId: string): Promise<MediaView[]> {
  if (product.images) return product.images;
  return mediaApi.listByOwner("PRODUCT", productId).catch(() => []);
}

/** همین قاعده برای `variants[]` — در نبودش از inventoryApi (که فیلدهای یکسانی دارد) می‌خوانیم */
async function resolveVariants(product: BackofficeProduct, productId: string): Promise<ProductVariant[]> {
  if (product.variants) return product.variants;
  const page = await inventoryApi.list({ productId, take: 100 }).catch(() => null);
  return page?.items ?? [];
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;

  const [product, refs] = await Promise.all([
    guardedResource(productsApi.get(productId)),
    loadProductRefs(),
  ]);

  const [
    images,
    variantsInitial,
    attributeGroups,
    allMedia,
    allSpareParts,
    documents,
  ] = await Promise.all([
    resolveImages(product, productId),
    resolveVariants(product, productId),
    product.category
      ? categoriesApi.listAttributeGroups(product.category.id).catch(() => [])
      : Promise.resolve([]),
    mediaApi.listByOwner("PRODUCT", productId).catch(() => []),
    sparePartsApi.list({ take: 100 }).catch(() => []),
    // اگر پاسخ جزئیات محصول اسناد را نداشت، از endpoint اختصاصی می‌خوانیم
    product.documents ?? productsApi.listDocuments(productId).catch(() => []),
  ]);
  const catalogFile = allMedia.find((m) => m.purpose === "DATASHEET") ?? null;
  const modelFile = allMedia.find((m) => m.purpose === "MODEL_3D") ?? null;
  const explodedViewFile = allMedia.find((m) => m.purpose === "EXPLODED_VIEW") ?? null;

  return (
    <>
      <PageHeader
        title={product.title}
        description={`قیمت پایه: ${formatToman(product.basePrice)}`}
        actions={
          <LinkButton href="/products" variant="ghost">
            <ArrowRight className="size-4" />
            بازگشت به لیست
          </LinkButton>
        }
      />

      <Card>
        <Tabs
          tabs={[
            {
              id: "basic",
              label: "اطلاعات پایه",
              content: (
                <ProductForm
                  product={product}
                  brands={refs.brands}
                  categories={refs.categories}
                />
              ),
            },
            {
              id: "images",
              label: "تصاویر",
              content: <ProductGallery productId={productId} initial={images} />,
            },
            {
              id: "variants",
              label: "واریانت‌ها",
              content: (
                <ProductVariants
                  productId={productId}
                  basePrice={product.basePrice}
                  initial={variantsInitial}
                />
              ),
            },
            {
              id: "specs",
              label: "مشخصات فنی",
              content: (
                <ProductSpecs
                  productId={productId}
                  groups={attributeGroups}
                  initialValues={product.attributeValues ?? []}
                />
              ),
            },
            {
              id: "files",
              label: "فایل‌ها",
              content: (
                <ProductFiles
                  productId={productId}
                  initialCatalog={catalogFile}
                  initialModel={modelFile}
                  initialExplodedView={explodedViewFile}
                />
              ),
            },
            {
              id: "parts",
              label: "قطعات نقشه انفجاری",
              content: (
                <ProductParts
                  productId={productId}
                  initialParts={product.parts ?? []}
                  explodedViewUrl={explodedViewFile?.url ?? null}
                  catalog={allSpareParts}
                />
              ),
            },
            {
              id: "highlights",
              label: "مشخصات شاخص",
              content: (
                <ProductHighlights
                  productId={productId}
                  initialHighlights={product.highlights ?? []}
                />
              ),
            },
            // {
            //   id: "model3d-hotspots",
            //   label: "نقاط مدل سه‌بعدی",
            //   content: (
            //     <ProductHotspots
            //       productId={productId}
            //       initialHotspots={product.model3dHotspots ?? []}
            //       model3dUrl={modelFile?.url ?? product.model3dUrl ?? null}
            //     />
            //   ),
            // },
            {
              id: "documents",
              label: "مدارک",
              content: (
                <ProductDocuments productId={productId} initialDocuments={documents} />
              ),
            },
          ]}
        />
      </Card>

      <div className="mt-6">
        <DeleteButton
          action={deleteProductAction.bind(null, product.id)}
          redirectTo="/products"
          confirmLabel="حذف این محصول قطعی است. مطمئن هستید؟"
        >
          حذف محصول
        </DeleteButton>
      </div>
    </>
  );
}
