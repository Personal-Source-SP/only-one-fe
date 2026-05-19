import { Alert } from 'antd';

type CustomAlertProps = {
    title: string;
    description: string;
};

const CustomAlert = ({ title, description }: CustomAlertProps) => {
    return (
        <section className="mt-2 mb-4">
            <Alert
                showIcon
                type="info"
                message={title}
                description={description}
                className="flex !items-center !py-3"
            />
        </section>
    );
};

export default CustomAlert;
