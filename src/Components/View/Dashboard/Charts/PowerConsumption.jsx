import React, { useEffect, useRef, useState } from "react";
import { Formik, Form, Field, ErrorMessage, useFormik } from "formik";
import ReactApexChart from "react-apexcharts";
import * as Yup from "yup";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import html2canvas from "html2canvas";
import { Button, Card, Col, Row } from "react-bootstrap";
import { CardBody, FormGroup, Label } from "reactstrap";
import moment from "moment";

import waterTank from "../../../../Assets/image/PowerConsuption.png";
import * as XLSX from "sheetjs-style";

import vector from "../../../../Assets/image/iotimages/vector-1.png";
import { BsDownload } from "react-icons/bs";
import CommonSelect from "../../../CommonComponents/CommonSelect";
import { useSelector } from "react-redux";
import {
  controllerdropdown,
  ViewUserPermission
} from "../../../../Service/ApiService";
import { getCatchMsg } from "../../../../Utilities/Methods";
import toast from "react-hot-toast";
import Loader from "../../../Loader";
import dayjs from "dayjs";
import { getCookie } from "../../../../Utilities/Cookie";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Validation Schema
const PowerConsumptionSchema = Yup.object().shape({
  fromDate: Yup.date().required("Required"),
  toDate: Yup.date().required("Required"),
  fromPeriod: Yup.string().required("Required"),
  toPeriod: Yup.string().required("Required")
});

