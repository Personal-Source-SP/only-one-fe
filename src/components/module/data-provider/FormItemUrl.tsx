import { FormInstance, Input } from 'antd';
import { isNumber } from 'lodash';
import { Option } from '../../../interfaces';
import { CustomSelect } from '../../custom';

const FormItemUrl = ({
    field,
    form,
    dataProviderItemOptions,
    index,
}: {
    field: string;
    form: FormInstance<any>;
    dataProviderItemOptions: Option[];
    index?: number;
}) => {
    if (!dataProviderItemOptions?.length) {
        return <Input disabled={false} placeholder="URL" />;
    }

    return (
        <CustomSelect
            showSearch
            disabled={false}
            options={dataProviderItemOptions}
            onInputChange={(value) => {
                if (isNumber(index)) {
                    form?.setFieldValue(
                        [field as 'dataProviderItems' | 'additionalUrls', index],
                        value,
                    );
                } else {
                    form?.setFieldValue(
                        [field as 'dataProviderItems' | 'additionalUrls' | 'url'],
                        value,
                    );
                }
            }}
        />
    );
};

export default FormItemUrl;
