import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  trend: "up" | "down";
}

const MetricCard = ({ title, value, change, icon: Icon, trend }: MetricCardProps) => {
  return (
    <Card className="border-border bg-gradient-to-br from-card to-card/50 hover:shadow-lg hover:shadow-primary/5 transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div
            className={cn(
              "flex items-center gap-1 text-sm font-medium",
              trend === "up" ? "text-green-500" : "text-red-500"
            )}
          >
            {trend === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {change}
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
