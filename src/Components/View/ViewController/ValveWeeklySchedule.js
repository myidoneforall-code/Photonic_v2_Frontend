import React, { useEffect, useState } from "react";
import devicestyle from "../ViewController/motorcontroller.module.css";
import { useFormik } from "formik";
import CommonSelect from "../../CommonComponents/CommonSelect";
import { WeeklyDaysList } from "../../../Utilities/Constants";
import CommonCheckbox from "../../CommonComponents/CommonCheckbox";
import * as Yup from "yup";
import { ExportedImages } from "../../../Utilities/ImageExport";
import { Table } from "react-bootstrap";
import { getValveTimeNames } from "../../../Utilities/Methods";

import ConfirmationModal from "../../../Modalcomponents/ConfirmationModal";
import CommonClockTimePicker from "../../CommonComponents/CommonClockTimePicker";
import dayjs from "dayjs";
import toast from "react-hot-toast";
const validationSchema = Yup.object().shape({
  device_id: Yup.string().nullable().required("Device is required"),
  time1: Yup.string().nullable().required("Start at is required"),
  time2: Yup.string().nullable().required("Run for is required"),

  weekly_schedule: Yup.array()
    .of(
      Yup.object().shape({
        label: Yup.string().required(),
        holiday_id: Yup.number().required(),
        name: Yup.string().required(),
        status: Yup.number().oneOf([0, 1]).required(),
      })
    )
    .test(
      "at-least-one-active",
      "Please Select atleast one Active Day",
      (days) => days.some((day) => day.status === 1)
    ),
});

