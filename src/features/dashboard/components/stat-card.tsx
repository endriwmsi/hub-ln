import { Area, AreaChart } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";

interface StatCardProps {
  title: string;
  value: string;
  subtext: React.ReactNode;
  icon: React.ElementType;
  chartData?: { date: string; value: number }[];
}

const chartConfig: ChartConfig = {
  amount: {
    label: "Valor",
    color: "hsl(var(--primary))",
  },
  count: {
    label: "Quantidade",
    color: "hsl(var(--primary))",
  },
};

export const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  chartData,
}: StatCardProps) => {
  return (
    <Card className="min-w-[85vw] snap-center overflow-hidden pb-0 sm:min-w-[45vw] lg:min-w-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="text-muted-foreground h-4 w-4" />
      </CardHeader>
      <CardContent className="p-0">
        <div className={chartData ? "px-6 pb-0" : "px-6 pb-4"}>
          <div className="text-2xl font-bold">{value}</div>
          <div className="h-4 text-xs text-muted-foreground">{subtext}</div>
        </div>
        {chartData && chartData.length > 0 && (
          <div className="h-8 w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <AreaChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 0,
                  left: 0,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id={`fill-${title.replace(/\s+/g, "")}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--chart-2)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--chart-2)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="value"
                  type="natural"
                  fill={`url(#fill-${title.replace(/\s+/g, "")})`}
                  fillOpacity={1}
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                  isAnimationActive={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      label={title}
                      hideLabel
                      indicator="line"
                    />
                  }
                />
              </AreaChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
