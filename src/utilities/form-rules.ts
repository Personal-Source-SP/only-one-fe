import type { Rule, RuleObject } from '@/components/custom';

export enum FormRuleType {
    Max = 'max',
    Min = 'min',
    Email = 'email',
    Required = 'required',
    RequiredNumber = 'required_number',
    Custom = 'custom',
}

export type BuildFormRulesRequest = {
    rules: FormRuleConfig[];
};

export type BuildFormRulesResponse = Rule[];

export type FormRuleConfig =
    | FormEmailRuleConfig
    | FormMaxRuleConfig
    | FormMinRuleConfig
    | FormRequiredRuleConfig
    | FormRequiredNumberRuleConfig
    | FormCustomRuleConfig;

export type FormEmailRuleConfig = {
    type: FormRuleType.Email;
    message: string;
};

export type FormMaxRuleConfig = {
    max: number;
    type: FormRuleType.Max;
    message?: string;
    valueType?: 'string' | 'number';
};

export type FormMinRuleConfig = {
    min: number;
    type: FormRuleType.Min;
    message?: string;
    valueType?: 'string' | 'number';
};

export type FormRequiredRuleConfig = {
    type: FormRuleType.Required;
    message: string;
    whitespace?: boolean;
};

export type FormRequiredNumberRuleConfig = {
    type: FormRuleType.RequiredNumber;
    message: string;
};

/** Escape hatch for arbitrary antd validators (async or sync). */
export type FormCustomRuleConfig = {
    type: FormRuleType.Custom;
    validator: RuleObject['validator'];
};

export const buildFormRules = ({ rules }: BuildFormRulesRequest): BuildFormRulesResponse => {
    if (!rules?.length) return [];

    return rules.map((rule) => {
        switch (rule.type) {
            case FormRuleType.Email: {
                return {
                    message: rule.message,
                    type: 'email',
                };
            }

            case FormRuleType.Max: {
                return {
                    type: rule.valueType,
                    max: rule.max,
                    message: rule.message,
                };
            }

            case FormRuleType.Min: {
                return {
                    type: rule.valueType,
                    min: rule.min,
                    message: rule.message,
                };
            }

            case FormRuleType.Required: {
                return {
                    required: true,
                    message: rule.message,
                    whitespace: rule.whitespace,
                };
            }

            case FormRuleType.RequiredNumber: {
                return {
                    required: true,
                    validator: (_, value) => {
                        if (value === undefined || value === null || value === '') {
                            return Promise.reject(new Error(rule.message));
                        }

                        if (typeof value === 'number' && isNaN(value)) {
                            return Promise.reject(new Error(rule.message));
                        }

                        return Promise.resolve();
                    },
                };
            }

            case FormRuleType.Custom: {
                return {
                    validator: rule.validator,
                };
            }
        }
    });
};
