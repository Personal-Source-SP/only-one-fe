export declare namespace NImportData {
    interface IPreviewImportDataResponse {
        statistics?: {
            errors: number;
            updates: number;
            overridden: number;
        };
        data: Record<string, any>[];
    }

    interface IImportDataResponse {
        success: boolean;
        message: string;
        updated: number;
        validationErrorMessages?: string[];
    }
}
