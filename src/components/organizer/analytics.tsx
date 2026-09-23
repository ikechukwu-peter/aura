"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function OrganizerAnalytics({ data }: { data: any[] }) {
  return (
    <div className="h-75 w-full">
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
            {data.map((_entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={index % 2 === 0 ? "#D97706" : "#0F766E"} 
                fillOpacity={0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
