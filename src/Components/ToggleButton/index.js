import React from "react";
import classes from "./Toggle.module.css";
export default function Toggle({
  buttoncol,
  id,
  isChecked,
  handleChange,
  valvelength,
  motormode,
  EditState,
  editstate,
  CheckvalveEditState,
  ValveState,
  disabled, // ADDED — callers (e.g. Motorcontrolleron.js's view-only lock)
  // passed this already, but it was silently ignored since this
  // component only ever disabled itself from its own internal
  // valve/motor-mode conditions below.
}) {
  return (
    <>
      <input
        key={id}
        type="checkbox"
        checked={isChecked}
        onClick={(e) => e.stopPropagation()}
        onChange={() => {
          handleChange({
            status: !isChecked,
          });
        }}
        disabled={
          disabled ||
          valvelength <= 0 ||
          EditState == false ||
          editstate == false ||
          ValveState == false ||
          CheckvalveEditState == false ||
          ((valvelength >= 0 || valvelength <= 0) &&
            motormode != 1 &&
            motormode != 2)
        }
        style={{
          // NOTE: `disabled` (e.g. View only access) deliberately does NOT
          // force grey here — it only blocks interaction (see `disabled`
          // attribute above). The switch should still show its real
          // status color (green ON / red OFF via the CSS below); grey is
          // reserved for buttoncol==="grey" (an action genuinely in
          // flight) and the pre-existing valve/motor-mode "can't act yet"
          // case.
          backgroundColor:
            ((valvelength >= 0 || valvelength <= 0) &&
              motormode != 1 &&
              motormode != 2) ||
            buttoncol === "grey"
              ? "grey"
              : null,
        }}
        className={classes.input}
      />
    </>
  );
}
