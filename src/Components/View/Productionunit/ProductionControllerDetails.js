import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  controllerrefreshapi,
  devicerefreshapi,
  editdevice,
  lastReceivedData,
  motordata,
  SimDropdownService,
  UpdateAMCReportService,
  viewdeviceapi,
} from "../../../Service/ApiService";
import Toggle from "../../ToggleButton";
import { ImSpinner11 } from "react-icons/im";
import { toast } from "react-hot-toast";
import Changestatus from "../../../Modalcomponents/Changestatus";
import Loader from "../../Loader";
import moment from "moment";

import { MdLocationOn } from "react-icons/md";
import productionstyle from "../Productionunit/production.module.css";
import dayjs from "dayjs";
import motorstyle from "../ViewController/motorcontroller.module.css";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import commonstyle from "../../../Assets/css/CommonStyle.module.css";
import {
  Float_Validation,
  getCatchMsg,
  getlimitAction,
  getUsagelimitAction,
  JSONtoformdatawithempty,
} from "../../../Utilities/Methods";

import CommonSelect from "../../CommonComponents/CommonSelect";
import { useFormik } from "formik";
import * as Yup from "yup";
import CommonInput from "../../CommonComponents/CommonInput";
import CommonDateTimePicker from "../../CommonComponents/CommonDatePicker";
import CommonSwitch from "../../CommonComponents/CommonSwitch";
import ConfirmationModal from "../../../Modalcomponents/ConfirmationModal";
import { ExportedImages } from "../../../Utilities/ImageExport";
import {
  onOffText,
  pumpText,
  reading100,
  FlowStatus,
  TankLight,
} from "../ViewController/HistoryDetails/ChlorinatorHistoryDetails";
import {
  MultiDeviceList,
  ChlorinatorChecklist,
  chlorinatorTicked,
} from "../../../Utilities/Constants";
import { Checkbox, Col, Row } from "antd";
import devicestyle from "../ViewController/motorcontroller.module.css";

const validationSchema = Yup.object().shape({
  amc_start_date: Yup.string().when("sim_id", (sim_id, schema) => {
    if (sim_id) return schema.required("Start Date is required");
    return schema;
  }),
  amc_cost: Yup.string().when("sim_id", (sim_id, schema) => {
    if (sim_id) return schema.required("Charges is required");
    return schema;
  }),
  validity: Yup.string().when("sim_id", (sim_id, schema) => {
    if (sim_id) return schema.required("Validity is required");
    return schema;
  }),
});

