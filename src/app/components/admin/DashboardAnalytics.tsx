import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, MessageSquare, Heart, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export function DashboardAnalytics() {
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivityData();
  }, []);

  const fetchActivityData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/admin/dashboard/activity');
      const data = await response.json();

      if (data.success) {
        setActivityData(data.data);
      }
    } catch (error) {
      console.error('Error fetching activity data:', error);
      toast.error('Failed to load activity data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4" />
              New Users (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {activityData.reduce((sum, day) => sum + day.users, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Heart className="w-4 h-4" />
              New Pets (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {activityData.reduce((sum, day) => sum + day.pets, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Messages (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {activityData.reduce((sum, day) => sum + day.messages, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Peak Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {activityData.length > 0
                ? activityData.reduce((max, day) => 
                    (day.users + day.pets + day.messages > 
                     max.users + max.pets + max.messages) ? day : max
                  )?.date
                : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Trends */}
      <Card>
        <CardHeader>
          <CardTitle>User & Pet Registration Trends (7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#3b82f6"
                name="New Users"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="pets"
                stroke="#10b981"
                name="New Pets"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Activity Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Activity Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="users" fill="#3b82f6" name="User Registrations" />
              <Bar dataKey="pets" fill="#10b981" name="Pet Registrations" />
              <Bar dataKey="messages" fill="#f59e0b" name="Messages" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Daily Statistics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Activity Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left text-sm font-medium">Date</th>
                  <th className="px-4 py-2 text-right text-sm font-medium">Users</th>
                  <th className="px-4 py-2 text-right text-sm font-medium">Pets</th>
                  <th className="px-4 py-2 text-right text-sm font-medium">Messages</th>
                  <th className="px-4 py-2 text-right text-sm font-medium">Total Activity</th>
                </tr>
              </thead>
              <tbody>
                {activityData.map((day) => (
                  <tr key={day.date} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">{day.date}</td>
                    <td className="px-4 py-2 text-right font-semibold">
                      {day.users}
                    </td>
                    <td className="px-4 py-2 text-right font-semibold">
                      {day.pets}
                    </td>
                    <td className="px-4 py-2 text-right font-semibold">
                      {day.messages}
                    </td>
                    <td className="px-4 py-2 text-right font-semibold text-blue-600">
                      {day.users + day.pets + day.messages}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardAnalytics;
