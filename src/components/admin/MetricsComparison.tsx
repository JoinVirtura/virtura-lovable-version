import { Card } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

interface MetricComparison {
  metric: string;
  current: number;
  previous: number;
  change: number;
  trend: "up" | "down" | "stable";
}

interface MetricsComparisonProps {
  comparisons: MetricComparison[];
}

export function MetricsComparison({ comparisons }: MetricsComparisonProps) {
  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <ArrowUp className="w-4 h-4 text-success" />;
      case "down":
        return <ArrowDown className="w-4 h-4 text-destructive" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return "text-success";
      case "down":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Historical Comparison</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Compare current metrics with previous period
      </p>
      
      <div className="space-y-4">
        {comparisons.map((comparison, index) => (
          <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">{comparison.metric}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold">{comparison.current}</span>
                <span className="text-sm text-muted-foreground">
                  vs {comparison.previous}
                </span>
              </div>
            </div>
            
            <div className={`flex items-center gap-2 ${getTrendColor(comparison.trend)}`}>
              {getTrendIcon(comparison.trend)}
              <span className="font-semibold">
                {comparison.change > 0 ? "+" : ""}
                {comparison.change.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}