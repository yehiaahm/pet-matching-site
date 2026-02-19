/**
 * Match Requests Chart
 * Line chart showing match requests over time
 */

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Card } from '../ui/card';
import type { MatchRequestsByDay } from '../../types/analytics';

interface MatchRequestsChartProps {
  data: MatchRequestsByDay[];
  height?: number;
}

export function MatchRequestsChart({
  data,
  height = 400,
}: MatchRequestsChartProps) {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Match Requests Over Time
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Daily match requests, completed matches, and pending requests
        </p>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
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
          <Area
            type="monotone"
            dataKey="requests"
            stroke="#3b82f6"
            fillOpacity={1}
            fill="url(#colorRequests)"
            name="Total Requests"
          />
          <Area
            type="monotone"
            dataKey="completed"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#colorCompleted)"
            name="Completed"
          />
          <Area
            type="monotone"
            dataKey="pending"
            stroke="#f59e0b"
            fillOpacity={1}
            fill="url(#colorPending)"
            name="Pending"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
