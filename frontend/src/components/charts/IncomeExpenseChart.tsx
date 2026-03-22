import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Props {
  data: { month: string; income: number; expenses: number; savings?: number }[];
}

export function IncomeExpenseChart({ data }: Props) {
  // Use a simple formatter for YAxis that handles thousands correctly without assuming 'k'
  const yAxisFormatter = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
    return `₹${value}`;
  };

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(220 9% 46%)" tickMargin={10} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12 }} stroke="hsl(220 9% 46%)" tickFormatter={yAxisFormatter} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "1px solid hsl(220 13% 91%)", fontSize: 13, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
          formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, undefined]}
        />
        <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} iconType="circle" />
        <Line type="monotone" dataKey="income" stroke="hsl(142 71% 45%)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Income" />
        <Line type="monotone" dataKey="expenses" stroke="hsl(0 84% 60%)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Expenses" />
        {data.some(d => d.savings !== undefined) && (
          <Line type="monotone" dataKey="savings" stroke="hsl(217 91% 60%)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Savings" />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
