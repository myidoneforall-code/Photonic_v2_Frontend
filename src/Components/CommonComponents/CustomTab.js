import { useState } from "react";
import "./customtab.css";

const CustomTabs = ({ tabs, defaultActive = 0 }) => {
  const [activeIndex, setActiveIndex] = useState(defaultActive);
  console.log(tabs, "tabs");

  return (
    <div className="tabs-wrapper">
      <div className="tabs-container">
        {tabs.map((tab, idx) => (
          <button
            key={tab.key || idx}
            type="button"
            className={`tab-btn ${idx === activeIndex ? "active" : ""}`}
            onClick={() => setActiveIndex(idx)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content" style={{ backgroundColor: "white" }}>
        {tabs[activeIndex].component}
      </div>
    </div>
  );
};
export default CustomTabs;
