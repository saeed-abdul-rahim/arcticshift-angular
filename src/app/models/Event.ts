import { CatalogType } from './Metadata';

export type AddCatalogEvent = {
    type: CatalogType
    ids: string[]
};

export type RemoveCatalogEvent = {
    type: CatalogType
    id: string
};
