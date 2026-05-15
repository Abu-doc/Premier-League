import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

function Chart({ data }) {
  return (
    <BarChart width={300} height={200} data={data}>
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="value" fill="#3b82f6" />
    </BarChart>
  );
}

export default Chart;