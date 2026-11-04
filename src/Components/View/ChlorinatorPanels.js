import chlorineImage from "../../Assets/image/chlorine.png";
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

// Tank: 1 is the round tank with moving water, 0 is an empty tank and the card
// turns red.
const TankCard = ({ value, uid }) => {
  const state = flag(value);
  const half = state === 1;
  const empty = state === 0;
  return (
    <div style={rowCard(empty)}>
      <p style={titleStyle(empty)}>TANK</p>
      <div style={picture}>
        <svg width="62" height="62" viewBox="0 0 62 62">
          <defs>
            <clipPath id={`chl-tank-${uid}`}>
              <circle cx="31" cy="31" r="27" />
            </clipPath>
          </defs>
          <circle cx="31" cy="31" r="27" fill={empty ? "#FADADC" : "#BFEBFF"} />
          {half ? (
            <g clipPath={`url(#chl-tank-${uid})`}>
              <rect x="0" y="31" width="62" height="34" fill="#38B6F0" />
              <g className="chl-wave">
                <path
                  d="M0 31 Q6 26 12 31 T24 31 T36 31 T48 31 T60 31 T72 31 T84 31 V38 H0 Z"
                  fill="#7DD3F7"
                />
              </g>
            </g>
          ) : null}
          <circle
            cx="31"
            cy="31"
            r="27"
            fill="none"
            stroke={empty ? COLORS.red : "#D6EFFB"}
            strokeWidth="3"
          />
        </svg>
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
        <svg width="100" height="48" viewBox="0 12 104 40">
          <defs>
            <clipPath id={`chl-pipe-${uid}`}>
              <rect x="9" y="23" width="86" height="18" />
            </clipPath>
          </defs>
          <rect x="6" y="20" width="92" height="24" rx="4" fill="#E6F1FB" stroke="#9AA7B5" strokeWidth="2" />
          {flowing ? (
            <g clipPath={`url(#chl-pipe-${uid})`}>
              <rect x="9" y="23" width="86" height="18" fill="#38B6F0" />
              <g className="chl-flow">
                <path
                  d="M0 32 Q6 24 12 32 T24 32 T36 32 T48 32 T60 32 T72 32 T84 32 T96 32 T108 32 T120 32"
                  fill="none"
                  stroke="#E6F7FF"
                  strokeWidth="3"
                />
              </g>
            </g>
          ) : null}
          <rect x="0" y="16" width="8" height="32" rx="2" fill="#5F6B7A" />
          <rect x="96" y="16" width="8" height="32" rx="2" fill="#5F6B7A" />
        </svg>
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
  const pumpOn = pump === 1 || pump === 2;
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
  return (
    <>
      <style>{CSS}</style>
      <div style={{ width: "100%", marginTop: "4px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
          <ImageTile />
          <ValueTile label="TDS" value={unit?.tds} unit="ppm" color="#FF4D5A" tint="#FCE7E4" />
          <ValueTile
            label="Chlorine"
            value={reading100(unit?.chlorine)}
            unit="ppm"
            color="#FBBF24"
            tint="#FFFFE5"
          />
          <PhValueTile ph={unit?.ph} />
        </div>
        <PhCard ph={unit?.ph} uid={uid} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          <TankCard value={unit?.float_status} uid={uid} />
          <FlowCard value={unit?.pressure_switch} uid={uid} />
        </div>
        <SwitchesCard unit={unit} />
      </div>
    </>
  );
}
