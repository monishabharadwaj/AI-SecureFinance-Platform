import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Props {
  data: { month: string; savings: number }[];
}

export function SavingsProgressChart({ data }: Props) {
  const yAxisFormatter = (value: number) => {
    if (Math.abs(value) >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (Math.abs(value) >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (Math.abs(value) >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
    return `₹${value}`;
  };

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" vertical={false} />
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 12 }} 
          stroke="hsl(220 9% 46%)" 
          tickMargin={10} 
          axisLine={false} 
          tickLine={false} 
        />
        <YAxis 
          tick={{ fontSize: 12 }} 
          stroke="hsl(220 9% 46%)" 
          tickFormatter={yAxisFormatter} 
          axisLine={false} 
          tickLine={false} 
        />
        <Tooltip
          cursor={{ fill: "hsl(220 13% 91%)", opacity: 0.4 }}
          contentStyle={{ borderRadius: 12, border: "1px solid hsl(220 13% 91%)", fontSize: 13, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
          formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Net Balance"]}
        />
        <Bar dataKey="savings" radius={[4, 4, 4, 4]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.savings >= 0 ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
