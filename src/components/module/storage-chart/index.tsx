import { FC, memo } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type StorageChartProps = {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
  total: string;
};

const StorageChart: FC<StorageChartProps> = ({ data, total }) => {
  return (
    <div className="w-full h-64 relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [
              `${value.toFixed(1)} GB`,
              "Dung lượng",
            ]}
            contentStyle={{
              backgroundColor: "white",
              borderRadius: "8px",
              border: "1px solid #DADCE0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          />
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            formatter={(value) => {
              const item = data.find((d) => d.name === value);
              return (
                <span className="text-sm">
                  {value} ({item?.value.toFixed(1)} GB)
                </span>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <p className="text-sm text-foreground-500">Tổng</p>
        <p className="text-xl font-medium">{total}</p>
      </div>
    </div>
  );
};

export default memo(StorageChart);
