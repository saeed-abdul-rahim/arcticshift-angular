export type CatalogType = 'category' | 'collection' | 'product' | 'variant';

export type Metadata = {
    type: CatalogType
    id: string
};
