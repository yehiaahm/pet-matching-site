/**
 * Daily Activity Chart
 * Multi-line chart showing daily platform activity
 */

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '../ui/card';
import type { DailyActivityData } from '../../types/analytics';

interface DailyActivityChartProps {
  data: DailyActivityData[];
  height?: number;
}

export function DailyActivityChart({
  data,
  height = 400,
}: DailyActivityChartProps) {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Daily Platform Activity
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          New users, pets, and activity metrics over the past 30 days
        </p>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
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
          <Line
            type="monotone"
            dataKey="newUsers"
            stroke="#3b82f6"
            strokeWidth={2}
            name="New Users"
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="newPets"
            stroke="#10b981"
            strokeWidth={2}
            name="New Pets"
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="activeUsers"
            stroke="#f59e0b"
            strokeWidth={2}
            name="Active Users"
            dot={{ fill: '#f59e0b', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="matchRequests"
            stroke="#8b5cf6"
            strokeWidth={2}
            name="Match Requests"
            dot={{ fill: '#8b5cf6', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="completedMatches"
            stroke="#ec4899"
            strokeWidth={2}
            name="Completed Matches"
            dot={{ fill: '#ec4899', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
