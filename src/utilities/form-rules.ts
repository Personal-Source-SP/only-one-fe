import type { Rule, RuleObject } from '@/components/custom-antd';

export enum FormRuleType {
    Max = 'max',
    Min = 'min',
    Email = 'email',
    Required = 'required',
    RequiredNumber = 'required_number',
    Code = 'code',
    Url = 'url',
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
    | FormCodeRuleConfig
    | FormUrlRuleConfig
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

export type FormCodeRuleConfig = {
    type: FormRuleType.Code;
    message?: string;
};

export type FormUrlRuleConfig = {
    type: FormRuleType.Url;
    message?: string;
    noTrailingSlash?: boolean;
    noWww?: boolean;
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

            case FormRuleType.Code: {
                return {
                    validator: (_, value) => {
                        if (!value) return Promise.resolve();
                        if (!/^[a-z0-9-]+$/.test(value)) {
                            return Promise.reject(
                                new Error(
                                    rule.message ||
                                        'Chỉ được chứa chữ cái thường, số và dấu gạch ngang',
                                ),
                            );
                        }
                        return Promise.resolve();
                    },
                };
            }

            case FormRuleType.Url: {
                return {
                    validator: (_, value) => {
                        if (!value) return Promise.resolve();
                        const noTrailingSlash = rule.noTrailingSlash ?? true;
                        const noWww = rule.noWww ?? true;

                        if (noTrailingSlash && !/^.*[^/]$/.test(value)) {
                            return Promise.reject(
                                new Error(rule.message || 'URL không được kết thúc bằng /'),
                            );
                        }
                        if (noWww && !/^(?!.*www\.).*$/.test(value)) {
                            return Promise.reject(
                                new Error(rule.message || 'URL không được chứa www'),
                            );
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
