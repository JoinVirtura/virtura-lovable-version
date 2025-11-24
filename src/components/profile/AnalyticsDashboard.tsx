import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Users, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const revenueData = [
  { month: 'Jan', revenue: 4200, views: 45000 },
  { month: 'Feb', revenue: 5800, views: 62000 },
  { month: 'Mar', revenue: 7200, views: 78000 },
  { month: 'Apr', revenue: 8900, views: 95000 },
  { month: 'May', revenue: 11200, views: 120000 },
  { month: 'Jun', revenue: 14500, views: 152000 },
];

const engagementData = [
  { day: 'Mon', likes: 450, comments: 120, shares: 80 },
  { day: 'Tue', likes: 520, comments: 145, shares: 95 },
  { day: 'Wed', likes: 680, comments: 180, shares: 110 },
  { day: 'Thu', likes: 750, comments: 210, shares: 125 },
  { day: 'Fri', likes: 890, comments: 250, shares: 145 },
  { day: 'Sat', likes: 1100, comments: 320, shares: 180 },
  { day: 'Sun', likes: 980, comments: 280, shares: 160 },
];

export function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <Card className="bg-gradient-to-br from-violet-900/30 to-purple-900/30 backdrop-blur-xl border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            Revenue & Growth
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#8b5cf6" 
                fillOpacity={1} 
                fill="url(#revenueGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Engagement Metrics */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 backdrop-blur-xl border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Weekly Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="day" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="likes" stroke="#ec4899" strokeWidth={2} />
                <Line type="monotone" dataKey="comments" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="shares" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="bg-gradient-to-br from-pink-900/30 to-rose-900/30 backdrop-blur-xl border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-pink-400" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <motion.div 
                className="flex justify-between items-center p-4 rounded-xl bg-card/50"
                whileHover={{ scale: 1.02 }}
              >
                <div>
                  <p className="text-sm text-muted-foreground">Avg. View Duration</p>
                  <p className="text-2xl font-bold text-violet-400">4:32</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </motion.div>
              
              <motion.div 
                className="flex justify-between items-center p-4 rounded-xl bg-card/50"
                whileHover={{ scale: 1.02 }}
              >
                <div>
                  <p className="text-sm text-muted-foreground">Engagement Rate</p>
                  <p className="text-2xl font-bold text-pink-400">12.8%</p>
                </div>
                <Users className="w-8 h-8 text-pink-400" />
              </motion.div>
              
              <motion.div 
                className="flex justify-between items-center p-4 rounded-xl bg-card/50"
                whileHover={{ scale: 1.02 }}
              >
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Growth</p>
                  <p className="text-2xl font-bold text-green-400">+28%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
