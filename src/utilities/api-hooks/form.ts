import type { ButtonProps, FormInstance } from '@/components';

/**
 * Creates save button props with form submit binding.
 */
export const createSaveButtonProps = (
    saveButtonProps: ButtonProps | undefined,
    form: FormInstance | undefined,
): ButtonProps & { onClick: () => void } => ({
    ...saveButtonProps,
    onClick: () => {
        form?.submit();
    },
});

/**
 * Creates form finish handler wrapping custom and original onFinish.
 */
export const createFormFinishHandler = <TVariables = Record<string, unknown>>(
    originalOnFinish?: (values: TVariables | FormData) => Promise<unknown> | unknown,
    customOnFinish?: (
        values: TVariables,
    ) => Promise<TVariables | FormData | void> | TVariables | FormData | void,
) => {
    return async (values: TVariables) => {
        if (customOnFinish) {
            const result = await customOnFinish(values);
            if (result) return originalOnFinish?.(result as TVariables | FormData);
        } else {
            return originalOnFinish?.(values);
        }
    };
};
