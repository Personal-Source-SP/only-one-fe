import { Alert } from 'antd';
import { FC } from 'react';

type CustomAlertProps = {
  title: string;
  description: string;
};

const CustomAlert: FC<CustomAlertProps> = ({ title, description }) => {
  return (
    <section className="mt-2 mb-4">
      <Alert showIcon type="info" message={title} description={description} className="flex !items-center !py-3" />
    </section>
  );
};

export default CustomAlert;
