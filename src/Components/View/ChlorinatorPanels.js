import { useMemo } from "react";
import chlorineImage from "../../Assets/image/chlorine.png";
import { chlorinatorTicked } from "../../Utilities/Constants";
import {
  onOffText,
  pumpText,
  reading100,
  FlowStatus,
} from "./ViewController/HistoryDetails/ChlorinatorHistoryDetails";

const hasValue = (value) =>
  value !== null && value !== undefined && value !== "";

const flag = (value) => (hasValue(value) ? parseInt(value, 10) : null);

const COLORS = {
  border: "#E3E8EF",
  sub: "#6B7785",
  text: "#1B2430",
  primary: "#1677F2",
  green: "#22A06B",
  greenBg: "#E6F6EE",
  grayBg: "#EEF1F5",
  red: "#E5484D",
  redBg: "#FDECEC",
  purple: "#7C5CFA",
  purpleBg: "#F1EDFF",
  orange: "#D97706",
  orangeBg: "#FEF3E2",
};

// pH colour and name: acid is red, neutral green, alkaline blue and purple.
const phInfo = (ph) => {
  if (ph === null) return { name: "-", color: COLORS.sub };
  if (ph < 3) return { name: "Strong acid", color: "#E5484D" };
  if (ph < 6) return { name: "Acidic", color: "#F59E0B" };
  if (ph < 6.5) return { name: "Slightly acidic", color: "#C9C21F" };
  if (ph <= 7.5) return { name: "Neutral", color: "#22A06B" };
  if (ph <= 8.5) return { name: "Slightly alkaline", color: "#1BA5C9" };
  if (ph < 11) return { name: "Alkaline", color: "#1677F2" };
  return { name: "Strong alkaline", color: "#7C5CFA" };
};

const phNumber = (ph) => {
  const shown = reading100(ph);
  const parsed = hasValue(shown) ? parseFloat(shown) : NaN;
  return { shown, number: Number.isNaN(parsed) ? null : parsed };
};

const BEAKER = "M16 14 H58 V22 L66 80 Q67 90 57 90 H17 Q7 90 8 80 L16 22 Z";

const CSS = `
@keyframes chl-bub{0%{transform:translateY(0);opacity:.8}100%{transform:translateY(-18px);opacity:0}}
@keyframes chl-wave{0%{transform:translateX(0)}100%{transform:translateX(-24px)}}
@keyframes chl-spin{to{transform:rotate(360deg)}}
@keyframes chl-drip{0%{transform:translateY(-2px);opacity:0}30%{opacity:1}100%{transform:translateY(5px);opacity:0}}
.chl-bub{animation:chl-bub 2.4s linear infinite}
.chl-wave{animation:chl-wave 2s linear infinite}
.chl-flow{animation:chl-wave 1.2s linear infinite}
.chl-spin{animation:chl-spin 1.4s linear infinite;transform-origin:12px 12px}
.chl-drip{animation:chl-drip 1.2s linear infinite}
@keyframes chl-gfront{from{transform:translateX(0)}to{transform:translateX(calc(var(--chl-s) * -1))}}
@keyframes chl-gback{from{transform:translateX(calc(var(--chl-s) * -1))}to{transform:translateX(0)}}
@keyframes chl-ribbon{from{transform:translateX(0)}to{transform:translateX(48px)}}
.chl-ribbon-move{animation:chl-ribbon 1.2s linear infinite}
`;

// The cards are small: the whole set has to fit in the controller card (460px high).
const cardStyle = (alert) => ({
  background: alert ? COLORS.redBg : "#fff",
  border: `1px solid ${alert ? COLORS.red : COLORS.border}`,
  borderRadius: "10px",
  padding: "7px 10px",
  color: COLORS.text,
  minWidth: 0,
});

// The four cards on the top row all have this shape.
const tileStyle = (color, tint) => ({
  height: "96px",
  minWidth: 0,
  border: `2px solid ${color}`,
  borderRadius: "10px",
  background: tint || "#fff",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  padding: "4px",
});

