import { Element } from '@/types/elements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface ElementsChartProps {
  elements: Element[];
}

const ElementsChart = ({ elements }: ElementsChartProps) => {
  const getElementColor = (id: string) => {
    const colors = {
      fire: 'rgb(234, 88, 12)',
      air: 'rgb(56, 189, 248)',
      water: 'rgb(59, 130, 246)',
      lightning: 'rgb(147, 51, 234)',
      earth: 'rgb(217, 119, 6)'
    };
    return colors[id as keyof typeof colors] || '#888';
  };

  const chartData = elements.map(element => ({
    name: element.name,
    points: element.points,
    fill: getElementColor(element.id)
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card className="border bg-background/95 backdrop-blur-sm shadow-xl">
          <CardContent className="p-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="font-medium">{label}</div>
              <div className="font-mono text-right">{payload[0].value} points</div>
            </div>
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-xl border rounded-xl bg-background/95 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center">Scores des Équipes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis 
                dataKey="name" 
                stroke="currentColor" 
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="currentColor"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="points" 
                radius={[4, 4, 0, 0]}
                className="transition-all duration-300"
                animationDuration={1000}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ElementsChart;
