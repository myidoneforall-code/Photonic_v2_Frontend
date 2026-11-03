import { useEffect, useRef, useState } from "react";
import Loader from "../../Loader";
import classes from "./reports.module.css";
import { useNavigate } from "react-router";
import { FaArrowLeft } from "react-icons/fa";
import { useFormik } from "formik";
import {
  filterValidObject,
  getCatchMsg,
  JSONtoformdata,
} from "../../../Utilities/Methods";
import {
  GetNotificationDropdown,
  ListSmsSettingsService,
  usercontrollerdropdownapi,
  userdropdown,
  Viewadmindevicedelete,
} from "../../../Service/ApiService";
import CommonSelect from "../../CommonComponents/CommonSelect";
import toast from "react-hot-toast";
import CommonTabs from "../../CommonComponents/CommonTabs";
import CommonInput from "../../CommonComponents/CommonInput";
import { SMSTable } from "../../Tables/SMSTable";
import { ExportedImages } from "../../../Utilities/ImageExport";
export default function SmsSetting() {
  let navigate = useNavigate();
  const [loader, setloader] = useState(false);
  const [userData, setUserData] = useState([]);
  const BulkDataRef = useRef(null);
  let controllertype = JSON.parse(localStorage.getItem("contollertype"));
  const [filters, setfilters] = useState({
    code: "",
    name: "",
    unit_type: 1,
    controller_id: 0,
    device_id: 0,
    user_id: 0,
    // group_id: 0,
    controller_type: 1,
    device_type: "",
  });

  const [ControllerList, setControllerList] = useState([]);
  const [DeviceList, setDeviceList] = useState([]);
  const [amcList, setamcList] = useState({
    items: [],
    page: 1,
    size: 10,
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
      name: "",
      unit_type: 1,
      controller_id: 0,
      device_id: 0,
      user_id: 0,
      // group_id: 0,
      controller_type: 1,
      device_type: "",
    },

    onSubmit: (values) => {
      setfilters({ ...values });
      handleListSMSReport(1, size, values);
    },
  });

  const handleListSMSReport = (page = 1, size = 10, values, download) => {
    setloader(true);
    const finalObj = filterValidObject({
      ...values,
      user_id: values.user_id || "",
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

    ListSmsSettingsService(page, size, JSONtoformdata(finalObj))
      .then(({ data }) => {
        if (data?.status === 1) {
          if (download) {
            if (data?.data) {
              window.open(data?.data);
            }
          } else {
            setamcList(data);
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

  const handleChangeTab = (finalObj) => {
    setValues({
      ...initialValues,
      ...finalObj,
    });
    setfilters({
      ...initialValues,
      ...finalObj,
    });
    handleListSMSReport(1, 10, {
      ...initialValues,
      ...finalObj,
    });
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
  // const GetDevicedropdown = (devicetype = null) => {
  //   let formdata = new FormData();

  //   if (devicetype) {
  //     formdata.append("device_type", devicetype);
  //   }
  //   Viewadmindevicedelete(devicetype ? formdata : "", 1, 1000).then(
  //     ({ data }) => {
  //       let dubdata = data?.items?.map((ele, ind) => {
  //         if (ele?.device_code) {
  //           return { value: ele?.id, label: ele?.device_code };
  //         }
  //       });
  //       let finalData = dubdata?.filter((ele) => ele != undefined);
  //       setDeviceList([{ label: "All", value: 0 }, ...finalData]);
  //       setFieldValue("device_id", 0);
  //     }
  //   );
  // };

  useEffect(() => {
    handleListSMSReport(1, 10, values);
    GetUserDropdown();
    GetControllerdropdown(values.controller_type);
  }, []);

  return (
    <>
      <Loader isLoader={loader} />
      <div className={classes.router_pages}>
        <div className="row mt-2 mb-4">
          <div className="pre-page col-sm-5">
            <FaArrowLeft
              className="arrow"
              onClick={() => Navigatetodashboard()}
            />
            <h3 className={classes.header}>SMS Setting ({total || 0})</h3>
          </div>
          <div className="col-sm-6">
            <CommonTabs
              items={Dataitems}
              onChange={(data) => {
                let finalTypes = {
                  controller_type: data <= 2 ? data : "",
                  device_type: data >= 3 ? data - 2 : "",
                  unit_type: data <= 2 ? 1 : 2,
                };
                handleChangeTab(finalTypes);
                if (data <= 2) {
                  GetControllerdropdown(data);
                }
                // else {
                //   GetDevicedropdown(data - 2);
                // }
              }}
              activeKey={
                values.unit_type === 1
                  ? values.controller_type
                  : values.device_type + 2
              }
            />
          </div>
        </div>
        <form className={classes.filterBlock} onSubmit={handleSubmit}>
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

          <div className={classes.filterColums}>
            <label>Product Name</label>
            <CommonInput
              value={values?.name}
              onChange={(e) => {
                setFieldValue("name", e);
              }}
              placeholder="Product Name"
            />
          </div>
          {values.unit_type === 2 && values.device_type ? (
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
          ) : (
            // : values.unit_type === 2 && values.device_type ? (
            //   <div className={classes.filterColums}>
            //     <label>Device</label>
            //     <CommonSelect
            //       placeholder={"Device"}
            //       value={values.device_id}
            //       styles={{ width: "210px" }}
            //       onChange={(e) => {
            //         setFieldValue("device_id", e);
            //       }}
            //       options={DeviceList}
            //       allowClear={false}
            //     />
            //   </div>
            // )
            ""
          )}
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

          <div className={classes.submitresetDiv} style={{ marginTop: "10px" }}>
            <button
              type="submit"
              className={classes.searchBtn}
              // onClick={() => {
              //   handleSubmit();
              // }}
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
            {/* {total > 0 && (
              <button
                type="button"
                onClick={() => {
                  handleListSMSReport(page, size, filters, 1);
                }}
                className={classes.downloadHistorybutton}
              >
                Download
              </button>
            )} */}
          </div>
        </form>
        <div className={`mt-3 ${classes.fileBlock}`}>
          <p>Samplefile.xls</p>
          <img
            src={ExportedImages.DOWNLOAD_ICON}
            onClick={() => {
              window.open(
                "https://psdas.in/photonic_prod_uploads/sample_files/sms_sample_file.xlsx"
              );
            }}
            style={{
              width: "20px",
              cursor: "pointer",
            }}
          />
        </div>
        <SMSTable
          filters={filters}
          handleListSMSReport={handleListSMSReport}
          items={items}
          total={total}
          size={size}
          page={page}
          ref={BulkDataRef}
          handleChangeSim={(data) => {
            setfilters((pre) => ({ ...pre, is_sim: data }));
            setValues((pre) => ({ ...pre, is_sim: data }));
            handleListSMSReport(1, size, { ...values, is_sim: data });
          }}
        />
      </div>
    </>
  );
}