export default function ProductionControllerDetails() {
  let abortcontroller = undefined;
  const [modal, setmodal] = useState(false);
  const [data, setdata] = useState();
  // Rebuild of the "Last Received Data" live-preview panel — shows the
  // raw incoming readings for a not-yet-approved device (its own DB
  // row/columns stay empty pre-approval, since process_ingest()'s
  // check_device_approved gate blocks the write) using the WebhookCallHistory-
  // backed /controller/last_received_data endpoint, which logs every raw
  // message regardless of approval status. Polled every 10s per the
  // backend's own doc comment on that endpoint.
  const [liveFeed, setLiveFeed] = useState(null);
  const [loader, setloader] = useState(false);
  const [isloading, setloading] = useState(false);
  const [deviceid, setdeviceid] = useState();
  const [spinnerindevice, setspinnerindevice] = useState(false);
  let navigate = useNavigate();
  const [editAMC, setEditAMC] = useState(false);
  const [amcchangeStatus, setAmcchangeStatus] = useState({
    type: 0,
    show: false,
  });
  const positions = ["tank", "flow", "valve"];
  const [devicePositionList, setDevicePositionList] = useState({
    tank: [],
    flow: [],
    valve: [],
  });
  const [ShowEditPosition, setShowEditPosition] = useState(false);
  const [ShowEditChlorinator, setShowEditChlorinator] = useState(false);
  const [chlorinatorTicks, setChlorinatorTicks] = useState([]);
  const [type, settype] = useState({
    requesttypeOne: 1,
    requesttypeTwo: 2,
    requesttypeThree: 3,
    requesttypeFour: 4,
    requesttypeFive: 5,
    requesttypeSix: 6,
    requesttypeSeven: 7,
  });
  const [locationtype, setlocation] = useState(0);
  const [buttongreyid, setbuttongreyid] = useState(0);
  const [SimList, setSimList] = useState([]);
  let productiondata = JSON.parse(sessionStorage.getItem("details"));

  const { values, setFieldValue, errors, touched, handleSubmit, setValues } =
    useFormik({
      initialValues: {
        sim_id: null,
        amc_start_date: "",
        amc_cost: "",
        validity: "",
        amc_msg: "",
        remarks: "",
        status: "",
        amc_status: "",
        inactivate_delay: "",
        // deactivate_delay: "",
      },
      validationSchema,
      onSubmit: (values) => {
        UpdateAMCReportData(values);
      },
    });

  const UpdateAMCReportData = (values) => {
    // setloader(true);
    let finalObj = {
      controller_id: productiondata.controller_id || "",
      device_id: productiondata.device_id || "",
      sim_id: values?.sim_id || "",
      amc_start_date: values?.amc_start_date || "",
      amc_cost: values?.amc_cost || "",
      validity: values?.validity || "",
      amc_msg: values?.amc_msg || "",
      remarks: values?.remarks || "",
      status: values?.status === 1 ? 1 : 0,
      amc_status: values?.amc_status === 1 ? 1 : 0,
      inactivate_delay: values?.inactivate_delay || "",
      // deactivate_delay: values?.deactivate_delay || "",
    };
    if (productiondata.controller_id) {
      delete finalObj.device_id;
    } else {
      delete finalObj.controller_id;
    }

    UpdateAMCReportService(JSONtoformdatawithempty(finalObj))
      .then(({ data }) => {
        if (data.status === 1) {
          toast.success(data.msg);
          setEditAMC(false);
          toviewcontroller();
        } else {
          toast.error(data.msg);
        }
      })
      .catch((err) => {
        getCatchMsg(err);
      })
      .finally(() => {
        setloader(false);
      });
  };

  const handleChangeDevicePosition = (keyName, item) => {
    setDevicePositionList((pre) => ({
      ...pre,
      [`${keyName}`]: devicePositionList?.[`${keyName}`]?.includes(item?.id)
        ? devicePositionList?.[`${keyName}`]?.filter((ele) => ele !== item?.id)
        : [...pre?.[`${keyName}`], item?.id],
    }));
  };

  // A unit that is not Tested Ok yet has nothing saved, so its card is filled from the live
  // preview. The latest preview is kept here, so the values stay filled when the page
  // reloads its data (every minute) instead of going blank until the next preview.
  const previewRef = useRef(null);
  const withPreview = (unit) => {
    const preview = previewRef.current;
    if (!unit || unit.status === 1 || !preview) return unit;
    const merged = { ...unit };
    Object.keys(preview).forEach((key) => {
      const current = merged[key];
      const isPlaceholder =
        current === null ||
        current === undefined ||
        current === "" ||
        current === 0 ||
        current === "0";
      if (isPlaceholder) {
        merged[key] = preview[key];
      }
    });
    return merged;
  };

  // Which phases the motor card shows: by the software version when there is one, else by
  // the voltages that came in.
  const hasVolt = (value) =>
    value !== null && value !== undefined && value !== "" && Number(value) !== 0;
  const softwareDigit = parseInt(data?.software_version?.charAt(0));
  const showPhaseR =
    softwareDigit === 1 ||
    softwareDigit === 3 ||
    (Number.isNaN(softwareDigit) && hasVolt(data?.r));
  const showPhaseYB =
    softwareDigit === 3 || (Number.isNaN(softwareDigit) && hasVolt(data?.y));

  const toviewcontroller = () => {
    if (productiondata?.product_type === 1) {
      setloader(true);

      motordata(productiondata?.controller_id)
        .then(({ data }) => {
          setdata(withPreview(data));
          setValues({
            sim_id: data.sim_id || null,
            amc_start_date: data.amc_start_date || "",
            amc_cost: data.amc_cost || "",
            validity: data.validity || "",
            amc_msg: data.amc_msg || "",
            remarks: data.remarks || "",
            status: data.status || "",
            amc_status: data.amc_status || "",
            inactivate_delay: data.inactivate_delay || "",
          });
        })
        .catch((err) => {
          if (err?.response?.data?.detail?.[0]?.msg) {
            toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
          } else if (err?.response?.data?.detail) {
            toast(err?.response?.data?.detail, { type: "error" });
          } else {
            toast("Something went wrong!!", { type: "error" });
          }
        })
        .finally(() => setloader(false));
    } else if (productiondata?.product_type === 2) {
      setloader(true);

      viewdeviceapi(productiondata?.device_id)
        .then(({ data }) => {
          setdata(withPreview(data));
          setValues({
            sim_id: data.sim_id || null,
            amc_start_date: data.amc_start_date || "",
            amc_cost: data.amc_cost || "",
            validity: data.validity || "",
            amc_msg: data.amc_msg || "",
            remarks: data.remarks || "",
            status: data.status || "",
            amc_status: data.amc_status || "",
            inactivate_delay: data.inactivate_delay || "",
            // deactivate_delay: data.deactivate_delay || "",
          });
          const getStringToArray = (position) => {
            return position ? position.split(",").map(Number) : [];
          };

          if (data?.device_type === 5) {
            const { tank_position, flow_position, valve_position } = data;

            setDevicePositionList({
              tank: getStringToArray(tank_position),
              flow: getStringToArray(flow_position),
              valve: getStringToArray(valve_position),
            });
          }
        })
        .catch((err) => {
          if (err?.response?.data?.detail?.[0]?.msg) {
            toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
          } else if (err?.response?.data?.detail) {
            toast(err?.response?.data?.detail, { type: "error" });
          } else {
            toast("Something went wrong!!", { type: "error" });
          }
        })
        .finally(() => setloader(false));
    }
  };

  // const changesstatus = () => {
  //   if (productiondata?.controller_type) {
  //     setloader(true);

  //     let formdata = {
  //       controller_name: data?.controller_name,
  //       latitude: data?.latitude,
  //       longitude: data?.longitude,
  //       msg: data?.msg,
  //       status: data?.status,
  //     };
  //     editcontroller(productiondata?.controller_id, formdata)
  //       .then(({ data }) => {
  //         toast(data, { type: "success" });
  //         toviewcontroller();
  //         setmodal(false);
  //       })
  //       .catch()
  //       .finally(() => setloader(false));
  //   } else {
  //     if (productiondata?.device_type === 4) {
  //       setloader(true);

  //       let formdata = {
  //         device_name: data?.device_name,
  //         latitude: data?.latitude,
  //         longitude: data?.longitude,
  //         msg: data?.msg,
  //         status: data?.status,
  //         dim: data?.dim_level,
  //       };
  //       editdevice(formdata, productiondata?.device_id)
  //         .then(({ data }) => {
  //           toviewcontroller();
  //           setmodal(false);
  //           toast(data, { type: "success" });
  //         })
  //         .catch()
  //         .finally(() => setloader(false));
  //     } else if (productiondata?.device_type === 1) {
  //       setloader(true);

  //       let formdata = {
  //         device_name: data?.device_name,
  //         low_limit: data?.low_limit,
  //         high_limit: data?.high_limit,
  //         edit_action: 0,
  //         tank_height: data?.tank_height,
  //         eb_number: data?.eb_number,
  //         latitude: data?.latitude,
  //         longitude: data?.longitude,
  //         msg: data?.msg,
  //         status: data?.status,
  //         lora_status: data?.lora_status,
  //       };
  //       editdevice(formdata, productiondata?.device_id)
  //         .then(({ data }) => {
  //           toviewcontroller();

  //           toast(data, { type: "success" });

  //           setmodal(false);
  //         })
  //         .catch()
  //         .finally(() => setloader(false));
  //     } else if (productiondata?.device_type == 2) {
  //       setloader(true);

  //       let formdata = {
  //         device_name: data?.device_name,
  //         usage_limit: data?.usage_limit,
  //         eb_number: data?.eb_number,
  //         latitude: data?.latitude,
  //         longitude: data?.longitude,
  //         msg: data?.msg,
  //         status: data?.status,
  //         lora_status: 0,
  //       };
  //       editdevice(formdata, productiondata?.device_id)
  //         .then(({ data }) => {
  //           toviewcontroller();
  //           setmodal(false);
  //           toast(data, { type: "success" });
  //         })
  //         .catch((err) => {
  //           if (err?.response?.data?.detail?.[0]?.msg) {
  //             toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
  //           } else if (err?.response?.data?.detail) {
  //             toast(err?.response?.data?.detail, { type: "error" });
  //           } else {
  //             toast("Something went wrong!!", { type: "error" });
  //           }
  //         })
  //         .finally(() => setloader(false));
  //     } else if (productiondata?.device_type === 3) {
  //       setloader(true);

  //       let formdata = {
  //         device_name: data?.device_name,
  //         eb_number: data?.eb_number,
  //         latitude: data?.latitude,
  //         longitude: data?.longitude,
  //         msg: data?.msg,
  //         status: data?.status,
  //       };
  //       editdevice(formdata, productiondata?.device_id)
  //         .then(({ data }) => {
  //           toviewcontroller();
  //           setmodal(false);
  //           toast(data, { type: "success" });
  //         })
  //         .catch()
  //         .finally(() => setloader(false));
  //     }
  //   }
  // };

  const Changebutton = (togglestatus, valve_id, valve_type) => {
    //controller button
    if (abortcontroller) {
      abortcontroller.abort("error cancelled");
    }

    abortcontroller = new AbortController();

    if (productiondata?.product_type === 1) {
      // setloader(true);
      let formData = new FormData();
      formData.append("controller_id", productiondata?.controller_id);
      formData.append("controller_type", productiondata?.controller_type);
      formData.append("request_type", togglestatus ? 3 : 4);
      setbuttongreyid(productiondata?.controller_id);
      controllerrefreshapi(formData, abortcontroller)
        .then(({ data }) => {
          setTimeout(() => {
            toviewcontroller();
            setbuttongreyid(0);
          }, 5000);
        })
        .catch((err) => {})
        .finally(() => setloader(false));
    } //device button
    else if (productiondata?.device_type === 3) {
      // setloader(true);
      let formData = new FormData();
      formData.append("device_id", productiondata?.device_id);
      formData.append("device_type", productiondata?.device_type);
      formData.append("request_type", togglestatus ? 3 : 4);
      setbuttongreyid(productiondata?.device_id);
      devicerefreshapi(formData, abortcontroller)
        .then(({ data }) => {
          setTimeout(() => {
            toviewcontroller();
            setbuttongreyid(0);
          }, 5000);
        })
        .catch((err) => {});
      // .finally(() => setloader(false));
    } else if (productiondata?.device_type === 5) {
      // setloader(true);
      let formData = new FormData();
      formData.append("device_id", valve_id);
      formData.append("device_type", valve_type);
      formData.append("request_type", togglestatus ? 3 : 4);
      setbuttongreyid(valve_id);
      devicerefreshapi(formData, abortcontroller)
        .then(({ data }) => {
          setTimeout(() => {
            toviewcontroller();
            setbuttongreyid(0);
          }, 5000);
        })
        .catch((err) => {});
      // .finally(() => setloader(false));
    } else if (productiondata?.device_type === 4) {
      // setloader(true);
      let formData = new FormData();
      formData.append("device_id", productiondata?.device_id);
      formData.append("device_type", productiondata?.device_type);
      formData.append("request_type", togglestatus ? 3 : 4);
      setbuttongreyid(productiondata?.device_id);
      devicerefreshapi(formData, abortcontroller)
        .then(({ data }) => {
          setTimeout(() => {
            toviewcontroller();
            setbuttongreyid(0);
          }, 5000);
        })
        .catch((err) => {});
      // .finally(() => setloader(false));
    }
  };

  const loadingspinner = (requesttypedata) => {
    //controller data spinner and setting spinner

    if (abortcontroller) {
      abortcontroller.abort("error cancelled");
    }

    abortcontroller = new AbortController();

    if (requesttypedata === 1 || requesttypedata === 2) {
      // setloader(true);
      setloading(true);
      setTimeout(() => {
        setloading(false);
      }, 3000);
      let formData = new FormData();
      formData.append("controller_id", productiondata?.controller_id);
      formData.append("controller_type", productiondata?.controller_type);
      formData.append("request_type", requesttypedata === 1 ? 1 : 2);

      controllerrefreshapi(formData, abortcontroller)
        .then(({ data }) => {
          setTimeout(() => {
            toviewcontroller();
            setlocation(0);
          }, 5000);
        })
        .catch((err) => {});
      // .finally(() => setloader(false));
    } //device data spinner and setting spinner
    else if (requesttypedata === 3 || requesttypedata === 4) {
      // setloader(true);
      setspinnerindevice(true);
      setTimeout(() => {
        setspinnerindevice(false);
      }, 3000);
      let formData = new FormData();
      formData.append("device_id", productiondata?.device_id);
      formData.append("device_type", productiondata?.device_type);
      formData.append("request_type", requesttypedata === 3 ? 1 : 2);
      devicerefreshapi(formData, abortcontroller)
        .then(({ data }) => {
          setTimeout(() => {
            toviewcontroller();
            setlocation(0);
          }, 5000);
        })
        .catch((err) => {});
      // .finally(() => setloader(false));
    }
    //device location
    else if (requesttypedata === 5) {
      // setloader(true);

      let formData = new FormData();
      formData.append("device_id", productiondata?.device_id);
      formData.append("device_type", productiondata?.device_type);
      formData.append("request_type", 2);
      devicerefreshapi(formData, abortcontroller)
        .then(({ data }) => {
          setTimeout(() => {
            toviewcontroller();
            setlocation(0);
          }, 5000);
        })
        .catch((err) => {});
      // .finally(() => setloader(false));
    } //controller location
    else if (requesttypedata === 6) {
      // setloader(true);

      let formData = new FormData();
      formData.append("controller_id", productiondata?.controller_id);
      formData.append("controller_type", productiondata?.controller_type);
      formData.append("request_type", 2);
      controllerrefreshapi(formData, abortcontroller)
        .then(({ data }) => {
          setTimeout(() => {
            toviewcontroller();
            setlocation(0);
          }, 5000);
        })
        .catch((err) => {});
      // .finally(() => setloader(false));
    } else if (requesttypedata === 7) {
      // setloader(true);

      let formData = new FormData();
      formData.append("device_id", productiondata?.device_id);
      formData.append("device_type", productiondata?.device_type);
      formData.append("request_type", 2);
      devicerefreshapi(formData, abortcontroller)
        .then(({ data }) => {
          setTimeout(() => {
            toviewcontroller();
            setlocation(0);
          }, 5000);
        })
        .catch((err) => {});
    }
  };

  const getSimDropdown = () => {
    SimDropdownService().then(({ data }) => {
      if (data.status === 1) {
        let finalData = data.data.map((ele) => ({
          ...ele,
          label: ele.sim_number,
          value: ele.id,
        }));
        setSimList(finalData);
      } else {
        toast.error(data.msg);
      }
    });
  };

  // The ticks saved on the device (null: the checklist was never edited, none).
  const savedTicks = chlorinatorTicked(data?.chlorinator_position);
  useEffect(() => {
    setChlorinatorTicks(chlorinatorTicked(data?.chlorinator_position));
  }, [data?.chlorinator_position]);

  const handleChangeChlorinator = (id) => {
    setChlorinatorTicks((pre) =>
      pre.includes(id) ? pre.filter((ele) => ele !== id) : [...pre, id]
    );
  };

  // Like the multi positions: saving the ticks keeps the status the device has.
  const handleEditChlorinator = () => {
    setloader(true);
    let Ticks = {
      chlorinator_position: [...chlorinatorTicks].sort().join(","),
      device_name: data?.device_name,
      latitude: data.latitude,
      longitude: data.longitude,
      is_fixed: data?.is_fixed ? data?.is_fixed : 0,
      status: data?.status ?? 0,
    };
    editdevice(Ticks, data?.device_id)
      .then(({ data }) => {
        toviewcontroller();
        toast(data, { type: "success" });
      })
      .catch((err) => {
        getCatchMsg(err);
      })
      .finally(() => {
        setShowEditChlorinator(false);
        setloader(false);
      });
  };

  const handleEditPosition = () => {
    setloader(true);
    let Positions = {
      tank_position: devicePositionList?.tank.toString(),
      valve_position: devicePositionList?.valve.toString(),
      flow_position: devicePositionList?.flow.toString(),
      device_name: data?.device_name,
      latitude: data.latitude,
      longitude: data.longitude,
      is_fixed: data?.is_fixed ? data?.is_fixed : 0,
      // Saving positions must not mark the device Tested Ok: keep the status it
      // has (Tested Ok is set from the status change screen).
      status: data?.status ?? 0,
    };
    editdevice(Positions, data?.device_id)
      .then(({ data }) => {
        toviewcontroller();
        toast(data, { type: "success" });
      })
      .catch((err) => {
        getCatchMsg(err);
      })
      .finally(() => {
        setShowEditPosition(false);
        setloader(false);
      });
  };
  useEffect(() => {
    toviewcontroller();
    getSimDropdown();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      toviewcontroller();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const productCode = data?.device_code || data?.controller_code;
  useEffect(() => {
    if (!productCode) return;
    const fetchLiveFeed = () => {
      lastReceivedData(productCode)
        .then(({ data: resp }) => {
          setLiveFeed(resp);
          // Fill the card's own fields (Tank Level, volts, Hardware
          // Version, Total Usage, Flow Rate, etc.) from the parsed
          // preview — but only while the device is still unapproved.
          // The backend's own view endpoints (e.g. device.py's
          // view_device) deliberately return telemetry fields as 0 (not
          // null) when there's no reading row yet — e.g. "tank_level":
          // check_device_data.tank_level if check_device_data else 0 —
          // and check_device_data can ONLY be missing pre-approval (the
          // approval gate blocks it from ever being created), so 0 is
          // safe to treat as a placeholder here specifically because
          // we've confirmed status !== 1. Once Tested Ok, real data is
          // always authoritative and this merge is skipped entirely.
          if (
            resp?.error === 0 &&
            resp?.preview &&
            Object.keys(resp.preview).length
          ) {
            previewRef.current = resp.preview;
            setdata((prev) => withPreview(prev));
          }
        })
        .catch(() => {});
    };
    fetchLiveFeed();
    const interval = setInterval(fetchLiveFeed, 10000);
    return () => clearInterval(interval);
  }, [productCode]);

  const renderLiveFeed = () => {
    if (!liveFeed || liveFeed.error === 1 || !liveFeed.readings?.length) {
      return null;
    }
    return (
      <div
        style={{
          background: "#eef7e8",
          border: "1px solid #cfe8bd",
          borderRadius: 10,
          padding: "14px 18px",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 8,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 15 }}>
            Last Received Data
          </span>
          <span
            style={{
              background: "#3fae29",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              padding: "2px 10px",
              borderRadius: 12,
              letterSpacing: 0.5,
            }}
          >
            ● LIVE
          </span>
        </div>
        {liveFeed.readings.map((reading, index) => {
          const accepted = reading.api_response?.includes("Success");
          return (
            <div
              key={index}
              style={{
                padding: "8px 0",
                borderBottom:
                  index < liveFeed.readings.length - 1
                    ? "1px solid #d9e8cd"
                    : "none",
              }}
            >
              <span style={{ color: "#6b7a63", fontSize: 13 }}>
                {index === 0 ? "Latest - " : ""}
                {reading.datetime
                  ? moment(reading.datetime).format("DD-MM-YYYY HH:mm:ss")
                  : ""}
              </span>
              &nbsp;&nbsp;
              <span
                style={{
                  color: accepted ? "#1a8a1a" : "#c0392b",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                {accepted ? "Accepted" : "Rejected — not yet Tested Ok"}
              </span>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 12.5,
                  color: "#555",
                  marginTop: 2,
                  wordBreak: "break-all",
                }}
              >
                {reading.params}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <Loader isLoader={loader} />
      {modal ? (
        <Changestatus
          show={modal}
          close={() => setmodal(false)}
          status={data?.status}
          data={data}
          funcall={() => toviewcontroller()}
          devicePositionList={devicePositionList}
        />
      ) : null}
      {amcchangeStatus.show && (
        <ConfirmationModal
          show={amcchangeStatus.show}
          close={() => {
            setAmcchangeStatus({ show: false, type: 0 });
          }}
          msg={`Are you sure want to change this ${
            amcchangeStatus.type === 1 ? "Controller" : "AMC"
          } status?`}
          handleOkFunction={() => {
            if (amcchangeStatus.type === 1) {
              setFieldValue("status", values.status === 1 ? 2 : 1);
            } else if (amcchangeStatus.type === 2) {
              setFieldValue("amc_status", values?.amc_status === 1 ? 2 : 1);
            }
            setAmcchangeStatus({ show: false, type: 0 });
          }}
        />
      )}

      <br />

      {productiondata?.product_type === 1 ? (
        <div>
          {renderLiveFeed()}
          {
            <div className="controller-view">
              <div className="viewtop-div">
                <div className="editflex">
                  {data?.controller_name ? (
                    <div>
                      {data?.controller_name ? (
                        <OverlayTrigger
                          key="top"
                          placement="top"
                          overlay={
                            <Tooltip>
                              <strong>{data?.controller_name}</strong>
                            </Tooltip>
                          }
                        >
                          <p className={motorstyle.motor_name}>
                            {data?.controller_name}
                          </p>
                        </OverlayTrigger>
                      ) : (
                        <p className={motorstyle.motor_name}>
                          {data?.controller_name}
                        </p>
                      )}
                    </div>
                  ) : null}
                </div>

                <div className="motor-btn">
                  {isloading && data?.controller_id === deviceid ? (
                    <img
                      src={ExportedImages.GREEN_SPINNER_GIF}
                      alt="tower"
                      className="controllerdetailpinner"
                      style={{ height: "23px" }}
                    />
                  ) : (
                    <img
                      src={ExportedImages.SPINNER_ICON}
                      alt="rotating-arrow"
                      className="controllerdetailpinner"
                      onClick={() => {
                        loadingspinner(type.requesttypeOne);
                        setdeviceid(data.controller_id);
                      }}
                    />
                  )}
                  {data?.tower ? (
                    <div className="productioncontower">
                      <img
                        src={
                          data?.tower >= 20 && data?.tower <= 39
                            ? ExportedImages.TOWER_ICON1
                            : data?.tower >= 40 && data?.tower <= 59
                            ? ExportedImages.TOWER_ICON2
                            : data?.tower >= 60 && data?.tower <= 79
                            ? ExportedImages.TOWER_ICON3
                            : data?.tower >= 80 && data?.tower <= 99
                            ? ExportedImages.TOWER_ICON4
                            : data?.tower === 100
                            ? ExportedImages.TOWER_ICON5
                            : ExportedImages.EMPTY_TOWER_ICON
                        }
                        alt="tower"
                        style={{
                          width: "30px",
                          right: "-275px",
                          marginBottom: "0px",
                        }}
                      />
                      &nbsp;&nbsp;
                      <span>{data?.tower}%</span>
                    </div>
                  ) : (
                    <img
                      src={ExportedImages.EMPTY_TOWER_ICON}
                      alt="tower"
                      style={{ width: "30px" }}
                    />
                  )}
                </div>

                <div className="motor-btn">
                  {data?.last_updated_by ? (
                    <p className="byproduction">By {data?.last_updated_by}</p>
                  ) : null}

                  {buttongreyid === 1 ? (
                    <Toggle
                      // id={index}
                      buttoncol={"grey"}
                      isChecked={
                        parseInt(data?.controller_status) === 1 ? true : false
                      }
                      handleChange={({ status }) => {
                        Changebutton(status);
                      }}
                    />
                  ) : data?.controller_code ? (
                    <Toggle
                      // id={index}
                      isChecked={
                        parseInt(data?.controller_status) === 1 ? true : false
                      }
                      handleChange={({ status }) => {
                        Changebutton(status);
                        setbuttongreyid(1);
                      }}
                    />
                  ) : null}
                </div>
              </div>

              {/* <div className="update-details"> */}
              <div className="date-update">
                <div className="update-text">
                  <p className="tank-header">last update</p>

                  <p className="tank-date">
                    {data?.controller_datetime
                      ? data?.controller_datetime
                      : null}
                  </p>
                </div>

                {/* <div className="status-update p0"> */}
                {/* LOADING IMAGE */}

                {/* END */}
                <div>
                  <p className="tank-header">status update</p>
                  <p className="tank-date">
                    {data?.status_change_time ? data?.status_change_time : null}
                  </p>
                  {/* </div> */}
                </div>
              </div>

              <p className="line motorLine One"></p>
              {data?.controller_code ? (
                <>
                  <div className="sub-details">
                    {data?.software_version != null || showPhaseR ? (
                      showPhaseR ? (
                        <div className="data-update">
                          {showPhaseR ? (
                            <div className="motor-detail-sub-div bg-color-one">
                              <p className="volt-text-1">
                                <span>R</span>
                                {data?.r} V
                              </p>
                              <p className="volt-text-2">
                                <span>A</span>
                                {data?.rl1} A
                              </p>

                              <p className="tankpf">PF {data?.rpf1}</p>
                            </div>
                          ) : null}
                          {showPhaseYB ? (
                            <>
                              <div className="motor-detail-sub-div  bg-color-two">
                                <p className="volt-text-1">
                                  <span>Y</span> {data?.y} V
                                </p>
                                <p className="volt-text-2">
                                  <span>A</span>
                                  {data?.yl2} A
                                </p>
                                <p className="tankpf">PF {data?.ypf2}</p>
                              </div>

                              <div className="motor-detail-sub-div  bg-color-three">
                                <p className="volt-text-1">
                                  <span>B</span> {data?.b} V
                                </p>
                                <p className="volt-text-2">
                                  <span>A</span>
                                  {data?.bl3} A
                                </p>
                                <p className="tankpf">PF {data?.bpf3}</p>
                              </div>
                            </>
                          ) : null}
                        </div>
                      ) : null
                    ) : null}
                    {/* <div>
                      <p>
                        <span className="tank-header">Hardware Version - </span>
                        <span className="tank-date">
                          {data?.hardware_version
                            ? `${data?.hardware_version}`
                            : null}
                        </span>
                      </p>
                      <p>
                        <span className="tank-header">Software Version - </span>
                        <span className="tank-date">
                          {data?.software_version
                            ? `${data?.software_version}`
                            : null}
                        </span>
                      </p>
                    </div> */}
                    {/* {data?.software_version != null ? (
                      parseInt(data?.software_version?.charAt(0)) == 1 ||
                      parseInt(data?.software_version?.charAt(0)) == 3 ? (
                        <div className="data-update">
                          {parseInt(data?.software_version?.charAt(0)) == 1 ||
                          parseInt(data?.software_version?.charAt(0)) == 3 ? (
                            <div className="motor-detail-sub-div bg-color-one">
                              <p className="volt-text-1">
                                <span>R</span>
                                {data?.r} V
                              </p>
                              <p className="volt-text-2">
                                <span>A</span>
                                {data?.rl1} A
                              </p>

                              <p className="tankpf">PF {data?.rpf1}</p>
                            </div>
                          ) : null}
                          {parseInt(data?.software_version?.charAt(0)) == 3 ? (
                            <>
                              <div className="motor-detail-sub-div  bg-color-two">
                                <p className="volt-text-1">
                                  <span>Y</span> {data?.y} V
                                </p>
                                <p className="volt-text-2">
                                  <span>A</span>
                                  {data?.yl2} A
                                </p>
                                <p className="tankpf">PF {data?.ypf2}</p>
                              </div>

                              <div className="motor-detail-sub-div  bg-color-three">
                                <p className="volt-text-1">
                                  <span>B</span> {data?.b} V
                                </p>
                                <p className="volt-text-2">
                                  <span>A</span>
                                  {data?.bl3} A
                                </p>
                                <p className="tankpf">PF {data?.bpf3}</p>
                              </div>
                            </>
                          ) : null}
                        </div>
                      ) : data?.r || data?.y || data?.b ? (
                        <div className="data-update">
                          {data?.r ? (
                            <div className="motor-detail-sub-div bg-color-one">
                              <p className="volt-text-1">
                                <span>R</span>
                                {data?.r} V
                              </p>
                              <p className="volt-text-2">
                                <span>A</span>
                                {data?.rl1} A
                              </p>

                              <p className="tankpf">PF {data?.rpf1}</p>
                            </div>
                          ) : null}
                          {data?.y ? (
                            <div className="motor-detail-sub-div  bg-color-two">
                              <p className="volt-text-1">
                                <span>Y</span> {data?.y} V
                              </p>
                              <p className="volt-text-2">
                                <span>A</span>
                                {data?.yl2} A
                              </p>
                              <p className="tankpf">PF {data?.ypf2}</p>
                            </div>
                          ) : null}
                          {data?.b ? (
                            <div className="motor-detail-sub-div  bg-color-three">
                              <p className="volt-text-1">
                                <span>B</span> {data?.b} V
                              </p>
                              <p className="volt-text-2">
                                <span>A</span>
                                {data?.bl3} A
                              </p>
                              <p className="tankpf">PF {data?.bpf3}</p>
                            </div>
                          ) : null}
                        </div>
                      ) : null
                    ) : data?.r || data?.y || data?.b ? (
                      <div className="data-update">
                        {data?.r ? (
                          <div className="motor-detail-sub-div bg-color-one">
                            <p className="volt-text-1">
                              <span>R</span>
                              {data?.r} V
                            </p>
                            <p className="volt-text-2">
                              <span>A</span>
                              {data?.rl1} A
                            </p>

                            <p className="tankpf">PF {data?.rpf1}</p>
                          </div>
                        ) : null}
                        {data?.y ? (
                          <div className="motor-detail-sub-div  bg-color-two">
                            <p className="volt-text-1">
                              <span>Y</span> {data?.y} V
                            </p>
                            <p className="volt-text-2">
                              <span>A</span>
                              {data?.yl2} A
                            </p>
                            <p className="tankpf">PF {data?.ypf2}</p>
                          </div>
                        ) : null}
                        {data?.b ? (
                          <div className="motor-detail-sub-div  bg-color-three">
                            <p className="volt-text-1">
                              <span>B</span> {data?.b} V
                            </p>
                            <p className="volt-text-2">
                              <span>A</span>
                              {data?.bl3} A
                            </p>
                            <p className="tankpf">PF {data?.bpf3}</p>
                          </div>
                        ) : null}
                      </div>
                    ) : null} */}

                    <div
                      className={productionstyle.production_con_right_detail}
                    >
                      <p>
                        <span className="tank-header">ID - </span>
                        <span className="tank-date">
                          {data?.controller_code}
                        </span>
                      </p>

                      {/* <div className="service">
                        <p className="tank-header">Location</p>
                        <img
                          src={place}
                          alt="place"
                          onClick={() => {
                            loadingspinner(type.requesttypeSix);
                            setdeviceid("");
                          }}
                        />
                      </div> */}

                      <div className="service">
                        <p className="tank-header">Location</p>
                        {locationtype === 1 ? (
                          <MdLocationOn className="locateapi" />
                        ) : (
                          <MdLocationOn
                            className="locate"
                            onClick={() => {
                              loadingspinner(type.requesttypeSix);
                              setdeviceid("");
                              setlocation(1);
                            }}
                          />
                        )}
                      </div>

                      <div>
                        <p>
                          <span className="tank-header"> Lat - </span>
                          <span className="tank-date">
                            {data?.latitude ? `${data?.latitude}‘N` : null}
                          </span>
                        </p>
                        <p>
                          <span className="tank-header">Long - </span>
                          <span className="tank-date">
                            {data?.longitude ? `${data?.longitude}‘E` : null}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p>
                          <span className="tank-header">
                            Hardware Version -
                          </span>
                          <span className="tank-date">
                            {data?.hardware_version
                              ? `${data?.hardware_version}`
                              : null}
                          </span>
                        </p>
                        <p>
                          <span className="tank-header">
                            Software Version -
                          </span>
                          <span className="tank-date">
                            {data?.software_version
                              ? `${data?.software_version}`
                              : null}
                          </span>
                        </p>
                      </div>

                      <div>
                        <button
                          type="button"
                          className="settings-btn"
                          onClick={() => {
                            loadingspinner(type.requesttypeTwo);
                            setdeviceid("");
                          }}
                        >
                          {isloading && deviceid == "" ? (
                            <img
                              src={ExportedImages.WHITE_SPINNER_GIF}
                              className="settingspinner"
                            />
                          ) : (
                            <ImSpinner11 />
                          )}
                          &nbsp;&nbsp;&nbsp;Settings
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* <div className={productionstyle.production_con_status_flex}>
                    <button
                      type="button"
                      className={productionstyle.production_change_status_btn}
                      onClick={() => setmodal(true)}
                    >
                      Change Status
                    </button>
                    <p>
                      <span className="tank-header">Status - </span>
                      <span
                        className={
                          data?.status === -1
                            ? productionstyle.production_status_deleted
                            : data?.status === 0
                            ? productionstyle.production_status_inactive
                            : data?.status === 1
                            ? productionstyle.production_status_on
                            : data?.status === 2
                            ? productionstyle.production_status_waiting
                            : data?.status === 3
                            ? productionstyle.production_status_off
                            : null
                        }
                      >
                        {data?.status === -1
                          ? "Deleted"
                          : data?.status === 0
                          ? "InActive"
                          : data?.status === 1
                          ? "Tested Ok"
                          : data?.status === 2
                          ? "Waiting for Test"
                          : data?.status === 3
                          ? "Fault"
                          : null}
                      </span>
                    </p>
                    <button
                      type="button"
                      className={productionstyle.production_finish_btn}
                      // onClick={() => changesstatus()}
                      onClick={() => {
                        navigate("/production");
                      }}
                    >
                      Close
                    </button>
                  </div> */}
                  <br />
                </>
              ) : null}
            </div>
          }
        </div>
      ) : null}

      {productiondata?.device_type === 2 ? (
        <>
          {renderLiveFeed()}
          <div
            className={`${productionstyle.device_details_view}
        ${commonstyle.cards_padding}
        ${commonstyle.cards_border_radius}`}
          >
            <div className={`tank-level ${productionstyle.production_ID}`}>
              <div className={productionstyle.production_flow_spinner}>
                <div className="inputWidth">
                  {data?.device_name ? (
                    <OverlayTrigger
                      key="top"
                      placement="top"
                      overlay={
                        <Tooltip id="tooltip-top">
                          <strong>{data?.device_name}</strong>
                        </Tooltip>
                      }
                    >
                      <p
                        className={`${motorstyle.device_name} 
                         ${motorstyle.device_name_flow_col}`}
                      >
                        {data?.device_name}
                      </p>
                    </OverlayTrigger>
                  ) : (
                    <p className={motorstyle.device_name}>
                      {data?.device_name}
                    </p>
                  )}
                </div>
                {data?.tower ? (
                  <div>
                    <img
                      src={
                        data?.tower >= 20 && data?.tower <= 39
                          ? ExportedImages.TOWER_ICON1
                          : data?.tower >= 40 && data?.tower <= 59
                          ? ExportedImages.TOWER_ICON2
                          : data?.tower >= 60 && data?.tower <= 79
                          ? ExportedImages.TOWER_ICON3
                          : data?.tower >= 80 && data?.tower <= 99
                          ? ExportedImages.TOWER_ICON4
                          : data?.tower === 100
                          ? ExportedImages.TOWER_ICON5
                          : ExportedImages.EMPTY_TOWER_ICON
                      }
                      alt="tower"
                      className={productionstyle.production_flow_tower}
                    />
                    <span
                      className={productionstyle.production_flow_percentage}
                    >
                      {data?.tower}%
                    </span>
                  </div>
                ) : (
                  <img
                    src={ExportedImages.EMPTY_TOWER_ICON}
                    alt="tower"
                    className={productionstyle.production_flow_tower}
                  />
                )}
              </div>
              <div>
                {data?.last_updated_by ? (
                  <p className="byproduction">By {data?.last_updated_by}</p>
                ) : null}
                <p className="tank-date">{data?.device_time}</p>
              </div>
            </div>

            <div className={`tank-level ${productionstyle.production_ID}`}>
              <div className={productionstyle.production_spinner_div_style}>
                <p className={`tank-usage ${productionstyle.production_ID}`}>
                  <span className="tank-header">ID - </span>
                  <span className="tank-date">{data?.device_code}</span>
                </p>
                {/* LOADING IMAGE */}
                {spinnerindevice && deviceid === data?.device_id ? (
                  <img
                    src={ExportedImages.GREEN_SPINNER_GIF}
                    alt="tower"
                    style={{ height: "23px" }}
                    className={productionstyle.production_spinner}
                  />
                ) : (
                  <img
                    src={ExportedImages.SPINNER_ICON}
                    alt="rotating-arrow"
                    onClick={() => {
                      loadingspinner(type.requesttypeThree);
                      setdeviceid(data?.device_id);
                    }}
                    className={productionstyle.production_spinner}
                  />
                )}
                {/* END */}
              </div>
              <p className={`tank-usage sasi ${productionstyle.production_ID}`}>
                <span className="tank-header">Usage Limit - </span>
                <span className="tank-date"> {data?.usage_limit}</span>&nbsp;
                <span className="tank-date">
                  {data?.usage_limit_status === 1 ? "off motor" : "on motor"}
                </span>
              </p>
            </div>

            <div className="sub-details">
              <div className="productionflex-data">
                <p className="tank-usage">
                  <span className="tank-header">Total usage - </span>
                  <span className="tank-date">{data?.total_usage}</span>
                </p>
                <p className="tank-usage">
                  <span className="tank-header">Daily Usage - </span>
                  <span className="tank-date">{data?.today_usage}</span>
                </p>
                <p className="tank-usage">
                  <span className="tank-header">Location </span>
                  {locationtype === 1 ? (
                    <MdLocationOn className="locateapi" />
                  ) : (
                    <MdLocationOn
                      className="locate"
                      onClick={() => {
                        loadingspinner(type.requesttypeFive);
                        setdeviceid("");
                        setlocation(1);
                      }}
                    />
                  )}
                </p>
                <p>
                  <span className="tank-header"> Lat - </span>
                  <span className="tank-date">
                    &nbsp;{data?.latitude ? `${data?.latitude} ‘N` : null}
                  </span>
                </p>
                <p>
                  <span className="tank-header"> Long - </span>
                  <span className="tank-date">
                    &nbsp;{data?.longitude ? `${data?.longitude} ‘E` : null}
                  </span>
                </p>

                <p className="tank-usage">
                  <span className="tank-header">Source - </span>
                  <span className="tank-date">
                    {data?.source !== null
                      ? data?.source == 0
                        ? "EB"
                        : "Battery"
                      : null}
                  </span>
                </p>
                {data?.source == 1 ? (
                  <>
                    <p className="tank-usage">
                      <span className="tank-header">Battery - </span>
                      <span className="tank-date"> {data?.battery} </span>
                    </p>
                    <p className="tank-usage">
                      <span className="tank-header">Solar Panel - </span>
                      <span className="tank-date">{data?.solar_panel}</span>
                    </p>
                  </>
                ) : null}
              </div>

              <div>
                <img
                  src={ExportedImages.Flow_Image}
                  alt="flowgif"
                  className={productionstyle.production_flow_gif}
                />
              </div>

              <div className="productionflex-data text-end">
                <p className="tank-usage">
                  <span className="tank-header">Flow Rate - </span>
                  <span className="tank-date"> {data?.flow_rate}</span>
                </p>
                <p className="tank-usage">
                  <span className="tank-header">Daily Update </span>
                  <span className="tank-date">
                    {data?.daily_update == null ? null : -data?.daily_update}
                  </span>
                </p>
                <p>
                  <span className="tank-header">Hardware Version - </span>
                  <span className="tank-date">{data?.hardware_version}</span>
                </p>
                <p>
                  <span className="tank-header">Software Version - </span>
                  <span className="tank-date">{data?.software_version}</span>
                </p>
                <p>
                  <button
                    type="button"
                    className="settings-btn"
                    onClick={() => {
                      loadingspinner(type.requesttypeFour);
                      setdeviceid("");
                    }}
                  >
                    {spinnerindevice && deviceid === "" ? (
                      <img
                        src={ExportedImages.WHITE_SPINNER_GIF}
                        className="settingspinner"
                      />
                    ) : (
                      <ImSpinner11 />
                    )}
                    <ImSpinner11 />
                    &nbsp;&nbsp;&nbsp;Settings
                  </button>
                </p>

                <p className="tank-usage">
                  <span className="tank-header">Liter/Pulse - </span>
                  <span className="tank-date"> {data?.lt_per_pulse}</span>
                </p>
              </div>
            </div>

            {/* <div
              className={`${productionstyle.production_device_status_flex} ${productionstyle.production_flow_status}`}
            >
              <button
                type="button"
                className={productionstyle.production_device_cgangestatus_btn}
                onClick={() => setmodal(true)}
              >
                Change Status
              </button>

              <p className="tank-usage">
                <span className="tank-header">Status - </span>
                <span
                  className={
                    data?.status === -1
                      ? productionstyle.production_status_deleted
                      : data?.status === 0
                      ? productionstyle.production_status_inactive
                      : data?.status === 1
                      ? productionstyle.production_status_on
                      : data?.status === 2
                      ? productionstyle.production_status_waiting
                      : data?.status === 3
                      ? productionstyle.production_status_off
                      : null
                  }
                >
                  {data?.status === -1
                    ? "Deleted"
                    : data?.status === 0
                    ? "InActive"
                    : data?.status === 1
                    ? "Tested Ok"
                    : data?.status === 2
                    ? "Waiting for Test"
                    : data?.status === 3
                    ? "Fault"
                    : null}
                </span>
              </p>

              <button
                type="button"
                className={productionstyle.production_device_finish_btn}
                // onClick={() => changesstatus()}
                onClick={() => {
                  navigate("/production");
                }}
              >
                Close
              </button>
            </div> */}
          </div>
        </>
      ) : null}

      {productiondata?.device_type === 6 ? (
        <>
          {renderLiveFeed()}
          <div
            className={`${productionstyle.device_details_view}
        ${commonstyle.cards_padding}
        ${commonstyle.cards_border_radius}`}
          >
            <div className={`tank-level ${productionstyle.production_ID}`}>
              <div className={productionstyle.production_flow_spinner}>
                <div className="inputWidth">
                  <p
                    className={`${motorstyle.device_name} ${motorstyle.device_name_flow_col}`}
                  >
                    {data?.device_name || "Chlorinator"}
                  </p>
                </div>
              </div>
              <div>
                {data?.last_updated_by ? (
                  <p className="byproduction">By {data?.last_updated_by}</p>
                ) : null}
                <p className="tank-date">{data?.device_time}</p>
              </div>
            </div>

            <div className={`tank-level ${productionstyle.production_ID}`}>
              <div className={productionstyle.production_spinner_div_style}>
                <p className={`tank-usage ${productionstyle.production_ID}`}>
                  <span className="tank-header">ID - </span>
                  <span className="tank-date">{data?.device_code}</span>
                </p>
                {/* LOADING IMAGE */}
                {spinnerindevice && deviceid === data?.device_id ? (
                  <img
                    src={ExportedImages.GREEN_SPINNER_GIF}
                    alt="loading"
                    style={{ height: "23px" }}
                    className={productionstyle.production_spinner}
                  />
                ) : (
                  <img
                    src={ExportedImages.SPINNER_ICON}
                    alt="rotating-arrow"
                    onClick={() => {
                      loadingspinner(type.requesttypeThree);
                      setdeviceid(data?.device_id);
                    }}
                    className={productionstyle.production_spinner}
                  />
                )}
                {/* END */}
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <p style={{ margin: 0, fontWeight: 500 }}>Chlorinator Position</p>
                <img
                  src={!ShowEditChlorinator ? ExportedImages.EDIT_ICON_BLUE : ExportedImages.SAVE_ICON_BLUE}
                  alt="edit"
                  onClick={() => {
                    if (ShowEditChlorinator) {
                      handleEditChlorinator();
                    } else {
                      setShowEditChlorinator((pre) => !pre);
                    }
                  }}
                  className="pointerCurser"
                />
              </div>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 4, fontSize: 14 }}>
                <thead>
                  <tr>
                    {ChlorinatorChecklist.map((item) => (
                      <th key={item.id} style={{ ...{ borderRadius: 4, padding: "8px 10px", textAlign: "center" }, background: "#eaf6fb", fontWeight: 500 }}>
                        {item.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {ChlorinatorChecklist.map((item) => (
                      <td key={item.id} style={{ padding: "8px 10px", textAlign: "center" }}>
                        <Checkbox
                          disabled={!ShowEditChlorinator}
                          className={"CheckBox_innerStyle"}
                          checked={chlorinatorTicks.includes(item.id)}
                          onChange={() => handleChangeChlorinator(item.id)}
                        />
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="sub-details" style={{ display: "flex", flexWrap: "nowrap", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
              <div className="productionflex-data">
                {savedTicks.includes(3) ? (
                <p className="tank-usage">
                  <span className="tank-header">TDS - </span>
                  <span className="tank-date">{data?.tds}</span>
                </p>
                ) : null}
                {savedTicks.includes(2) ? (
                <p className="tank-usage">
                  <span className="tank-header">pH - </span>
                  <span className="tank-date">{reading100(data?.ph)}</span>
                </p>
                ) : null}
                {savedTicks.includes(4) ? (
                <p className="tank-usage">
                  <span className="tank-header">Chlorine - </span>
                  <span className="tank-date">{reading100(data?.chlorine)}</span>
                </p>
                ) : null}
                {savedTicks.includes(1) ? (
                <p className="tank-usage">
                  <span className="tank-header">Dosing switch - </span>
                  <span className="tank-date">{onOffText(data?.dosing_switch)}</span>
                </p>
                ) : null}
                {savedTicks.includes(1) ? (
                <p className="tank-usage">
                  <span className="tank-header">Dosing pump - </span>
                  <span className="tank-date">{pumpText(data?.dosing_pump)}</span>
                </p>
                ) : null}
              </div>

              <div>
                <img
                  src={ExportedImages.Chlorinator_Image}
                  alt="chlorinator"
                  className={productionstyle.production_flow_gif}
                  // The flow meter picture is placed for a taller card; this card
                  // is shorter, so the symbol is smaller and sits in the middle.
                  style={{
                    position: "static",
                    margin: "0 auto",
                    width: "130px",
                    height: "130px",
                    objectFit: "contain",
                  }}
                />
              </div>

              <div className="productionflex-data" style={{ textAlign: "left" }}>
                {savedTicks.includes(1) ? (
                <p className="tank-usage">
                  <span className="tank-header">Agitator - </span>
                  <span className="tank-date">{onOffText(data?.agitator)}</span>
                </p>
                ) : null}
                {savedTicks.includes(1) ? (
                <p className="tank-usage">
                  <span className="tank-header">Tank - </span>
                  <span className="tank-date"><TankLight value={data?.float_status} /></span>
                </p>
                ) : null}
                {savedTicks.includes(1) ? (
                <p className="tank-usage">
                  <span className="tank-header">Flow - </span>
                  <span className="tank-date"><FlowStatus value={data?.pressure_switch} /></span>
                </p>
                ) : null}
                <p>
                  <span className="tank-header">Hardware Version - </span>
                  <span className="tank-date">{data?.hardware_version}</span>
                </p>
                <p>
                  <span className="tank-header">Software Version - </span>
                  <span className="tank-date">{data?.software_version}</span>
                </p>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {productiondata?.device_type === 4 ? (
        <>
          <div
            className={`${productionstyle.device_details_view}
        ${commonstyle.cards_padding} 
        ${commonstyle.cards_border_radius}`}
          >
            {/* <div className="data-data  tank-bgcolor"> */}
            <div className="setting-top-bar">
              <div className="setting-sub-bar">
                {data?.device_name ? (
                  <div>
                    {data?.device_name ? (
                      <OverlayTrigger
                        key="top"
                        placement="top"
                        overlay={
                          <Tooltip>
                            <strong>{data?.device_name}</strong>
                          </Tooltip>
                        }
                      >
                        <p
                          className={`${motorstyle.device_name} 
                        ${motorstyle.device_name_valve_col}`}
                        >
                          {data?.device_name}
                        </p>
                      </OverlayTrigger>
                    ) : (
                      <p
                        className={`${motorstyle.device_name} 
                        ${motorstyle.device_name_valve_col}`}
                      >
                        {data?.device_name}
                      </p>
                    )}
                  </div>
                ) : null}
                {data?.tower ? (
                  <div className="productioncontower">
                    <img
                      src={
                        data?.tower >= 20 && data?.tower <= 39
                          ? ExportedImages.TOWER_ICON1
                          : data?.tower >= 40 && data?.tower <= 59
                          ? ExportedImages.TOWER_ICON2
                          : data?.tower >= 60 && data?.tower <= 79
                          ? ExportedImages.TOWER_ICON3
                          : data?.tower >= 80 && data?.tower <= 99
                          ? ExportedImages.TOWER_ICON4
                          : data?.tower === 100
                          ? ExportedImages.TOWER_ICON5
                          : ExportedImages.EMPTY_TOWER_ICON
                      }
                      alt="tower"
                      style={{ width: "30px" }}
                      className="lightTower"
                    />
                    &nbsp;&nbsp;
                    <span className={productionstyle.light_tower_percentage}>
                      {data?.tower}%
                    </span>
                  </div>
                ) : (
                  <img
                    src={ExportedImages.EMPTY_TOWER_ICON}
                    alt="tower"
                    style={{ width: "30px" }}
                  />
                )}
              </div>

              <div className="production_light_button">
                {data?.last_updated_by ? (
                  <p className="byproduction">By {data?.last_updated_by}</p>
                ) : null}
                <div className="edit-off">
                  {buttongreyid === 1 ? (
                    <Toggle
                      // id={index}
                      buttoncol={"grey"}
                      isChecked={data?.light_status == 1 ? true : false}
                      handleChange={({ status }) => {
                        Changebutton(status);
                      }}
                    />
                  ) : data?.device_code ? (
                    <Toggle
                      isChecked={data?.light_status == 1 ? true : false}
                      handleChange={({ status }) => {
                        Changebutton(status);
                        setbuttongreyid(1);
                      }}
                    />
                  ) : null}
                </div>
              </div>
            </div>
            <div className="setting-top-bar setting-height">
              <p className="tank-usage d-grid pb-2">
                <span className="tank-header">last time - </span>
                <span className="tank-date">
                  {data?.device_time !== null && data?.device_time.includes("T")
                    ? moment(data?.device_time).format("DD-MM-YYYY HH:mm:ss")
                    : data?.device_time}
                </span>
              </p>
              <p>
                {/* LOADING IMAGE */}
                {spinnerindevice && deviceid === data?.device_id ? (
                  <img
                    src={ExportedImages.GREEN_SPINNER_GIF}
                    alt="tower"
                    className="tanpkinner data_spinner"
                    style={{ height: "23px" }}
                  />
                ) : (
                  <img
                    src={ExportedImages.SPINNER_ICON}
                    alt="rotating-arrow"
                    className="tanpkinner data_spinner"
                    onClick={() => {
                      loadingspinner(type.requesttypeThree);
                      setdeviceid(data?.device_id);
                    }}
                  />
                )}
                {/* END */}
                <p className="tank-usage d-grid">
                  <span className="tank-header">status time - </span>
                  <span className="tank-date">
                    {data?.on_off_time !== null
                      ? data?.on_off_time?.includes("T")
                        ? moment(data?.on_off_time).format(
                            "DD-MM-YYYY HH:mm:ss"
                          )
                        : data?.on_off_time
                      : ""}
                  </span>
                </p>
              </p>
            </div>
            <div className="setting-top-bar">
              <div>
                <p className="tank-usage">
                  <span className="tank-header">ID - </span>
                  <span className="tank-date">{data?.device_code}</span>
                </p>
                <p className="tank-usage">
                  <span className="tank-header">Dim - </span>
                  <span className="tank-date">{data?.dim_level}% </span>
                </p>
                <p className="tank-usage">
                  <span className="tank-header">burning hour - </span>
                  <span className="tank-date">
                    <span>{data?.burning_hrs}</span>
                  </span>
                </p>
                <p className="tank-usage">
                  <span className="tank-header">Location </span>
                  &nbsp;
                  {locationtype === 1 ? (
                    <MdLocationOn className="locateapi" />
                  ) : (
                    <MdLocationOn
                      className="locate"
                      onClick={() => {
                        loadingspinner(type.requesttypeFive);
                        setdeviceid("");
                        setlocation(1);
                      }}
                    />
                  )}
                  &nbsp;
                </p>
                <p>
                  <span className="tank-header">Lat - </span>
                  <span className="tank-date">
                    {data?.latitude ? `${data?.latitude}‘N` : null}
                  </span>
                </p>
                <p>
                  <span className="tank-header">Long - </span>
                  <span className="tank-date">
                    {data?.longitude ? `${data?.longitude}‘E` : null}
                  </span>
                </p>
              </div>
              <div className={productionstyle.production_light_div}>
                <p className="tank-usage">
                  <span className="tank-header">volts - </span>
                  <span className="tank-date">
                    <span>{data?.volts}</span>
                  </span>
                </p>
                <p className="tank-usage">
                  <span className="tank-header">Amps - </span>
                  <span className="tank-date">{data?.amps}</span>
                </p>
                <p className="tank-usage">
                  <span className="tank-header">PF - </span>
                  <span className="tank-date">
                    <span>{data?.pf}</span>
                  </span>
                </p>
                <p className="tank-usage">
                  <span className="tank-header">Software Version - </span>
                  <span className="tank-date">{data?.software_version}</span>
                </p>
                <p className="tank-usage">
                  <span className="tank-header">Hardware Version - </span>
                  <span className="tank-date">
                    <span>{data?.hardware_version}</span>
                  </span>
                </p>
                <button
                  type="button"
                  className="settings-btn"
                  onClick={() => {
                    loadingspinner(type.requesttypeFour);
                    setdeviceid("");
                  }}
                >
                  {spinnerindevice && deviceid === "" ? (
                    <img
                      src={ExportedImages.WHITE_SPINNER_GIF}
                      className="settingspinner"
                    />
                  ) : (
                    <ImSpinner11 />
                  )}
                  &nbsp;&nbsp;&nbsp;Settings
                </button>
              </div>
            </div>
            {/* <div className={productionstyle.production_device_status_flex}>
              <button
                type="button"
                className={productionstyle.production_device_cgangestatus_btn}
                onClick={() => setmodal(true)}
              >
                Change Status
              </button>

              <p className="tank-usage">
                <span className="tank-header">Status - </span>
                <span
                  className={
                    data?.status === -1
                      ? productionstyle.production_status_deleted
                      : data?.status === 0
                      ? productionstyle.production_status_inactive
                      : data?.status === 1
                      ? productionstyle.production_status_on
                      : data?.status === 2
                      ? productionstyle.production_status_waiting
                      : data?.status === 3
                      ? productionstyle.production_status_off
                      : null
                  }
                >
                  {data?.status === -1
                    ? "Deleted"
                    : data?.status === 0
                    ? "InActive"
                    : data?.status === 1
                    ? "Tested Ok"
                    : data?.status === 2
                    ? "Waiting for Test"
                    : data?.status === 3
                    ? "Fault"
                    : null}
                </span>
              </p>

              <button
                type="button"
                className={productionstyle.production_device_finish_btn}
                // onClick={() => changesstatus()}
                onClick={() => {
                  navigate("/production");
                }}
              >
                Close
              </button>
            </div> */}
            {/* </div> */}
          </div>
        </>
      ) : null}

      {productiondata?.device_type === 1 ? (
        <>
          {renderLiveFeed()}
          <div
            className={`${productionstyle.device_details_view}
        ${commonstyle.cards_padding}
        ${commonstyle.cards_border_radius}`}
          >
            <div className={productionstyle.production_tank_top_div}>
              <div className={productionstyle.production_tank_tower}>
                {data?.device_name ? (
                  <OverlayTrigger
                    key="top"
                    placement="top"
                    overlay={
                      <Tooltip id="tooltip-top">
                        <strong> {data?.device_name}</strong>
                      </Tooltip>
                    }
                  >
                    <p
                      className={`${motorstyle.device_name} 
                      ${motorstyle.device_name_tank_col}`}
                    >
                      {data?.device_name}
                    </p>
                  </OverlayTrigger>
                ) : (
                  <p
                    className={`${motorstyle.device_name} 
                    ${motorstyle.device_name_tank_col}`}
                  >
                    {data?.device_name}
                  </p>
                )}
                <div className={productionstyle.production_tower}>
                  {data?.tower ? (
                    <>
                      <img
                        src={
                          data?.tower >= 20 && data?.tower <= 39
                            ? ExportedImages.TOWER_ICON1
                            : data?.tower >= 40 && data?.tower <= 59
                            ? ExportedImages.TOWER_ICON2
                            : data?.tower >= 60 && data?.tower <= 79
                            ? ExportedImages.TOWER_ICON3
                            : data?.tower >= 80 && data?.tower <= 99
                            ? ExportedImages.TOWER_ICON4
                            : data?.tower === 100
                            ? ExportedImages.TOWER_ICON5
                            : ExportedImages.EMPTY_TOWER_ICON
                        }
                        alt="tower"
                        className={
                          productionstyle.production_tank_tower_position
                        }
                      />
                      <span
                        className={productionstyle.production_tank_perentage}
                      >
                        {data?.tower}%
                      </span>
                    </>
                  ) : (
                    <img
                      src={ExportedImages.EMPTY_TOWER_ICON}
                      alt="tower"
                      className={productionstyle.production_tank_tower_position}
                    />
                  )}
                </div>
              </div>

              <div>
                {data?.last_updated_by ? (
                  <p className="byproduction">By {data?.last_updated_by}</p>
                ) : null}
                <p className="tank-date">{data?.device_time}</p>
              </div>
            </div>

            <div className="tank-level-data">
              <p className={productionstyle.production_ID}>
                <span className="tank-header">ID - </span>
                <span className="tank-date"> {data?.device_code} </span>
              </p>

              {/* LOADING IMAGE */}
              {spinnerindevice && deviceid === data.device_id ? (
                <img
                  src={ExportedImages.GREEN_SPINNER_GIF}
                  alt="tower"
                  className={productionstyle.production_tank_spinner}
                  style={{ height: "23px" }}
                />
              ) : (
                <img
                  src={ExportedImages.SPINNER_ICON}
                  alt="rotating-arrow"
                  style={{ height: "20px" }}
                  className={productionstyle.production_tank_spinner}
                  onClick={() => {
                    loadingspinner(type.requesttypeThree);
                    setdeviceid(data.device_id);
                  }}
                />
              )}
              {/* END */}

              <div className="btnWidth">
                <button
                  type="button"
                  className="settings-btn"
                  onClick={() => {
                    loadingspinner(type.requesttypeFour);
                    // setspinnerindevice(true);
                    setdeviceid("");
                  }}
                >
                  {spinnerindevice && deviceid === "" ? (
                    <img
                      src={ExportedImages.WHITE_SPINNER_GIF}
                      className="settingspinner"
                    />
                  ) : (
                    <ImSpinner11 />
                  )}
                  &nbsp;&nbsp;&nbsp;Settings
                </button>
              </div>
            </div>

            <div className="sub-details">
              <div className="w-40 detailsflex">
                <p>
                  <span className="tank-header">High Limit - </span>
                  <span className="tank-date">{data?.high_limit}</span>
                  <span className="tank-date">
                    {data?.high_limit_action === 0
                      ? "No action"
                      : data?.high_limit_action === 1
                      ? "Off Motor"
                      : data?.high_limit_action === 2
                      ? "On Motor"
                      : null}
                  </span>
                </p>

                <p className="d-inline-block ">
                  <span className="tank-header">Low Limit - </span>
                  <span className="tank-date">{data?.low_limit}</span>
                  <span className="tank-date">
                    {data?.low_limit_action === 0
                      ? "No action"
                      : data?.low_limit_action === 1
                      ? "Off Motor"
                      : data?.low_limit_action === 2
                      ? "On Motor"
                      : null}
                  </span>
                </p>
                <p>
                  <span className="tank-header">Tank Height - </span>
                  <span className="tank-date">
                    {" "}
                    {data?.tank_height
                      ? Number(data.tank_height)
                      : data?.tank_height}{" "}
                    ft
                  </span>
                </p>

                <p>
                  <span className="tank-header">Location</span>
                  &nbsp;
                  {locationtype === 1 ? (
                    <MdLocationOn className="locateapi" />
                  ) : (
                    <MdLocationOn
                      className="locate"
                      onClick={() => {
                        loadingspinner(type.requesttypeFive);
                        setdeviceid("");
                        setlocation(1);
                      }}
                    />
                  )}
                </p>
                <p>
                  <span className="tank-header"> Lat - </span>
                  <span className="tank-date">
                    {data?.latitude ? `${data?.latitude}‘N` : null}
                  </span>
                </p>
                <p>
                  <span className="tank-header"> Long - </span>
                  <span className="tank-date">
                    {data?.longitude ? `${data?.longitude}‘E` : null}
                  </span>
                </p>

                <p>
                  <span className="tank-header">Water Quality</span>
                  <span className="tank-date">
                    -
                    {data?.source !== null
                      ? data?.source == 0
                        ? "EB"
                        : "TDS"
                      : null}
                  </span>
                </p>
                {data?.source == 1 ? (
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                    }}
                  >
                    <p>
                      <span className="tank-header">TDS</span>
                      <span className="tank-date"> - {data?.battery}</span>
                    </p>
                    <p>
                      <span className="tank-header">PH</span>
                      <span className="tank-date"> - {data?.solar_panel}</span>
                    </p>
                  </div>
                ) : null}
                <p>
                  <span className="tank-header">Hardware Version - </span>
                  <span className="tank-date">{data?.hardware_version}</span>
                </p>
                <p>
                  <span className="tank-header">Software Version - </span>
                  <span className="tank-date">{data?.software_version}</span>
                </p>
              </div>
              <div className={productionstyle.production_tank_style}>
                <div>
                  <span className="tank-header">Tank Level-</span>
                  <span className="items-data">
                    {data?.tank_level !== null
                      ? `${Number(data?.tank_level)}%`
                      : null}
                  </span>
                </div>
                <div className={productionstyle.details_tank}>
                  {data?.tank_level !== null ? (
                    <>
                      <p className={productionstyle.tank_percentage_label}>
                        {data?.tank_level !== null
                          ? `${Number(data?.tank_level)}%`
                          : null}
                      </p>
                      {data?.tank_level >= 1 && data?.tank_level <= 10 ? (
                        <img
                          width={200}
                          src={ExportedImages.WATER_TANK_10_GIF}
                        />
                      ) : data?.tank_level > 10 && data?.tank_level <= 20 ? (
                        <img
                          width={200}
                          src={ExportedImages.WATER_TANK_20_GIF}
                        />
                      ) : data?.tank_level > 20 && data?.tank_level <= 30 ? (
                        <img
                          width={200}
                          src={ExportedImages.WATER_TANK_30_GIF}
                        />
                      ) : data?.tank_level > 30 && data?.tank_level <= 40 ? (
                        <img
                          width={200}
                          src={ExportedImages.WATER_TANK_40_GIF}
                        />
                      ) : data?.tank_level > 40 && data?.tank_level <= 60 ? (
                        <img
                          width={200}
                          src={ExportedImages.WATER_TANK_50_GIF}
                        />
                      ) : data?.tank_level > 60 && data?.tank_level <= 70 ? (
                        <img
                          width={200}
                          src={ExportedImages.WATER_TANK_60_GIF}
                        />
                      ) : data?.tank_level > 70 && data?.tank_level <= 80 ? (
                        <img
                          width={200}
                          src={ExportedImages.WATER_TANK_70_GIF}
                        />
                      ) : data?.tank_level > 80 && data?.tank_level <= 90 ? (
                        <img
                          width={200}
                          src={ExportedImages.WATER_TANK_80_GIF}
                        />
                      ) : data?.tank_level > 90 && data?.tank_level <= 95 ? (
                        <img
                          width={200}
                          src={ExportedImages.WATER_TANK_90_GIF}
                        />
                      ) : data?.tank_level > 95 && data?.tank_level <= 100 ? (
                        <img
                          width={200}
                          src={ExportedImages.WATER_TANK_100_GIF}
                        />
                      ) : (
                        <img
                          width={200}
                          src={ExportedImages.EMPTY_WATER_TANK}
                        />
                      )}
                    </>
                  ) : null}
                </div>
              </div>
            </div>
            {/* <div className={productionstyle.production_device_status_flex}>
              <button
                type="button"
                className={productionstyle.production_change_status_btn}
                onClick={() => setmodal(true)}
              >
                Change Status
              </button>

              <p>
                <span className="tank-header">Status - </span>
                <span
                  className={
                    data?.status === -1
                      ? productionstyle.production_status_deleted
                      : data?.status === 0
                      ? productionstyle.production_status_inactive
                      : data?.status === 1
                      ? productionstyle.production_status_on
                      : data?.status === 2
                      ? productionstyle.production_status_waiting
                      : data?.status === 3
                      ? productionstyle.production_status_off
                      : null
                  }
                >
                  {data?.status === -1
                    ? "Deleted"
                    : data?.status === 0
                    ? "InActive"
                    : data?.status === 1
                    ? "Tested Ok"
                    : data?.status === 2
                    ? "Waiting for Test"
                    : data?.status === 3
                    ? "Fault"
                    : null}
                </span>
              </p>

              <button
                type="button"
                className={productionstyle.production_finish_btn}
                // onClick={() => changesstatus()}
                onClick={() => {
                  navigate("/production");
                }}
              >
                Close
              </button>
            </div> */}
          </div>
        </>
      ) : null}

      {productiondata?.device_type === 3 ? renderLiveFeed() : null}
      {productiondata?.device_type === 3 ? (
        <div
          className={`${productionstyle.device_details_view}
        ${commonstyle.cards_padding}
        ${commonstyle.cards_border_radius}`}
        >
          <div className="tank-level">
            <div className={productionstyle.production_valve_spinner}>
              {data?.device_name ? (
                <div>
                  {data?.device_name ? (
                    <OverlayTrigger
                      key="top"
                      placement="top"
                      overlay={
                        <Tooltip>
                          <strong>{data?.device_name}</strong>
                        </Tooltip>
                      }
                    >
                      <p
                        className={`${motorstyle.device_name} 
              ${motorstyle.device_name_valve_col}`}
                      >
                        {data?.device_name}
                      </p>
                    </OverlayTrigger>
                  ) : (
                    <p
                      className={`${motorstyle.device_name} 
                    ${motorstyle.device_name_valve_col}`}
                    >
                      {data?.device_name}
                    </p>
                  )}
                </div>
              ) : null}

              {data?.tower ? (
                <div className={productionstyle.production_tower}>
                  <img
                    src={
                      data?.tower >= 20 && data?.tower <= 39
                        ? ExportedImages.TOWER_ICON1
                        : data?.tower >= 40 && data?.tower <= 59
                        ? ExportedImages.TOWER_ICON2
                        : data?.tower >= 60 && data?.tower <= 79
                        ? ExportedImages.TOWER_ICON3
                        : data?.tower >= 80 && data?.tower <= 99
                        ? ExportedImages.TOWER_ICON4
                        : data?.tower === 100
                        ? ExportedImages.TOWER_ICON5
                        : ExportedImages.EMPTY_TOWER_ICON
                    }
                    alt="tower"
                    style={{ width: "30px" }}
                    className="lightTower"
                  />
                  &nbsp;&nbsp;
                  <span className={productionstyle.valve_perentage}>
                    {data?.tower}%
                  </span>
                </div>
              ) : (
                <img
                  src={ExportedImages.EMPTY_TOWER_ICON}
                  alt="tower"
                  className={productionstyle.empty_tower_valve}
                />
              )}
            </div>
            <div>
              {data?.last_updated_by ? (
                <p className="byproduction">By {data?.last_updated_by}</p>
              ) : null}
              <p className="tank-date">{data?.device_time}</p>
            </div>
          </div>

          <div className="tank-level-data">
            <p className="tank-usage">
              <span className="tank-header">ID - </span>
              <span className="tank-date">{data?.device_code}</span>
            </p>
            {/* LOADING IMAGE */}
            {spinnerindevice && data?.device_id === deviceid ? (
              <img
                src={ExportedImages.GREEN_SPINNER_GIF}
                alt="tower"
                className="valvespinner"
                style={{ height: "23px" }}
              />
            ) : (
              <img
                src={ExportedImages.SPINNER_ICON}
                alt="rotating-arrow"
                className="valvespinner"
                onClick={() => {
                  loadingspinner(type.requesttypeThree);
                  setdeviceid(data?.device_id);
                }}
              />
            )}
            {/* END */}
            <div>
              <span>{data?.operated_by}</span>&nbsp;
              {buttongreyid === 1 ? (
                <Toggle
                  buttoncol={"grey"}
                  isChecked={data?.valve_status === 1 ? true : false}
                  handleChange={({ status }) => {
                    Changebutton(status);
                  }}
                />
              ) : data?.device_code ? (
                <Toggle
                  isChecked={data?.valve_status === 1 ? true : false}
                  handleChange={({ status }) => {
                    Changebutton(status);
                    setbuttongreyid(1);
                  }}
                />
              ) : null}
            </div>
          </div>

          <div className="sub-details">
            <div>
              <p className="tank-usage">
                <span className="tank-header">Mode - </span>
                <span className="tank-date">
                  {data?.valve_mode === 2
                    ? "Weekly"
                    : data?.valve_mode === 1
                    ? "Daily"
                    : "Manual"}
                </span>
              </p>
              <p className="tank-usage">
                <span className="tank-header">Location - </span>
                &nbsp;
                {locationtype === 1 ? (
                  <MdLocationOn className="locateapi" />
                ) : (
                  <MdLocationOn
                    className="locate"
                    onClick={() => {
                      loadingspinner(type.requesttypeFive);
                      setdeviceid("");
                      setlocation(1);
                    }}
                  />
                )}
              </p>
              <p>
                <span className="tank-header">Lat - </span>
                <span className="tank-date">
                  {data?.latitude ? `${data?.latitude}‘N` : null}
                </span>
              </p>
              <p>
                <span className="tank-header">Long - </span>
                <span className="tank-date">
                  {data?.longitude ? `${data?.longitude}‘E` : null}
                </span>
              </p>

              <p>
                <span className="tank-header">Source</span>
                <span className="tank-date">
                  -
                  {data?.source !== null
                    ? data?.source == 0
                      ? "EB"
                      : "Battery"
                    : null}
                </span>
              </p>
              {data?.source == 1 ? (
                <>
                  <p>
                    <span className="tank-header">Battery</span>
                    <span className="tank-date"> - {data?.battery}</span>
                  </p>
                  <p>
                    <span className="tank-header">Solar panel</span>
                    <span className="tank-date"> - {data?.solar_panel}</span>
                  </p>
                </>
              ) : null}
              <p>
                <span className="tank-header">Software Version - </span>
                <span className="tank-date">{data?.software_version}</span>
              </p>
              <p>
                <span className="tank-header">Hardware Version - </span>
                <span className="tank-date">{data?.hardware_version}</span>
              </p>
              <button
                type="button"
                className={`${productionstyle.settings_btn} settings-btn`}
                onClick={() => {
                  loadingspinner(type.requesttypeFour);
                  setdeviceid("");
                }}
              >
                {spinnerindevice && deviceid === "" ? (
                  <img
                    src={ExportedImages.WHITE_SPINNER_GIF}
                    className="settingspinner"
                  />
                ) : (
                  <ImSpinner11 />
                )}
                &nbsp;&nbsp;&nbsp;Settings
              </button>
            </div>
            <div>
              {/* <img
                src={ExportedImages.VALVE_IMG}
                alt="valve"
                className={productionstyle.production_valve}
              /> */}
              <img
                src={ExportedImages.valveImage}
                alt="valve"
                className={productionstyle.production_valve}
              />
            </div>
          </div>
          {/* <div className={productionstyle.production_device_status_flex}>
            <button
              type="button"
              className={productionstyle.production_change_status_btn}
              onClick={() => setmodal(true)}
            >
              Change Status
            </button>

            <p>
              <span className="tank-header">Status - </span>
              <span
                className={
                  data?.status === -1
                    ? productionstyle.production_status_deleted
                    : data?.status === 0
                    ? productionstyle.production_status_inactive
                    : data?.status === 1
                    ? productionstyle.production_status_on
                    : data?.status === 2
                    ? productionstyle.production_status_waiting
                    : data?.status === 3
                    ? productionstyle.production_status_off
                    : null
                }
              >
                {data?.status === -1
                  ? "Deleted"
                  : data?.status === 0
                  ? "InActive"
                  : data?.status === 1
                  ? "Tested Ok"
                  : data?.status === 2
                  ? "Waiting for Test"
                  : data?.status === 3
                  ? "Fault"
                  : null}
              </span>
            </p>

            <button
              type="button"
              className={productionstyle.production_finish_btn}
              // onClick={() => changesstatus()}
              onClick={() => {
                navigate("/production");
              }}
            >
              Close
            </button>
          </div> */}
        </div>
      ) : null}
      {productiondata?.device_type === 5 ? (
        <div style={{ display: "flex", gap: 10, flexDirection: "column" }}>
          {renderLiveFeed()}
          <div
            className={`${productionstyle.device_details_view}
        ${commonstyle.cards_padding} 
        ${commonstyle.cards_border_radius} w-100 mw-100`}
          >
            <div className={productionstyle.production_tank_top_div}>
              <div className={productionstyle.production_tank_tower}>
                {data?.device_name ? (
                  <OverlayTrigger
                    key="top"
                    placement="top"
                    overlay={
                      <Tooltip id="tooltip-top">
                        <strong> {data?.device_name}</strong>
                      </Tooltip>
                    }
                  >
                    <p
                      className={`${motorstyle.device_name} 
                      ${motorstyle.device_name_tank_col}`}
                    >
                      {data?.device_name}
                    </p>
                  </OverlayTrigger>
                ) : (
                  <p
                    className={`${motorstyle.device_name} 
                    ${motorstyle.device_name_tank_col}`}
                  >
                    {data?.device_name}
                  </p>
                )}
                <div className={productionstyle.production_tower}>
                  {data?.tower ? (
                    <>
                      <img
                        src={
                          data?.tower >= 20 && data?.tower <= 39
                            ? ExportedImages.TOWER_ICON1
                            : data?.tower >= 40 && data?.tower <= 59
                            ? ExportedImages.TOWER_ICON2
                            : data?.tower >= 60 && data?.tower <= 79
                            ? ExportedImages.TOWER_ICON3
                            : data?.tower >= 80 && data?.tower <= 99
                            ? ExportedImages.TOWER_ICON4
                            : data?.tower === 100
                            ? ExportedImages.TOWER_ICON5
                            : ExportedImages.EMPTY_TOWER_ICON
                        }
                        alt="tower"
                        className={
                          productionstyle.production_tank_tower_position
                        }
                      />
                      <span
                        className={productionstyle.production_tank_perentage}
                      >
                        {data?.tower}%
                      </span>
                    </>
                  ) : (
                    <img
                      src={ExportedImages.EMPTY_TOWER_ICON}
                      alt="tower"
                      className={productionstyle.production_tank_tower_position}
                    />
                  )}
                </div>
              </div>
              <div className={commonstyle.actionBlock}>
                <img
                  src={
                    !ShowEditPosition
                      ? ExportedImages.EDIT_ICON_BLUE
                      : ExportedImages.SAVE_ICON_BLUE
                  }
                  alt="edit"
                  onClick={() => {
                    if (ShowEditPosition) {
                      handleEditPosition();
                    } else {
                      setShowEditPosition((pre) => !pre);
                    }
                  }}
                  className="pointerCurser"
                />
                <div>
                  {data?.last_updated_by ? (
                    <p className="byproduction">By {data?.last_updated_by}</p>
                  ) : null}
                  <p className="tank-date">{data?.device_time}</p>
                  {/* <p
                    className="tank-date mergetankname NoWrapStyle"
                    style={{
                      alignItems: "flex-start",
                    }}
                  >
                    Setting Time &nbsp;
                  </p>{" "}
                  <p className="tank-date">
                    {data?.updated_at ? data?.updated_at : ""}
                  </p> */}
                </div>
              </div>
            </div>

            <div className="tank-level-data">
              <p className={productionstyle.production_ID}>
                <span className="tank-header">ID - </span>
                <span className="tank-date"> {data?.device_code} </span>
              </p>

              {/* LOADING IMAGE */}
              {spinnerindevice && deviceid === data.device_id ? (
                <img
                  src={ExportedImages.GREEN_SPINNER_GIF}
                  alt="tower"
                  className={productionstyle.production_tank_spinner}
                  style={{ height: "23px" }}
                />
              ) : (
                <img
                  src={ExportedImages.SPINNER_ICON}
                  alt="rotating-arrow"
                  style={{ height: "20px" }}
                  className={productionstyle.production_tank_spinner}
                  onClick={() => {
                    loadingspinner(type.requesttypeThree);
                    setdeviceid(data.device_id);
                  }}
                />
              )}
              {/* END */}

              <div
                className="btnWidth"
                style={{ alignItems: "center", gap: 5 }}
              >
                <button
                  type="button"
                  className="settings-btn"
                  onClick={() => {
                    loadingspinner(type.requesttypeFour);
                    // setspinnerindevice(true);
                    setdeviceid("");
                  }}
                >
                  {spinnerindevice && deviceid === "" ? (
                    <img
                      src={ExportedImages.WHITE_SPINNER_GIF}
                      className="settingspinner"
                    />
                  ) : (
                    <ImSpinner11 />
                  )}
                  &nbsp;&nbsp;&nbsp;Settings
                </button>
              </div>
            </div>
            <div className={commonstyle.slotContainer}>
              {positions.map((position) => (
                <div className={commonstyle.soltFlex} key={position}>
                  <p>
                    {position.charAt(0).toUpperCase() + position.slice(1)}{" "}
                    Position
                  </p>
                  <div className={commonstyle.soltFlex}>
                    {MultiDeviceList?.[position]?.map((item, index) => (
                      <div className={commonstyle.slotItmesFlex} key={item.id}>
                        <p>{index + 1}</p>
                        <Checkbox
                          disabled={!ShowEditPosition}
                          className={"CheckBox_innerStyle"}
                          checked={devicePositionList?.[position]?.includes(
                            item?.id
                          )}
                          onChange={() =>
                            handleChangeDevicePosition(position, item)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className={commonstyle.slotContainer}>
              <div className={commonstyle.ItemLineData}>
                <p className="tank-usage">
                  <Checkbox checked={data?.is_fixed ? true : false} disabled />
                  &nbsp;
                  <span className="tank-header">is Fixed</span>
                </p>
                <p className="tank-usage">
                  <span className="tank-header">Location - </span>
                  &nbsp;
                  {locationtype === 7 ? (
                    <MdLocationOn className="locateapi" />
                  ) : (
                    <MdLocationOn
                      className="locate"
                      onClick={() => {
                        loadingspinner(type.requesttypeSeven);
                        setdeviceid("");
                        setlocation(7);
                      }}
                    />
                  )}
                </p>
                <p>
                  <span className="tank-header"> Lat - </span>
                  <span className="tank-date">
                    {data?.latitude ? `${data?.latitude}‘N` : null}
                  </span>
                  <span className="tank-header"> Long - </span>
                  <span className="tank-date">
                    {data?.longitude ? `${data?.longitude}‘E` : null}
                  </span>
                </p>
                {data?.reserved1 && (
                  <p className="tank-header">{data?.reserved1}</p>
                )}
                {data?.reserved2 && (
                  <p className="tank-header">{data?.reserved2}</p>
                )}{" "}
                {data?.reserved3 && (
                  <p className="tank-header">{data?.reserved3}</p>
                )}{" "}
                {data?.reserved4 && (
                  <p className="tank-header">{data?.reserved4}</p>
                )}
              </div>

              <div className={commonstyle.ItemLineData}>
                <p>
                  <span className="tank-header">Water Quality</span>
                  <span className="tank-date">
                    -
                    {data?.source !== null
                      ? data?.source == 0
                        ? "EB"
                        : "TDS"
                      : null}
                  </span>
                </p>
                {data?.source == 1 ? (
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                    }}
                  >
                    <p>
                      <span className="tank-header">TDS</span>
                      <span className="tank-date"> - {data?.battery}</span>
                    </p>
                    <p>
                      <span className="tank-header">PH</span>
                      <span className="tank-date"> - {data?.solar_panel}</span>
                    </p>
                  </div>
                ) : null}
              </div>
              <div className={commonstyle.ItemLineData}>
                <p>
                  <span className="tank-header">Hardware Version - </span>
                  <span className="tank-date">{data?.hardware_version}</span>
                </p>
                <p>
                  <span className="tank-header">Software Version - </span>
                  <span className="tank-date">{data?.software_version}</span>
                </p>
              </div>
            </div>
          </div>
          {[
            ...(data?.valve_data || []),
            ...(data?.flow_data || []),
            ...(data?.level_data || []),
          ]?.length > 0 ? (
            <div
              className={`${productionstyle.device_details_view}
        ${commonstyle.cards_padding} 
        ${commonstyle.cards_border_radius} w-100 mw-100`}
            >
              <h3 style={{ fontSize: 20 }}>Devices</h3>
              <Row gutter={[10, 10]}>
                {data?.level_data?.length > 0 ? (
                  <Col xs={24}>
                    <Row gutter={[10, 10]}>
                      <Col xs={24}>
                        <p className={commonstyle.deviceHeader}>Tank</p>
                      </Col>
                      {data?.level_data?.map((tankItem, tankIndex) => {
                        return (
                          <Col xs={24} sm={24} md={12} lg={12} xl={6}>
                            <div className={commonstyle.CartItemBox}>
                              <div className={commonstyle.rowStyle}>
                                {tankItem?.device_name ? (
                                  <OverlayTrigger
                                    key="top"
                                    placement="top"
                                    overlay={
                                      <Tooltip id="tooltip-top">
                                        <strong>
                                          {" "}
                                          {tankItem?.device_name}
                                        </strong>
                                      </Tooltip>
                                    }
                                  >
                                    <p
                                      className={`${devicestyle.device_name} ${devicestyle.device_name_tank_col}`}
                                    >
                                      {tankItem?.device_name}
                                    </p>
                                  </OverlayTrigger>
                                ) : (
                                  <p
                                    className={`${devicestyle.device_name} ${devicestyle.device_name_tank_col}`}
                                  >
                                    {tankItem?.device_name}
                                  </p>
                                )}
                                {tankItem?.device_code && (
                                  <p>{tankItem?.device_code}</p>
                                )}
                                <p className="fw-bold h6">
                                  {tankItem?.device_order}
                                </p>
                              </div>
                              <div className={commonstyle.rowStyle}>
                                <div
                                  className={devicestyle.RowLineFlex}
                                  style={{ gap: 6 }}
                                >
                                  <p className="mergetankname  input_width NoWrapStyle">
                                    High Limit -
                                    <span className="tank-date">
                                      {tankItem?.high_limit}
                                    </span>
                                    &nbsp;
                                    <span className="tank-date">
                                      (
                                      {getlimitAction(
                                        tankItem.high_limit_action
                                      )}
                                      )
                                    </span>
                                  </p>
                                  <p
                                    className="mergetankname  input_width NoWrapStyle"
                                    style={{ alignItems: "flex-start" }}
                                  >
                                    Low Limit -
                                    <span className="tank-date">
                                      {tankItem?.low_limit}
                                    </span>
                                    &nbsp;
                                    <span className="tank-date">
                                      (
                                      {getlimitAction(
                                        tankItem.low_limit_action
                                      )}
                                      )
                                    </span>
                                  </p>
                                  <p
                                    className=" mergetankname  input_width NoWrapStyle"
                                    style={{ alignItems: "flex-start" }}
                                  >
                                    Tank Level -
                                    <span className="tank-date">
                                      {Number(tankItem?.tank_level) || 0}%
                                    </span>
                                  </p>
                                  <p
                                    className=" mergetankname  input_width NoWrapStyle"
                                    style={{ alignItems: "flex-start" }}
                                  >
                                    Tank Height -
                                    <span className="tank-date">
                                      {tankItem?.tank_height
                                        ? Number(tankItem.tank_height)
                                        : "-"}
                                    </span>
                                    <span className="tank-date"> ft</span>
                                  </p>
                                  <p
                                    className=" mergetankname  input_width NoWrapStyle"
                                    style={{ alignItems: "flex-start" }}
                                  >
                                    Default Level -
                                    <span className="tank-date">
                                      {tankItem?.default_level !== null
                                        ? tankItem?.default_level
                                        : "-"}
                                    </span>
                                    <span className="tank-date"> %</span>
                                  </p>
                                </div>{" "}
                                <div>
                                  <div className="multidevicetank">
                                    {tankItem?.tank_level !== null ? (
                                      <>
                                        <p
                                          className={
                                            productionstyle.multidevice_tank_percentage_label
                                          }
                                          style={{ left: "42px" }}
                                        >
                                          {tankItem?.tank_level !== null
                                            ? `${Number(tankItem?.tank_level)}%`
                                            : null}
                                        </p>
                                        {tankItem?.tank_level >= 1 &&
                                        tankItem?.tank_level <= 10 ? (
                                          <img
                                            width={200}
                                            src={
                                              ExportedImages.WATER_TANK_10_GIF
                                            }
                                          />
                                        ) : tankItem?.tank_level > 10 &&
                                          tankItem?.tank_level <= 20 ? (
                                          <img
                                            width={200}
                                            src={
                                              ExportedImages.WATER_TANK_20_GIF
                                            }
                                          />
                                        ) : tankItem?.tank_level > 20 &&
                                          tankItem?.tank_level <= 30 ? (
                                          <img
                                            width={200}
                                            src={
                                              ExportedImages.WATER_TANK_30_GIF
                                            }
                                          />
                                        ) : tankItem?.tank_level > 30 &&
                                          tankItem?.tank_level <= 40 ? (
                                          <img
                                            width={200}
                                            src={
                                              ExportedImages.WATER_TANK_40_GIF
                                            }
                                          />
                                        ) : tankItem?.tank_level > 40 &&
                                          tankItem?.tank_level <= 60 ? (
                                          <img
                                            width={200}
                                            src={
                                              ExportedImages.WATER_TANK_50_GIF
                                            }
                                          />
                                        ) : tankItem?.tank_level > 60 &&
                                          tankItem?.tank_level <= 70 ? (
                                          <img
                                            width={200}
                                            src={
                                              ExportedImages.WATER_TANK_60_GIF
                                            }
                                          />
                                        ) : tankItem?.tank_level > 70 &&
                                          tankItem?.tank_level <= 80 ? (
                                          <img
                                            width={200}
                                            src={
                                              ExportedImages.WATER_TANK_70_GIF
                                            }
                                          />
                                        ) : tankItem?.tank_level > 80 &&
                                          tankItem?.tank_level <= 90 ? (
                                          <img
                                            width={200}
                                            src={
                                              ExportedImages.WATER_TANK_80_GIF
                                            }
                                          />
                                        ) : tankItem?.tank_level > 90 &&
                                          tankItem?.tank_level <= 95 ? (
                                          <img
                                            width={200}
                                            src={
                                              ExportedImages.WATER_TANK_90_GIF
                                            }
                                          />
                                        ) : tankItem?.tank_level > 95 &&
                                          tankItem?.tank_level <= 100 ? (
                                          <img
                                            width={200}
                                            src={
                                              ExportedImages.WATER_TANK_100_GIF
                                            }
                                          />
                                        ) : (
                                          <img
                                            width={200}
                                            src={
                                              ExportedImages.EMPTY_WATER_TANK
                                            }
                                          />
                                        )}
                                      </>
                                    ) : null}
                                  </div>{" "}
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <p
                                      style={{
                                        fontWeight: "bolder",
                                      }}
                                    >
                                      {tankItem?.water_volume ?? "0"}
                                      kL
                                    </p>
                                  </div>
                                </div>
                                {/* <div>
                                  <p className="tank-date mergetankname  input_width NoWrapStyle">
                                    Tank Level -
                                    <span className="tank-date">
                                      {tankItem?.tank_level || 0}%
                                    </span>
                                  </p>
                                  <p className="tank-date mergetankname  input_width NoWrapStyle">
                                    Tank Height -
                                    <span className="tank-date">
                                      {tankItem?.tank_height !== null
                                        ? tankItem?.tank_height
                                        : "-"}
                                    </span>
                                    <span className="tank-date"> ft</span>
                                  </p>
                                </div> */}
                              </div>
                            </div>
                          </Col>
                        );
                      })}
                    </Row>
                  </Col>
                ) : null}
                {data?.flow_data?.length > 0 ? (
                  <Col xs={24}>
                    <Row gutter={[10, 10]}>
                      <Col xs={24}>
                        <p className={commonstyle.deviceHeader}>Flow</p>
                      </Col>
                      {data?.flow_data?.map((flowItem, tankIndex) => {
                        return (
                          <Col xs={24} sm={24} md={12} lg={12} xl={6}>
                            <div className={commonstyle.CartItemBox}>
                              <div className={commonstyle.rowStyle}>
                                {flowItem?.device_name ? (
                                  <OverlayTrigger
                                    key="top"
                                    placement="top"
                                    overlay={
                                      <Tooltip id="tooltip-top">
                                        <strong>
                                          {" "}
                                          {flowItem?.device_name}
                                        </strong>
                                      </Tooltip>
                                    }
                                  >
                                    <p
                                      className={`${devicestyle.device_name} ${devicestyle.device_name_flow_col}`}
                                    >
                                      {flowItem?.device_name}
                                    </p>
                                  </OverlayTrigger>
                                ) : (
                                  <p
                                    className={`${devicestyle.device_name} ${devicestyle.device_name_flow_col}`}
                                  >
                                    {flowItem?.device_name}
                                  </p>
                                )}
                                {flowItem?.device_code && (
                                  <p>{flowItem?.device_code}</p>
                                )}
                                <p className="fw-bold h6">
                                  {flowItem?.device_order}
                                </p>
                              </div>
                              <div className={commonstyle.rowStyle}>
                                <div
                                  className={devicestyle.RowLineFlex}
                                  style={{ gap: 6 }}
                                >
                                  <p className="tank-usage">
                                    <span className="tank-date mergetankname">
                                      Total usage -{" "}
                                    </span>
                                    <span className="tank-date">
                                      {flowItem.total_usage} kL
                                    </span>
                                  </p>
                                  <p className="tank-usage">
                                    <span className="tank-date mergetankname">
                                      Daily Usage -{" "}
                                    </span>
                                    <span className="tank-date">
                                      {flowItem.today_usage}
                                    </span>
                                  </p>
                                  <p
                                    className="e mergetankname  input_width NoWrapStyle"
                                    style={{ alignItems: "flex-start" }}
                                  >
                                    Usage Limit -{" "}
                                    <span className="tank-date">
                                      {flowItem?.usage_limit}
                                    </span>
                                    &nbsp;
                                    <span className="tank-date">
                                      {getUsagelimitAction(
                                        flowItem.usage_limit_action
                                      )}
                                    </span>
                                  </p>
                                  <p
                                    className=" mergetankname  input_width NoWrapStyle"
                                    style={{ alignItems: "flex-start" }}
                                  >
                                    Flow Rate -{" "}
                                    <span className="tank-date">
                                      {flowItem?.flow_rate}
                                    </span>
                                    {/* &nbsp; */}
                                    {/* <span className="tank-date">
                                    {getUsagelimitAction(
                                      flowItem.usage_limit_action
                                    )}
                                  </span> */}
                                  </p>
                                  <p
                                    className=" mergetankname  input_width NoWrapStyle"
                                    style={{ alignItems: "flex-start" }}
                                  >
                                    Battery -{" "}
                                    <span className="tank-date">
                                      {flowItem?.battery}
                                    </span>
                                  </p>
                                </div>
                                <div>
                                  <img
                                    src={ExportedImages.Flow_Image}
                                    width={80}
                                  />
                                </div>
                              </div>
                              {/* <div className={commonstyle.rowStyle}>
                                <div>
                                  <p
                                    className="tank-date mergetankname  input_width NoWrapStyle"
                                    style={{ alignItems: "flex-start" }}
                                  >
                                    Usage Limit -
                                    <span className="tank-date">
                                      {flowItem?.usage_limit}
                                    </span>
                                    &nbsp;
                                    <span className="tank-date">
                                      {getUsagelimitAction(
                                        flowItem.usage_limit_action
                                      )}
                                    </span>
                                  </p>
                                </div>
                              </div> */}
                            </div>
                          </Col>
                        );
                      })}
                    </Row>
                  </Col>
                ) : null}
                {data?.valve_data?.length > 0 ? (
                  <Col xs={24}>
                    <Row gutter={[10, 10]}>
                      <Col xs={24}>
                        <p className={commonstyle.deviceHeader}>Valve</p>
                      </Col>
                      {data?.valve_data?.map((valveItem, tankIndex) => {
                        return (
                          <Col xs={24} sm={24} md={12} lg={12} xl={6}>
                            <div className={commonstyle.CartItemBox}>
                              <div className={commonstyle.rowStyle}>
                                {valveItem?.device_name ? (
                                  <OverlayTrigger
                                    key="top"
                                    placement="top"
                                    overlay={
                                      <Tooltip id="tooltip-top">
                                        <strong>
                                          {valveItem?.device_name}
                                        </strong>
                                      </Tooltip>
                                    }
                                  >
                                    <p
                                      className={`${devicestyle.device_name} ${devicestyle.device_name_valve_col}`}
                                    >
                                      {valveItem?.device_name}
                                    </p>
                                  </OverlayTrigger>
                                ) : (
                                  <p
                                    className={`${devicestyle.device_name} ${devicestyle.device_name_valve_col}`}
                                  >
                                    {valveItem?.device_name}
                                  </p>
                                )}
                                {valveItem?.device_code && (
                                  <p>{valveItem?.device_code}</p>
                                )}

                                <p
                                  className="tank-usage"
                                  style={{ display: "flex", gap: 8 }}
                                >
                                  <span
                                    className="mobile"
                                    style={{
                                      width: "60px",
                                    }}
                                  >
                                    {valveItem.operated_by}
                                  </span>{" "}
                                  <div style={{ marginTop: 5 }}>
                                    {valveItem?.device_id === buttongreyid ? (
                                      <CommonSwitch
                                        checked={
                                          valveItem.valve_status === 1
                                            ? true
                                            : false
                                        }
                                        type={3}
                                        status={valveItem.valve_status}
                                        disabled={
                                          valveItem.valve_status === 2
                                            ? true
                                            : false
                                        }
                                        color="gray"
                                        tooltipText={
                                          valveItem.valve_status === 2
                                            ? "Field Error"
                                            : null
                                        }
                                        onChange={(status) => {
                                          Changebutton(
                                            status,
                                            valveItem?.device_id,
                                            valveItem?.device_type
                                          );
                                        }}
                                      />
                                    ) : (
                                      <CommonSwitch
                                        checked={
                                          valveItem.valve_status === 1
                                            ? true
                                            : false
                                        }
                                        type={3}
                                        status={valveItem.valve_status}
                                        disabled={
                                          valveItem.valve_status === 2
                                            ? true
                                            : false
                                        }
                                        color={
                                          valveItem.valve_status === 2
                                            ? "#494848"
                                            : ""
                                        }
                                        tooltipText={
                                          valveItem.valve_status === 2
                                            ? "Field Error"
                                            : null
                                        }
                                        onChange={(status) => {
                                          Changebutton(
                                            status,
                                            valveItem?.device_id,
                                            valveItem?.device_type
                                          );
                                        }}
                                      />
                                    )}
                                  </div>
                                </p>
                                <p className="fw-bold h6">
                                  {valveItem?.device_order}
                                </p>
                              </div>
                              <div className={commonstyle.rowStyle}>
                                <div
                                  className={devicestyle.RowLineFlex}
                                  style={{ gap: 6 }}
                                >
                                  <p className="tank-usage">
                                    <span className="tank-date mergetankname">
                                      Mode -{" "}
                                    </span>
                                    <span className="tank-date">
                                      {valveItem.valve_mode === 1
                                        ? ""
                                        : valveItem.valve_mode === 0
                                        ? "Manual"
                                        : valveItem.valve_mode === 2
                                        ? "Weekly"
                                        : ""}
                                    </span>
                                  </p>
                                  <p className="tank-usage">
                                    <span className="tank-date mergetankname">
                                      Status Update -
                                    </span>
                                    &nbsp;
                                  </p>{" "}
                                  <span className="tank-date">
                                    {valveItem?.status_updated_at
                                      ? dayjs(
                                          valveItem?.status_updated_at
                                        ).format("DD-MM-YYYY HH:mm:ss")
                                      : ""}
                                  </span>
                                </div>
                                <div>
                                  <img
                                    src={ExportedImages.valveImage}
                                    width={100}
                                  />
                                </div>
                              </div>
                            </div>
                          </Col>
                        );
                      })}
                    </Row>
                  </Col>
                ) : null}
              </Row>
            </div>
          ) : null}
        </div>
      ) : null}

      <br />

      <div className={productionstyle.amcContainer}>
        <div className="d-flex gap-2 justify-content-between align-items-center">
          <h3>AMC Report</h3>
          <img
            src={
              !editAMC
                ? ExportedImages.EDIT_ICON_BLUE
                : ExportedImages.SAVE_ICON_BLUE
            }
            alt="edit"
            onClick={() => {
              if (editAMC) {
                handleSubmit();
              } else {
                setEditAMC(!editAMC);
              }
            }}
            className="pointerCurser"
          />
        </div>
        <div className="row">
          <div
            className={`col-sm-12 col-md-6 col-lg-4 col-xl-3 px-3 ${productionstyle.acmDataBlock}`}
          >
            <p style={{ flexWrap: "wrap" }}>
              <span>SIM</span> -
              {editAMC ? (
                <CommonSelect
                  options={SimList}
                  value={values.sim_id}
                  // placeholder={"Sim"}
                  onChange={(data) => {
                    setFieldValue("sim_id", data);
                  }}
                  inlinefield={true}
                  allowClear={false}
                />
              ) : (
                <span>{data?.sim_number}</span>
              )}
            </p>
            <p>
              <span>Validity (In Months)</span> -
              {editAMC ? (
                <CommonInput
                  value={values.validity}
                  maxLength={3}
                  isNumber={true}
                  onChange={(data) => {
                    if ((data <= 100 || data === "") && data !== "0") {
                      setFieldValue("validity", data);
                    }
                  }}
                  styles={{
                    borderColor:
                      errors.validity && touched.validity ? "red" : "",
                  }}
                  inlinefield={true}
                />
              ) : (
                <span>{data?.validity}</span>
              )}
            </p>
            <p>
              <span>Charges</span> -
              {editAMC ? (
                <CommonInput
                  maxLength={8}
                  value={values.amc_cost}
                  onChange={(data) => {
                    if ((data <= 99999.99 && data !== "0") || data == "") {
                      if (Float_Validation(data)) {
                        setFieldValue("amc_cost", data);
                      }
                    }
                  }}
                  styles={{
                    borderColor:
                      errors.amc_cost && touched.amc_cost ? "red" : "",
                  }}
                  inlinefield={true}
                />
              ) : (
                <span>{data?.amc_cost}</span>
              )}
            </p>
          </div>
          <div
            className={`col-sm-12 col-md-6 col-lg-4 col-xl-3 px-3 ${productionstyle.acmDataBlock}`}
          >
            <p>
              <span>SIM Started Date</span> -
              {editAMC ? (
                <CommonDateTimePicker
                  placeholder={""}
                  onChange={(data) => {
                    setFieldValue(
                      "amc_start_date",
                      dayjs(data).format("YYYY-MM-DD HH:mm:ss")
                    );
                  }}
                  formate={"DD-MM-YYYY"}
                  value={values.amc_start_date}
                  allowClear={false}
                  inlinefield={true}
                  styles={{
                    borderColor:
                      errors.amc_start_date && touched.amc_start_date
                        ? "red"
                        : "",
                  }}
                />
              ) : (
                <span>
                  {data?.amc_start_date
                    ? dayjs(data?.amc_start_date).format("YYYY-MM-DD")
                    : ""}
                </span>
              )}
            </p>
            <p>
              <span>No of Days to Blur</span> -
              {editAMC ? (
                <CommonInput
                  value={values.inactivate_delay}
                  maxLength={3}
                  isNumber={true}
                  onChange={(data) => {
                    if ((data <= 100 && data !== "0") || data === "") {
                      setFieldValue("inactivate_delay", data);
                    }
                  }}
                  // placeholder="No of Days to Blur"

                  inlinefield={true}
                />
              ) : (
                <span>
                  {data?.inactivate_delay}{" "}
                  {data?.inactivate_delay ? "days" : ""}
                </span>
              )}
            </p>
            <p>
              <span>SIM Expiry Date</span> -
              <span>
                {data?.amc_end_date
                  ? dayjs(data?.amc_end_date).format("YYYY-MM-DD")
                  : ""}
              </span>
            </p>
            {/* <p>
              <span>DeActivate Delay</span> -
              {editAMC ? (
                <CommonInput
                  value={values.deactivate_delay}
                  maxLength={3}
                  isNumber={true}
                  onChange={(data) => {
                    if ((data <= 100 && data !== "0") || data === "") {
                      setFieldValue("deactivate_delay", data);
                    }
                  }}
                  // placeholder="DeActivate Delay"
                  inlinefield={true}
                />
              ) : (
                <span>
                  {data?.deactivate_delay}{" "}
                  {data?.deactivate_delay ? "days" : ""}
                </span>
              )}
            </p> */}
          </div>
          <div
            className={`col-sm-12 col-md-6 col-lg-4 col-xl-3 px-3 ${productionstyle.acmDataBlock}`}
          >
            <p>
              <span>SIM Mobile No</span> -<span>{data?.sim_mobile_no}</span>
            </p>
            <p>
              <span>IMSI Number</span> -<span>{data?.imsi_number}</span>
            </p>
            <p>
              <span>Network</span> -<span>{data?.network}</span>
            </p>
          </div>
          <div
            className={`col-sm-12 col-md-6 col-lg-4 col-xl-3 px-3 ${productionstyle.acmDataBlock}`}
          >
            <p>
              <span>Controller Status</span> -
              {/* {editAMC ? (
                <CommonSwitch
                  checked={values.status === 1 ? true : false}
                  onChange={() => {
                    setAmcchangeStatus({ show: true, type: 1 });
                  }}
                  type={1}
                />
              ) : ( */}
              <span
                className={
                  data?.status === 1
                    ? productionstyle.activestatusTD
                    : productionstyle.statusTD
                }
              >
                {data?.status === 1 ? "Active" : "InActive"}
              </span>
              {/* )} */}
            </p>
            <p>
              <span>AMC Status</span> -
              {editAMC ? (
                <CommonSwitch
                  checked={values?.amc_status === 1 ? true : false}
                  onChange={() => {
                    setAmcchangeStatus({ show: true, type: 2 });
                  }}
                  type={2}
                />
              ) : (
                <span
                  className={
                    data?.amc_status === 1
                      ? productionstyle.activestatusTD
                      : productionstyle.statusTD
                  }
                >
                  {data?.amc_status === 1 ? "Activate" : "DeActivate"}
                </span>
              )}
            </p>
          </div>
          <div
            className={`col-sm-12 col-md-6 col-lg-6 ${productionstyle.acmDataBlock}`}
          >
            <p>
              <span>Display Content</span> -
              {editAMC ? (
                <textarea
                  type="text"
                  className="filterinput w-100 inlinefield"
                  value={values.amc_msg}
                  onChange={(data) => {
                    setFieldValue("amc_msg", data.target?.value);
                  }}
                  // placeholder="Content"
                  style={{ height: "55px" }}
                  maxLength={2000}
                />
              ) : (
                <span>{data?.amc_msg}</span>
              )}
            </p>
          </div>
          <div
            className={`col-sm-12 col-md-6 col-lg-6 ${productionstyle.acmDataBlock}`}
          >
            <p>
              <span>Remarks</span> -
              {editAMC ? (
                <textarea
                  type="text"
                  className="filterinput w-100 inlinefield"
                  value={values.remarks}
                  onChange={(data) => {
                    setFieldValue("remarks", data.target?.value);
                  }}
                  maxLength={2000}
                  // placeholder="Remarks"
                  style={{ height: "55px" }}
                />
              ) : (
                <span>{data?.remarks}</span>
              )}
            </p>
          </div>
        </div>
        <div className={productionstyle.production_device_status_flex}>
          <button
            type="button"
            className={productionstyle.production_change_status_btn}
            onClick={() => setmodal(true)}
          >
            Change Status
          </button>
          <p>
            <span className="tank-header">Status - </span>
            <span
              className={
                data?.status === -1
                  ? productionstyle.production_status_deleted
                  : data?.status === 0
                  ? productionstyle.production_status_inactive
                  : data?.status === 1
                  ? productionstyle.production_status_on
                  : data?.status === 2
                  ? productionstyle.production_status_waiting
                  : data?.status === 3
                  ? productionstyle.production_status_off
                  : null
              }
            >
              {data?.status === -1
                ? "Deleted"
                : data?.status === 0
                ? "InActive"
                : data?.status === 1
                ? "Tested Ok"
                : data?.status === 2
                ? "Waiting for Test"
                : data?.status === 3
                ? "Fault"
                : null}
            </span>
          </p>

          <button
            type="button"
            className={productionstyle.production_finish_btn}
            // onClick={() => changesstatus()}
            onClick={() => {
              navigate("/production");
            }}
          >
            Close
          </button>
        </div>
      </div>
      <br />
      {data?.history_lt?.length > 0 ? (
        <div className="productionhistry">
          <h3>History Details</h3>
          <div
            className={`${productionstyle.production_history_flex} status-div propadding`}
          >
            {data?.history_lt?.map((ele, index) => {
              return (
                <div className={productionstyle.production_history_div}>
                  <div className="status-div-flex">
                    <p
                      className={`${productionstyle.production_con_name} allsubhead`}
                    >
                      Tested By {ele?.username}
                    </p>
                    <p className="allsubhead">{ele?.updated_at}</p>
                  </div>
                  <div
                    className={
                      productiondata?.product_type === 1
                        ? "status-div-flex"
                        : "status_div_display"
                    }
                  >
                    <p className={productionstyle.production_con_name}>
                      {ele?.controller_name}
                    </p>
                    <p>
                      <span className="allsubhead">status : </span>
                      <span
                        className={
                          ele?.controller_status !== null ||
                          ele?.device_status !== null
                            ? ele?.controller_status === -1
                              ? productionstyle.production_status_deleted
                              : ele?.controller_status === 0
                              ? productionstyle.production_status_inactive
                              : ele?.controller_status === 1
                              ? productionstyle.production_status_on
                              : ele?.controller_status === 2
                              ? productionstyle.production_status_waiting
                              : ele?.controller_status === 3
                              ? productionstyle.production_status_off
                              : ele?.device_status === -1
                              ? productionstyle.production_status_deleted
                              : ele?.device_status === 0
                              ? productionstyle.production_status_inactive
                              : ele?.device_status === 1
                              ? productionstyle.production_status_on
                              : ele?.device_status === 2
                              ? productionstyle.production_status_waiting
                              : ele?.device_status === 3
                              ? productionstyle.production_status_off
                              : null
                            : null
                        }
                      >
                        {ele?.controller_status !== null ||
                        ele?.device_status !== null
                          ? ele?.controller_status === -1
                            ? "Deleted"
                            : ele?.controller_status === 0
                            ? "In Active"
                            : ele?.controller_status === 1
                            ? "Tested Ok"
                            : ele?.controller_status === 2
                            ? "Waiting for Test"
                            : ele?.controller_status === 3
                            ? "Fault"
                            : ele?.device_status === -1
                            ? "Deleted"
                            : ele?.device_status === 0
                            ? "In Active"
                            : ele?.device_status === 1
                            ? "Tested Ok"
                            : ele?.device_status === 2
                            ? "Waiting for Test"
                            : ele?.device_status === 3
                            ? "Fault"
                            : null
                          : null}
                      </span>
                    </p>
                  </div>
                  {ele?.msg ? (
                    <p>
                      <span className="allsubhead">Message : </span>
                      <span>{ele?.msg}</span>
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </>
  );
}
