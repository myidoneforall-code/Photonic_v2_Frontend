import { Switch, Tooltip } from "antd";

export default function CommonSwitch({
  checked,
  onChange,
  type,
  color,
  label = false,
  status,
  tooltipText,
  disabled // Optional tooltip text
}) {
  return (
    <div
      className={color ? "" : "SwitchStyles"}
      // onClick={(event) => {
      //   onChange(!checked);
      //   event.stopPropagation();
      // }}
    >
      <Tooltip title={tooltipText}>
        <Switch
          checked={checked}
          // checkedChildren={
          //   type === 3 ? "Open" : type === 1 ? "Active" : "Activated"
          // }
          checkedChildren={
            !label
              ? type === 3
                ? "Open"
                : type === 1
                ? "Active"
                : "Activated"
              : type === 3
              ? "Open"
              : type === 1
              ? "Active"
              : "Show"
          }
          // unCheckedChildren={
          //   status === 2
          //     ? "Field Er"
          //     : type === 3
          //     ? "Close"
          //     : type === 1
          //     ? "InActive"
          //     : "DeActivated"
          // }
          unCheckedChildren={
            !label
              ? status === 2
                ? "Field Er"
                : type === 3
                ? "Close"
                : type === 1
                ? "InActive"
                : "DeActivated"
              : status === 2
              ? "Field Er"
              : type === 3
              ? "Close"
              : type === 1
              ? "InActive"
              : "Hide"
          }
          onChange={onChange}
          className="customStyles"
          onClick={(event) => {
            console.log(event, "event123");

            if (!disabled) {
              onChange(!checked);
              event.stopPropagation();
            }
          }}
          style={{
            transform: "scale(1.1)",
            marginRight: 10,
            backgroundColor: color ?? ""
          }}
        />
      </Tooltip>
    </div>
  );
}
