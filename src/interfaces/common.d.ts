export interface Option {
    key: string;
    label: string;
    value?: string;
}

export interface PaginationRequest {
    page?: number;
    limit?: number;
    filter?: string;
    sortBy?: string[];
}
