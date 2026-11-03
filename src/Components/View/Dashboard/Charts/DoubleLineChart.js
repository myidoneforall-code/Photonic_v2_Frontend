import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

const LineChart = () => {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Data Points",
        data: [10, 20, 15, 25, 30, 40], // Line connecting data points
        borderColor: "blue",
        borderWidth: 2,
        fill: false,
      },
      {
        label: "Custom Line",
        data: [10, null, null, null, null, 40], // Only start & end points
        borderColor: "red",
        borderWidth: 2,
        fill: false,
        spanGaps: true, // Draws a straight line between first and last point
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    tooltip: {
      callbacks: {
        label: {
          function(tooltipItem) {
            if (tooltipItem.dataIndex === 0) return "Start Point";
            if (tooltipItem.dataIndex === 5) return "End Point";
            return `Value: ${tooltipItem.raw}`;
          },
        },
      },
    },
  };

  return (
    <div style={{ width: "600px", height: "400px" }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default LineChart;
