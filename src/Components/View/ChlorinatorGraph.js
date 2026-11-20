import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import zoomPlugin from "chartjs-plugin-zoom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import moment from "moment";
import toast from "react-hot-toast";
import { FaArrowLeft } from "react-icons/fa";
import { ChlorinatorSeriesService } from "../../Service/ApiService";
import Loader from "../Loader";
import CommonDateTimePicker from "../CommonComponents/CommonDatePicker";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, zoomPlugin);

// The graph of one reading (TDS, chlorine or pH) of a chlorinator, as a page of its own: touching
// a tile of the chlorinator card opens it, Back returns to the page before. One merged page (no
// cards): the reading tabs, the range chips and the dates, the line graph (the design of the
// tank level graph) and Lowest / Average / Highest. Each reading has its own colour.
const METRICS = {
  tds: { title: "TDS", axis: "TDS (ppm)", color: "#E5484D", tint: "#FCE7E4", edge: "#E58A8E", text: "#a33036" },
  chlorine: { title: "Chlorine", axis: "Chlorine (ppm)", color: "#D9A400", tint: "#FFF6D6", edge: "#E8C14A", text: "#8a6a00" },
  ph: { title: "pH", axis: "pH", color: "#0EA5E9", tint: "#E6F7FF", edge: "#7CCBF0", text: "#0a6f9a" }
};
const LINE = "1px solid #e3e8ee";