export default function ValveWeeklySchedule({
  valueTimeList,
  valvetime,
  valveList,
  weeklyTimeList,
  setWeeklyTimeList,
  motorMode,
}) {
  const [showModal, setShowModal] = useState({ show: false, index: -1 });

  const {
    values,
    setValues,
    setFieldValue,
    errors,
    touched,
    handleSubmit,
    resetForm,
    initialValues,
  } = useFormik({
    initialValues: {
      device_id: null,
      device_name: "",

      valve_mode: 2,
      time1: null,
      time2: null,
      timer_name: "",
      weekly_schedule: WeeklyDaysList,
    },
    validationSchema,
    onSubmit: (values) => {
      handleAddWeekSetting(values);
    },
  });

  const handleAddWeekSetting = (values) => {
    const filterArray = weeklyTimeList?.filter(
      (ele) => ele?.device_name === values?.device_name
    );
    if (filterArray?.length >= 11) {
      toast.error(
        `${values?.device_name} has reached its maximum time setting limit.`
      );
    } else {
      setWeeklyTimeList((pre) => [...pre, values]);
      resetForm();
    }
  };

  const handleChangeStatus = (weekSetting, ItemIndex) => {
    setWeeklyTimeList((pre) =>
      pre?.map((item, index) =>
        index === ItemIndex ? { ...item, weekly_schedule: weekSetting } : item
      )
    );
  };

  // FIXED: valueTimeList is a brand-new array reference on every poll
  // (Controlardetails.js's setValueTimeList runs unconditionally, even
  // on the fast silent background poll), so this fired every few
  // seconds regardless of whether the data actually changed — wiping
  // the Add-row (device, both times, day toggles) back to blank while
  // the user was still filling it in. Skip while the add-row is
  // actually open/in use.
  useEffect(() => {
    if (valueTimeList && !valvetime) {
      resetForm();
    }
  }, [valueTimeList]);
  const checkIfListAvailable = () => {
    return weeklyTimeList?.filter((ele) => ele?.valve_mode === 2)?.length;
  };
  useEffect(() => {
    setValues(initialValues);
  }, [valvetime]);
  const GetSelectedStyle = {
    background: "#007bff",
    color: "#fff",
    border: "none",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
  };

  return (
    <>
      {showModal?.show && (
        <ConfirmationModal
          ICONStyle={{ width: 50 }}
          handleOkFunction={() => {
            setWeeklyTimeList((pre) =>
              pre?.filter((ele, ind) => showModal?.index !== ind)
            );
            setShowModal({ show: false, index: -1 });
          }}
          show={showModal.show}
          close={() => setShowModal({ show: false, index: -1 })}
          msg={"Are you sure want to Remove this Weekly Schedule?"}
        />
      )}
      {/* <div className="tank-level">
        <p
          className="motorhead"
          style={{
            background: "#6A80B9",
            marginTop: "10px",
          }}
        >
          Weekly Schedule
        </p>
      </div> */}
      {valvetime && (
        <>
          <div className={devicestyle.TimeSettingContainer}>
            <div
              className={devicestyle.timeLineStyle}
              style={{ flexFlow: "wrap", gap: 20 }}
            >
              <div className={devicestyle?.inputContainer}>
                <CommonSelect
                  onChange={(data, opt) => {
                    setFieldValue("device_id", data);
                    setFieldValue("device_name", opt?.device_name);
                  }}
                  allowClear={false}
                  value={values?.device_id}
                  options={valveList?.map((ele) => ({
                    ...ele,
                    label: ele?.device_name,
                    value: ele?.device_id,
                  }))}
                  placeholder={"Select Device"}
                  responsiveClassName={true}
                />
                {errors?.device_id && touched?.device_id ? (
                  <p className={devicestyle.errorText}>{errors?.device_id}</p>
                ) : (
                  ""
                )}
              </div>
              <div className={devicestyle?.inputContainer}>
                <CommonClockTimePicker
                  onChange={(date) => {
                    setValues({
                      ...values,
                      time1: dayjs(date).format("HH:mm:00"),
                    });
                  }}
                  istimeField
                  istestFieldStyle
                  value={
                    values.time1
                      ? dayjs(values.time1, "HH:mm:ss").format(
                          "YYYY-MM-DD HH:mm:ss"
                        )
                      : ""
                  }
                  placeholder={getValveTimeNames(motorMode)?.time1}
                  // showSecond={false}
                  // className={"timeInputBox"}
                />

                {errors?.time1 && touched?.time1 ? (
                  <p className={devicestyle.errorText}>{errors?.time1}</p>
                ) : (
                  ""
                )}
              </div>
              <div className={devicestyle?.inputContainer}>
                <CommonClockTimePicker
                  onChange={(date) => {
                    setValues({
                      ...values,
                      time2: dayjs(date).format("HH:mm:00"),
                    });
                  }}
                  istimeField
                  istestFieldStyle
                  value={
                    values.time2
                      ? dayjs(values.time2, "HH:mm").format(
                          "YYYY-MM-DD HH:mm:ss"
                        )
                      : ""
                  }
                  ampm={false}
                  placeholder={getValveTimeNames(motorMode)?.time2}
                  // showSecond={false}
                  // className={"timeInputBox"}
                />

                {errors?.time2 && touched?.time2 ? (
                  <p className={devicestyle.errorText}>{errors?.time2}</p>
                ) : (
                  ""
                )}
              </div>

              <div>
                <div className={devicestyle.deviceTimeList}>
                  <div className={devicestyle?.dayItemBox}>
                    <button
                      className={devicestyle.daysButton}
                      style={
                        values?.weekly_schedule?.every(
                          (ele) => ele?.status === 1
                        )
                          ? GetSelectedStyle
                          : {}
                      }
                      onClick={() => {
                        let data = !values?.weekly_schedule?.every(
                          (ele) => ele?.status === 1
                        );
                        setFieldValue(
                          "weekly_schedule",
                          values?.weekly_schedule?.map((ele, index) => ({
                            ...ele,
                            status: data ? 1 : 0,
                          }))
                        );
                      }}
                    >
                      All
                    </button>
                  </div>
                  {values?.weekly_schedule?.map((item, ind) => {
                    return (
                      <div className={devicestyle?.dayItemBox}>
                        <button
                          className={devicestyle.daysButton}
                          style={item?.status === 1 ? GetSelectedStyle : {}}
                          onClick={() => {
                            let data = !item?.status;
                            setFieldValue(
                              "weekly_schedule",
                              values?.weekly_schedule?.map((ele, index) =>
                                ind === index
                                  ? {
                                      ...ele,
                                      status: data ? 1 : 0,
                                    }
                                  : ele
                              )
                            );
                          }}
                        >
                          {item?.name}
                        </button>
                      </div>
                    );
                  })}
                </div>
                {errors?.weekly_schedule && touched?.weekly_schedule ? (
                  <p className={devicestyle.errorText}>
                    {errors?.weekly_schedule}
                  </p>
                ) : (
                  ""
                )}
              </div>

              <button
                type="button"
                className={devicestyle.timeSettingAddButton}
                onClick={() => {
                  handleSubmit();
                }}
              >
                Add
              </button>
            </div>
          </div>
        </>
      )}
      {checkIfListAvailable() ? (
        <div className={devicestyle.WeeklyDaysListStyle}>
          {weeklyTimeList?.map((timeItem, ItemIndex) => {
            if (timeItem?.valve_mode === 2) {
              return (
                <div
                  className={devicestyle.timeLineStyle}
                  style={{ alignItems: "center", gap: 20 }}
                >
                  {/* <p className={devicestyle.TextStyle}>{ItemIndex + 1} </p> */}
                  <div className={devicestyle?.inputContainer}>
                    <p
                      className={devicestyle.labelStyle}
                      style={{ color: valvetime ? "#000" : "green" }}
                    >
                      Device
                    </p>
                    {valvetime ? (
                      <CommonSelect
                        onChange={(data, opt) => {
                          setWeeklyTimeList((pre) =>
                            pre?.map((elem, index) =>
                              index === ItemIndex
                                ? {
                                    ...elem,
                                    device_id: data,
                                    device_name: opt?.device_name,
                                  }
                                : elem
                            )
                          );
                        }}
                        allowClear={false}
                        value={timeItem?.device_id}
                        options={valveList?.map((ele) => ({
                          ...ele,
                          label: ele?.device_name,
                          value: ele?.device_id,
                        }))}
                        placeholder={"Select Device"}
                        responsiveClassName={true}
                      />
                    ) : (
                      <div style={{ width: 150 }}>
                        <p className={devicestyle.TextStyle}>
                          {timeItem?.device_name}
                        </p>
                      </div>
                    )}{" "}
                  </div>
                  <div>
                    {valvetime ? (
                      <div>
                        <p className={devicestyle.labelStyle}>
                          {getValveTimeNames(motorMode)?.time1}
                        </p>

                        <CommonClockTimePicker
                          onChange={(date) => {
                            setWeeklyTimeList((pre) =>
                              pre?.map((elem, index) =>
                                index === ItemIndex
                                  ? {
                                      ...elem,
                                      time1: dayjs(date).format("HH:mm:00"),
                                    }
                                  : elem
                              )
                            );
                          }}
                          istimeField
                          istestFieldStyle={true}
                          value={
                            timeItem.time1
                              ? dayjs(timeItem.time1, "HH:mm").format(
                                  "YYYY-MM-DD HH:mm:ss"
                                )
                              : ""
                          }
                          placeholder={getValveTimeNames(motorMode)?.time1}
                          // showSecond={false}
                          // className={"timeInputBox"}
                        />
                        {/* <TimePicker
                              onChange={(date) => {
                                setWeeklyTimeList((pre) =>
                                  pre?.map((elem, index) =>
                                    index === ItemIndex
                                      ? {
                                          ...elem,
                                          time1:
                                            moment(date).format("HH:mm:00"),
                                        }
                                      : elem
                                  )
                                );
                              }}
                              value={
                                timeItem.time1
                                  ? moment(timeItem.time1, "HH:mm")
                                  : null
                              }
                              placeholder={getValveTimeNames(motorMode)?.time1}
                              showSecond={false}
                              className={"timeInputBox"}
                            /> */}
                        {/* <CommonDateTimePicker
                              value={dayjs(timeItem.time1, "HH:mm")}
                              onChange={(date) => {
                                setWeeklyTimeList((pre) =>
                                  pre?.map((elem, index) =>
                                    index === ItemIndex
                                      ? {
                                          ...elem,
                                          time1: dayjs(date).format("HH:mm:00"),
                                        }
                                      : elem
                                  )
                                );
                              }}
                              placeholder={getValveTimeNames(motorMode)?.time1}
                              formate={"HH:mm"}
                              picker={"time"}
                              allowClear={false}
                              styles={{ maxWidth: "180px", height: "45px" }}
                            /> */}
                      </div>
                    ) : (
                      <div style={{ width: 90 }}>
                        <p
                          className={devicestyle.labelStyle}
                          style={{ color: "green" }}
                        >
                          {getValveTimeNames(motorMode)?.time1}
                        </p>
                        <p className={devicestyle.TextStyle}>
                          {timeItem?.time1}
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    {valvetime ? (
                      <div>
                        <p className={devicestyle.labelStyle}>
                          {getValveTimeNames(motorMode)?.time2}
                        </p>
                        <CommonClockTimePicker
                          onChange={(date) => {
                            setWeeklyTimeList((pre) =>
                              pre?.map((elem, index) =>
                                index === ItemIndex
                                  ? {
                                      ...elem,
                                      time2: dayjs(date).format("HH:mm:00"),
                                    }
                                  : elem
                              )
                            );
                          }}
                          istimeField
                          istestFieldStyle={true}
                          styles={{ maxWidth: "180px", height: "45px" }}
                          value={
                            timeItem.time2
                              ? dayjs(timeItem.time2, "HH:mm").format(
                                  "YYYY-MM-DD HH:mm:ss"
                                )
                              : ""
                          }
                          ampm={false}
                          placeholder={getValveTimeNames(motorMode)?.time2}
                          // showSecond={false}
                          // className={"timeInputBox"}
                        />
                      </div>
                    ) : (
                      <div style={{ width: 90 }}>
                        <p
                          className={devicestyle.labelStyle}
                          style={{ color: "green" }}
                        >
                          {getValveTimeNames(motorMode)?.time2}
                        </p>
                        <p className={devicestyle.TextStyle}>
                          {timeItem?.time2}
                        </p>
                      </div>
                    )}
                  </div>

                  <>
                    <div className={devicestyle?.dayItemBox}>
                      <div className={devicestyle.deviceTimeList}>
                        <button
                          type="button"
                          disabled={!valvetime}
                          className={devicestyle.daysButton}
                          style={
                            timeItem?.weekly_schedule?.every(
                              (ele) => ele?.status === 1
                            )
                              ? GetSelectedStyle
                              : {}
                          }
                          onClick={() => {
                            let data = timeItem?.weekly_schedule?.every(
                              (ele) => ele?.status === 1
                            )
                              ? false
                              : true;
                            setWeeklyTimeList((pre) =>
                              pre?.map((item, index) =>
                                index === ItemIndex
                                  ? {
                                      ...item,
                                      weekly_schedule:
                                        timeItem?.weekly_schedule?.map(
                                          (ele, index) => ({
                                            ...ele,
                                            status: data ? 1 : 0,
                                          })
                                        ),
                                    }
                                  : item
                              )
                            );
                          }}
                        >
                          All
                        </button>
                        {timeItem?.weekly_schedule?.map((item, daysIndex) => {
                          return (
                            // <div className={devicestyle?.dayItemBox}>
                            <button
                              type="button"
                              disabled={!valvetime}
                              style={item?.status ? GetSelectedStyle : {}}
                              className={devicestyle.daysButton}
                              onClick={() => {
                                let status = !item?.status;
                                let weekSetting =
                                  timeItem?.weekly_schedule?.map(
                                    (elem, elemIndex) =>
                                      daysIndex === elemIndex
                                        ? {
                                            ...elem,
                                            status: status ? 1 : 0,
                                          }
                                        : elem
                                  );
                                handleChangeStatus(weekSetting, ItemIndex);
                              }}
                            >
                              {WeeklyDaysList[daysIndex].name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                  {/* </div> */}
                  {valvetime && (
                    <div>
                      <img
                        className={devicestyle.RemoveImage}
                        src={ExportedImages.RemoveIcon}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setShowModal({ show: true, index: ItemIndex });
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            }
          })}
        </div>
      ) : (
        ""
      )}
    </>
  );
}
