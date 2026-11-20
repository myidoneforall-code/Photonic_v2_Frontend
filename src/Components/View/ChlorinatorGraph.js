import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaArrowDown, FaArrowLeft, FaArrowUp, FaCalendarAlt, FaChartLine } from "react-icons/fa";
import { ChlorinatorSeriesService } from "../../Service/ApiService";

// The graph of one reading (TDS, chlorine or pH) of a chlorinator, as a page of its own: touching a
// tile of the chlorinator card opens it, Back returns to the page before.
const METRICS = {
  tds: { title: "TDS", color: "#E5484D" },
  chlorine: { title: "Chlorine", color: "#D9A400" },
  ph: { title: "pH", color: "#0EA5E9" },
};
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const pad = (n) => String(n).padStart(2, "0");
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return ymd(d);
};
const parse = (text) => new Date(text.replace(" ", "T"));
const show = (value) => (value === null || value === undefined ? "-" : Number(value).toString());
const dm = (date) => `${pad(date.getDate())} ${MONTHS[date.getMonth()]}`;

// a smooth line through the points that never goes above or below them (monotone cubic)
function smoothPath(xy) {
  if (xy.length === 0) return "";
  if (xy.length === 1) return `M${xy[0][0]},${xy[0][1]}`;
  const n = xy.length;
  const dx = [];
  const slope = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(xy[i + 1][0] - xy[i][0]);
    slope.push(dx[i] === 0 ? 0 : (xy[i + 1][1] - xy[i][1]) / dx[i]);
  }
  const tangent = [slope[0]];
  for (let i = 1; i < n - 1; i++) {
    tangent.push(slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2);
  }
  tangent.push(slope[n - 2]);
  for (let i = 0; i < n - 1; i++) {
    if (slope[i] === 0) {
      tangent[i] = 0;
      tangent[i + 1] = 0;
    } else {
      const a = tangent[i] / slope[i];
      const b = tangent[i + 1] / slope[i];
      const s = a * a + b * b;
      if (s > 9) {
        const t = 3 / Math.sqrt(s);
        tangent[i] = t * a * slope[i];
        tangent[i + 1] = t * b * slope[i];
      }
    }
  }
  let d = `M${xy[0][0]},${xy[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const c1x = xy[i][0] + dx[i] / 3;
    const c1y = xy[i][1] + (tangent[i] * dx[i]) / 3;
    const c2x = xy[i + 1][0] - dx[i] / 3;
    const c2y = xy[i + 1][1] - (tangent[i + 1] * dx[i]) / 3;
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${xy[i + 1][0]},${xy[i + 1][1]}`;
  }
  return d;
}

function niceTicks(min, max, count = 4) {
  if (min === max) {
    const step = Math.abs(min) > 1 ? Math.abs(min) * 0.1 : 1;
    min -= step;
    max += step;
  }
  const raw = (max - min) / count;
  const power = Math.pow(10, Math.floor(Math.log10(raw)));
  const unit = [1, 2, 2.5, 5, 10].map((m) => m * power).find((s) => s >= raw) || raw;
  const start = Math.floor(min / unit) * unit;
  const ticks = [];
  for (let v = start; v <= max + unit * 0.999; v += unit) ticks.push(Number(v.toFixed(6)));
  return ticks;
}

const W = 600;
const H = 250;
const L = 44;
const R = 14;
const T = 18;
const B = 30;

function Chart({ points, color, unit }) {
  const [hover, setHover] = useState(null);

  const model = useMemo(() => {
    if (!points?.length) return null;
    const times = points.map((p) => parse(p.t).getTime());
    const values = points.map((p) => p.v);
    const tMin = times[0];
    const tMax = times[times.length - 1];
    const ticks = niceTicks(Math.min(...values), Math.max(...values));
    const yMin = ticks[0];
    const yMax = ticks[ticks.length - 1];
    const x = (t) => (tMax === tMin ? (L + W - R) / 2 : L + ((t - tMin) / (tMax - tMin)) * (W - L - R));
    const y = (v) => T + (1 - (v - yMin) / (yMax - yMin || 1)) * (H - T - B);
    const xy = points.map((p, i) => [x(times[i]), y(values[i])]);
    const top = values.indexOf(Math.max(...values));
    const labels = [];
    const span = tMax - tMin;
    for (let i = 0; i < 5; i++) {
      const t = tMin + (span * i) / 4;
      const date = new Date(t);
      labels.push({ x: x(t), text: span <= 86400000 * 1.5 ? `${pad(date.getHours())}:${pad(date.getMinutes())}` : dm(date) });
    }
    return { times, xy, ticks, y, top, labels, tMin, tMax };
  }, [points]);

  if (!model) {
    return (
      <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7785", fontSize: "14px" }}>
        No readings in this period
      </div>
    );
  }

  const base = H - B;
  const line = smoothPath(model.xy);
  const area = `${line} L${model.xy[model.xy.length - 1][0]},${base} L${model.xy[0][0]},${base} Z`;
  const shown = hover !== null ? hover : model.top;
  const [sx, sy] = model.xy[shown];
  const tip = `${show(points[shown].v)} ${unit} · ${parse(points[shown].t).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}`;
  const tipWidth = tip.length * 6.2 + 16;
  const tipX = Math.min(Math.max(sx - tipWidth / 2, L), W - R - tipWidth);
  const last = model.xy[model.xy.length - 1];

  const move = (e) => {
    const box = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - box.left) / box.width) * W;
    let best = 0;
    model.xy.forEach((p, i) => {
      if (Math.abs(p[0] - px) < Math.abs(model.xy[best][0] - px)) best = i;
    });
    setHover(best);
  };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="Graph"
      style={{ display: "block", touchAction: "pan-y" }}
      onMouseMove={move}
      onMouseLeave={() => setHover(null)}
      onTouchMove={(e) => move(e.touches[0] ? { currentTarget: e.currentTarget, clientX: e.touches[0].clientX } : e)}
      onTouchEnd={() => setHover(null)}
    >
      {model.ticks.map((tick) => (
        <g key={tick}>
          <line x1={L} x2={W - R} y1={model.y(tick)} y2={model.y(tick)} stroke="#eef1f5" />
          <text x={L - 6} y={model.y(tick) + 3} fontSize="10" fill="#8a94a1" textAnchor="end">
            {Number(tick.toFixed(2))}
          </text>
        </g>
      ))}
      {model.labels.map((label, i) => (
        <text key={i} x={label.x} y={H - 10} fontSize="10" fill="#8a94a1" textAnchor={i === 0 ? "start" : i === 4 ? "end" : "middle"}>
          {label.text}
        </text>
      ))}
      <path d={area} fill={color} opacity="0.12" />
      <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1={sx} x2={sx} y1={sy} y2={base} stroke={color} strokeDasharray="3 3" opacity="0.5" />
      <circle cx={last[0]} cy={last[1]} r="4" fill={color} />
      <circle cx={sx} cy={sy} r="5" fill="#ffffff" stroke={color} strokeWidth="2.5" />
      <rect x={tipX} y={Math.max(sy - 34, 2)} width={tipWidth} height="22" rx="6" fill="#1B2430" />
      <text x={tipX + tipWidth / 2} y={Math.max(sy - 34, 2) + 15} fontSize="11" fill="#ffffff" textAnchor="middle">
        {tip}
      </text>
    </svg>
  );
}

