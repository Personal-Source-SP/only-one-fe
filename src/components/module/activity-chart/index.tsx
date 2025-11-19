import { FC } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ActivityChartProps = {
  data: {
    date: string;
    files: number;
    photos: number;
    notes: number;
  }[];
};

const ActivityChart: FC<ActivityChartProps> = ({ data }) => {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E8EAED" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "#E8EAED" }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "#E8EAED" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              borderRadius: "8px",
              border: "1px solid #DADCE0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          />
          <Area
            type="monotone"
            dataKey="files"
            stackId="1"
            stroke="#4285F4"
            fill="#D2E3FC"
            name="Tệp"
          />
          <Area
            type="monotone"
            dataKey="photos"
            stackId="1"
            stroke="#34A853"
            fill="#CEEAD6"
            name="Ảnh"
          />
          <Area
            type="monotone"
            dataKey="notes"
            stackId="1"
            stroke="#FBBC04"
            fill="#FEEFC3"
            name="Ghi chú"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityChart;
