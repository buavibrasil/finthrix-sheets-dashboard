import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number;
  format?: "currency" | "number";
  trend?: "up" | "down" | "neutral";
  trendValue?: number;
  icon?: ReactNode;
  className?: string;
}

export const MetricCard = ({ 
  title, 
  value, 
  format = "currency", 
  trend, 
  trendValue,
  icon,
  className = ""
}: MetricCardProps) => {
  const formatValue = (val: number) => {
    if (format === "currency") {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(val);
    }
    return val.toLocaleString("pt-BR");
  };

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4" />;
      case "down":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-success";
      case "down":
        return "text-danger";
      default:
        return "text-muted-foreground";
    }
  };

  const getValueColor = () => {
    if (title.toLowerCase().includes("despesa") || title.toLowerCase().includes("saída")) {
      return "text-danger";
    }
    if (title.toLowerCase().includes("receita") || title.toLowerCase().includes("entrada")) {
      return "text-success";
    }
    return "text-foreground";
  };

  return (
    <Card className={`bg-gradient-card shadow-card hover:shadow-hover transition-all duration-300 animate-fade-in ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          {icon && <div className="text-primary">{icon}</div>}
        </div>
        <div className="space-y-2">
          <div className={`text-2xl font-bold ${getValueColor()}`}>
            {formatValue(value)}
          </div>
          {trend && trendValue !== undefined && (
            <div className={`flex items-center text-xs ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="ml-1">
                {trendValue > 0 ? "+" : ""}{trendValue.toFixed(1)}% vs mês anterior
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};