import React from "react";
import Chart from "react-apexcharts";
import { Col, Row } from "reactstrap";

const ScheduleComplianceChart = ({ data, title, controllerDropDown }) => {
  const totalCompliance =
    (Number(data?.active_today_count) || 0) +
    (Number(data?.inactive_today_count) || 0);

  console.log(data, "Data1231");

  const isEmpty = totalCompliance === 0;

  const onValue = !isEmpty
    ? (data?.active_today_count / totalCompliance) * 100
    : 0;
  const offValue = !isEmpty
    ? (data?.inactive_today_count / totalCompliance) * 100
    : 0;

  const series = isEmpty ? [100] : [onValue, offValue];

  const options = {
    chart: {
      type: "donut",
      height: 300
    },
    labels: isEmpty
      ? ["No Data Found"]
      : ["Healthy(On)", "Attention Needed(Off)"],
    colors: isEmpty ? ["#FF9999"] : ["#10CF61", "#DC131F"],

    legend: {
      position: "bottom",
      horizontalAlign: "center"
    },
    dataLabels: {
      enabled: true,
      formatter(val) {
        return isEmpty ? "" : `${Number(val).toFixed(1)}%`;
      }
    },
    noData: {
      text: "No Data Found",

      style: {
        color: "#5d5d5d",
        fontSize: "16px"
      }
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "14px",
              fontFamily: "Arial, sans-serif",
              color: "#373d3f",
              offsetY: -10
            },
            value: {
              show: !isEmpty,
              fontSize: "24px",
              fontFamily: "Arial, sans-serif",
              color: "#373d3f",
              offsetY: 10,
              // Was `val.toFixed(1)` with no guard — ApexCharts'
              // printInnerLabels sometimes calls this with a non-numeric
              // val, throwing "val.toFixed is not a function". Same
              // isEmpty + Number() guard as the dataLabels formatter above.
              formatter(val) {
                return isEmpty ? "" : `${Number(val).toFixed(1)}%`;
              }
            },
            total: {
              show: true,
              label: isEmpty ? "No Data Found" : "Health Rate",
              color: "#373d3f",
              fontSize: "14px",
              formatter() {
                return isEmpty ? "" : `${onValue.toFixed(1)}%`;
              }
            }
          }
        }
      }
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300
          },
          legend: {
            position: "bottom"
          }
        }
      }
    ]
  };

  return (
    <div style={{ padding: 15 }}>
      <Row className="align-items-center mb-3 chart-card">
        <Col md={8} className="chart-card-left-sec">
          <h5 className="mb-1">{title}</h5>
          <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
            Monitor pump activity and adherence to schedule
          </p>
        </Col>
      </Row>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "30px" }}>
        <div style={{ flex: "1 1 300px" }}>
          <Chart options={options} series={series} type="donut" height={400} />
        </div>
      </div>
    </div>
  );
};

export default ScheduleComplianceChart;
