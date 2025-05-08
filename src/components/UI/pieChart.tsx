import { PieChart, Pie, Cell } from "recharts";

const COLORS = ["#00C950", "#61738E", "#FA2C37"];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

export default function Chart({
  votes,
}: {
  votes: { like: number; dislike: number; unknown: number };
}) {
  const data = [
    { name: "like", value: votes.like },
    { name: "unknown", value: votes.unknown },
    { name: "dislike", value: votes.dislike },
  ];
  return (
    <PieChart width={250} height={250}>
      <Pie
        data={data}
        cx={125}
        cy={125}
        labelLine={false}
        label={renderCustomizedLabel}
        outerRadius={100}
        fill="#8884d8"
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index]} />
        ))}
      </Pie>
    </PieChart>
  );
}
