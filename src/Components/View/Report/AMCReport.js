import { useEffect, useRef, useState } from "react";
import Loader from "../../Loader";
import classes from "./reports.module.css";
import { useNavigate } from "react-router";
import { FaArrowLeft } from "react-icons/fa";
import { useFormik } from "formik";
import {
  filterValidObject,
  getCatchMsg,
  getTableSNO,
  JSONtoformdata,
  StatusOptions,
} from "../../../Utilities/Methods";
import CommonDateTimePicker from "../../CommonComponents/CommonDatePicker";
import {
  AMSREportService,
  groupdropdownapi,
  usercontrollerdropdownapi,
  userdropdown,
  Viewadmindevicedelete,
} from "../../../Service/ApiService";
import CommonSelect from "../../CommonComponents/CommonSelect";
import dayjs from "dayjs";

import toast from "react-hot-toast";
import CommonTabs from "../../CommonComponents/CommonTabs";
import CommonInput from "../../CommonComponents/CommonInput";
import {
  ControllerTypeDropdown,
  FilterDeviceTypeDropdown,
  PaginationSize,
} from "../../../Utilities/Constants";
import { ReportTable } from "../../Tables/ReportTable";
import { useDispatch, useSelector } from "react-redux";
import { UpdateAMCfilters } from "../../Store/Config/Configuration";

