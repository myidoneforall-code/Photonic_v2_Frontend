import React, { useEffect, useRef, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  FormGroup,
  Label
} from "reactstrap";
import html2canvas from "html2canvas";
import {
  Formik,
  Form,
  Field,
  ErrorMessage,
  useFormikContext,
  useFormik
} from "formik";
import ReactApexChart from "react-apexcharts";
import * as Yup from "yup";
import waterTank from "../../../../Assets/image/iotimages/water-tank.png";
import vector from "../../../../Assets/image/iotimages/vector-1.png";
import { Button } from "react-bootstrap";
import moment from "moment";
import toast from "react-hot-toast";
import * as XLSX from "sheetjs-style";
import { BsDownload } from "react-icons/bs";
import CommonSelect from "../../../CommonComponents/CommonSelect";
import { useSelector } from "react-redux";
import {
  controllerdropdown,
  ViewUserPermission,
  WaterConsumptionLineChart
} from "../../../../Service/ApiService";
import { getCatchMsg } from "../../../../Utilities/Methods";
import { GetCookieStorage } from "../../../../Utilities/Storage";
import Loader from "../../../Loader";
import dayjs from "dayjs";
import { getCookie } from "../../../../Utilities/Cookie";
const WaterConsumptionSchema = Yup.object().shape({
  fromDate: Yup.date().required("From Date is required"),
  toDate: Yup.date().required("To Date is required"),
  fromPeriod: Yup.string().required("From Period is required"),
  toPeriod: Yup.string().required("To Period is required")
});

