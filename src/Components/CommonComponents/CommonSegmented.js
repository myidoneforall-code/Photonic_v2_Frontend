import { ConfigProvider, Segmented } from "antd";

export default function CommonSegmented({ value, size, onChange, options }) {
  return (
    <ConfigProvider
      theme={{
        components: {
          Segmented: {
            itemSelectedBg: "#fff",
            itemSelectedColor: "#921A40",
            itemHoverBg: "pink",
            itemHoverColor: "#921A40",
            itemActiveBg: "pink",
            trackBg: "#FFD0D0",
            trackPadding: 2,
            itemColor: "#000",
          },
        },
      }}
    >
      <Segmented
        className="segmentedStyle"
        value={value}
        style={{ marginBottom: "10px" }}
        size="middle"
        onChange={onChange}
        options={options}
      />
    </ConfigProvider>
  );
}
