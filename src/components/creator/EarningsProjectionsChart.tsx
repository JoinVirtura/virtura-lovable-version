import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, ComposedChart } from 'recharts';
import { TrendingUp, Calendar, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface EarningsProjectionsChartProps {
  timeSeriesData: Array<{ date: string; total: number }>;
  dailyAverage: number;
}

export function EarningsProjectionsChart({ timeSeriesData, dailyAverage }: EarningsProjectionsChartProps) {
  // Calculate projections for 30, 60, 90 days
  const generateProjections = (days: number) => {
    const today = new Date();
    const projectionData = [];
    
    // Add historical data (last 14 days)
    const historicalStart = Math.max(0, timeSeriesData.length - 14);
    for (let i = historicalStart; i < timeSeriesData.length; i++) {
      projectionData.push({
        date: timeSeriesData[i].date,
        actual: timeSeriesData[i].total,
        projected: null,
        optimistic: null,
        pessimistic: null,
      });
    }
    
    // Calculate trend (simple linear regression on last 7 days)
    const recentData = timeSeriesData.slice(-7);
    let growthRate = 0;
    if (recentData.length >= 2) {
      const firstWeekAvg = recentData.slice(0, 3).reduce((s, d) => s + d.total, 0) / 3;
      const lastWeekAvg = recentData.slice(-3).reduce((s, d) => s + d.total, 0) / 3;
      growthRate = firstWeekAvg > 0 ? (lastWeekAvg - firstWeekAvg) / firstWeekAvg : 0;
    }
    
    // Generate future projections
    let cumulativeBase = 0;
    for (let i = 1; i <= days; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i);
      
      const baseProjection = dailyAverage * (1 + (growthRate * i / 30));
      const optimisticProjection = baseProjection * 1.3; // 30% higher
      const pessimisticProjection = baseProjection * 0.7; // 30% lower
      
      cumulativeBase += baseProjection;
      
      projectionData.push({
        date: futureDate.toISOString().split('T')[0],
        actual: null,
        projected: Math.round(baseProjection * 100) / 100,
        optimistic: Math.round(optimisticProjection * 100) / 100,
        pessimistic: Math.round(pessimisticProjection * 100) / 100,
      });
    }
    
    return {
      data: projectionData,
      totalProjected: Math.round(cumulativeBase * 100) / 100,
      optimisticTotal: Math.round(cumulativeBase * 1.3 * 100) / 100,
      pessimisticTotal: Math.round(cumulativeBase * 0.7 * 100) / 100,
    };
  };
  
  const projection30 = generateProjections(30);
  const projection60 = generateProjections(60);
  const projection90 = generateProjections(90);
  
  const ProjectionChart = ({ data, totalProjected, optimisticTotal, pessimisticTotal, days }: any) => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <motion.div 
          className="p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20"
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-sm text-muted-foreground">Pessimistic</p>
          <p className="text-xl font-bold text-red-400">${pessimisticTotal.toLocaleString()}</p>
        </motion.div>
        <motion.div 
          className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-violet-500/10 border border-primary/20"
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-sm text-muted-foreground">Expected</p>
          <p className="text-xl font-bold text-primary">${totalProjected.toLocaleString()}</p>
        </motion.div>
        <motion.div 
          className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20"
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-sm text-muted-foreground">Optimistic</p>
          <p className="text-xl font-bold text-green-400">${optimisticTotal.toLocaleString()}</p>
        </motion.div>
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="projectionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => {
                if (value === null) return ['-', name];
                return [`$${value.toFixed(2)}`, name.charAt(0).toUpperCase() + name.slice(1)];
              }}
            />
            <ReferenceLine 
              x={new Date().toISOString().split('T')[0]} 
              stroke="hsl(var(--primary))" 
              strokeDasharray="5 5"
              label={{ value: 'Today', position: 'top', fill: 'hsl(var(--primary))' }}
            />
            <Area
              type="monotone"
              dataKey="optimistic"
              stroke="transparent"
              fill="hsl(142.1 76.2% 36.3% / 0.1)"
            />
            <Area
              type="monotone"
              dataKey="pessimistic"
              stroke="transparent"
              fill="hsl(0 84.2% 60.2% / 0.1)"
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', r: 3 }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="projected"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="optimistic"
              stroke="hsl(142.1 76.2% 36.3%)"
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="pessimistic"
              stroke="hsl(0 84.2% 60.2%)"
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-primary" />
          <span className="text-muted-foreground">Actual</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-primary border-dashed" style={{ borderTop: '2px dashed hsl(var(--primary))' }} />
          <span className="text-muted-foreground">Projected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-green-500" />
          <span className="text-muted-foreground">Optimistic</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-red-500" />
          <span className="text-muted-foreground">Pessimistic</span>
        </div>
      </div>
    </div>
  );
  
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-violet-500/20">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Revenue Projections</CardTitle>
              <CardDescription>Predicted earnings based on current trends</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {dailyAverage === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Target className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Not enough data for projections</p>
            <p className="text-sm text-muted-foreground/70">Start earning to see your revenue projections</p>
          </div>
        ) : (
          <Tabs defaultValue="30" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="30" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                30 Days
              </TabsTrigger>
              <TabsTrigger value="60" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                60 Days
              </TabsTrigger>
              <TabsTrigger value="90" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                90 Days
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="30">
              <ProjectionChart {...projection30} days={30} />
            </TabsContent>
            <TabsContent value="60">
              <ProjectionChart {...projection60} days={60} />
            </TabsContent>
            <TabsContent value="90">
              <ProjectionChart {...projection90} days={90} />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}