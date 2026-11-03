import React from "react";
import { Card } from "react-bootstrap";

const CountCard = ({ image, name, count, style, iconStyle, onpress }) => {
  return (
    <Card
      className="count-card p-3 h-100"
      style={{ ...style, border: `1px solid ${"black"}`, borderRadius: "5px" }}
    >
      <div
        style={{}}
        className="d-flex align-items-center"
        onClick={() => {
          onpress();
        }}
      >
        <div
          className="icon-circle d-flex justify-content-center align-items-center me-3"
          style={{ backgroundColor: "white" }}
        >
          <img src={image} alt={name} className="card-icon" />
        </div>
        <div className="text-start">
          <p
            className="count-label mb-1"
            style={{ color: "white", fontSize: "16px" }}
          >
            {name}
          </p>
          <h5 className="count-value mb-0" style={{ color: "white" }}>
            {count}
          </h5>
        </div>
      </div>
    </Card>
  );
};

export default CountCard;