const card = { background: "#ffffff", borderRadius: "14px", padding: "12px 14px" };
const chipStyle = (on) => ({
  background: on ? "#1a6a9e" : "#ffffff",
  color: on ? "#ffffff" : "#1B2430",
  border: "none",
  borderRadius: "16px",
  padding: "5px 14px",
  fontSize: "13px",
  cursor: "pointer",
});
const dateStyle = {
  border: "none",
  borderRadius: "16px",
  padding: "5px 10px",
  fontSize: "13px",
  background: "#ffffff",
  color: "#1B2430",
};

export default function ChlorinatorGraph() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const metric = METRICS[state?.metric] ? state.metric : "tds";
  const { title, color } = METRICS[metric];
  const [from, setFrom] = useState(daysAgo(6));
  const [to, setTo] = useState(daysAgo(0));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!state?.device_id || !from || !to || from > to) return undefined;
    let live = true;
    setLoading(true);
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
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [state?.device_id, metric, from, to]);

  const range = (days) => {
    setFrom(daysAgo(days));
    setTo(daysAgo(0));
  };
  const is = (days) => from === daysAgo(days) && to === daysAgo(0);

  const stat = (label, value, icon, tint) => (
    <div style={{ ...card, flex: 1, padding: "10px 14px" }}>
      <div style={{ fontSize: "12px", color: "#6B7785", display: "flex", alignItems: "center", gap: "5px" }}>
        <span style={{ color: tint, display: "inline-flex" }}>{icon}</span>
        {label}
      </div>
      <div style={{ fontSize: "22px", fontWeight: 500, marginTop: "2px" }}>{show(value)}</div>
    </div>
  );

  return (
    <div style={{ maxWidth: "980px", margin: "0 auto", padding: "12px 0 24px" }}>
      <div style={{ background: "#EEF3F8", borderRadius: "18px", padding: "16px", color: "#1B2430" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            type="button"
            aria-label="Back"
            onClick={() => navigate(-1)}
            style={{ width: "34px", height: "34px", borderRadius: "50%", border: "none", background: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <FaArrowLeft size={14} />
          </button>
          <div>
            <div style={{ fontSize: "20px", fontWeight: 500 }}>{title}</div>
            <div style={{ fontSize: "12px", color: "#6B7785" }}>
              {state?.device_name || "Chlorinator"}
              {state?.device_code ? ` · ID ${state.device_code}` : ""}
            </div>
          </div>
        </div>

        {!state?.device_id ? (
          <p style={{ marginTop: "16px", fontSize: "14px" }}>Open a chlorinator card and touch TDS, Chlorine or pH to see its graph.</p>
        ) : (
          <>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", marginTop: "14px" }}>
              <button type="button" style={chipStyle(is(0))} onClick={() => range(0)}>
                Today
              </button>
              <button type="button" style={chipStyle(is(6))} onClick={() => range(6)}>
                7 days
              </button>
              <button type="button" style={chipStyle(is(29))} onClick={() => range(29)}>
                30 days
              </button>
              <span style={{ flex: 1 }} />
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <FaCalendarAlt size={13} color="#6B7785" />
                <input type="date" value={from} max={to} onChange={(e) => e.target.value && setFrom(e.target.value)} style={dateStyle} aria-label="From" />
                <span style={{ fontSize: "13px", color: "#6B7785" }}>to</span>
                <input type="date" value={to} min={from} onChange={(e) => e.target.value && setTo(e.target.value)} style={dateStyle} aria-label="To" />
              </span>
            </div>

            <div style={{ ...card, marginTop: "14px", minHeight: "230px", position: "relative" }}>
              {loading ? <div style={{ position: "absolute", right: "14px", top: "10px", fontSize: "12px", color: "#6B7785" }}>Loading...</div> : null}
              <Chart points={data?.points} color={color} unit={data?.unit || ""} />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
              {stat("Lowest", data?.min, <FaArrowDown size={11} />, "#22A06B")}
              {stat("Average", data?.avg, <FaChartLine size={11} />, "#1a6a9e")}
              {stat("Highest", data?.max, <FaArrowUp size={11} />, "#E5484D")}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
