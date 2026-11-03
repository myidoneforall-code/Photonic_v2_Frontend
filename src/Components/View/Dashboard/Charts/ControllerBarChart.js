import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { dashboardbarchart } from "../../../../Service/ApiService";
import { useSelector } from "react-redux";
import moment from "moment";
import { toast } from "react-hot-toast";
import Loader from "../../../Loader";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function ControllerBarChart() {
  let controllertype = parseInt(localStorage.getItem("contollertype"));
  const [YAxisdata, setYAxisdata] = useState();
  const [XAxisdata, setXAxisdata] = useState();
  let [loader, setloader] = useState(false);

  let CurrentDate = moment(new Date()).format("YYYY-MM-DD 00:00:00");
  let BeforeSevenDays = moment(new Date())
    .subtract(7, "d")
    .format("YYYY-MM-DD 00:00:00");

  useEffect(() => {
    const interval = setInterval(() => {
      ConBarChart();
    }, 2 * 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    ConBarChart();
  }, []);

  const ConBarChart = () => {
    setloader(true);

    let formData = new FormData();
    formData.append("controller_type", controllertype);
    formData.append("from_date", BeforeSevenDays);
    formData.append("to_date", CurrentDate);
    formData.append("from_date_format", 1);
    formData.append("to_date_format", 1);
    dashboardbarchart(formData)
      .then(({ data }) => {
        let consumption = data?.map((ydata) => {
          return ydata.tot_consumption;
        });
        let XAxis = data?.map((xdata) => {
          return xdata.date.split(" ", 1);
        });
        setYAxisdata(consumption);
        setXAxisdata(XAxis.flat());
      })
      .catch((err) => {
        if (err?.response?.data?.detail?.[0]?.msg) {
          toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
        } else if (err?.response?.data?.detail) {
          toast(err?.response?.data?.detail, { type: "error" });
        } else {
          toast("Something went wrong!!", { type: "error" });
        }
      })
      .finally(() => setloader(false));
  };

  return (
    <>
      <Loader isLoader={loader} />

      <Bar
        data={{
          labels: XAxisdata,
          datasets: [
            {
              label: "Total Consumption",
              data: YAxisdata,
              backgroundColor: "rgba(255, 99, 132, 0.5)",
              borderWidth: 0.1,
              barThickness: 70,
              hoverBackgroundColor: "rgb(255 5 58 / 50%)",
              borderColor: "yellow",
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: {
              display: false,
              // position: 'top',
            },
            title: {
              display: true,
              text: "Consumption Report",
              color: "red",
              font: { size: 20 },
            },
          },

          scales: {
            x: {
              grid: { display: true },
              title: {
                display: true,
                text: "Date",
                font: { size: 20 },
              },
            },
            y: {
              grid: { display: true },
              title: {
                display: true,
                text: "Power Consumption",
                font: { size: 20 },
              },
            },
          },
        }}
      />
    </>
  );
}
