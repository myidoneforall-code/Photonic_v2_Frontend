import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaWrench } from "react-icons/fa";
import ChlorinatorPanels from "./ChlorinatorPanels";
import { SetChlorinatorValuesService } from "../../Service/ApiService";
import { getCatchMsg } from "../../Utilities/Methods";

const BLUE = "#1a6a9e";

const box = {
  width: "86px",
  height: "28px",
  fontSize: "13px",
  padding: "0 4px",
  textAlign: "center",
  border: "1px solid #c9c9c9",
  borderRadius: "4px",
  background: "#ffffff",
  outline: "none",
};

const select = {
  width: "100px",
  height: "28px",
  fontSize: "13px",
  padding: "0 2px",
  border: "1px solid #c9c9c9",
  borderRadius: "4px",
  background: "#ffffff",
  outline: "none",
};

// The three readings, and the five status values of R1 (ds, dp, as, f, p). The dropdowns send
// "" (nothing set, the unit's own value is used), "0", "1" or "2".
const NUMBERS = [
  ["tds", "TDS"],
  ["chlorine", "Chlorine"],
  ["ph", "pH"],
];
const ON_OFF = [
  ["1", "ON"],
  ["0", "OFF"],
];
const STATUS = [
  ["ds", "Dosing switch", ON_OFF],
  [
    "dp",
    "Dosing pump",
    [
      ["0", "Off"],
      ["1", "Pump 1"],
      ["2", "Pump 2"],
    ],
  ],
  ["as", "Agitator", ON_OFF],
  ["f", "Tank", ON_OFF],
  ["p", "Flow", ON_OFF],
];
// the value of each status on the card
const CARD_FIELD = {
  ds: "dosing_switch",
  dp: "dosing_pump",
  as: "agitator",
  f: "float_status",
  p: "pressure_switch",
};

const plain = (value) =>
  /^\d*\.?\d*$/.test(String(value ?? "")) ? String(value ?? "") : "";
const digit = (value) => (value === null || value === undefined ? "" : String(value));

// A chlorinator in the cards: its panels, and, for the master (Super Admin only), a spanner
// at the bottom left. Touching the spanner shows, right under it, small boxes for TDS,
// Chlorine and pH, dropdowns for the dosing switch, dosing pump, agitator, tank and flow,
// and a Save button. A value set here is used instead of what the chlorinator sends; "-" or
// an empty box means its own value is used again. Each chlorinator has its own values.
export default function ChlorinatorBlock({ unit, usertype }) {
  const isMaster = Number(usertype) === 1;
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState({ tds: "", chlorine: "", ph: "" });
  const [status, setStatus] = useState({ ds: "", dp: "", as: "", f: "", p: "" });
  // What was just saved: shown at once, until the card gets its next data.
  const [saved, setSaved] = useState(null);

  const statusKey = JSON.stringify(unit?.status_set || {});

  // The boxes show what is set now (nothing is set when they are empty).
  useEffect(() => {
    if (!open) {
      setValues({
        tds: plain(unit?.tds_set),
        chlorine: plain(unit?.chlorine_set),
        ph: plain(unit?.ph_set),
      });
      const set = unit?.status_set || {};
      setStatus({
        ds: digit(set.ds),
        dp: digit(set.dp),
        as: digit(set.as),
        f: digit(set.f),
        p: digit(set.p),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit?.tds_set, unit?.chlorine_set, unit?.ph_set, statusKey, open]);

  useEffect(() => {
    setSaved(null);
  }, [unit?.tds, unit?.chlorine, unit?.ph, unit?.device_time]);

  const change = (key) => (e) => {
    const text = e.target.value;
    if (/^\d*\.?\d*$/.test(text)) {
      setValues((pre) => ({ ...pre, [key]: text }));
    }
  };

  const save = () => {
    setSaving(true);
    const formData = new FormData();
    formData.append("tds", values.tds);
    formData.append("chlorine", values.chlorine);
    formData.append("ph", values.ph);
    STATUS.forEach(([key]) => formData.append(key, status[key]));
    SetChlorinatorValuesService(unit?.device_id, formData)
      .then(({ data }) => {
        if (data?.status === 1) {
          toast.success("Saved");
          const set = data.status_set || {};
          const card = {};
          Object.keys(CARD_FIELD).forEach((key) => {
            if (set[key] !== null && set[key] !== undefined) {
              card[CARD_FIELD[key]] = set[key];
            }
          });
          // the unit sends pH and chlorine times 100: the card divides by 100
          setSaved({
            ...card,
            tds: data.tds_set !== null ? Number(data.tds_set) : undefined,
            chlorine: data.chlorine_set !== null ? Number(data.chlorine_set) * 100 : undefined,
            ph: data.ph_set !== null ? Number(data.ph_set) * 100 : undefined,
            tds_set: data.tds_set,
            chlorine_set: data.chlorine_set,
            ph_set: data.ph_set,
            status_set: set,
          });
          setOpen(false);
        } else {
          toast.error(data?.msg || "Something went wrong");
        }
      })
      .catch((err) => getCatchMsg(err))
      .finally(() => setSaving(false));
  };

  const shown = saved
    ? {
        ...unit,
        ...saved,
        tds: saved.tds !== undefined ? saved.tds : unit?.tds,
        chlorine: saved.chlorine !== undefined ? saved.chlorine : unit?.chlorine,
        ph: saved.ph !== undefined ? saved.ph : unit?.ph,
      }
    : unit;

  return (
    <>
      <ChlorinatorPanels unit={shown} />
      {isMaster ? (
        <div style={{ marginTop: "6px", width: "100%" }}>
          <button
            type="button"
            aria-label="Set values"
            title="Set values"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((pre) => !pre);
            }}
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              background: open ? BLUE : "#EAF6FB",
              color: open ? "#ffffff" : BLUE,
            }}
          >
            <FaWrench size={14} />
          </button>
          {open ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", flexWrap: "wrap" }}>
                {NUMBERS.map(([key, label]) => (
                  <div key={key} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <label style={{ fontSize: "11px", margin: 0 }}>{label}</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={values[key]}
                      onChange={change(key)}
                      style={box}
                      aria-label={label}
                    />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", flexWrap: "wrap" }}>
                {STATUS.map(([key, label, options]) => (
                  <div key={key} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <label style={{ fontSize: "11px", margin: 0 }}>{label}</label>
                    <select
                      value={status[key]}
                      onChange={(e) => setStatus((pre) => ({ ...pre, [key]: e.target.value }))}
                      style={select}
                      aria-label={label}
                    >
                      <option value="">-</option>
                      {options.map(([value, text]) => (
                        <option key={value} value={value}>
                          {text}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "10px", color: "#6b7785" }}>
                  "-" or empty: the chlorinator's own value is used
                </span>
                <button
                  type="button"
                  disabled={saving}
                  onClick={save}
                  style={{
                    height: "28px",
                    padding: "0 16px",
                    fontSize: "13px",
                    background: BLUE,
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
