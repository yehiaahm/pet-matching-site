/**
 * Breeds Chart
 * Bar chart showing most requested breeds
 */

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '../ui/card';
import type { BreedStat } from '../../types/analytics';

interface BreedsChartProps {
  data: BreedStat[];
  height?: number;
}

export function BreedsChart({ data, height = 400 }: BreedsChartProps) {
  // Prepare data for chart
  const chartData = data.map((item) => ({
    breed: item.breed,
    'Total Pets': item.count,
    'Total Requests': item.requests,
  }));

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Top 10 Most Requested Breeds
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Number of registered pets and breeding requests by breed
        </p>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="breed"
            angle={-45}
            textAnchor="end"
            height={120}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar dataKey="Total Pets" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          <Bar dataKey="Total Requests" fill="#10b981" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
