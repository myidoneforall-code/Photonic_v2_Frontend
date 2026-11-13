import ChlorinatorBlock from "./ChlorinatorBlock";
import React from "react";
import { Tooltip } from "antd";
import commonstyle from "../../Assets/css/CommonStyle.module.css";
import motorstyle from "./ViewController/motorcontroller.module.css";
import productionstyle from "./Productionunit/production.module.css";
import { ExportedImages } from "../../Utilities/ImageExport";
import Toggle from "../ToggleButton";
import CommonSwitch from "../CommonComponents/CommonSwitch";
import MultiDeviceComponent from "./MultiDeviceComponent";
import BlurComponent from "./BlurComponent";
import { FindAvilable } from "../../Utilities/Methods";


// m1/m2/m3 (volts/amps/PF) arrive as zero-padded device strings
// ("00.0", "0.0", "1.00") — Number() strips that down to a plain "0" /
// "1" instead of showing the raw padding.
const fmt = (v) => {
  if (v === null || v === undefined || v === "") return 0;
  const n = Number(v);
  return Number.isNaN(n) ? v : n;
};

// Extracted from Motorcontrolleron.js's Items component so the exact same
// motor card (name, tower, on/off toggle, last-update/status-update,
// R/Y/B panels, and its mapped tank/flow/valve/multi device rows) can be
// reused anywhere a motor controller needs to render, instead of building
// a second, thinner card for each new screen that lists motors.
// showDeviceMeta adds the device-code/status row the admin device grid
// needs (ControllerDevice.js) — off by default so the original
// customer-facing list (Motorcontrolleron.js) keeps its exact look.
export default function MotorControllerCard({
  motoron,
  index,
  isloading,
  motorindex,
  setindex,
  loadingspinner,
  Changebutton,
  buttongreyid,
  usertype,
  openNotification,
  valvebuttontype = 1,
  onCardClick,
  showDeviceMeta = false,
  nameEdit,
  showSetValues = false
}) {
  const swPhaseDigit = motoron?.software_version
    ? parseInt(String(motoron.software_version).charAt(0))
    : null;
  const showElectricalReadings =
    motoron?.r != null && motoron?.r !== ""
      ? true
      : swPhaseDigit === 1 || swPhaseDigit === 3;
  const showThreePhase =
    swPhaseDigit === 3 ||
    (swPhaseDigit === null && motoron?.y != null && motoron?.y !== "");

  // The card of a chlorinator added on its own (placeholder controller with no code):
  // its inner cards need the room, so the gaps in the card are smaller.
  const isChlorinatorCard =
    !motoron?.controller_code && motoron?.chlorinator?.length > 0;

  // That placeholder controller is named "Controller 0" when it is created, so the card
  // shows the name given to the chlorinator itself instead.
  const cardName =
    isChlorinatorCard &&
    (!motoron?.controller_name || motoron.controller_name === "Controller 0")
      ? motoron.chlorinator[0]?.device_name || motoron?.controller_name
      : motoron?.controller_name;

  return (
    <div
      className={
        FindAvilable(motoron).show && (usertype === 3 || usertype === 2)
          ? "BlurViewContainer"
          : ""
      }
    >
      <div
        className={`${motorstyle.motor_on_bg} ${commonstyle.cards_border_radius} ${
          isChlorinatorCard && showSetValues ? "" : motorstyle.motor_card_height
        }`}
        // In the lists a chlorinator card is as high as the other cards. On its details page
        // (showSetValues) it grows when it has more to show (the spanner of the master and
        // its boxes).
        style={isChlorinatorCard && showSetValues ? { minHeight: "460px" } : undefined}
        onClick={onCardClick}
      >
        <div className={`${motorstyle.motor_on_pad} ${commonstyle.cards_padding}`} style={isChlorinatorCard ? { gap: "8px" } : undefined}>
          <div className="motor-tower-div-flex">
            <div className="motor-1-flex">
              {nameEdit?.editing ? (
                <input
                  type="text"
                  maxLength={50}
                  className={`${motorstyle.motor_name_input} filedPickBackground`}
                  style={{ width: "100%", minWidth: 0 }}
                  value={nameEdit.value}
                  onChange={(e) => nameEdit.onChange(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <Tooltip title={cardName || ""}>
                  <p className={commonstyle.item_name}>{cardName}</p>
                </Tooltip>
              )}
              {nameEdit ? (
                // In a span: the header CSS makes any second <img> of this row float over the card.
                <span style={{ display: "inline-flex", flexShrink: 0 }}>
                  <img
                    src={
                      nameEdit.editing
                        ? ExportedImages.SAVE_ICON_BLUE
                        : ExportedImages.EDIT_ICON_BLACK
                    }
                    alt="edit"
                    className="pointerCurser"
                    style={{ width: "20px", cursor: "pointer" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      nameEdit.onToggle();
                    }}
                  />
                </span>
              ) : null}
              {motoron.is_warning && (usertype === 2 || usertype === 3) ? (
                <div
                  className="AMCnotificationBlock"
                  onClick={(event) => {
                    event.stopPropagation();
                    openNotification(motoron);
                  }}
                >
                  <span>AMC</span>
                </div>
              ) : (
                ""
              )}
            </div>

            {motoron.tower ? (
              <>
                <img
                  src={
                    motoron?.tower >= 20 && motoron?.tower <= 39
                      ? ExportedImages.TOWER_ICON1
                      : motoron?.tower >= 40 && motoron?.tower <= 59
                        ? ExportedImages.TOWER_ICON2
                        : motoron?.tower >= 60 && motoron?.tower <= 79
                          ? ExportedImages.TOWER_ICON3
                          : motoron?.tower >= 80 && motoron?.tower <= 99
                            ? ExportedImages.TOWER_ICON4
                            : motoron?.tower === 100
                              ? ExportedImages.TOWER_ICON5
                              : ExportedImages.EMPTY_TOWER_ICON
                  }
                  alt="tower"
                  style={{ width: "30px" }}
                  className="motorTower"
                />
                <p className={motorstyle.towerpercentage}>{motoron.tower}%</p>
              </>
            ) : null}

            {motoron?.controller_code ? (
              <>
                {isloading && index === motorindex ? (
                  <img
                    src={ExportedImages.GREEN_SPINNER_GIF}
                    alt="tower"
                    className="lightwhitespinner"
                    style={{ height: "23px" }}
                  />
                ) : (
                  <img
                    src={ExportedImages.SPINNER_ICON}
                    alt="rotating-arrow"
                    className="lightwhitespinner"
                    onClick={(e) => {
                      e.stopPropagation();
                      loadingspinner(motoron.controller_id, motoron.access_type);
                      setindex(index);
                    }}
                  />
                )}
              </>
            ) : null}


            <div className="mobile-1-flex">
              {!motoron?.controller_code && motoron?.chlorinator?.length > 0 ? (
                <>
                  {isloading && index === motorindex ? (
                    <img
                      src={ExportedImages.GREEN_SPINNER_GIF}
                      alt="loading"
                      className="lightwhitespinner"
                      style={{ top: "15px", height: "20px" }}
                    />
                  ) : (
                    <img
                      src={ExportedImages.SPINNER_ICON}
                      alt="rotating-arrow"
                      className="lightwhitespinner"
                      style={{ top: "15px" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        loadingspinner(motoron.chlorinator[0]?.device_id, motoron?.access_type, 6);
                        setindex(index);
                      }}
                    />
                  )}
                  <p className="tank-date" style={{ margin: 0, whiteSpace: "nowrap" }}>
                    {motoron.chlorinator[0]?.device_time}
                  </p>
                </>
              ) : null}

              {motoron.operated_by && (
                <Tooltip title={motoron?.operated_by || ""}>
                  <p className={commonstyle.createdby}>
                    {motoron?.operated_by && motoron?.operated_by !== null
                      ? motoron.operated_by
                      : "Unknown"}
                  </p>
                </Tooltip>
              )}

              {motoron?.controller_code ? (
                showDeviceMeta ? (
                  <Toggle
                    isChecked={motoron.controller_status === 1}
                    disabled
                    handleChange={() => {}}
                  />
                ) : (
                  <Toggle
                    id={index}
                    buttoncol={motoron?.controller_id === buttongreyid ? "grey" : ""}
                    isChecked={motoron.controller_status === 1}
                    disabled={
                      motoron?.controller_id === buttongreyid ||
                      motoron?.access_type === 3
                    }
                    handleChange={({ status }) => {
                      Changebutton(motoron?.controller_id, status, motoron?.access_type);
                    }}
                  />
                )
              ) : null}
            </div>
          </div>

          {showDeviceMeta ? (
            <div className={motorstyle.motor_id_status_row}>
              <p className="tank-header">
                ID - <span className="tank-date">{motoron?.controller_code}</span>
              </p>
            </div>
          ) : null}

          <div className="motor-div-one-flex" style={isChlorinatorCard ? { gap: "2px" } : undefined}>
            {!motoron?.controller_code && motoron?.chlorinator?.length > 0 ? (
              <p className="tank-header" style={{ margin: 0 }}>
                ID -{" "}
                <span className="tank-date">
                  {motoron.chlorinator.map((unit) => unit?.device_code).join(", ")}
                </span>
              </p>
            ) : null}

            {motoron?.controller_code ? (
              <>
                <div className="motor-update-div-flex">
                  <div className={motorstyle.update_text}>
                    <p className="tank-header">last update</p>
                    <p className="tank-date">{motoron?.controller_datetime}</p>
                  </div>

                  <div className="status-update">
                    <p className="tank-header">status update</p>
                    <p className="tank-date">{motoron?.status_change_time}</p>
                  </div>
                </div>

                {showElectricalReadings ? (
                  <div className={motorstyle.motor_volt_div_flex}>
                    <div className={`bg-color-one ${motorstyle.motor_volt_sub_div}`}>
                      <p className="volt-text-1">
                        <span>R</span>
                        {fmt(motoron.r)} V
                      </p>
                      <p className="volt-text-2">
                        <span>A</span>
                        {fmt(motoron.rl1)} A
                      </p>
                    </div>
                    {showThreePhase ? (
                      <>
                        <div className={`bg-color-two ${motorstyle.motor_volt_sub_div}`}>
                          <p className="volt-text-1">
                            <span>Y</span> {fmt(motoron.y)} V
                          </p>
                          <p className="volt-text-2">
                            <span>A</span>
                            {fmt(motoron.yl2)} A
                          </p>
                        </div>

                        <div className={`bg-color-three ${motorstyle.motor_volt_sub_div}`}>
                          <p className="volt-text-1">
                            <span>B</span> {fmt(motoron.b)} V
                          </p>
                          <p className="volt-text-2">
                            <span>A</span>
                            {fmt(motoron.bl3)} A
                          </p>
                        </div>
                      </>
                    ) : null}
                  </div>
                ) : null}
              </>
            ) : null}

            {motoron.controller_code ? <p className="line secondLine"></p> : null}

            <div className={motorstyle.motor_valve_div_flex}>
              {motoron.device?.level > 0 && (
                <p>
                  tank-<span>{motoron.device.level}</span>
                </p>
              )}
              {motoron.device?.flow > 0 && (
                <p>
                  flow meter-<span>{motoron.device.flow}</span>
                </p>
              )}
              {motoron.device?.valve > 0 && (
                <p>
                  valve-<span>{motoron.device.valve}</span>
                </p>
              )}
              {motoron.device?.multi_count > 0 && (
                <p>
                  multi-<span>{motoron.device.multi_count}</span>
                </p>
              )}
              {motoron.device?.chlorinator > 0 && (
                <p>
                  chlorinator-<span>{motoron.device.chlorinator}</span>
                </p>
              )}
            </div>

            {!motoron.controller_code &&
            (motoron?.tank_level?.length > 0 ||
              motoron?.flow_meter?.length > 0 ||
              motoron?.valve_device?.length > 0 ||
              motoron?.chlorinator?.length > 0 ||
              motoron?.multi_device?.length > 0) ? (
              <p className={`line ${commonstyle.margin_zero}`}></p>
            ) : null}

            <div>
              {motoron?.tank_level?.length > 0 && !motoron?.controller_code ? (
                <>
                  {motoron?.tank_level?.map((datas, i) => {
                    return (
                      <div key={i}>
                        <div className={motorstyle.motor_valve_div_flex}>
                          <div className={motorstyle.updatetank_text}>
                            <Tooltip title={datas?.device_name || ""}>
                              <p className={motorstyle.levels}>{datas?.device_name}</p>
                            </Tooltip>

                            <p className={motorstyle.tank_level_details}>
                              <span className="tank-header">
                                Tank Level -{""}
                                <span className="tank-date">
                                  {datas?.tank_level !== null
                                    ? `${Number(datas?.tank_level)}%`
                                    : null}
                                </span>
                              </span>
                            </p>
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
                                loadingspinner(datas?.device_id, motoron?.access_type, 1);
                                setindex(index);
                              }}
                            />
                          )}
                          <p className="tank-date timeOnly">{datas?.device_time}</p>
                        </div>

                        <div className={motorstyle.motor_valve_div_flex}>
                          <div className={motorstyle.updatetank_text}>
                            <p className="tank-header">
                              ID -{" "}
                              <span className="tank-date">{datas?.device_code}</span>{" "}
                            </p>
                            <p className="tank-header">
                              Tank Height{" "}
                              <span className="tank-date">
                                - {datas?.tank_height ? `${datas?.tank_height}ft` : null}
                              </span>
                            </p>
                          </div>
                          <div className={motorstyle.water_tank}>
                            {datas?.tank_level !== null ? (
                              <div className={motorstyle.tankstyle}>
                                <p className={motorstyle.waterper}>
                                  {datas?.tank_level !== null
                                    ? `${Number(datas?.tank_level)}%`
                                    : null}
                                </p>
                                {datas?.tank_level >= 1 && datas?.tank_level <= 10 ? (
                                  <img src={ExportedImages.WATER_TANK_10_GIF} alt="tank level" />
                                ) : datas?.tank_level > 10 && datas?.tank_level <= 20 ? (
                                  <img src={ExportedImages.WATER_TANK_20_GIF} alt="tank level" />
                                ) : datas?.tank_level > 20 && datas?.tank_level <= 30 ? (
                                  <img src={ExportedImages.WATER_TANK_30_GIF} alt="tank level" />
                                ) : datas?.tank_level > 30 && datas?.tank_level <= 40 ? (
                                  <img src={ExportedImages.WATER_TANK_40_GIF} alt="tank level" />
                                ) : datas?.tank_level > 40 && datas?.tank_level <= 60 ? (
                                  <img src={ExportedImages.WATER_TANK_50_GIF} alt="tank level" />
                                ) : datas?.tank_level > 60 && datas?.tank_level <= 70 ? (
                                  <img src={ExportedImages.WATER_TANK_60_GIF} alt="tank level" />
                                ) : datas?.tank_level > 70 && datas?.tank_level <= 80 ? (
                                  <img src={ExportedImages.WATER_TANK_70_GIF} alt="tank level" />
                                ) : datas?.tank_level > 80 && datas?.tank_level <= 90 ? (
                                  <img src={ExportedImages.WATER_TANK_80_GIF} alt="tank level" />
                                ) : datas?.tank_level > 90 && datas?.tank_level <= 95 ? (
                                  <img src={ExportedImages.WATER_TANK_90_GIF} alt="tank level" />
                                ) : datas?.tank_level > 95 && datas?.tank_level <= 100 ? (
                                  <img src={ExportedImages.WATER_TANK_100_GIF} alt="tank level" />
                                ) : (
                                  <img src={ExportedImages.EMPTY_WATER_TANK} alt="empty tank" />
                                )}
                              </div>
                            ) : null}
                          </div>
                          <div className={motorstyle.updatetank_text}>
                            <p className="tank-header">
                              High Limit{" "}
                              <span className="tank-date">- {datas?.high_limit}</span>
                            </p>
                            <p className="tank-header">
                              Low Limit{" "}
                              <span className="tank-date">-{datas?.low_limit}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : null}

              {motoron?.flow_meter?.length > 0 && !motoron?.controller_code ? (
                <>
                  {motoron?.flow_meter?.map((datas, i) => {
                    return (
                      <React.Fragment key={i}>
                        <div className={motorstyle.motor_valve_div_flex}>
                          <div className={motorstyle.updatetank_text}>
                            <Tooltip title={datas?.device_name || ""}>
                              <p className={motorstyle.levels}>{datas?.device_name}</p>
                            </Tooltip>

                            <p className={motorstyle.tank_level_details}>
                              <span className="tank-header">Total Usage-</span>
                              <span className="tank-date">{datas?.total_usage}</span>{" "}
                            </p>
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
                                loadingspinner(datas?.device_id, motoron?.access_type, 2);
                                setindex(index);
                              }}
                            />
                          )}
                          <p className="tank-date timeOnly">{datas?.device_time}</p>
                        </div>

                        <div className="tank-limit">
                          <div className={motorstyle.updatetank_text}>
                            <p className="tank-header">
                              ID -{" "}
                              <span className="tank-date">{datas?.device_code}</span>{" "}
                            </p>
                            <p className="tank-header">
                              Daily usage{" "}
                              <span className="tank-date">-{datas?.today_usage}{(datas?.today_usage ?? "") !== "" ? " kL" : ""}</span>
                            </p>
                            <p className="tank-header">
                              Daily update{" "}
                              <span className="tank-date">-{datas?.daily_update}</span>
                            </p>
                          </div>
                          <div>
                            <img
                              src={ExportedImages.Flow_Image}
                              alt="flowgif"
                              className={motorstyle.flowgif}
                            />
                          </div>
                          <div className={motorstyle.updatetank_text}>
                            <p className="tank-header">
                              flow rate{" "}
                              <span className="tank-date">- {datas?.flow_rate}</span>
                            </p>
                            <p className="tank-header">
                              usage Limit{" "}
                              <span className="tank-date">-{datas?.usage_limit}</span>
                            </p>
                            <p className="tank-header">
                              liter/pulse{" "}
                              <span className="tank-date">-{datas?.lt_per_pulse}</span>
                            </p>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </>
              ) : null}

              {motoron?.chlorinator?.length > 0 && !motoron?.controller_code ? (
                <>
                  {motoron?.chlorinator?.map((datas, i) => {
                    return (
                      <React.Fragment key={i}>
                        <ChlorinatorBlock unit={datas} usertype={usertype} canSet={showSetValues} compact={!showSetValues} />
                      </React.Fragment>
                    );
                  })}
                </>
              ) : null}

              {motoron?.valve_device?.length > 0 && !motoron?.controller_code ? (
                <div className="valveflex">
                  {motoron?.valve_device?.map((datas, i) => {
                    return (
                      <React.Fragment key={i}>
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
                                loadingspinner(datas?.device_id, motoron?.access_type, 3);
                                setindex(index);
                              }}
                            />
                          )}
                          <p className="tank-date timeOnly">{datas?.device_time}</p>
                        </div>

                        <div className="valveimgflex">
                          <div className={motorstyle.updatetank_text}>
                            <p className="tank-header">
                              mode -{" "}
                              <span className="tank-date">
                                {datas?.valve_mode === 1
                                  ? "Daily"
                                  : datas?.valve_mode === 0
                                    ? "manual"
                                    : datas?.valve_mode === 2
                                      ? "Weekly"
                                      : null}
                              </span>{" "}
                            </p>
                            <p className="tank-header">
                              ID -{" "}
                              <span className="tank-date">{datas?.device_code}</span>{" "}
                            </p>
                          </div>
                          <img
                            src={ExportedImages.valveImage}
                            alt="valve"
                            className="listvalveimg"
                          />

                          <div className="valvebuttonflex">
                            <p className="tank-header">{datas?.operated_by}</p>
                            {datas.device_id === buttongreyid ? (
                              <CommonSwitch
                                color={"grey"}
                                type={3}
                                disabled={motoron?.access_type === 3}
                                checked={datas?.valve_status === 1 ? true : false}
                                onChange={({ status }) => {
                                  Changebutton(
                                    datas?.device_id,
                                    status,
                                    motoron?.access_type,
                                    valvebuttontype
                                  );
                                }}
                              />
                            ) : datas?.device_code ? (
                              <CommonSwitch
                                type={3}
                                disabled={motoron?.access_type === 3}
                                checked={datas?.valve_status === 1 ? true : false}
                                onChange={({ status }) => {
                                  Changebutton(
                                    datas?.device_id,
                                    status,
                                    motoron?.access_type,
                                    valvebuttontype
                                  );
                                }}
                              />
                            ) : null}
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              ) : null}

              {motoron?.multi_device?.length > 0 && !motoron?.controller_code ? (
                <>
                  {motoron?.multi_device?.map((datas, i) => {
                    return (
                      <div key={i}>
                        <MultiDeviceComponent
                          datas={datas}
                          isloading={isloading}
                          index={index}
                          motorindex={motorindex}
                          loadingspinner={loadingspinner}
                          motors={motoron}
                          setindex={setindex}
                        />
                      </div>
                    );
                  })}
                </>
              ) : null}
            </div>
          </div>

          {showDeviceMeta && motoron?.status != null ? (
            <p className={motorstyle.motor_status_bottom}>
              <span className="tank-header">status&nbsp;:&nbsp;</span>
              <span
                className={
                  motoron?.status === -1
                    ? productionstyle.production_status_deleted
                    : motoron?.status === 0
                    ? productionstyle.production_status_inactive
                    : motoron?.status === 1
                    ? productionstyle.production_status_on
                    : motoron?.status === 2
                    ? productionstyle.production_status_waiting
                    : motoron?.status === 3
                    ? productionstyle.production_status_off
                    : null
                }
              >
                {motoron?.status === -1
                  ? "Deleted"
                  : motoron?.status === 0
                  ? "In Active"
                  : motoron?.status === 1
                  ? "Tested Ok"
                  : motoron?.status === 2
                  ? "Waiting for Test"
                  : motoron?.status === 3
                  ? "Fault"
                  : null}
              </span>
            </p>
          ) : null}
        </div>
      </div>
      {(usertype === 2 || usertype === 3) && (
        <BlurComponent navigateFunc={onCardClick} deviceData={motoron} />
      )}
    </div>
  );
}
