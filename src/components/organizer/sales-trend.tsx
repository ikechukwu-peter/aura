"use client";

import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

export function SalesTrend({ data }: { data: { date: string; sales: number }[] }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--aura-primary)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--aura-primary)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
          <XAxis 
            dataKey="date" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: 'currentColor', opacity: 0.5 }}
          />
          <YAxis 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: 'currentColor', opacity: 0.5 }}
          />
          <Tooltip 
            cursor={{ stroke: 'var(--aura-primary)', strokeWidth: 2 }}
            contentStyle={{ 
              backgroundColor: 'hsl(var(--background))', 
              borderColor: 'hsl(var(--border))',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="sales" 
            stroke="var(--aura-primary)" 
            fillOpacity={1} 
            fill="url(#colorSales)" 
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
