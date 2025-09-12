import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string;
  trend: string;
  trendColor: string;
  icon: React.ReactNode;
  isAnomalous?: boolean;
};

export function StatCard({
  title,
  value,
  trend,
  trendColor,
  icon,
  isAnomalous,
}: StatCardProps) {
  return (
    <Card className={cn("transition-all", isAnomalous && "ring-2 ring-destructive")}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={cn("text-xs", trendColor)}>{trend}</p>
      </CardContent>
    </Card>
  );
}
