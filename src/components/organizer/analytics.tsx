"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export function OrganizerAnalytics({ data }: { data: any[] }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
          <XAxis 
            dataKey="name" 
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
            cursor={{ fill: 'currentColor', opacity: 0.05 }}
            contentStyle={{ 
              backgroundColor: 'hsl(var(--background))', 
              borderColor: 'hsl(var(--border))',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          />
          <Bar dataKey="sold" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={index % 2 === 0 ? "var(--aura-primary)" : "var(--aura-secondary)"} 
                fillOpacity={0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
