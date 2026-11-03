import { PaginationSize } from "../../Utilities/Constants";
import CommonSelect from "./CommonSelect";

export default function PaginationSizeChanger({ size, onChange, options }) {
  return (
    <CommonSelect
      options={options ?? PaginationSize}
      styles={{
        width: "120px",
        height: "45px",
      }}
      value={size}
      allowClear={false}
      onChange={onChange}
    />
  );
}
