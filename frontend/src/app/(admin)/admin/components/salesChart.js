"use client";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { formatPrice } from "@/app/(main)/utils/formatPrice";

// Pass chartData as a reactive prop from your master parent dashboard layout container
export default function SalesChart({ chartData = [] }) {
  // Clean fallback in case the store database has zero orders in the week interval
  const defaultEmptyFallback = [
    { name: "Mon", sales: 0 },
    { name: "Tue", sales: 0 },
    { name: "Wed", sales: 0 },
    { name: "Thu", sales: 0 },
    { name: "Fri", sales: 0 },
    { name: "Sat", sales: 0 },
    { name: "Sun", sales: 0 },
  ];

  const activeData = chartData.length > 0 ? chartData : defaultEmptyFallback;

  return (
    <div className="h-75 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={activeData}>
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1f1f1f" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#1f1f1f" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e6e6e6"
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6b6b6b", fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6b6b6b", fontSize: 12 }}
            // Format the Y-Axis tick markers clean into currency metrics (e.g. 50k instead of 50000)
            tickFormatter={(value) =>
              value >= 1000 ? `₦${(value / 1000).toFixed(0)}k` : `₦${value}`
            }
          />
          <Tooltip
            formatter={(value) => [formatPrice(value), "Gross Revenue"]}
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
              fontFamily: "inherit",
              fontSize: "12px",
            }}
          />
          <Area
            type="monotone"
            dataKey="sales"
            stroke="#1f1f1f"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorSales)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