const daysAgo = (n) => moment().subtract(n, "d").format("YYYY-MM-DD");
const show = (value) => (value === null || value === undefined ? "-" : Number(value).toString());
const hex = (color, alpha) => {
  const n = parseInt(color.slice(1), 16);
  return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

export default function ChlorinatorGraph() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [metric, setMetric] = useState(METRICS[state?.metric] ? state.metric : "tds");
  const [from, setFrom] = useState(daysAgo(6));
  const [to, setTo] = useState(daysAgo(0));
  const [data, setData] = useState(null);
  const [loader, setLoader] = useState(false);
  const { title, axis, color } = METRICS[metric];

  useEffect(() => {
    if (!state?.device_id || !from || !to || from > to) return undefined;
    let live = true;
    setLoader(true);
    ChlorinatorSeriesService(state.device_id, metric, from, to)
      .then(({ data: result }) => {
        if (live) setData(result);
      })
      .catch((err) => {
        if (live) {
          setData(null);
          toast.error(err?.response?.data?.detail?.toString() || "Something went wrong");
        }
      })
      .finally(() => live && setLoader(false));
    return () => {
      live = false;
    };
  }, [state?.device_id, metric, from, to]);

  const preset = (days) => {
    setFrom(daysAgo(days));
    setTo(daysAgo(0));
  };
  const is = (days) => from === daysAgo(days) && to === daysAgo(0);
  const pickFrom = (date) => {
    if (!date) return;
    const text = moment(date).format("YYYY-MM-DD");
    if (text > to) toast.error("The from date is after the to date");
    else setFrom(text);
  };
  const pickTo = (date) => {
    if (!date) return;
    const text = moment(date).format("YYYY-MM-DD");
    if (text < from) toast.error("The to date is before the from date");
    else setTo(text);
  };

  const points = data?.points || [];
  const chartData = {
    labels: points.map((point) => moment(point.t, "YYYY-MM-DD HH:mm:ss").format("DD-MM-YYYY HH:mm")),
    datasets: [
      {
        label: `${title}${data?.unit ? ` (${data.unit})` : ""}`,
        data: points.map((point) => point.v),
        borderColor: color,
        backgroundColor: hex(color, 0.15),
        pointBackgroundColor: color,
        pointRadius: 3,
        tension: 0.2,
        fill: true
      }
    ]
  };

  const outline = (on, item) => ({
    flex: "0 0 auto",
    minWidth: "92px",
    textAlign: "center",
    padding: "6px 18px",
    borderRadius: "5px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    border: `1.5px solid ${on ? item.color : item.edge}`,
    background: on ? item.color : item.tint,
    color: on ? "#ffffff" : item.text
  });
  const chip = (on) => ({
    border: `1px solid ${on ? color : "#c9c9c9"}`,
    background: on ? METRICS[metric].tint : "#ffffff",
    color: on ? color : "#555555",
    borderRadius: "5px",
    padding: "5px 14px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer"
  });

  const stat = (label, value, first) => (
    <div style={{ flex: 1, padding: "12px 20px", borderLeft: first ? "none" : LINE }}>
      <div style={{ fontSize: "13px", color: "#6B7785" }}>{label}</div>
      <div style={{ fontSize: "24px", fontWeight: 700, color }}>{show(value)}</div>
    </div>
  );

  return (
    <div style={{ background: "#ffffff", borderRadius: "6px", margin: "8px 0 24px", color: "#1d1d1f" }}>
      <Loader isLoader={loader} />
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 20px", borderBottom: LINE }}>
        <button
          type="button"
          aria-label="Back"
          onClick={() => navigate(-1)}
          style={{ width: "34px", height: "34px", borderRadius: "50%", border: "none", background: "#eaf3f8", color: "#1f78a4", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <FaArrowLeft size={14} />
        </button>
        <div>
          <div style={{ fontSize: "22px", fontWeight: 700, color }}>{title}</div>
          <div style={{ fontSize: "12px", color: "#6B7785" }}>
            {state?.device_name || "Chlorinator"}
            {state?.device_code ? ` · ID ${state.device_code}` : ""}
          </div>
        </div>
      </div>

      {!state?.device_id ? (
        <p style={{ padding: "20px", margin: 0 }}>Open a chlorinator card and touch TDS, Chlorine or pH to see its graph.</p>
      ) : (
        <>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", padding: "12px 20px", borderBottom: LINE }}>
            {Object.keys(METRICS).map((key) => (
              <button key={key} type="button" onClick={() => setMetric(key)} style={outline(metric === key, METRICS[key])}>
                {METRICS[key].title}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", padding: "12px 20px", borderBottom: LINE }}>
            <button type="button" style={chip(is(0))} onClick={() => preset(0)}>
              Today
            </button>
            <button type="button" style={chip(is(6))} onClick={() => preset(6)}>
              7 days
            </button>
            <button type="button" style={chip(is(29))} onClick={() => preset(29)}>
              30 days
            </button>
            <span style={{ flex: 1 }} />
            <label style={{ fontWeight: 700, margin: 0 }}>From</label>
            <CommonDateTimePicker value={new Date(`${from}T00:00:00`)} onChange={pickFrom} formate={"DD-MM-YYYY"} disableDate={true} isFuture={true} allowClear={false} />
            <label style={{ fontWeight: 700, margin: 0 }}>To</label>
            <CommonDateTimePicker value={new Date(`${to}T00:00:00`)} onChange={pickTo} formate={"DD-MM-YYYY"} disableDate={true} isFuture={true} allowClear={false} />
          </div>

          <div style={{ padding: "12px 20px" }}>
            {points.length > 0 ? (
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  plugins: {
                    decimation: { enabled: true, algorithm: "lttb", samples: 2000 },
                    zoom: {
                      zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: "x" },
                      pan: { enabled: true, mode: "x" }
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => `${context.dataset.label}: ${context.parsed.y}`
                      }
                    },
                    legend: { display: true, position: "top" },
                    title: { display: true, text: `${title} - ${state?.device_name || "Chlorinator"}`, font: { size: 20 } }
                  },
                  scales: {
                    x: { grid: { display: true }, title: { display: true, text: "Date and Time", font: { size: 20 }, color: "green" } },
                    y: { grid: { display: true }, title: { display: true, text: axis, font: { size: 20 }, color: "green" } }
                  }
                }}
              />
            ) : (
              <p style={{ textAlign: "center", margin: "40px 0", fontSize: "16px" }}>{loader ? "Loading..." : "No readings in this period"}</p>
            )}
          </div>

          <div style={{ display: "flex", borderTop: LINE }}>
            {stat("Lowest", data?.min, true)}
            {stat("Average", data?.avg)}
            {stat("Highest", data?.max)}
          </div>
        </>
      )}
    </div>
  );
}
