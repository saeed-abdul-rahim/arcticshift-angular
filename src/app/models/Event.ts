
export type CatalogType = 'category' | 'collection' | 'product';

export type AddCatalogEvent = {
    type: CatalogType
    ids: string[]
};

export type RemoveCatalogEvent = {
    type: CatalogType
    id: string
};
