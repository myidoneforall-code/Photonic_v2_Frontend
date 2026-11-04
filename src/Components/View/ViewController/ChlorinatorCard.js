import chlorineImage from "../../../Assets/image/chlorine.png";
import { chlorinatorTicked } from "../../../Utilities/Constants";
import {
  onOffText,
  pumpText,
  reading100,
  FlowStatus,
  TankLight,
} from "./HistoryDetails/ChlorinatorHistoryDetails";

const hasValue = (value) =>
  value !== null && value !== undefined && value !== "";

const show = (value) => (hasValue(value) ? value : "-");

const cell = (label, value, color) => (
  <div
    style={{
      minWidth: "110px",
      padding: "8px 12px",
      borderRadius: "10px",
      background: "#f3f7fb",
      textAlign: "center",
    }}
  >
    <div style={{ fontSize: "12px", color: "#6b7785" }}>{label}</div>
    <div style={{ fontSize: "18px", fontWeight: 700, color: color || "#1b2430" }}>
      {value}
    </div>
  </div>
);

// The chlorinators on a controller: their symbol and the latest values they
// sent (pH, TDS, chlorine and the state of each switch).
export default function ChlorinatorCard({ controllerdata }) {
  const units = controllerdata?.chlorinator || [];
  if (units.length === 0) {
    return null;
  }
  return (
    <>
      {units.map((unit, index) => (
        <div
          key={unit?.device_id ?? index}
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            margin: "12px 0",
            padding: "14px 16px",
            borderRadius: "14px",
            background: "#ffffff",
            boxShadow: "0 1px 6px rgba(0,0,0,0.12)",
          }}
        >
          <img
            src={chlorineImage}
            alt="chlorinator"
            style={{ height: "72px", width: "72px" }}
          />
          <div style={{ flex: 1, minWidth: "220px" }}>
            <div style={{ fontSize: "16px", fontWeight: 700 }}>
              {unit?.device_name || "Chlorinator"}
            </div>
            <div style={{ fontSize: "12px", color: "#6b7785" }}>
              ID : {unit?.device_code} &nbsp;|&nbsp; {unit?.device_time || "-"}
            </div>
            <div
              style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}
            >
              {chlorinatorTicked(unit?.chlorinator_position).includes(3) && cell("TDS", show(unit?.tds), "#7c5cfa")}
              {chlorinatorTicked(unit?.chlorinator_position).includes(2) && cell("pH", show(reading100(unit?.ph)), "#1677f2")}
              {chlorinatorTicked(unit?.chlorinator_position).includes(4) && cell("Chlorine", show(reading100(unit?.chlorine)), "#f59e0b")}
              {chlorinatorTicked(unit?.chlorinator_position).includes(1) && cell("Dosing switch", onOffText(unit?.dosing_switch))}
              {chlorinatorTicked(unit?.chlorinator_position).includes(1) && cell("Dosing pump", pumpText(unit?.dosing_pump))}
              {chlorinatorTicked(unit?.chlorinator_position).includes(1) && cell("Agitator", onOffText(unit?.agitator))}
              {chlorinatorTicked(unit?.chlorinator_position).includes(1) && cell("Tank", <TankLight value={unit?.float_status} />)}
              {chlorinatorTicked(unit?.chlorinator_position).includes(1) && cell("Flow", <FlowStatus value={unit?.pressure_switch} />)}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
