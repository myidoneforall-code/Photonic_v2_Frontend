import React, { useState, useMemo, useEffect, useRef } from "react";
import ReactApexChart from "react-apexcharts";
import CommonSelect from "../../../CommonComponents/CommonSelect";
import { useFormik } from "formik";
import { useSelector } from "react-redux";
import { controllerdropdown } from "../../../../Service/ApiService";
import { getCatchMsg } from "../../../../Utilities/Methods";
import { Button } from "react-bootstrap";
import { BsDownload } from "react-icons/bs";
import toast from "react-hot-toast";
import html2canvas from "html2canvas";
import * as XLSX from "sheetjs-style";
import dayjs from "dayjs";
import { getCookie } from "../../../../Utilities/Cookie";

function DepthLinechart({
  onPressData,
  depthLinechartData,
  title,
  controllerDropDown,
}) {
  const [timeRange, setTimeRange] = useState("weekly");
  // const [controllerDropDown, setControllerDropDown] = useState([]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const { LoginUserData } = useSelector((state) => state);
  const token = JSON.parse(getCookie("cookiedata"))?.access_token;
  const [loader, setLoader] = useState(false);
  console.log(depthLinechartData, "DepthLineChartData");

  const { values, setFieldValue } = useFormik({
    initialValues: {
      device_id: null,
    },
  });
  const chartRef = useRef(null);
  const data = controllerDropDown?.find(
    (ele) => ele?.controller_id === values?.device_id,
  );
  const controllerData = data
    ? data
    : {
        controller_id: "",
        controller_code: "",
        controller_name: "All Controller Details",
      };
  const handleButtonClick = (range, period_type) => {
    setTimeRange(range);
    if (onPressData) onPressData(period_type, values?.device_id); // passes only period_type
  };

  const shortenWeekday = (day) => {
    const map = {
      Monday: "Mon",
      Tuesday: "Tue",
      Wednesday: "Wed",
      Thursday: "Thu",
      Friday: "Fri",
      Saturday: "Sat",
      Sunday: "Sun",
    };
    return map[day] || day;
  };
  const chartData = useMemo(() => {
    const data = depthLinechartData || [];
    return {
      series: [
        {
          name: "Depth",
          data: data
            ? data?.aggregated_data?.map((item) => item?.total_depth ?? 0)
            : [],
        },
      ],
      options: {
        xaxis: {
          categories: data
            ? data?.aggregated_data?.map((item) => shortenWeekday(item.period))
            : [],
        },
      },
    };
  }, [depthLinechartData]);

  const chartOptions = {
    chart: {
      type: "area",
      height: 350,
      toolbar: { show: false },
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100],
      },
    },
    colors: ["#39E7C5"],
    xaxis: { ...chartData.options.xaxis },
    yaxis: {
      labels: { style: { colors: "#666", fontSize: "12px", fontWeight: 500 } },
      title: { text: "Feet" },
    },
    // tooltip: {
    //   enabled: true,
    //   shared: true,
    //   followCursor: true,
    //   custom: function ({ series, seriesIndex, dataPointIndex, w }) {
    //     // Find the corresponding period (like Monday, Tuesday, etc.)
    //     const point =
    //       w.config.xaxis.categories[dataPointIndex] ||
    //       depthLinechartData?.aggregated_data?.[dataPointIndex]?.period ||
    //       "Unknown";

    //     // Find the matching data object for that period
    //     const fullData = (depthLinechartData?.aggregated_data || []).find(
    //       (d) => d.period === point,
    //     );

    //     if (!fullData || !fullData.records?.length) {
    //       return `
    //         <div style="padding:8px; min-width:180px; border-radius:6px;">
    //           <b>${point}</b><br/>
    //           <span style="color:#999;">No records found</span>
    //         </div>`;
    //     }

    //     // Map over all depth values for that day
    //     const recordList = fullData.records
    //       .map(
    //         (r) => `
    //           <div style="font-size:12px; margin-bottom:3px;">
    //             <span style="color:#176BA0;">Depth:</span> <b>${r.depth}(feet)</b><br/>
    //             <span style="color:#999;">${r.created_at}</span>
    //           </div>`,
    //       )
    //       .join("");

    //     // Return the tooltip HTML
    //     return `
    //       <div style="padding:8px; min-width:200px; border-radius:6px;">
    //         <b style="font-size:13px;">${point}</b>
    //         <div style="
    //           margin-top:5px;
    //           max-height:150px;
    //           overflow-y:auto;
    //           display:block;
    //           -webkit-overflow-scrolling: touch;
    //         ">
    //           ${recordList}
    //         </div>
    //       </div>`;
    //   },
    // },
    grid: { borderColor: "#f1f1f1" },

    tooltip: {
      enabled: true,
      shared: true,
      intersect: false,
      followCursor: true,
      custom: function ({ dataPointIndex, w }) {
        const point =
          w.config.xaxis.categories[dataPointIndex] ||
          depthLinechartData?.aggregated_data?.[dataPointIndex]?.period ||
          "Unknown";

        const fullData = (depthLinechartData?.aggregated_data || []).find(
          (d) => d.period === point,
        );

        if (!fullData || !fullData.records?.length) {
          return `
        <div style="padding:8px; min-width:180px;">
          <b>${point}</b><br/>
          <span style="color:#999;">No records found</span>
        </div>`;
        }

        const recordList = fullData.records
          .map(
            (r) => `
          <div style="font-size:12px; margin-bottom:4px;">
            <span style="color:#176BA0;">Depth:</span>
            <b>${r.depth} feet</b><br/>
            <span style="color:#999;">${r.created_at}</span>
          </div>`,
          )
          .join("");

        return `
      <div style="padding:8px; min-width:200px;">
        <b style="font-size:13px;">${point}</b>
        <div style="margin-top:6px;">
          ${recordList}
        </div>
      </div>`;
      },
    },

    noData: {
      text: "No Data Found",
      align: "center",
      verticalAlign: "middle",
      style: {
        color: "#999",
        fontSize: "16px",
        fontWeight: "600",
        fontFamily: "Helvetica, Arial, sans-serif",
      },
    },
  };

  const timeRangeButtons = [
    // { id: 4, key: "yearly", label: "Yearly" },
    { id: 1, key: "daily", label: "Day" },
    { id: 3, key: "monthly", label: "Month" },
    { id: 2, key: "weekly", label: "Week" },
  ];

  const onFetchConsumptionChart = (id, device_id, action) => {
    let newFromDate, newToDate;

    if (timeRange === "monthly") {
      // Get current from_date or today if not available
      let current = depthLinechartData?.from_date
        ? dayjs(depthLinechartData.from_date)
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
    }

    // weekly/daily/yearly can stay your existing logic
    else if (timeRange === "weekly") {
      let currentFrom = dayjs(depthLinechartData?.from_date);
      let currentTo = dayjs(depthLinechartData?.to_date);

      if (action === "previous") {
        newFromDate = currentFrom.subtract(7, "day");
        newToDate = currentTo.subtract(7, "day");
      } else if (action === "next") {
        newFromDate = currentFrom.add(7, "day");
        newToDate = currentTo.add(7, "day");
      } else {
        newFromDate = currentFrom;
        newToDate = currentTo;
      }
    }

    // Call API with newFromDate and newToDate
    if (onPressData) {
      onPressData(
        id,
        device_id,
        newFromDate.format("YYYY-MM-DD"),
        newToDate.format("YYYY-MM-DD"),
      );
    }
  };

  // useEffect(() => {
  //   if (token) {
  //     handleControllerDropDown(LoginUserData);
  //   }
  // }, [token]);
  const handleControllerDropDown = () => {
    setLoader(true);
    const formdata = new FormData();
    formdata.append("controller_type", 1);
    formdata.append("report_for", 6);

    controllerdropdown(formdata)
      .then((res) => {
        if (res?.data) {
          // setControllerDropDown(res.data || []);
        }
      })
      .catch((err) => getCatchMsg(err))
      .finally(() => setLoader(false));
  };
  console.log(depthLinechartData, "depthLinechartData");
  const handleExport = async (type) => {
    const date = dayjs();
    let currentDate = date.startOf("month");

    const startDate = dayjs(depthLinechartData?.from_date)?.format(
      "DD-MM-YYYY",
    );
    const rawDate = dayjs(depthLinechartData?.from_date);
    const endDate = dayjs(depthLinechartData?.to_date)?.format("DD-MM-YYYY");
    const safeEndDate = dayjs(endDate).isValid()
      ? dayjs(endDate).format("DD-MM-YYYY")
      : startDate;
    if (type === "png") {
      try {
        console.log("PNG Export Triggered");

        let chartElement = null;

        const possibleSelectors = [
          "#depthLineChart",
          ".depth-line-chart-sec .card",
          ".react-apexchart",
          ".apexcharts-canvas",
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
            <b>Name:</b> ${LoginUserData?.name ?? ""} (Psdas)<br/>
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
          logging: false,
        });

        document.body.removeChild(wrapper);

        const imgData = canvas.toDataURL("image/png");
        const timestamp = new Date()
          .toISOString()
          .slice(0, 19)
          .replace(/[:T]/g, "-");
        const link = document.createElement("a");
        link.href = imgData;
        link.download = `${
          controllerData?.controller_name || "All"
        }_DepthLineChart_${timestamp}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Chart exported as PNG successfully!");
      } catch (err) {
        console.error("Error exporting PNG:", err);
        toast.error(
          "Error exporting PNG: " + (err?.message || "Unknown error"),
        );
      }
    }
    if (type === "xls") {
      try {
        const aggregatedData = depthLinechartData?.aggregated_data;
        if (!aggregatedData || aggregatedData.length === 0) {
          toast.error("No data available for Excel export");
          return;
        }

        const rows = [
          [`${LoginUserData?.name ?? "ADMIN"} (Psdas)`],
          ["Controller ID:", `${controllerData?.controller_code || ""}`],
          ["Group Name:", `${controllerData?.group_name || ""}`],
          [
            "Controller Name:",
            `${controllerData?.controller_name || "All Controller Details"}`,
          ],
          [""],
          [
            `Report for the period: ${startDate}  ${
              timeRange !== "daily"
                ? `to ${endDate}`
                  ? endDate
                  : `${safeEndDate}`
                : ""
            }`,
          ],
          [""],
          timeRange === "daily"
            ? [
                "SI.No",
                // " Received Time",
                "Motor Start Time",
                "Flow Rate Start Time",
                "Depth(feet)",
                "value",
              ]
            : [
                "SI.No",
                "Date",
                "Motor Start Time",
                // "Received Time",
                "Flow Rate Start Time",
                "Depth (feet)",
                "value",
              ],
        ];

        let serial = 1;
        const startDateObj = dayjs(depthLinechartData?.from_date);

        aggregatedData.forEach((item, index) => {
          const baseDate = startDateObj.add(index, "day");
          if (item.records && item.records.length > 0) {
            item.records.forEach((record) => {
              if (timeRange === "daily") {
                // Only push Time & Depth
                rows.push([
                  serial++,
                  // dayjs(record?.created_at).format("HH:mm:ss"),
                  record?.motor_start_time
                    ? dayjs(record?.motor_start_time).format("HH:mm:ss")
                    : "--",
                  record?.timing
                    ? dayjs(record?.timing).format("HH:mm:ss")
                    : "--",
                  record.depth ?? 0,
                  record.value ? record?.value : "--",
                ]);
              } else {
                // Include Date
                rows.push([
                  serial++,
                  dayjs(record?.created_at).format("DD-MM-YYYY"),
                  // dayjs(record?.created_at).format("HH:mm:ss"),
                  record?.motor_start_time
                    ? dayjs(record?.motor_start_time).format("HH:mm:ss")
                    : "--",
                  record?.timing
                    ? dayjs(record?.timing).format("HH:mm:ss")
                    : "--",
                  record.depth ?? 0,
                  record.value ? record?.value : "--",
                ]);
              }
            });
          } else {
            // Handle no records
            if (timeRange === "daily") {
              rows.push([serial++, "-", 0]);
            } else {
              rows.push([serial++, baseDate.format("DD-MM-YYYY"), "-", 0]);
            }
          }
        });

        // ✅ Add Total Depth Summary (based on column count)
        // if (timeRange === "daily") {
        //   rows.push(["", "Total Depth (m):", totalDepth]);
        // } else {
        //   rows.push(["", "", "Total Depth (m):", totalDepth]);
        // }

        // Create workbook and sheet
        const ws = XLSX.utils.aoa_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Depth Line Chart");

        // 🎨 Colors
        const COLORS = {
          blue: "4F81BD",
          green: "00B050",
          purple: "B3A2C7",
          white: "FFFFFF",
          black: "000000",
          gray: "F2F2F2",
        };

        const range = XLSX.utils.decode_range(ws["!ref"]);

        // ✅ Styling
        // ✅ Styling
        for (let R = range.s.r; R <= range.e.r; ++R) {
          for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
            const cell = ws[cellRef];
            if (!cell) continue;

            const isTitle = R === 0;
            const isMeta = R > 0 && R < 4;
            const isReportHeader = R === 5;
            const isTableHeader = R === 7;

            cell.s = {
              font: {
                name: "Calibri",
                sz: isTitle ? 16 : 12,
                bold: isTitle || isTableHeader || isReportHeader,
                color: {
                  rgb: isTitle || isReportHeader ? COLORS.white : COLORS.black,
                },
              },
              alignment: {
                horizontal: "center",
                vertical: "center",
                wrapText: true,
              },
              border: {
                top: { style: "thin", color: { rgb: COLORS.black } },
                left: { style: "thin", color: { rgb: COLORS.black } },
                bottom: { style: "thin", color: { rgb: COLORS.black } },
                right: { style: "thin", color: { rgb: COLORS.black } },
              },
              fill: {
                fgColor: {
                  rgb: isTitle
                    ? COLORS.blue
                    : isReportHeader
                      ? COLORS.green
                      : isTableHeader
                        ? COLORS.purple
                        : COLORS.white, // ✅ No blue at the end
                },
              },
            };
          }
        }

        // ✅ Merge cells
        // ws["!merges"] = [
        //   { s: { r: 0, c: 0 }, e: { r: 0, c: timeRange === "daily" ? 2 : 3 } },
        //   { s: { r: 5, c: 0 }, e: { r: 5, c: timeRange === "daily" ? 2 : 3 } },
        // ];

        const totalColumns = timeRange === "daily" ? 6 : 7;

        ws["!merges"] = [
          // ADMIN (Psdas)
          { s: { r: 0, c: 0 }, e: { r: 0, c: totalColumns - 1 } },

          // Report period row
          { s: { r: 5, c: 0 }, e: { r: 5, c: totalColumns - 1 } },
        ];

        // ✅ Dynamic Column Widths
        ws["!cols"] =
          timeRange === "daily"
            ? [
                { width: 20 }, // SI.No
                { width: 30 }, // Time
                { width: 25 },
                { width: 35 },
                { width: 35 }, // Depth
                { width: 35 },
              ]
            : [
                { width: 30 }, // SI.No
                { width: 35 }, // Date
                { width: 35 }, // Time
                { width: 35 }, // Depth
                { width: 35 },
                { width: 35 },
                { width: 35 },
              ];

        // ✅ Row heights
        ws["!rows"] = Array.from({ length: range.e.r + 1 }, (_, i) => ({
          hpt:
            i === 0
              ? 30 // Main title
              : i === 5
                ? 24 // Report period row
                : i === 7
                  ? 36 // 🔥 TABLE HEADER (important)
                  : 20, // Normal rows
        }));

        // ✅ Save File
        const timestamp = new Date()
          .toISOString()
          .slice(0, 19)
          .replace(/[:T]/g, "-");
        XLSX.writeFile(
          wb,
          `${
            controllerData?.controller_name || "All"
          }_DepthLineChart_${timestamp}.xlsx`,
          { bookType: "xlsx" },
        );

        toast.success("Depth Line Chart Excel exported successfully!");
      } catch (err) {
        console.error("Error exporting Excel:", err);
        toast.error(
          "Error exporting Excel: " + (err?.message || "Unknown error"),
        );
      }
    }
  };

  return (
    <div>
      {/* Header & Toggle Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
          padding: "20px",
        }}
      >
        <p style={{ fontSize: "20px", margin: 0 }}>{title}</p>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "flex-end",
            gap: 5,
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", gap: "2px" }}>
            {timeRangeButtons.map((btn) => (
              <button
                key={btn.key}
                onClick={() => handleButtonClick(btn.key, btn.id)}
                style={{
                  fontWeight: "400",
                  padding: "6px 10px",
                  fontSize: "15px",
                  borderRadius: "4px",
                  border:
                    timeRange === btn.key
                      ? "1px solid #176BA0"
                      : "1px solid #ccc",
                  backgroundColor: timeRange === btn.key ? "#2C67BA" : "white",
                  color: timeRange == btn.key ? "white" : "black",
                  cursor: "pointer",
                }}
              >
                {btn.label}
              </button>
            ))}
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
                    minHeight: "80px",
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
          </div>
          <div
            className="from_to_date"
            style={{
              paddingLeft: "10px",
              display: "flex",
              gap: "10px",
              justifyContent: "center",
              alignItems: "center",
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
                value: ele?.controller_id,
              }))}
              placeholder={"Select Device"}
            />
            <div>
              {timeRange === "weekly" && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {/* Previous Week */}
                  <span
                    onClick={() =>
                      onFetchConsumptionChart(
                        timeRangeButtons?.find((ele) => ele?.key === timeRange)
                          ?.id,
                        values?.device_id,
                        "previous",
                      )
                    }
                    style={{ cursor: "pointer", fontWeight: "bold" }}
                  >
                    {"<"}
                  </span>

                  {/* Current week range */}
                  <span>
                    {`${dayjs(depthLinechartData?.from_date)?.format(
                      "DD-MM",
                    )} - ${dayjs(depthLinechartData?.to_date)?.format(
                      "DD-MM",
                    )}`}
                  </span>

                  {/* Next Week (disabled if to_date >= today) */}
                  {(() => {
                    const toDate = dayjs(depthLinechartData?.to_date);
                    const today = dayjs();

                    const isFutureDisabled = toDate.isAfter(today, "day"); // disable if next week exceeds today

                    return (
                      <span
                        onClick={() => {
                          if (!isFutureDisabled) {
                            onFetchConsumptionChart(
                              timeRangeButtons?.find(
                                (ele) => ele?.key === timeRange,
                              )?.id,
                              values?.device_id,
                              "next",
                            );
                          }
                        }}
                        style={{
                          cursor: isFutureDisabled ? "not-allowed" : "pointer",
                          fontWeight: "bold",
                          opacity: isFutureDisabled ? 0.4 : 1,
                          color: isFutureDisabled ? "#999" : "black",
                        }}
                      >
                        {">"}
                      </span>
                    );
                  })()}
                </div>
              )}

              {timeRange === "monthly" && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {/* Previous Week */}
                  <span
                    onClick={() =>
                      onFetchConsumptionChart(
                        timeRangeButtons?.find((ele) => ele?.key === timeRange)
                          ?.id,
                        values?.device_id,
                        "previous",
                      )
                    }
                    style={{ cursor: "pointer", fontWeight: "bold" }}
                  >
                    {"<"}
                  </span>

                  {/* Current week range */}
                  <span>
                    {`${dayjs(depthLinechartData?.from_date)?.format(
                      "DD-MM-YYYY",
                    )}`}
                  </span>

                  {/* Next Week (disabled if to_date >= today) */}
                  {(() => {
                    const toDate = dayjs(depthLinechartData?.from_date);
                    const today = dayjs();

                    const isFutureDisabled = toDate.isAfter(today, "month"); // disable if next week exceeds today

                    return (
                      <span
                        onClick={() => {
                          if (!isFutureDisabled) {
                            onFetchConsumptionChart(
                              timeRangeButtons?.find(
                                (ele) => ele?.key === timeRange,
                              )?.id,
                              values?.device_id,
                              "next",
                            );
                          }
                        }}
                        style={{
                          cursor: isFutureDisabled ? "not-allowed" : "pointer",
                          fontWeight: "bold",
                          opacity: isFutureDisabled ? 0.4 : 1,
                          color: isFutureDisabled ? "#999" : "black",
                        }}
                      >
                        {">"}
                      </span>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <ReactApexChart
        id="depthLineChart"
        options={chartOptions}
        series={chartData.series}
        type="area"
        height={350}
      />
    </div>
  );
}

export default DepthLinechart;
