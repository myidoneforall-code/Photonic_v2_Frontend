// import { ConfigProvider, Tabs } from "antd";

// export default function CommonTabs({ onChange, items, activeKey, TablColors }) {
//   return (
//     <ConfigProvider
//       theme={{
//         components: {
//           Tabs: {
//             itemSelectedColor: TablColors?.itemActiveColor || "#db0048",
//             inkBarColor: TablColors?.itemActiveColor || "#db0048",
//             itemColor: TablColors?.itemColor || "black",
//             itemHoverColor: TablColors?.itemActiveColor || "#db0048",
//             itemActiveColor: TablColors?.itemActiveColor || "#db0048",
//             titleFontSize: 18,
//             horizontalItemPadding: 0,
//             fontFamily: "Nunito-bold-700"
//             /* here iscardHeight your component tokens */
//           }
//         },
//         token: {
//           colorBorderSecondary: "transparant",
//           fontFamily: "Nunito-semibold-600"
//         }
//       }}
//     >
//       <Tabs activeKey={activeKey} items={items} onChange={onChange} />
//     </ConfigProvider>
//   );
// }

// import React from "react";

// export default function CommonTabs({ items, activeKey, onChange, TablColors }) {
//   const activeColor = TablColors?.itemActiveColor || "#00ffff";
//   const defaultColor = TablColors?.itemColor || "#fff";

//   return (
//     <div className="custom-tabs-container">
//       {items.map((tab) => (
//         <button
//           key={tab.key}
//           className={`custom-tab-button ${
//             activeKey === tab.key ? "active" : ""
//           }`}
//           onClick={() => onChange(tab.key)}
//           style={{
//             color: activeKey === tab.key ? activeColor : defaultColor,
//             borderBottom:
//               activeKey === tab.key
//                 ? `3px solid ${activeColor}`
//                 : "3px solid transparent"
//           }}
//         >
//           {tab.label}
//         </button>
//       ))}
//     </div>
//   );
// }

export default function CommonTabs({ items, activeKey, onChange, TablColors }) {
  const activeColor = TablColors?.itemActiveColor || "blue"; // default active: blue
  const defaultColor = TablColors?.itemColor || "black"; // default normal: black

  return (
    <div className="custom-tabs-container">
      {items.map((tab) => (
        <button
          key={tab.key}
          className={`custom-tab-button ${
            activeKey === tab.key ? "active" : ""
          }`}
          onClick={() => onChange(tab.key)}
          style={{
            color: activeKey === tab.key ? activeColor : defaultColor,
            borderBottom:
              activeKey === tab.key
                ? `3px solid ${activeColor}`
                : "3px solid transparent"
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
