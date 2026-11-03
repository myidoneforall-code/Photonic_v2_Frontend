import { AllowAlphaNumeric, RemoveNonNumeric } from "../../Utilities/Methods";
import classes from "./components.module.css";
export default function CommonInput({
  placeholder,
  onChange,
  maxLength,
  value,
  styles,
  isNumber,
  inlinefield = false,
  isAlphaNumeric = false,
  disabled = false,
}) {
  return (
    <>
      <input
        type="text"
        className={`${inlinefield ? classes.inlinefield : classes.inputBox} `}
        placeholder={placeholder}
        onChange={(event) => {
          if (isNumber) {
            onChange(RemoveNonNumeric(event.target.value));
          } else if (isAlphaNumeric) {
            if (AllowAlphaNumeric(event.target.value)) {
              onChange(event.target.value);
            }
          } else {
            onChange(event.target.value);
          }
        }}
        maxLength={maxLength}
        value={value}
        style={{ ...styles }}
        disabled={disabled}
      />
    </>
  );
}
