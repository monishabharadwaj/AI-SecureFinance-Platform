import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { BarChart3 } from "lucide-react";

interface CategoryDataEntry {
  name: string;
  amount?: number;
  value?: number;
  percentage?: number;
  color?: string;
  trend?: "up" | "down" | "stable";
}

interface Props {
  data: CategoryDataEntry[];
}

const DEFAULT_COLORS = [
  "hsl(217, 91%, 60%)",
  "hsl(142, 71%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(262, 83%, 58%)",
  "hsl(0, 84%, 60%)",
];

function formatINR(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
  return `₹${value}`;
}

export function CategoryBarChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BarChart3 className="h-10 w-10 text-muted-foreground mb-3 opacity-30" />
        <p className="text-sm font-medium text-muted-foreground">No spending data</p>
      </div>
    );
  }

  const chartData = data
    .map((d, index) => ({
      name: d.name,
      value: d.value ?? d.amount ?? 0,
      color: d.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]
    }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 7); // Top 7 for cleanly sized bars

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} layout="vertical">
        <XAxis type="number" hide />
        <YAxis 
          dataKey="name" 
          type="category" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
          width={90}
        />
        <Tooltip
          cursor={{ fill: "transparent" }}
          contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", fontSize: 13 }}
          formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Spent"]}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