const WaterConsumption = ({
  title,
  waterConsumptionData,
  onPress,
  onPressConsumptionChart,
  consumptionLineChart,
  apidatapowerconsumption,
  controllerDropDown
}) => {
  const chartRef = useRef(null);
  const token = JSON.parse(getCookie("cookiedata"))?.access_token;
  let cookie = JSON.parse(GetCookieStorage("cookiedata"));
  let usertype = cookie?.user_type;
  const [active, setActive] = useState(1);
  const [showExportMenu, setShowExportMenu] = useState(false);
  // const [controllerDropDown, setControllerDropDown] = useState([]);
  const [userpersmission, setUserPermissions] = useState([]);
  const [timeRange, setTimeRange] = useState("monthly");
  const [loader, setLoader] = useState(false);
  const { LoginUserData } = useSelector((state) => state);
  const timeRangeButtons = [
    { id: 4, key: "yearly", label: "Year" },
    { id: 3, key: "monthly", label: "Month" },
    { id: 2, key: "weekly", label: "Week" },
    { id: 1, key: "daily", label: "Day" }
  ];
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
        controller_id: 326,
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
      label: getPermissionDetailsById(userpersmission?.data, 31)
        ? getPermissionDetailsById(userpersmission?.data, 31)?.title
        : "Total",
      sublabel: getPermissionDetailsById(userpersmission?.data, 33)
        ? ""
        : "Discharged",
      data: waterConsumptionData?.total_consumption ?? 0,
      backgroundColor: "#3084E4"
    },
    {
      id: 2,
      label: getPermissionDetailsById(userpersmission?.data, 32)
        ? getPermissionDetailsById(userpersmission?.data, 32)?.title
        : "Average",
      sublabel: getPermissionDetailsById(userpersmission?.data, 32)
        ? ""
        : "Daily",
      data: waterConsumptionData?.average_consumption ?? 0,
      backgroundColor: "#FD8636"
    },
    {
      id: 3,
      label: getPermissionDetailsById(userpersmission?.data, 33)
        ? getPermissionDetailsById(userpersmission?.data, 33)?.title
        : "Peak",
      sublabel: getPermissionDetailsById(userpersmission?.data, 33)
        ? ""
        : "Discharged",
      data: waterConsumptionData?.peak_consumption ?? 0,
      backgroundColor: "#1CD468"
    }
  ];

  const handleTypeChange = (typeId, currentFilters) => {
    setActive(typeId);
    if (onPress) {
      onPress({ typeId, values, filters: currentFilters });
    }
  };
  // useEffect(() => {
  //   if (token) {
  //     handleControllerDropDown(LoginUserData);
  //   }
  // }, [token, active]);
  const handleControllerDropDown = () => {
    setLoader(true);
    const formdata = new FormData();
    formdata.append("controller_type", 1);
    formdata.append("report_for", active === 1 ? 2 : 3);

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

  // Generate chart data dynamically from consumptionLineChart
  const getChartData = () => {
    const data = consumptionLineChart || [];

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
              name: "Water Consumption",
              data: data.map((item) => item.total_consumption ?? 0)
            }
          ],
          options: { xaxis: { categories: data.map((item) => item.period) } }
        };

      case "weekly":
        return {
          series: [
            {
              name: "Water Consumption",
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
              name: "Water Consumption",
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

  const chartOptions = {
    chart: {
      id: "water-consumption-chart",
      type: "area",
      height: 200,
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
    xaxis: {
      ...chartData.options.xaxis,
      labels: {
        rotate: -45,
        tickAmount: 6,
        style: {
          fontSize: "9px",
          colors: "#666"
        }
      }
    },
    tooltip: { y: { formatter: (val) => val.toFixed(0) } },
    grid: { borderColor: "#f1f1f1" },
    yaxis: {
      labels: {
        formatter: (val) => `${val.toFixed(0)} KL`,
        style: { colors: "#666", fontSize: "10px" }
      }
    },
    tooltip: {
      y: {
        formatter: (val) => `${val.toFixed(0)} KL`
      }
    }
  };

  const SyncFormikValues = ({ data }) => {
    const { setFieldValue } = useFormikContext();
    const initialized = React.useRef(false); // prevent multiple updates

    useEffect(() => {
      if (data && !initialized.current) {
        initialized.current = true;

        if (data.from_date) {
          setFieldValue(
            "fromDate",
            moment(data.from_date).format("YYYY-MM-DD")
          );
          setFieldValue(
            "fromPeriod",
            data.from_date_format === 1 ? "AM" : "PM"
          );
        }

        if (data.to_date) {
          setFieldValue("toDate", moment(data.to_date).format("YYYY-MM-DD"));
          setFieldValue("toPeriod", data.to_date_format === 1 ? "AM" : "PM");
        }
      }
    }, [data, setFieldValue]);

    return null;
  };
  const getButtonStyle = (type) => ({
    backgroundColor: active === type ? "#0B5ED7" : "#E0E0E0",
    color: active === type ? "white" : "black",
    border: "none",
    borderRadius: "5px",
    padding: "6px 12px",
    cursor: "pointer",
    transition: "all 0.2s ease"
  });

  useEffect(() => {
    if (LoginUserData.user_id) {
      handleUserPrmission();
    }
  }, [LoginUserData.user_id]);

  const handleUserPrmission = () => {
    const formdata = new FormData();
    formdata.append("user_id", LoginUserData.user_id);
    ViewUserPermission(formdata)
      .then((res) => {
        setUserPermissions(res.data);
      })
      .catch((err) => {
        getCatchMsg(err);
      });
  };

  console.log(userpersmission, "permission");
  const handleExport = async (type) => {
    if (type === "png") {
      try {
        let chartElement = null;

        const possibleSelectors = [
          ".apexcharts-canvas",
          ".water-consumption-chart-sec .card",
          '[id*="water-consumption"]',
          ".react-apexchart"
        ];

        for (const selector of possibleSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            chartElement = element;
            break;
          }
        }

        // Fallback to chartRef
        if (!chartElement && chartRef?.current) {
          chartElement = chartRef.current;
        }

        if (!chartElement) {
          toast.error("Chart not found for export");
          return;
        }

        // ✅ Add wrapper with controller info
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

        // ✅ Capture image
        const canvas = await html2canvas(wrapper, {
          backgroundColor: "#ffffff",
          scale: 2,
          useCORS: true,
          logging: false
        });

        document.body.removeChild(wrapper);

        // ✅ Download PNG
        const imgData = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = imgData;
        link.download = `${
          controllerData?.controller_name || "All"
        }_WaterConsumption.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Chart exported as PNG successfully!");
      } catch (err) {
        console.error("Error exporting PNG:", err);
        toast.error(
          "Error exporting PNG: " + (err?.message || "Unknown error")
        );
      }
    }
    if (type === "xls") {
      if (!consumptionLineChart || consumptionLineChart.length === 0) return;

      const wb = XLSX.utils.book_new();
      const ws = {};

      const startDate = dayjs(apidatapowerconsumption?.from_date)?.format(
        "DD-MM-YYYY"
      );
      const endDate =
        timeRange === "yearly"
          ? dayjs().endOf("year").format("DD-MM-YYYY")
          : timeRange === "daily"
          ? dayjs().format("DD-MM-YYYY")
          : dayjs(apidatapowerconsumption?.to_date).format("DD-MM-YYYY");

      const rawDate = dayjs(apidatapowerconsumption?.from_date);
      const safeEndDate = dayjs(endDate).isValid() ? endDate : startDate;

      const rows = [
        [`${LoginUserData?.name || "Admin"} (Psdas)`],
        [""],
        ["Controller ID", controllerData.controller_code || ""],
        ["Group Name", controllerData.group_name || ""],
        [
          "Controller Name",
          controllerData.controller_name || "All Controller Details"
        ],
        [""],
        [`Report for the period: ${startDate} to ${endDate || safeEndDate}`],
        [""],
        ["Total Water Consumption"],
        [""],
        timeRange === "daily"
          ? ["SI.No", "Time", "Water Consumption (KL)"]
          : [
              "SI.No",
              timeRange === "monthly" || timeRange === "weekly"
                ? "Date"
                : timeRange === "yearly"
                ? "Month"
                : "Date",
              "Water Consumption (KL)"
            ]
      ];

      // Calculate total
      const totalConsumption = consumptionLineChart.reduce(
        (sum, item) => Number(sum) + Number(item.total_consumption ?? 0),
        0
      );

      let serial = 1;
      let dayCounter = 0;

      // consumptionLineChart.forEach((item) => {
      //   const thisDate = rawDate.add(dayCounter, "day");
      //   const formattedDate =
      //     timeRange === "yearly"
      //       ?item.period:""

      //   if (timeRange === "daily") {
      //     rows.push([serial++, item.total_consumption ?? 0]);
      //   } else {
      //     rows.push([serial++, formattedDate, item.total_consumption ?? 0]);
      //   }

      //   dayCounter += 1;
      // });

      consumptionLineChart.forEach((item, index) => {
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

      // Add total row INSIDE table
      if (timeRange === "daily") {
        rows.push(["", "", ""]); // spacing
        rows.push(["", "Total Water Consumption (KL)", totalConsumption]);
      } else {
        rows.push(["", "", ""]); // spacer
        rows.push(["", "Total Water Consumption (KL)", totalConsumption]);
      }

      XLSX.utils.sheet_add_aoa(ws, rows, { origin: "A1" });

      // ✅ Increased column widths for better visibility
      ws["!cols"] =
        timeRange === "daily"
          ? [
              { width: 30 }, // SI.No
              { width: 30 },
              { width: 30 } // Consumption
            ]
          : [
              { width: 25 }, // SI.No
              { width: 35 }, // Date / Month
              { width: 45 } // Consumption
            ];

      // Merge header sections
      ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, // Title
        { s: { r: 6, c: 0 }, e: { r: 6, c: 2 } }, // Period line
        { s: { r: 8, c: 0 }, e: { r: 8, c: 2 } } // Section header
      ];

      // Row heights
      ws["!rows"] = [
        { hpt: 35 },
        { hpt: 10 },
        {},
        {},
        {},
        { hpt: 8 },
        { hpt: 25 }
      ];

      // Default font size for all rows
      const defaultFontSize = 12;

      // Styling for all cells
      const range = XLSX.utils.decode_range(ws["!ref"]);
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cell_address = { r: R, c: C };
          const cell_ref = XLSX.utils.encode_cell(cell_address);
          if (!ws[cell_ref]) continue;

          ws[cell_ref].s = {
            font: { name: "Arial", sz: defaultFontSize, bold: false },
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
            }
          };

          // Header styling
          if (R === 0) {
            ws[cell_ref].s.font.bold = true;
            ws[cell_ref].s.font.sz = 16;
            ws[cell_ref].s.fill = { fgColor: { rgb: "8EB4E3" } };
          } else if (R === 6) {
            ws[cell_ref].s.fill = { fgColor: { rgb: "00B050" } };
            ws[cell_ref].s.font.bold = true;
            ws[cell_ref].s.font.color = { rgb: "FFFFFF" };
          } else if (R === 8) {
            ws[cell_ref].s.fill = { fgColor: { rgb: "00B0F0" } };
            ws[cell_ref].s.font.bold = true;
            ws[cell_ref].s.font.color = { rgb: "FFFFFF" };
          } else if (R === 10) {
            ws[cell_ref].s.fill = { fgColor: { rgb: "B3A2C7" } };
            ws[cell_ref].s.font.bold = true;
          }

          // Left align controller info
          if ((R === 2 || R === 3 || R === 4) && C === 0) {
            ws[cell_ref].s.alignment.horizontal = "left";
          }
        }
      }

      // ✅ Style only the last total row (green + small font)
      const lastRowIndex = rows.length - 1;
      const lastRowRange = timeRange === "daily" ? 2 : 2;
      for (let c = 0; c <= lastRowRange; c++) {
        const cellRef = XLSX.utils.encode_cell({ r: lastRowIndex, c });
        if (!ws[cellRef]) continue;
        ws[cellRef].s = {
          font: {
            name: "Arial",
            sz: timeRange === "daily" ? 12 : 12,
            bold: true,
            color: { rgb: "FFFFFF" }
          },
          alignment: {
            horizontal: "center",
            vertical: "center",
            wrapText: true
          },
          fill: { fgColor: { rgb: "00B050" } },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        };
      }

      // Slightly higher row height for total
      if (!ws["!rows"]) ws["!rows"] = [];
      ws["!rows"][lastRowIndex] = { hpt: 25 };

      XLSX.utils.book_append_sheet(wb, ws, "Water Consumption");
      XLSX.writeFile(
        wb,
        `${controllerData?.controller_name || "All"}_WaterConsumption.xlsx`
      );
    }
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

  console.log(getPermissionDetailsById(userpersmission?.data, 25), "jjj");

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
            {/* Image */}
            <Col xs={12} lg={5}>
              <img
                src={waterTank}
                alt="Sprinkler"
                className="img-fluid h-100"
                style={{ maxWidth: "100%", objectFit: "cover" }}
              />
            </Col>

            {/* Form */}
            <Col xs={12} lg={6}>
              <div
                className="d-flex flex-column justify-content-center h-100"
                style={{ padding: 25 }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <h5>{title}</h5>

                  <div style={{ display: "flex", gap: "10px" }}>
                    {getPermissionDetailsById(userpersmission?.data, 25) ||
                    usertype === 1 ? (
                      <button
                        style={getButtonStyle(1)}
                        onClick={() => handleTypeChange(1)}
                      >
                        Pressure
                      </button>
                    ) : null}

                    {getPermissionDetailsById(userpersmission?.data, 24) ||
                    usertype === 1 ? (
                      <button
                        style={getButtonStyle(2)}
                        onClick={() => handleTypeChange(2)}
                      >
                        Flow
                      </button>
                    ) : null}
                  </div>
                </div>
                <div
                  className="from_to_date"
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "flex-end",
                    marginTop: "10px"
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
                <Formik
                  enableReinitialize={true} // add this
                  initialValues={{
                    fromDate: waterConsumptionData?.from_date
                      ? moment(waterConsumptionData.from_date).format(
                          "YYYY-MM-DD"
                        )
                      : moment().subtract(3, "d").format("YYYY-MM-DD"),
                    toDate: waterConsumptionData?.to_date
                      ? moment(waterConsumptionData.to_date).format(
                          "YYYY-MM-DD"
                        )
                      : moment().format("YYYY-MM-DD"),
                    fromPeriod:
                      waterConsumptionData?.from_date_format === 2
                        ? "PM"
                        : "AM",
                    toPeriod:
                      waterConsumptionData?.to_date_format === 2 ? "PM" : "AM",

                    device_id: values?.device_id
                  }}
                  validationSchema={WaterConsumptionSchema}
                  onSubmit={(values) => {
                    if (onPress) onPress({ ...values, typeId: active });
                  }}
                >
                  {() => (
                    <Form>
                      {/* <SyncFormikValues data={waterConsumptionData} /> */}

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
                            <Label
                              className="form-check-label"
                              htmlFor="fromPeriodAM"
                            >
                              AM
                            </Label>
                          </div>
                          <div className="form-check">
                            <Field
                              type="radio"
                              id="fromPeriodPM"
                              name="fromPeriod"
                              value="PM"
                              className="form-check-input"
                            />
                            <Label
                              className="form-check-label"
                              htmlFor="fromPeriodPM"
                            >
                              PM
                            </Label>
                          </div>
                        </div>
                        <ErrorMessage
                          name="fromPeriod"
                          component="div"
                          className="text-danger"
                        />
                      </FormGroup>

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
                            <Label
                              className="form-check-label"
                              htmlFor="toPeriodAM"
                            >
                              AM
                            </Label>
                          </div>
                          <div className="form-check">
                            <Field
                              type="radio"
                              id="toPeriodPM"
                              name="toPeriod"
                              value="PM"
                              className="form-check-input"
                            />
                            <Label
                              className="form-check-label"
                              htmlFor="toPeriodPM"
                            >
                              PM
                            </Label>
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

        {/* Right Stats and Chart */}
        <Col md={5} className="ps-2">
          <Row className="mt-2 mb-2 power-consumption-small-card-sec gap-2">
            {cardData?.map((item) => (
              <Col
                key={item.id}
                style={{
                  padding:
                    item?.id === 1
                      ? "0px 0px 0px 10px"
                      : item?.id === 3
                      ? "0px 10px 0px 0px"
                      : "0px"
                }}
              >
                <Card
                  style={{
                    backgroundColor: item?.backgroundColor,
                    color: "white"
                  }}
                >
                  <CardBody style={{ minHeight: "166px" }}>
                    <div className="consumption-card">
                      <div className="img-sec mb-2">
                        <img src={vector} alt="" width={"40px"} />
                      </div>
                      <div>
                        <p style={{ color: "white", padding: 0, margin: 0 }}>
                          {item?.label}
                        </p>
                        <p
                          style={{
                            color: "white",
                            padding: 0,
                            marginBottom: "5px"
                          }}
                        >
                          {item?.sublabel}
                        </p>
                      </div>
                      <h5>{item.data} kL</h5>
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
                    className="chat-btn-group"
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <div className="btn-group" role="group">
                      {timeRangeButtons.map((button) => (
                        <button
                          key={button.key}
                          type="button"
                          className={`btn btn-sm ${
                            timeRange === button.key ? "active" : ""
                          }`}
                          onClick={() => {
                            setTimeRange(button.key);
                            if (onPressConsumptionChart) {
                              onPressConsumptionChart(
                                button?.id,
                                values?.device_id
                              );
                            }
                          }}
                        >
                          {button.label}
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

                <Row>
                  <Col>
                    <ReactApexChart
                      options={chartOptions}
                      series={chartData.series}
                      type="area"
                      height={200}
                    />
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default WaterConsumption;