const ImageTile = () => (
  <div style={{ ...tileStyle(COLORS.primary), border: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.10)" }}>
    <img src={chlorineImage} alt="chlorinator" style={{ width: 84, height: 84 }} />
  </div>
);

const ValueTile = ({ label, value, unit, color, tint }) => (
  <div style={{ ...tileStyle(color, tint), border: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.10)" }}>
    <p style={{ fontSize: "11px", margin: 0, color: COLORS.text }}>{label}</p>
    <p style={{ fontSize: "22px", fontWeight: 600, margin: "2px 0 0", color: COLORS.text, lineHeight: "24px" }}>
      {hasValue(value) ? value : "-"}
    </p>
    <p style={{ fontSize: "10px", margin: 0, color: COLORS.text }}>{unit && hasValue(value) ? unit : " "}</p>
  </div>
);

// Top row: the pH value only (the beaker with its animation is the card below).
const PhValueTile = ({ ph }) => {
  const { shown, number } = phNumber(ph);
  return (
    <ValueTile
      label="pH"
      value={number === null ? null : shown}
      unit=""
      color="#0EA5E9"
      tint="#E6F7FF"
    />
  );
};

// The pH card: the beaker in the pH colour with bubbles rising, the value and
// its name, and a 0 to 14 scale with a pointer.
const PhCard = ({ ph, uid }) => {
  const { shown, number } = phNumber(ph);
  const info = phInfo(number);
  const pointer = number === null ? 0 : Math.max(0, Math.min(14, number)) / 14;
  const bubble = (left, size, delay) => (
    <span
      className="chl-bub"
      style={{
        position: "absolute",
        left,
        bottom: 6,
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#fff",
        animationDelay: delay,
      }}
    />
  );
  return (
    <div style={{ ...cardStyle(false), display: "flex", alignItems: "center", gap: "12px" }}>
      <div style={{ position: "relative", width: 36, height: 46, flexShrink: 0 }}>
        <svg width="36" height="46" viewBox="0 0 74 96">
          <defs>
            <clipPath id={`chl-beaker-${uid}`}>
              <path d={BEAKER} />
            </clipPath>
          </defs>
          {number !== null ? (
            <g clipPath={`url(#chl-beaker-${uid})`}>
              <rect x="0" y="34" width="74" height="70" fill={info.color} opacity="0.85" />
              <rect x="0" y="34" width="74" height="4" fill="#fff" opacity="0.35" />
            </g>
          ) : null}
          <path d={BEAKER} fill="none" stroke="#5F6B7A" strokeWidth="3" strokeLinejoin="round" />
        </svg>
        {number !== null ? (
          <>
            {bubble(11, 4, "0s")}
            {bubble(21, 3, "0.7s")}
            {bubble(16, 4, "1.3s")}
          </>
        ) : null}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
          <span style={{ fontSize: "22px", fontWeight: 600, lineHeight: "24px", color: info.color }}>
            {number === null ? "-" : shown}
          </span>
          <span style={{ fontSize: "11px", color: info.color }}>{info.name}</span>
        </div>
        <div
          style={{
            position: "relative",
            height: "7px",
            borderRadius: "4px",
            marginTop: "5px",
            background:
              "linear-gradient(90deg,#E5484D 0%,#F59E0B 22%,#E6D52B 36%,#22A06B 50%,#1BA5C9 66%,#1677F2 80%,#7C5CFA 100%)",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "-3px",
              left: `${pointer * 100}%`,
              width: "3px",
              height: "13px",
              marginLeft: "-1.5px",
              borderRadius: "2px",
              background: COLORS.text,
              border: "1px solid #fff",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "9px",
            color: COLORS.sub,
            marginTop: "2px",
          }}
        >
          <span>0</span>
          <span>7</span>
          <span>14</span>
        </div>
      </div>
    </div>
  );
};

// The title sits on the left, in the middle of the card; the picture is centred.
const titleStyle = (alert) => ({
  fontSize: "11px",
  color: alert ? COLORS.red : COLORS.sub,
  letterSpacing: "0.3px",
  margin: 0,
  flexShrink: 0,
});

const picture = {
  flex: "0 0 auto",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 0,
};

const rowCard = (alert) => ({
  ...cardStyle(alert),
  display: "flex",
  alignItems: "center",
  height: "88px",
  boxSizing: "border-box",
  justifyContent: "center",
  gap: "14px",
  padding: "6px 10px",
});

// The same tank and pipe as the mobile app (WaterGauge and LiquidRibbonFlow),
// drawn with SVG and CSS animation.

// One wave period is exactly `size` wide, so sliding the wave by `size` loops
// without a jump.
const wavePath = (size, amp, height, phase) => {
  const width = size * 2;
  let d = `M0 ${amp}`;
  for (let x = 0; x <= width; x += 3) {
    const y = amp + amp * Math.sin((x / size) * 2 * Math.PI + phase);
    d += ` L${x} ${y.toFixed(2)}`;
  }
  return `${d} L${width} ${height} L0 ${height} Z`;
};

// A round tank: water rises to the level and the surface keeps waving (a back
// wave and a front wave moving the other way).
const WaterGauge = ({
  size = 64,
  level = 0,
  color = "#7FD8FF",
  backColor = "#BFEBFF",
  rimColor = "#D6EFFB",
}) => {
  const pct = Math.max(0, Math.min(100, level));
  const amp = Math.max(2, size * 0.05);
  const waveHeight = size + amp * 3;
  const backPath = useMemo(() => wavePath(size, amp, waveHeight, 1.6), [size, amp, waveHeight]);
  const frontPath = useMemo(() => wavePath(size, amp, waveHeight, 0), [size, amp, waveHeight]);
  // empty: the wave is below the circle; full: its surface is at the top
  const top = size + amp - (pct / 100) * (size + amp * 2);
  const wave = (path, fill, animation) => (
    <svg
      width={size * 2}
      height={waveHeight}
      style={{
        position: "absolute",
        left: 0,
        top,
        transition: "top 1s cubic-bezier(0.215, 0.61, 0.355, 1)",
        animation,
      }}
    >
      <path d={path} fill={fill} />
    </svg>
  );
  return (
    <div
      style={{
        "--chl-s": `${size}px`,
        position: "relative",
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        background: "#fff",
        border: `2px solid ${rimColor}`,
        boxSizing: "border-box",
        flexShrink: 0,
      }}
    >
      {wave(backPath, backColor, "chl-gback 3.8s linear infinite")}
      {wave(frontPath, color, "chl-gfront 2.6s linear infinite")}
    </div>
  );
};

// A small horizontal pipe. With flow the blue water inside it moves from left
// to right as smooth ribbons; without flow the pipe is shown empty.
const FlowPipe = ({ flowing, width = 122, uid }) => {
  const height = (86 * width) / 220;
  return (
    <svg width={width} height={height} viewBox="0 0 220 86" style={{ display: "block" }}>
      <defs>
        <linearGradient id={`chl-ribbon-water-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7de0fc" />
          <stop offset="0.55" stopColor="#0ea5e9" />
          <stop offset="1" stopColor="#0474bb" />
        </linearGradient>
        <clipPath id={`chl-ribbon-clip-${uid}`}>
          <rect x="15" y="25" width="190" height="36" rx="4" />
        </clipPath>
      </defs>
      <rect x="8" y="20" width="204" height="46" rx="8" fill="#d5e2ea" stroke="#7894a6" strokeWidth="2" />
      <rect x="15" y="25" width="190" height="36" rx="4" fill="#e4f4fa" />
      {flowing ? (
        <g clipPath={`url(#chl-ribbon-clip-${uid})`}>
          <rect x="15" y="25" width="190" height="36" fill={`url(#chl-ribbon-water-${uid})`} />
          <g className="chl-ribbon-move">
            {Array.from({ length: 7 }, (_, i) => (
              <path
                key={i}
                d="M0 0 Q12 -14 24 0 T48 0"
                transform={`translate(${-33 + i * 48} 43)`}
                stroke="#b8f3ff"
                strokeWidth="7"
                strokeLinecap="round"
                opacity="0.75"
                fill="none"
              />
            ))}
          </g>
        </g>
      ) : null}
      <path d="M18 28 H202" stroke="white" strokeWidth="3" opacity="0.55" strokeLinecap="round" />
      <rect x="5" y="16" width="12" height="54" rx="3" fill="#9cb1c0" stroke="#71899a" />
      <rect x="203" y="16" width="12" height="54" rx="3" fill="#9cb1c0" stroke="#71899a" />
    </svg>
  );
};

// Tank: 1 is the round tank with moving water at half, 0 is an empty tank and
// the card turns red.
const TankCard = ({ value }) => {
  const state = flag(value);
  const half = state === 1;
  const empty = state === 0;
  return (
    <div style={rowCard(empty)}>
      <p style={titleStyle(empty)}>TANK</p>
      <div style={picture}>
        <WaterGauge
          size={64}
          level={half ? 50 : 0}
          rimColor={empty ? COLORS.red : "#D6EFFB"}
          backColor={empty ? "#FADADC" : "#BFEBFF"}
        />
      </div>
    </div>
  );
};

// Flow: the pipe shows water flowing when the pressure switch is 1; with 0 the
// card is red.
const FlowCard = ({ value, uid }) => {
  const state = flag(value);
  const flowing = state === 1;
  const stopped = state === 0;
  return (
    <div style={rowCard(stopped)}>
      <p style={titleStyle(stopped)}>FLOW</p>
      <div style={picture}>
        <FlowPipe flowing={flowing} uid={uid} />
        <p style={{ fontSize: "11px", margin: 0, lineHeight: "14px" }}>
          <FlowStatus value={value} />
        </p>
      </div>
    </div>
  );
};

const SwitchIcon = ({ on }) => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    stroke={on ? COLORS.green : "#5F6B7A"}
    strokeWidth="2.2"
    strokeLinecap="round"
  >
    <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
    <path d="M12 2v10" />
  </svg>
);

const PumpIcon = ({ running }) => (
  <div style={{ position: "relative", width: 26, height: 29, margin: "0 auto" }}>
    <svg width="26" height="29" viewBox="0 0 24 28">
      <rect x="4" y="2" width="16" height="12" rx="3" fill="#EEF1F5" stroke="#5F6B7A" strokeWidth="2" />
      <path d="M12 14 v4" stroke="#5F6B7A" strokeWidth="2.4" />
    </svg>
    {running ? (
      <span
        className="chl-drip"
        style={{
          position: "absolute",
          left: 10,
          top: 19,
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: COLORS.primary,
        }}
      />
    ) : null}
  </div>
);

const AgitatorIcon = ({ on }) => (
  <svg width="26" height="26" viewBox="0 0 24 24">
    <g className={on ? "chl-spin" : undefined}>
      <circle cx="12" cy="12" r="2" fill={on ? COLORS.green : "#5F6B7A"} />
      <path
        d="M12 12 L12 3 M12 12 L20 16.5 M12 12 L4 16.5"
        stroke={on ? COLORS.green : "#5F6B7A"}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </g>
  </svg>
);

const Cell = ({ icon, label, text, on, first }) => (
  <div
    style={{
      flex: 1,
      minWidth: 0,
      textAlign: "center",
      borderLeft: first ? "none" : `1px solid ${COLORS.border}`,
    }}
  >
    <div style={{ display: "flex", justifyContent: "center" }}>{icon}</div>
    <p style={{ fontSize: "12px", color: COLORS.sub, margin: "3px 0", lineHeight: "15px" }}>{label}</p>
    <span
      style={{
        display: "inline-block",
        fontSize: "12px",
        lineHeight: "17px",
        padding: "0 10px",
        borderRadius: "999px",
        background: on ? COLORS.greenBg : COLORS.grayBg,
        color: on ? COLORS.green : COLORS.sub,
      }}
    >
      {text}
    </span>
  </div>
);

// Dosing switch, dosing pump and agitator side by side.
const SwitchesCard = ({ unit }) => {
  const switchOn = flag(unit?.dosing_switch) === 1;
  const pump = flag(unit?.dosing_pump);
  const pumpOn = pump === 1 || pump === 2 || pump === 3;
  const agitatorOn = flag(unit?.agitator) === 1;
  return (
    <div style={{ ...cardStyle(false), display: "flex", alignItems: "center", height: "88px", boxSizing: "border-box", padding: 0 }}>
      <Cell
        first
        icon={<SwitchIcon on={switchOn} />}
        label="Dosing switch"
        text={onOffText(unit?.dosing_switch)}
        on={switchOn}
      />
      <Cell
        icon={<PumpIcon running={pumpOn && switchOn} />}
        label="Dosing pump"
        text={pumpText(unit?.dosing_pump)}
        on={pumpOn}
      />
      <Cell
        icon={<AgitatorIcon on={agitatorOn} />}
        label="Agitator"
        text={onOffText(unit?.agitator)}
        on={agitatorOn}
      />
    </div>
  );
};

// The inner cards of the chlorinator card in the controller list (the mobile app
// design, small and animated): a row of four equal value cards (picture, TDS,
// chlorine, pH), the pH card with its animation, the tank and the flow, and the
// switches.
export default function ChlorinatorPanels({ unit }) {
  const uid = unit?.device_id ?? "x";
  // The readings ticked on the production page: R1 status (the tank, the flow and
  // the switches), R2 pH, R3 TDS, R4 chlorine. A checklist never edited shows all.
  const ticks = chlorinatorTicked(unit?.chlorinator_position);
  const tiles = 1 + [2, 3, 4].filter((r) => ticks.includes(r)).length;
  return (
    <>
      <style>{CSS}</style>
      <div style={{ width: "100%", marginTop: "4px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${tiles}, 1fr)`, gap: "8px" }}>
          <ImageTile />
          {ticks.includes(3) ? (
            <ValueTile label="TDS" value={unit?.tds} unit="ppm" color="#FF4D5A" tint="#FCE7E4" />
          ) : null}
          {ticks.includes(4) ? (
            <ValueTile
              label="Chlorine"
              value={reading100(unit?.chlorine)}
              unit="ppm"
              color="#FBBF24"
              tint="#FFFFE5"
            />
          ) : null}
          {ticks.includes(2) ? <PhValueTile ph={unit?.ph} /> : null}
        </div>
        {ticks.includes(2) ? <PhCard ph={unit?.ph} uid={uid} /> : null}
        {ticks.includes(1) ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <TankCard value={unit?.float_status} uid={uid} />
              <FlowCard value={unit?.pressure_switch} uid={uid} />
            </div>
            <SwitchesCard unit={unit} />
          </>
        ) : null}
      </div>
    </>
  );
}
