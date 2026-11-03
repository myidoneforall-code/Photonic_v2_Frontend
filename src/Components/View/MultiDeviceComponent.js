import React from "react";
import { getCookie } from "../../Utilities/Cookie";
import { Tooltip } from "antd";
import motorstyle from "./ViewController/motorcontroller.module.css";

import { ExportedImages } from "../../Utilities/ImageExport";

export default function MultiDeviceComponent({
  datas,
  isloading,
  index,
  motorindex,
  loadingspinner,
  motors,
  setindex,
}) {
  let cookie = JSON.parse(getCookie("cookiedata"));
  let usertype = cookie?.user_type;
  return (
    <>
      <div className={motorstyle.motor_valve_div_flex}>
        <div className={motorstyle.updatetank_text}>
          <Tooltip title={datas?.device_name || ""}>
            <p className={motorstyle.levels}>{datas?.device_name}</p>
          </Tooltip>
        </div>

        <div className={motorstyle.updatetank_text}>
          {datas?.tower ? (
            <>
              <img
                src={
                  datas?.tower >= 20 && datas?.tower <= 39
                    ? ExportedImages.TOWER_ICON1
                    : datas?.tower >= 40 && datas?.tower <= 59
                    ? ExportedImages.TOWER_ICON2
                    : datas?.tower >= 60 && datas?.tower <= 79
                    ? ExportedImages.TOWER_ICON3
                    : datas?.tower >= 80 && datas?.tower <= 99
                    ? ExportedImages.TOWER_ICON4
                    : datas?.tower === 100
                    ? ExportedImages.TOWER_ICON5
                    : ExportedImages.EMPTY_TOWER_ICON
                }
                alt="tower"
                style={{ width: "30px" }}
              />
              <p className={motorstyle.motorviewtowerpercentage}>
                {datas.tower}%
              </p>
            </>
          ) : (
            <img
              src={ExportedImages.EMPTY_TOWER_ICON}
              alt="tower"
              style={{ width: "30px" }}
            />
          )}
        </div>
        {isloading && index === motorindex ? (
          <img
            src={ExportedImages.GREEN_SPINNER_GIF}
            alt="tower"
            className="whitespinner"
            style={{ height: "23px" }}
          />
        ) : (
          <img
            src={ExportedImages.SPINNER_ICON}
            alt="rotating-arrow"
            className="whitespinner spinnerOne"
            onClick={(e) => {
              e.stopPropagation();
              loadingspinner(datas?.device_id, motors?.access_type, 5);
              setindex(index);
            }}
          />
        )}
      </div>

      <div className={`mt-2 ${motorstyle.motor_valve_div_flex}`}>
        <div className={motorstyle.updatetank_text}>
          <p className="tank-header">
            ID -<span className="tank-date">{datas?.device_code}</span>
          </p>
          <p>
            <span className="tank-header">Hardware Version -</span>
            <span className="tank-date">{datas?.hardware_version}</span>
          </p>
          <p>
            <span className="tank-header">Software Version -</span>
            <span className="tank-date">{datas?.software_version}</span>
          </p>
          <div className="tank-header">
            Lat-
            <span className="tank-date">
              {datas.latitude === "" ? null : `${datas?.latitude} 'N`}
            </span>
            &nbsp; &nbsp; Long-
            <span className="tank-date">
              {datas.longitude === "" ? null : `${datas?.longitude} 'E`}
            </span>
          </div>
        </div>

        <div
          className={motorstyle.updatetank_text}
          style={{ alignItems: "flex-end" }}
        >
          <p className="tank-date">{datas?.device_time}</p>
          <p>
            <span className="tank-header">Source</span>
            <span className="tank-date">
              - {datas?.source === 1 ? "Battery" : "EB"}
            </span>
          </p>
          {datas?.source === 1 && (
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
              }}
            >
              <p>
                <span className="tank-header">Battery</span>
                <span className="tank-date">- {datas?.battery}</span>
              </p>
              <p>
                <span className="tank-header">Solar Panel</span>
                <span className="tank-date">- {datas?.solar_panel}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
