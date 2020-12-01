export type CatalogType = 'category' | 'collection' | 'product' | 'variant';

export type Metadata = {
    type: CatalogType | 'settings'
    id: string
};

export interface DataGroup {
    name: string;
    urls: string[];
    version?: number;
    cacheConfig: {
        maxSize: number;
        maxAge: string;
        timeout?: string;
        strategy?: 'freshness' | 'performance';
    };
}