export default function AMCReport() {
  let navigate = useNavigate();
  const [loader, setloader] = useState(false);
  const [userData, setUserData] = useState([]);
  const BulkDataRef = useRef(null);
  const { AMCfilters } = useSelector((state) => state);
  let controllertype = JSON.parse(localStorage.getItem("contollertype"));
  const [filters, setfilters] = useState({
    code: "",
    sim_number: "",
    network: "",
    user_id: 0,
    from_date: "",
    to_date: "",
    unit_type: 1,
    name: "",
    controller_id: "",
    group_id: 0,
    device_id: "",
    controller_type: 1,
    device_type: "",
    status: null,
    amc_status: null,
    is_sim: 0,
  });
  let dispatch = useDispatch();
  const [ControllerList, setControllerList] = useState([]);
  const [DeviceList, setDeviceList] = useState([]);
  const [GroupList, setGroupList] = useState([]);

  const [amcList, setamcList] = useState({
    items: [],
    page: 1,
    size: 50,
    total: 0,
  });
  const { page, size, total, items } = amcList;
  const Navigatetodashboard = () => {
    navigate("/dashboard");
  };

  const {
    values,
    errors,
    touched,
    setValues,
    handleSubmit,
    resetForm,
    setFieldValue,
    initialValues,
  } = useFormik({
    initialValues: {
      code: "",
      sim_number: "",
      user_id: "",
      network: "",
      from_date: "",
      to_date: "",
      unit_type: 1,
      name: "",
      controller_id: null,
      device_id: null,
      controller_type: 1,
      device_type: null,
      status: null,
      amc_status: null,
      is_sim: 0,
      group_id: 0,
    },

    onSubmit: (values) => {
      setfilters({ ...values });
      handleListAMCReport(1, size, values);
    },
  });

  const handleListAMCReport = (page = 1, size = 50, values, download) => {
    setloader(true);
    const finalObj = filterValidObject({
      ...values,
      user_id: values.user_id || "",
      group_id: values.group_id || "",

      controller_type: values?.controller_type || "",
      device_type: values?.device_type || "",
      device_id: values?.device_id || "",
      controller_id: values?.controller_id || "",
      status: values.status === 1 || values.status === 0 ? values.status : "",
      amc_status:
        values.amc_status === 1 || values.amc_status === 0
          ? values.amc_status
          : "",

      is_sim: values.is_sim || "",
      download: download || "",
    });

    AMSREportService(page, size, JSONtoformdata(finalObj))
      .then(({ data }) => {
        if (data?.status === 1) {
          if (download) {
            if (data?.data) {
              window.open(data?.data);
            }
          } else {
            let setkeyData = data?.items?.map((ele, ind) => {
              return {
                ...ele,
                key: ele?.unit_id,
                sno: getTableSNO(page, size, ind),
              };
            });
            setamcList({ ...data, items: setkeyData });
          }
          BulkDataRef.current?.clearBulkData();
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

  const Dataitems = [
    {
      key: 1,
      label: "Motor",
      children: "",
    },
    {
      key: 2,
      label: "Light",
      children: "",
    },
    {
      key: 3,
      label: "Tank",
      children: "",
    },
    {
      key: 4,
      label: "Flow",
      children: "",
    },
    {
      key: 5,
      label: "Valve",
      children: "",
    },
    {
      key: 7,
      label: "Multi",
      children: "",
    },
    {
      key: 6,
      label: "ILM",
      children: "",
    },
  ];

  // const handleChangeTab = (finalObj) => {
  //   setValues({
  //     ...initialValues,
  //     ...finalObj,
  //   });
  //   setfilters({
  //     ...initialValues,
  //     ...finalObj,
  //   });
  //   handleListAMCReport(1, 50, {
  //     ...initialValues,
  //     ...finalObj,
  //   });
  // };

  const handleChangeTab = (finalObj) => {
  const updated = {
    ...initialValues,
    ...finalObj,
  };

  setValues(updated);
  setfilters(updated);

  handleListAMCReport(1, 50, updated);
};

  const GetUserDropdown = () => {
    let formdata = new FormData();

    formdata.append("controller_type", controllertype);
    userdropdown(formdata).then(({ data }) => {
      let dubdata = data?.map((ele, ind) => {
        return { value: ele?.user_id, label: ele?.username };
      });
      setUserData([{ label: "All", value: 0 }, ...dubdata]);
    });
  };
  const getGroupOptions = () => {
    groupdropdownapi()
      .then(({ data }) => {
        let options = data.map((id) => {
          return { value: id?.group_id, label: id?.group_name };
        });
        setGroupList([{ label: "All", value: 0 }, ...options]);
      })
      .catch((err) => {});
  };

  const GetControllerdropdown = (type = null) => {
    let formdata = new FormData();
    formdata.append("controller_type", type ? type : "");
    // formdata.append("for_history", 1);
    usercontrollerdropdownapi(formdata).then(({ data }) => {
      let dubdata = data?.map((ele, ind) => {
        if (ele?.controller_code) {
          return { value: ele?.controller_id, label: ele?.controller_code };
        }
      });
      let finalData = dubdata?.filter((ele) => ele != undefined);
      setControllerList([{ label: "All", value: 0 }, ...finalData]);
      setFieldValue("controller_id", 0);
    });
  };
  const GetDevicedropdown = (devicetype = null) => {
    let formdata = new FormData();

    if (devicetype) {
      formdata.append("device_type", devicetype);
    }
    Viewadmindevicedelete(devicetype ? formdata : "", 1, 1000).then(
      ({ data }) => {
        let dubdata = data?.items?.map((ele, ind) => {
          if (ele?.device_code) {
            return { value: ele?.id, label: ele?.device_code };
          }
        });
        let finalData = dubdata?.filter((ele) => ele != undefined);
        setDeviceList([{ label: "All", value: 0 }, ...finalData]);
        setFieldValue("device_id", 0);
      }
    );
  };

  useEffect(() => {
    handleListAMCReport(
      AMCfilters?.page || 1,
      AMCfilters?.size || 50,
      AMCfilters?.values || values
    );
    setValues(AMCfilters?.values || initialValues);
    setfilters(AMCfilters?.values || initialValues);
    GetUserDropdown();
    getGroupOptions();
    GetControllerdropdown(values.controller_type);

    // end

    dispatch(
      UpdateAMCfilters({
        page: 1,
        size: 50,
        values: initialValues,
      })
    );
  }, []);

  return (
    <>
      {/* <p>ksdflksdlksdf</p> */}
      <Loader isLoader={loader} />
      <div className={classes.router_pages}>
        <div className="row mt-2 mb-4">
          <div className="pre-page col-sm-5">
            <FaArrowLeft
              className="arrow"
              onClick={() => Navigatetodashboard()}
            />
            <h3 className={classes.header}>AMC report ({total || 0})</h3>
          </div>
          <div className="col-sm-6">
            {/* <CommonTabs
              items={Dataitems}
              onChange={(data) => {
                let finalTypes = {
                  controller_type: data <= 2 ? data : "",
                  device_type: data >= 4 ? data - 2 : "",
                  unit_type: data <= 2 ? 1 : 2
                };
                handleChangeTab(finalTypes);
                if (data <= 2) {
                  GetControllerdropdown(data);
                } else {
                  GetDevicedropdown(data - 2);
                }
              }}
              activeKey={
                values.unit_type === 1
                  ? values.controller_type
                  : values.device_type + 2
              }
              TablColors={{
                itemActiveColor: "red",
                itemColor: "black"
              }}
            /> */}


         {/* mohan */}
            <CommonTabs
              items={Dataitems}
              onChange={(data) => {
                let finalTypes = {};

                if (data <= 2) {
                  // Motor (1), Light (2)
                  finalTypes = {
                    controller_type: data,
                    device_type: "",
                    unit_type: 1,
                  };
                  GetControllerdropdown(data);
                } else if (data === 3) {
                  // Tank
                  finalTypes = {
                    controller_type: "",
                    device_type: 1,
                    unit_type: 2,
                  };
                } else {
                  // Flow, Valve, Multi, ILM
                  finalTypes = {
                    controller_type: "",
                    device_type: data - 2,
                    unit_type: 2,
                  };
                  GetDevicedropdown(data - 2);
                }

                // *** APPLY FILTERS ***
                handleChangeTab(finalTypes);
              }}
              activeKey={
                values.unit_type === 1
                  ? values.controller_type
                  : values.unit_type === 3
                  ? 3
                  : values.device_type + 2
              }
              TablColors={{
                itemActiveColor: "red",
                itemColor: "black",
              }}
            />
          </div>
        </div>
        <div className={classes.filterBlock}>
          <div className={classes.filterColums}>
            <label>Sim Number</label>
            <CommonInput
              value={values.sim_number}
              onChange={(e) => {
                setFieldValue("sim_number", e);
              }}
              placeholder="Sim Number"
            />
          </div>
          <div className={classes.filterColums}>
            <label>Network</label>
            <CommonInput
              value={values.network}
              onChange={(e) => {
                setFieldValue("network", e);
              }}
              placeholder="Network"
            />
          </div>
          <div className={classes.filterColums}>
            <label>Product Id</label>
            <CommonInput
              value={values.code}
              onChange={(e) => {
                setFieldValue("code", e);
              }}
              placeholder="Product Id"
            />
          </div>
          {/* {values.unit_type === 1 && values.controller_type ? (
            <div className={classes.filterColums}>
              <label>Controller</label>
              <CommonSelect
                placeholder={"Controller"}
                value={values.controller_id}
                styles={{ width: "210px" }}
                onChange={(e) => {
                  setFieldValue("controller_id", e);
                }}
                options={ControllerList}
                allowClear={false}
              />
            </div>
          ) : values.unit_type === 2 && values.device_type ? (
            <div className={classes.filterColums}>
              <label>Device</label>
              <CommonSelect
                placeholder={"Device"}
                value={values.device_id}
                styles={{ width: "210px" }}
                onChange={(e) => {
                  setFieldValue("device_id", e);
                }}
                options={DeviceList}
                allowClear={false}
              />
            </div>
          ) : (
            ""
          )} */}
          <div className={classes.filterColums}>
            <label>Product Name</label>
            <CommonInput
              value={values.name}
              onChange={(e) => {
                setFieldValue("name", e);
              }}
              placeholder="Product Name"
            />
          </div>
          <div className={classes.filterColums}>
            <label>User</label>
            <CommonSelect
              placeholder={"User Id"}
              value={
                values.user_id ? values.user_id : { label: "All", values: 0 }
              }
              styles={{ width: "210px" }}
              onChange={(e) => {
                setFieldValue("user_id", e);
              }}
              options={userData}
              allowClear={false}
            />
          </div>
          <div className={classes.filterColums}>
            <label>Group</label>
            <CommonSelect
              placeholder={"Group"}
              value={
                values.group_id ? values.group_id : { label: "All", values: 0 }
              }
              styles={{ width: "210px" }}
              onChange={(e) => {
                setFieldValue("group_id", e);
              }}
              options={GroupList}
              allowClear={false}
            />
          </div>
          <div className={classes.filterColums}>
            <label>From Date</label>

            <CommonDateTimePicker
              value={values?.from_date}
              onChange={(date) => {
                setFieldValue(
                  "from_date",
                  date ? dayjs(date).format("YYYY-MM-DD 00:00:00") : ""
                );
              }}
              placeholder={"From Date"}
              formate={"DD-MM-YYYY"}
              disableDate={true}
              // isFuture={true}
              // allowClear={false}
            />
          </div>
          <div className={classes.filterColums}>
            <label>To Date</label>

            <CommonDateTimePicker
              value={values?.to_date}
              onChange={(date) => {
                setFieldValue(
                  "to_date",
                  date ? dayjs(date).format("YYYY-MM-DD 23:59:59") : ""
                );
              }}
              formate={"DD-MM-YYYY"}
              // allowClear={false}
              for_todate={true}
              placeholder={"To Date"}
              startDate={values.from_date}
              disableDate={true}
            />

            {errors?.to_date && touched?.to_date ? (
              <p className="inputerror">{errors?.to_date}</p>
            ) : null}
          </div>

          <div className={classes.filterColums}>
            <label>Product Conditions</label>
            <CommonSelect
              placeholder={"Product Conditions"}
              value={values.status}
              styles={{ width: "210px" }}
              onChange={(e) => {
                setFieldValue("status", e);
              }}
              options={StatusOptions(1)}
              allowClear={false}
            />
          </div>
          <div className={classes.filterColums}>
            <label>AMC Conditions</label>
            <CommonSelect
              placeholder={"AMC Conditions"}
              value={values.amc_status}
              styles={{ width: "210px" }}
              onChange={(e) => {
                setFieldValue("amc_status", e);
              }}
              options={StatusOptions(2)}
              allowClear={false}
            />
          </div>

          {/* {values.unit_type === 1 ? (
            <div className={classes.filterColums}>
              <label>Controller Type</label>
              <CommonSelect
                placeholder={"Controller Type"}
                value={values.controller_type}
                styles={{ width: "210px" }}
                onChange={(e) => {
                  setFieldValue("controller_type", e);
                  if (e) {
                    GetControllerdropdown(e);
                  }
                }}
                options={ControllerTypeDropdown}
                allowClear={false}
              />
            </div>
          ) : (
            <div className={classes.filterColums}>
              <label>Device Type</label>
              <CommonSelect
                placeholder={"Device Type"}
                value={values.device_type}
                styles={{ width: "210px" }}
                onChange={(e) => {
                  setFieldValue("device_type", e);
                  if (e) {
                    GetDevicedropdown(e);
                  }
                }}
                options={FilterDeviceTypeDropdown}
                allowClear={false}
              />
            </div>
          )} */}

          <div className={classes.submitresetDiv} style={{ marginTop: "10px" }}>
            <button
              type="submit"
              className={classes.searchBtn}
              onClick={() => {
                handleSubmit();
              }}
            >
              Search
            </button>
            <button
              type="button"
              className={classes.resetBtn}
              onClick={() => {
                let finalTypes = {
                  unit_type: values?.unit_type,
                  controller_type: values?.controller_type,
                  device_type: values?.device_type,
                };
                setValues({ ...initialValues, ...finalTypes });
                setfilters({ ...initialValues, ...finalTypes });
                handleSubmit();
              }}
            >
              Reset
            </button>
            {total > 0 && (
              <button
                type="button"
                onClick={() => {
                  handleListAMCReport(page, size, filters, 1);
                }}
                className={classes.downloadHistorybutton}
              >
                Download
              </button>
            )}
          </div>
        </div>
        <ReportTable
          currentTab={
            Dataitems[
              (values.unit_type === 1
                ? values.controller_type
                : values.device_type + 2) - 1
            ]
          }
          filters={filters}
          handleListAMCReport={handleListAMCReport}
          items={items}
          total={total}
          size={size}
          page={page}
          ref={BulkDataRef}
          options={[
            ...PaginationSize,
            {
              value: 100,
              label: "100 / page",
            },
          ]}
          handleChangeSim={(data) => {
            setfilters((pre) => ({ ...pre, is_sim: data }));
            setValues((pre) => ({ ...pre, is_sim: data }));
            handleListAMCReport(1, size, { ...values, is_sim: data });
          }}
        />
      </div>
    </>
  );
}
