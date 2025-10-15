export interface Option {
    label: string;
    value?: string;
    key?: string;
}

export interface PaginationRequest {
    page?: number;
    limit?: number;
    filter?: string;
    sortBy?: string[];
}