const PowerConsumption = ({
  groupName,
  title,
  powerConsumptionData,
  onPress,
  onPressConsumptionChart,
  powerconsumptionLineChart,
  apidatapowerconsumption,
  controllerDropDown
}) => {
  const { LoginUserData } = useSelector((state) => state);
  const token = JSON.parse(getCookie("cookiedata"))?.access_token;
  const [timeRange, setTimeRange] = useState("monthly");
  const [loader, setLoader] = useState(false);
  const chartRef = useRef(null);
  // const [controllerDropDown, setControllerDropDown] = useState([]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [userpersmission, setUserPermissions] = useState([]);
  const { values, setFieldValue } = useFormik({
    initialValues: {
      device_id: null
    }
  });
  const data = controllerDropDown?.find(
    (ele) => ele?.controller_id === values?.device_id
  );
  const controllerData = data
    ? data
    : {
        controller_id: "",
        controller_code: "",
        controller_name: "All Controller Details"
      };
  const getPermissionDetailsById = (permissions, id) => {
    if (!Array.isArray(permissions)) return null;
    const item = permissions.find(
      (p) => p.permission_id === id && p.status === 1
    );
    return item
      ? { title: item.title, permission_id: item.permission_id }
      : null;
  };

  const cardData = [
    {
      id: 1,
      label: getPermissionDetailsById(userpersmission?.data, 28)
        ? getPermissionDetailsById(userpersmission?.data, 28)?.title
        : "Total",
      sublabel: getPermissionDetailsById(userpersmission?.data, 28)
        ? ""
        : "Consumption",
      data: powerConsumptionData?.total_consumption ?? 0,
      backgroundColor: "#3084E4"
    },
    {
      id: 2,
      label: getPermissionDetailsById(userpersmission?.data, 29)
        ? getPermissionDetailsById(userpersmission?.data, 29)?.title
        : "Average",
      sublabel: getPermissionDetailsById(userpersmission?.data, 29)
        ? ""
        : "Daily",
      data: powerConsumptionData?.average_consumption ?? 0,
      backgroundColor: "#FD8636"
    },
    {
      id: 3,
      label: getPermissionDetailsById(userpersmission?.data, 30)
        ? getPermissionDetailsById(userpersmission?.data, 30)?.title
        : "Peak",
      sublabel: getPermissionDetailsById(userpersmission?.data, 30)
        ? ""
        : "Consumption",
      data: powerConsumptionData?.peak_consumption ?? 0,
      backgroundColor: "#1CD468"
    }
  ];

  const timeRangeButtons = [
    { id: 4, key: "yearly", label: "Year" },
    { id: 3, key: "monthly", label: "Month" },
    { id: 2, key: "weekly", label: "Week" },
    { id: 1, key: "daily", label: "Day" }
  ];

  const handleControllerDropDown = () => {
    setLoader(true);
    const formdata = new FormData();
    formdata.append("controller_type", 1);

    controllerdropdown(formdata)
      .then((res) => {
        if (res?.data) {
          // setControllerDropDown(res.data || []);
        }
      })
      .catch((err) => getCatchMsg(err))
      .finally(() => setLoader(false));
  };
  const shortenWeekday = (day) => {
    const map = {
      Monday: "Mon",
      Tuesday: "Tue",
      Wednesday: "Wed",
      Thursday: "Thu",
      Friday: "Fri",
      Saturday: "Sat",
      Sunday: "Sun"
    };
    return map[day] || day;
  };

  // chart data config
  const getChartData = () => {
    const data = powerconsumptionLineChart || [];

    switch (timeRange) {
      case "yearly":
        return {
          series: [
            {
              name: "Power Consumption",
              data: data.map((item) => item.total_consumption ?? 0)
            }
          ],
          options: { xaxis: { categories: data.map((item) => item.period) } }
        };

      case "monthly":
        return {
          series: [
            {
              name: "Power Consumption",
              data: data.map((item) => item.total_consumption ?? 0)
            }
          ],
          options: { xaxis: { categories: data.map((item) => item.period) } }
        };

      case "weekly":
        return {
          series: [
            {
              name: "Power Consumption",
              data: data.map((item) => item.total_consumption ?? 0)
            }
          ],
          options: {
            xaxis: {
              categories: data.map((item) => shortenWeekday(item.period))
            }
          }
        };

      case "daily":
        return {
          series: [
            {
              name: "Power Consumption",
              data: data.map((item) => item.total_consumption ?? 0)
            }
          ],
          options: { xaxis: { categories: data.map((item) => item.period) } }
        };

      default:
        return { series: [], options: {} };
    }
  };

  const chartData = getChartData();
  const chartId = "powerConsumptionChart";

  const chartOptions = {
    chart: {
      id: chartId,
      type: "area",
      height: 200,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false
        }
      },
      toolbar: { show: false }
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100]
      }
    },
    colors: ["#39E7C5"],
    xaxis: { ...chartData.options.xaxis },

    yaxis: {
      labels: {
        formatter: (val) => `${val.toFixed(0)} kWh`,
        style: { colors: "#666" }
      }
      // title: {
      //   text: "Power Consumption (kWh)",
      //   style: { color: "#666" },
      // },
    },

    // ✅ Add this for tooltip values with "kWh"
    tooltip: {
      y: {
        formatter: (val) => `${val.toFixed(0)} kWh`
        // title: {
        //   formatter: (seriesName) => `${seriesName}`, // optional, cleaner label
        // },
      }
    },

    grid: { borderColor: "#f1f1f1" }
  };

  const handleExport = async (type) => {
    if (type === "xls") {
      if (!powerconsumptionLineChart || powerconsumptionLineChart.length === 0)
        return;

      const wb = XLSX.utils.book_new();
      const ws = {};

      const startDate = dayjs(apidatapowerconsumption?.from_date)?.format(
        "DD-MM-YYYY"
      );
      // const endDateRaw = dayjs(apidatapowerconsumption?.to_date);

      const endDateRaw =
        timeRange === "yearly"
          ? dayjs(dayjs().endOf("year"))
          : dayjs(apidatapowerconsumption?.to_date);

      const endDate = endDateRaw.isValid()
        ? endDateRaw.format("DD-MM-YYYY")
        : startDate;

      // ✅ Build header rows
      const rows = [
        [`${LoginUserData?.name || "User"} (Psdas)`], // Title
        ["Controller ID", controllerData?.controller_code || ""],
        ["Group Name", controllerData?.group_name || ""],
        [
          "Controller Name",
          controllerData?.controller_name || "All Controller Details"
        ],
        [""],
        [`Report for the period: ${startDate} to ${endDate}`],
        ["Total Power Consumption (kWh)"]
      ];

      // ✅ Conditional Table Header
      if (timeRange === "daily") {
        rows.push(["SI.No", "Time", "Power Consumption (kWh)"]);
      } else {
        const timeLabel =
          timeRange === "monthly"
            ? "Date"
            : timeRange === "yearly"
            ? "Month"
            : "Date";
        rows.push(["SI.No", timeLabel, "Power Consumption (kWh)"]);
      }

      // ✅ Add data rows
      let serial = 1;

      powerconsumptionLineChart.forEach((item, index) => {
        let formattedLabel = "";

        if (timeRange === "daily") {
          // Example: 10-11-2025
          formattedLabel = dayjs(apidatapowerconsumption?.from_date)
            .add(index, "day")
            .format("DD-MM-YYYY");
          rows.push([serial++, item.period, item.total_consumption ?? 0]);
        } else if (timeRange === "monthly") {
          // Example: January, February, etc.
          formattedLabel = dayjs(apidatapowerconsumption?.from_date)
            .add(index, "day")
            .format("DD-MM-YYYY");
          rows.push([serial++, formattedLabel, item.total_consumption ?? 0]);
        } else if (timeRange === "yearly") {
          // Full year: January to December
          formattedLabel = item.period;
          rows.push([serial++, formattedLabel, item.total_consumption ?? 0]);
        } else {
          // Default: show date range (fallback)
          formattedLabel = dayjs(apidatapowerconsumption?.from_date)
            .add(index, "day")
            .format("DD-MM-YYYY");
          rows.push([serial++, formattedLabel, item.total_consumption ?? 0]);
        }
      });

      // ✅ Add total row
      const totalConsumption = powerconsumptionLineChart.reduce(
        (sum, item) => Number(sum) + Number(item.total_consumption ?? 0),
        0
      );

      if (timeRange === "daily") {
        rows.push(["", "Total Power Consumption (kWh)", totalConsumption]);
      } else {
        rows.push(["", "Total Power Consumption (kWh)", totalConsumption]);
      }

      // ✅ Add data to worksheet
      XLSX.utils.sheet_add_aoa(ws, rows, { origin: "A1" });

      // ✅ Merge header rows
      ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, // Title
        { s: { r: 5, c: 0 }, e: { r: 5, c: 2 } }, // Report period
        { s: { r: 6, c: 0 }, e: { r: 6, c: 2 } } // Total power heading
      ];

      // ✅ Adjust column widths dynamically
      ws["!cols"] =
        timeRange === "daily"
          ? [{ width: 40 }, { width: 40 }, { width: 40 }]
          : [{ width: 25 }, { width: 50 }, { width: 30 }];

      // ✅ Style formatting
      const highlightRows = [0, 5, 6, 7];
      const range = XLSX.utils.decode_range(ws["!ref"]);
      const lastRow = range.e.r;

      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cell_ref = XLSX.utils.encode_cell({ r: R, c: C });
          if (!ws[cell_ref]) continue;

          const isHeader = highlightRows.includes(R);
          const isTitle = R === 0;
          const isReportRow = R === 5;
          const isTableHeader = R === 7;
          const isRealTotalRow = R === lastRow;

          ws[cell_ref].s = {
            font: {
              name: "Arial",
              sz: isTitle ? 20 : 12,
              bold: isHeader || isRealTotalRow,
              color: { rgb: isReportRow ? "FFFFFF" : "000000" }
            },
            alignment: {
              horizontal: "center",
              vertical: "center",
              wrapText: true
            },
            border: {
              top: { style: "thin", color: { rgb: "000000" } },
              left: { style: "thin", color: { rgb: "000000" } },
              bottom: { style: "thin", color: { rgb: "000000" } },
              right: { style: "thin", color: { rgb: "000000" } }
            },
            fill: {
              fgColor: {
                rgb: isTitle
                  ? "00B0F0"
                  : isReportRow
                  ? "00B050"
                  : isTableHeader
                  ? "B3A2C7"
                  : isRealTotalRow
                  ? "C6EFCE"
                  : "FFFFFF"
              }
            }
          };

          if ([1, 2, 3].includes(R) && C === 0) {
            ws[cell_ref].s.alignment.horizontal = "left";
          }
        }
      }

      // ✅ Set row heights
      ws["!rows"] = [];
      for (let R = 0; R <= lastRow; R++) {
        if (R === 0) {
          ws["!rows"][R] = { hpt: 35 }; // Title row
        } else if (R === 5) {
          ws["!rows"][R] = { hpt: 25 }; // Report period row
        } else if (R === 6) {
          ws["!rows"][R] = { hpt: 25 }; // Total power heading
        } else if (R === lastRow) {
          ws["!rows"][R] = { hpt: 22 }; // Total consumption row
        } else {
          ws["!rows"][R] = { hpt: 18 }; // Default row height
        }
      }

      // ✅ Save file
      XLSX.utils.book_append_sheet(wb, ws, "Power Consumption");
      XLSX.writeFile(
        wb,
        `${controllerData?.controller_name || "All"}_PowerConsumption.xlsx`
      );
    }

    // if (type === "xls") {
    //   if (!powerconsumptionLineChart || powerconsumptionLineChart.length === 0)
    //     return;

    //   const rows = [
    //     ["Name", `${LoginUserData?.name ?? ""} (Psdas)`],
    //     ["Controller Name", controllerData.controller_name ?? "All Controller Details"],
    //     ["Controller Code", controllerData.controller_code ?? ""],
    //     [], // empty row for spacing
    //     ["Period", "Power Consumption"], // headers
    //     ...powerconsumptionLineChart.map((item) => [
    //       item.period,
    //       item.total_consumption ?? 0,
    //     ]),
    //   ];

    //   const ws = XLSX.utils.aoa_to_sheet(rows);
    //   const wb = XLSX.utils.book_new();
    //   XLSX.utils.book_append_sheet(wb, ws, "Power Consumption");

    //   XLSX.writeFile(
    //     wb,
    //     `${controllerData.controller_name}_PowerConsumption.xls`,
    //     { bookType: "xls" }
    //   );
    // }
    if (type === "png") {
      try {
        let chartElement = null;
        const possibleSelectors = [
          ".apexcharts-canvas",
          ".power-consumption-chart-sec .card",
          '[id*="power-consumption"]',
          ".react-apexchart"
        ];
        for (const selector of possibleSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            chartElement = element;
            break;
          }
        }
        if (!chartElement && chartRef?.current) {
          chartElement = chartRef.current;
        }

        if (!chartElement) {
          toast.error("Chart not found for export");
          return;
        }

        const wrapper = document.createElement("div");
        wrapper.style.background = "#ffffff";
        wrapper.style.padding = "10px";
        wrapper.style.display = "inline-block";
        wrapper.style.textAlign = "center";

        const infoHTML = `
        <div style="font-family: Arial; font-size: 14px; margin-bottom: 10px;">
            <b>Name:</b> ${LoginUserData?.name}(Psdas)<br/>
          <b>Controller Name:</b> ${
            controllerData?.controller_name ?? "All Controller Details"
          }<br/>
          ${
            controllerData?.controller_code
              ? `<b>Controller Code:</b> ${controllerData.controller_code}<br/>`
              : ""
          }
        </div>
      `;

        wrapper.innerHTML = infoHTML;
        const clonedChart = chartElement.cloneNode(true);
        wrapper.appendChild(clonedChart);
        document.body.appendChild(wrapper);

        const canvas = await html2canvas(wrapper, {
          backgroundColor: "#ffffff",
          scale: 2,
          useCORS: true,
          logging: false
        });

        document.body.removeChild(wrapper);
        const imgData = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = imgData;
        link.download = `${controllerData.controller_name}_PowerConsumption.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        toast.error(
          "Error exporting PNG: " + (err?.message || "Unknown error")
        );
      }
    }
  };
  console.log(controllerData, "ControllerData");

  // useEffect(() => {
  //   if (token) {
  //     handleControllerDropDown(LoginUserData);
  //   }
  // }, [token]);
  useEffect(() => {
    if (LoginUserData.user_id) {
      handleUserPrmission();
    }
  }, [LoginUserData.user_id]);

  const handleUserPrmission = () => {
    const formdata = new FormData();
    formdata.append("user_id", LoginUserData.user_id);
    formdata.append("report_for", 1);
    ViewUserPermission(formdata)
      .then((res) => {
        setUserPermissions(res.data);
      })
      .catch((err) => {
        getCatchMsg(err);
      });
  };

  const onFetchConsumptionChart = (id, device_id, action) => {
    let newFromDate, newToDate;

    if (timeRange === "monthly") {
      let current = apidatapowerconsumption?.from_date
        ? dayjs(apidatapowerconsumption.from_date)
        : dayjs().startOf("month");
      if (action === "previous") {
        newFromDate = current.subtract(1, "month").startOf("month");
        newToDate = current.subtract(1, "month").endOf("month");
      } else if (action === "next") {
        newFromDate = current.add(1, "month").startOf("month");
        newToDate = current.add(1, "month").endOf("month");
      } else {
        newFromDate = current.startOf("month");
        newToDate = current.endOf("month");
      }
    } else if (timeRange === "weekly") {
      newFromDate = dayjs(apidatapowerconsumption?.from_date);
      newToDate = dayjs(apidatapowerconsumption?.to_date);

      if (action === "previous") {
        newFromDate = newFromDate.subtract(7, "day");
        newToDate = newToDate.subtract(7, "day");
      } else if (action === "next") {
        newFromDate = newFromDate.add(7, "day");
        newToDate = newToDate.add(7, "day");
      }
    }

    // Then call API with new dates
    onPressConsumptionChart(id, device_id, newFromDate, newToDate);
  };

  console.log(apidatapowerconsumption, "apidatapowerconsumption");

  return (
    <div
      style={{
        border: "1px solid rgb(0,0,0,0.1)",
        padding: 10,
        borderRadius: 5
      }}
    >
      <Loader isLoader={loader} />
      <Row>
        <Col xs={12} md={7}>
          <Row className="align-items-stretch">
            <Col xs={12} lg={5}>
              <img
                src={waterTank}
                alt="Sprinkler"
                className="img-fluid h-100"
                style={{ objectFit: "cover" }}
              />
            </Col>

            <Col xs={12} lg={6}>
              <div
                className="from_to_date"
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <div>
                  <h5 className="mt-3">{title}</h5>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "flex-end",
                    paddingTop: "30px"
                  }}
                >
                  <CommonSelect
                    styles={{ height: "30px" }}
                    onChange={(data) => {
                      setFieldValue("device_id", data);
                    }}
                    value={values.device_id}
                    options={controllerDropDown?.map((ele) => ({
                      ...ele,
                      label: ele?.controller_name,
                      value: ele?.controller_id
                    }))}
                    placeholder={"Select Device"}
                  />
                </div>
              </div>
              <div className="d-flex flex-column h-100" style={{ padding: 25 }}>
                <Formik
                  enableReinitialize={true}
                  initialValues={{
                    fromDate: powerConsumptionData?.from_date
                      ? moment(powerConsumptionData.from_date).format(
                          "YYYY-MM-DD"
                        )
                      : moment().subtract(3, "d").format("YYYY-MM-DD"),
                    toDate: powerConsumptionData?.to_date
                      ? moment(powerConsumptionData.to_date).format(
                          "YYYY-MM-DD"
                        )
                      : moment().format("YYYY-MM-DD"),
                    fromPeriod:
                      powerConsumptionData?.from_date_format === 2
                        ? "PM"
                        : "AM",
                    toPeriod:
                      powerConsumptionData?.to_date_format === 2 ? "PM" : "AM",
                    device_id: values?.device_id
                  }}
                  validationSchema={PowerConsumptionSchema}
                  onSubmit={(values) => {
                    console.log(values, "values123");

                    if (onPress) onPress(values);
                  }}
                >
                  {() => (
                    <Form>
                      <Formik data={powerConsumptionData} />

                      {/* From Date */}
                      <FormGroup>
                        <Label htmlFor="fromDate">From</Label>
                        <Field
                          type="date"
                          id="fromDate"
                          name="fromDate"
                          className="form-control"
                        />
                        <ErrorMessage
                          name="fromDate"
                          component="div"
                          className="text-danger"
                        />
                      </FormGroup>

                      {/* From Period */}
                      <FormGroup tag="fieldset" className="mt-3">
                        <div className="d-flex gap-3">
                          <div className="form-check">
                            <Field
                              type="radio"
                              id="fromPeriodAM"
                              name="fromPeriod"
                              value="AM"
                              className="form-check-input"
                            />
                            <Label htmlFor="fromPeriodAM">AM</Label>
                          </div>
                          <div className="form-check">
                            <Field
                              type="radio"
                              id="fromPeriodPM"
                              name="fromPeriod"
                              value="PM"
                              className="form-check-input"
                            />
                            <Label htmlFor="fromPeriodPM">PM</Label>
                          </div>
                        </div>
                        <ErrorMessage
                          name="fromPeriod"
                          component="div"
                          className="text-danger"
                        />
                      </FormGroup>

                      {/* To Date */}
                      <FormGroup className="mt-3">
                        <Label htmlFor="toDate">To</Label>
                        <Field
                          type="date"
                          id="toDate"
                          name="toDate"
                          className="form-control"
                        />
                        <ErrorMessage
                          name="toDate"
                          component="div"
                          className="text-danger"
                        />
                      </FormGroup>

                      {/* To Period */}
                      <FormGroup tag="fieldset" className="mt-3">
                        <div className="d-flex gap-3">
                          <div className="form-check">
                            <Field
                              type="radio"
                              id="toPeriodAM"
                              name="toPeriod"
                              value="AM"
                              className="form-check-input"
                            />
                            <Label htmlFor="toPeriodAM">AM</Label>
                          </div>
                          <div className="form-check">
                            <Field
                              type="radio"
                              id="toPeriodPM"
                              name="toPeriod"
                              value="PM"
                              className="form-check-input"
                            />
                            <Label htmlFor="toPeriodPM">PM</Label>
                          </div>
                        </div>
                        <ErrorMessage
                          name="toPeriod"
                          component="div"
                          className="text-danger"
                        />
                      </FormGroup>

                      <div className="mt-5">
                        <Button type="submit" style={{ width: "100%" }}>
                          Submit
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </Col>
          </Row>
        </Col>

        {/* Right side */}
        <Col md={5} className="ps-2">
          <Row className="mb-2 power-consumption-small-card-sec">
            {cardData.map((item) => (
              <Col key={item.id} style={{ padding: "0px 5px" }}>
                <Card
                  style={{
                    backgroundColor: item?.backgroundColor,
                    color: "white",
                    marginTop: 5
                  }}
                >
                  <CardBody style={{ minHeight: "166px" }}>
                    <div className="consumption-card">
                      <div className="img-sec mb-2">
                        <img src={vector} alt="" width={"40px"} />
                      </div>
                      <div className="text-muted mb-1">
                        {" "}
                        <p style={{ color: "white", padding: 0, margin: 0 }}>
                          {" "}
                          {item.label}
                        </p>
                      </div>
                      <p
                        style={{
                          color: "white",
                          padding: 0,
                          marginBottom: "5px"
                        }}
                      >
                        {item?.sublabel}
                      </p>
                      <h5>{item.data} kwh</h5>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>

          <div className="power-consumption-chart-sec position-relative">
            <Card>
              <CardBody>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <h5>{title}</h5>

                  {timeRange === "weekly" && (
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      {/* Previous Week */}
                      <span
                        onClick={() =>
                          onFetchConsumptionChart(
                            timeRangeButtons?.find(
                              (ele) => ele?.key === timeRange
                            )?.id,
                            values?.device_id,

                            "previous"
                          )
                        }
                        style={{ cursor: "pointer", fontWeight: "bold" }}
                      >
                        {"<"}
                      </span>

                      {/* Current week range */}
                      <span>
                        {`${dayjs(apidatapowerconsumption?.from_date)?.format(
                          "DD-MM"
                        )} - ${dayjs(apidatapowerconsumption?.to_date)?.format(
                          "DD-MM"
                        )}`}
                      </span>

                      {/* Next Week (disabled if to_date >= today) */}
                      {(() => {
                        const toDate = dayjs(apidatapowerconsumption?.to_date);
                        const today = dayjs();

                        const isFutureDisabled = toDate.isAfter(today, "day"); // disable if next week exceeds today

                        return (
                          <span
                            onClick={() => {
                              if (!isFutureDisabled) {
                                onFetchConsumptionChart(
                                  timeRangeButtons?.find(
                                    (ele) => ele?.key === timeRange
                                  )?.id,
                                  values?.device_id,
                                  "next"
                                );
                              }
                            }}
                            style={{
                              cursor: isFutureDisabled
                                ? "not-allowed"
                                : "pointer",
                              fontWeight: "bold",
                              opacity: isFutureDisabled ? 0.4 : 1,
                              color: isFutureDisabled ? "#999" : "black"
                            }}
                          >
                            {">"}
                          </span>
                        );
                      })()}
                    </div>
                  )}

                  {timeRange === "monthly" && (
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      {/* Previous Week */}
                      <span
                        onClick={() =>
                          onFetchConsumptionChart(
                            timeRangeButtons?.find(
                              (ele) => ele?.key === timeRange
                            )?.id,
                            values?.device_id,
                            "previous"
                          )
                        }
                        style={{ cursor: "pointer", fontWeight: "bold" }}
                      >
                        {"<"}
                      </span>

                      {/* Current week range */}
                      <span>
                        {`${dayjs(apidatapowerconsumption?.from_date)?.format(
                          "DD-MM-YYYY"
                        )}`}
                      </span>

                      {/* Next Week (disabled if to_date >= today) */}
                      {(() => {
                        const toDate = dayjs(
                          apidatapowerconsumption?.from_date
                        );
                        const today = dayjs();

                        const isFutureDisabled = toDate.isAfter(today, "month"); // disable if next week exceeds today

                        return (
                          <span
                            onClick={() => {
                              if (!isFutureDisabled) {
                                onFetchConsumptionChart(
                                  timeRangeButtons?.find(
                                    (ele) => ele?.key === timeRange
                                  )?.id,
                                  values?.device_id,
                                  "next"
                                );
                              }
                            }}
                            style={{
                              cursor: isFutureDisabled
                                ? "not-allowed"
                                : "pointer",
                              fontWeight: "bold",
                              opacity: isFutureDisabled ? 0.4 : 1,
                              color: isFutureDisabled ? "#999" : "black"
                            }}
                          >
                            {">"}
                          </span>
                        );
                      })()}
                    </div>
                  )}
                </div>

                <Row className="align-items-center mb-3">
                  <Col
                    md={12}
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <div className="btn-group" role="group">
                      {timeRangeButtons.map((btn) => (
                        <button
                          key={btn.key}
                          type="button"
                          className={`btn btn-sm ${
                            timeRange === btn.key ? "active" : ""
                          }`}
                          onClick={() => {
                            setTimeRange(btn.key);
                            if (onPressConsumptionChart)
                              onPressConsumptionChart(
                                btn?.id,
                                values?.device_id
                              );
                          }}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                    <div
                      className="d-flex justify-content-end position-relative"
                      style={{ gap: "0.25rem" }}
                    >
                      <Button
                        size="sm"
                        variant="light"
                        onClick={() => setShowExportMenu(!showExportMenu)}
                      >
                        <BsDownload size={16} />
                      </Button>
                      {showExportMenu && (
                        <div
                          className="position-absolute bg-white border rounded shadow-sm p-2"
                          style={{
                            right: 0,
                            top: "100%",
                            zIndex: 10,
                            minWidth: "130px",
                            minHeight: "80px"
                          }}
                        >
                          <Button
                            variant="light"
                            size="sm"
                            onClick={() => handleExport("xls")}
                            className="w-100 text-start"
                          >
                            Export XLS
                          </Button>
                          <Button
                            variant="light"
                            size="sm"
                            onClick={() => handleExport("png")}
                            className="w-100 text-start"
                          >
                            Export PNG
                          </Button>
                        </div>
                      )}
                    </div>
                  </Col>
                </Row>

                <ReactApexChart
                  id="power-consumption"
                  options={chartOptions}
                  series={chartData.series}
                  type="area"
                  height={200}
                />
              </CardBody>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default PowerConsumption;
