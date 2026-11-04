import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { useEffect, useState } from "react";
import {
  addcontroller,
  adddeviceapi,
  Addgroupapi,
  checkproduct,
  city,
  groupdropdownapi,
  state
} from "../../Service/ApiService";
import { useFormik } from "formik";
import CreatableSelect from "react-select/creatable";
import * as Yup from "yup";
import Loader from "../Loader";
import { toast } from "react-hot-toast";
import DeleteConfirmationModal from "../../Modalcomponents/DeleteConfirmationModal";
import CommonSelect from "../CommonComponents/CommonSelect";
import { GetLocalStorage } from "../../Utilities/Storage";
import { UserTypeOptions } from "../../Utilities/Constants";
import {
  Updatedeletefilter,
  UpdatedeletepageState,
  Updatefilterdata,
  UpdatePageState
} from "../Store/Config/Configuration";
import { useDispatch } from "react-redux";

const validate = Yup.object().shape({
  Uniqueid: Yup.string().required("ID is required"),
  usertype: Yup.string().required("User type is required").nullable(),
  state: Yup.string().required("State is required").nullable(),
  distric: Yup.string().required("Distric is required").nullable(),
  name: Yup.string().required("Name is required"),
  groupid: Yup.string("Create group").required("Group name is required")
});

export default function Addcontroller() {
  let navigate = useNavigate();
  let location = useLocation();
  let dispatch = useDispatch();
  let controllertype = GetLocalStorage("contollertype");

  const [states, setstates] = useState();
  const [district, setdistrict] = useState();
  const [groupoptions, setoptions] = useState(null);
  const [loader, setloader] = useState(false);
  const [checkproductdata, setcheckproductdata] = useState(null);
  const [showmodal, setshowmodal] = useState({
    show: false,
    showvaluemodal: ""
  });
  const [inputVal, setInputVal] = useState("");
  const [groupname, setgroupname] = useState("");

  const { values, setValues, errors, touched, setFieldValue, handleSubmit } =
    useFormik({
      initialValues: {
        Uniqueid: "",
        usertype: null,
        state: null,
        distric: null,
        name: "",
        groupid: ""
      },
      validationSchema: validate,
      onSubmit: (values) => {
        Finish();
      }
    });

  const getStateDropdown = () => {
    state().then(({ data }) => {
      if (data) {
        let stateOptions = data?.map((ele) => ({
          ...ele,
          label: ele.name,
          value: ele.state_id
        }));
        setstates(stateOptions);
      } else {
        setstates([]);
      }
    });
  };

  const getGroupOptions = () => {
    groupdropdownapi().then(({ data }) => {
      let options = data.map((id) => {
        return { value: id?.group_id, label: id?.group_name };
      });
      setoptions(options);
    });
  };

  const Addcontroller = () => {
    let formdata = new FormData();
    formdata.append("product_code", values.Uniqueid);
    checkproduct(formdata)
      .then(({ data }) => {
        if (data?.error === 1) {
          toast(data?.msg, { type: "error" });
        }
        if (location?.state?.device === 1 && data?.product_type === 1) {
          toast("Can't add controller instead to add device", {
            type: "error"
          });
        }

        setValues({
          ...values,
          name: data.controller_name ? data.controller_name : data.device_name
        });
        setcheckproductdata(data);
      })
      .catch((err) => {
        if (err?.response?.data?.detail?.[0]?.msg) {
          toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
        } else if (err?.response?.data?.detail) {
          toast(err?.response?.data?.detail, { type: "error" });
        } else {
          toast("Something went wrong!!", { type: "error" });
        }
      });
  };

  // controller.state/district (same for device) are plain string columns
  // meant to hold the actual name ("Tamil Nadu", "Coimbatore") — but the
  // dropdowns above store state_id/city_id (numbers, needed to cascade
  // the district list off the chosen state). Sending that raw id as
  // `state`/`district` failed backend validation ("Input should be a
  // valid string") since the schema expects Optional[str] — resolve
  // back to the option's label here instead of the numeric value.
  const resolveLabel = (options, value) =>
    options?.find((opt) => opt?.value === value)?.label ?? "";

  const Finish = () => {
    // setloader(true);
    // FIXED: this only ran when navigated here via the "Add Device"
    // route (location.state.device === 1) — entering a device's code on
    // the "Add Controller" page (checkproduct() correctly detects
    // product_type === 2, a device, either way) fell through both
    // branches and silently submitted nothing. The actually-detected
    // product_type is what should decide this, not which route got you
    // here — a device's code should add it as a device regardless.
    if (location?.state?.device === 1 || checkproductdata?.product_type === 2) {
      let AddDevice = {
        device_code: values.Uniqueid,
        device_type: checkproductdata?.device_type,
        controller_type: controllertype,
        device_name: values.name,
        user_type: JSON.parse(values.usertype),
        district: resolveLabel(district, values.distric),
        state: resolveLabel(states, values.state),
        latitude: "",
        longitude: "",
        msg: "",
        status: 1,
        controller_code: location?.state?.controllercode,
        controller_id: location?.state?.controllerid
      };
      adddeviceapi(AddDevice)
        .then(({ data }) => {
          toast(data, { type: "success" });
          navigate(-1);
        })
        .catch((err) => {
          if (err?.response?.data?.detail?.[0]?.msg) {
            toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
          } else if (err?.response?.data?.detail) {
            toast(err?.response?.data?.detail, { type: "error" });
          } else {
            toast("Something went wrong!!", { type: "error" });
          }
        });
    } else if (checkproductdata.product_type === 1) {
      let AddController = {
        controller_code: values.Uniqueid,
        controller_type: checkproductdata.controller_type,
        controller_name: values.name,
        user_type: JSON.parse(values.usertype),
        district: resolveLabel(district, values.distric),
        state: resolveLabel(states, values.state),
        latitude: "",
        longitude: "",
        msg: "",
        status: 1,
        group_id: parseInt(values.groupid)
      };
      addcontroller(AddController)
        .then(({ data }) => {
          if (data) {
            toast(data, { type: "success" });
          }
          navigate(-1);
        })
        .catch((err) => {
          // Was a hardcoded "There is no group create it" for ANY 422 here
          // — showed that same message for every validation failure on
          // this endpoint, whether or not it was actually about the
          // group. Show the real backend message instead.
          if (err?.response?.data?.detail?.[0]?.msg) {
            toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
          } else if (err?.response?.data?.detail) {
            toast(err?.response?.data?.detail, { type: "error" });
          } else {
            toast("Something went wrong!!", { type: "error" });
          }
        });
    }
    // .finally(() => setloader(false));
  };

  const GetCityDropdown = (stateid) => {
    let formdata = new FormData();
    formdata.append("state_id", stateid);
    city(formdata).then(({ data }) => {
      if (data) {
        let cityOptions = data?.map((ele) => ({
          ...ele,
          label: ele.name,
          value: ele.city_id
        }));
        setdistrict(cityOptions);
        setFieldValue("distric", cityOptions[0].value);
      } else {
        setdistrict(data);
      }
    });
  };

  let deletecontrollerpage = sessionStorage.getItem("deletecontrollerpage");
  let controllerpage = sessionStorage.getItem("controllerpage");
  let deletelightcontrollerpage = sessionStorage.getItem(
    "deletelightcontrollerpage"
  );
  let lightcontrollerpage = sessionStorage.getItem("lightcontrollerpage");
  const todashboard = () => {
    if (controllertype == 1) {
      navigate(deletecontrollerpage ? deletecontrollerpage : controllerpage, {
        state: {
          id: location?.state?.controllerid,
          page: location?.state?.page,
          ControllerFilters: location?.state?.ControllerFilters || {
            page: 1,
            values: {}
          }
        }
      });
    } else {
      navigate(
        deletelightcontrollerpage
          ? deletelightcontrollerpage
          : lightcontrollerpage,
        {
          state: {
            id: location?.state?.controllerid,
            page: location?.state?.page,
            ControllerFilters: location?.state?.ControllerFilters || {
              page: 1,
              values: {}
            }
          }
        }
      );
    }
  };

  const handleaddGroup = () => {
    let formData = new FormData();
    formData.append("group_name", inputVal ? inputVal : groupname);
    Addgroupapi(formData)
      .then(({ data }) => {
        toast(data?.msg, { type: "success" });
        getGroupOptions();
        setValues({ ...values, groupid: data?.group_id });
        setInputVal("");
      })
      .catch((err) => {
        if (err?.response?.data?.detail?.[0]?.msg) {
          setValues({ ...values, groupid: "" });
          setgroupname("");
          toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
        } else if (err?.response?.data?.detail) {
          setValues({ ...values, groupid: "" });
          setgroupname("");
          toast(err?.response?.data?.detail, { type: "error" });
        } else {
          setValues({ ...values, groupid: "" });
          setgroupname("");
          toast("Something went wrong!!", { type: "error" });
        }
      });
  };

  const handleInputValue = (str, event) => {
    if (event.action === "menu-close") {
      if (!str) {
        setInputVal(inputVal);
      }
    } else {
      setInputVal(str);
    }
  };

  // Was `(val) => {}` — an empty body always returns undefined (falsy),
  // which is exactly what isValidNewOption checks to decide whether to
  // show react-select's own "Create '...'" row at all. So it never did,
  // and typing a name here only ever changed the search text — nothing
  // was actually created unless you separately found and clicked the
  // small "+" button next to the field. This makes typing a genuinely
  // new, non-blank name work as expected again.
  const clearcreateoption = (val) =>
    !!val?.trim() && !groupoptions?.some((opt) => opt.label === val.trim());

  useEffect(() => {
    if (location?.state?.device) {
      setValues({ ...values, groupid: "true" });
    }
    getStateDropdown();
    getGroupOptions();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      getGroupOptions();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (location?.state?.ControllerFilters) {
      dispatch(Updatefilterdata(location?.state?.ControllerFilters?.values));
      dispatch(UpdatePageState(location?.state?.ControllerFilters?.page));
    }
    if (location?.state?.DeleteControllerFilters) {
      dispatch(
        Updatedeletefilter(location?.state?.DeleteControllerFilters?.values)
      );
      dispatch(
        UpdatedeletepageState(location?.state?.DeleteControllerFilters?.page)
      );
    }
  }, [location?.state]);

  return (
    <>
      <Loader isLoader={loader} />
      {showmodal?.showvaluemodal === 2 &&
      showmodal.show &&
      location?.state?.device == undefined ? (
        <DeleteConfirmationModal
          show={showmodal.show}
          close={() =>
            setshowmodal((prev) => {
              return {
                ...prev,
                show: false
              };
            })
          }
          devicetype={checkproductdata?.device_type}
          Deletekey={9}
          controllertype={controllertype}
          values={values}
          producttype={checkproductdata?.product_type}
          district={district}
          states={states}
        />
      ) : null}
      <div>
        <div className="router-pages">
          <div className="controller-head">
            <div className="pre-page">
              <FaArrowLeft
                className="arrow"
                onClick={() => {
                  console.log(
                    todashboard(),
                    deletecontrollerpage,
                    controllerpage,
                    controllertype,
                    "test1231"
                  );
                }}
              />
              <p className="controller-name">
                {location?.state?.device === 1
                  ? "Add device"
                  : "Add Controller"}
              </p>
            </div>
          </div>
          <div className="view-page">
            <form
              className="add-form  row justify-content-center"
              onSubmit={handleSubmit}
            >
              <div className="select-div  col-md-4">
                <label className="modal-label">
                  Unique Id<span className="required">*</span>
                </label>
                <div className="addgroup col-12 ">
                  <input
                    type="text"
                    className="filterinput "
                    placeholder="unique id"
                    value={values.Uniqueid}
                    id="Uniqueid"
                    name="Uniqueid"
                    maxLength={15}
                    onChange={(e) =>
                      setValues({
                        ...values,
                        Uniqueid: e.target.value
                      })
                    }
                  ></input>
                  <button
                    type="button"
                    className="addgroupbtn"
                    onClick={() => {
                      Addcontroller();
                    }}
                  >
                    save
                  </button>
                </div>
                {errors.Uniqueid && touched.Uniqueid ? (
                  <p className="inputerror">{errors.Uniqueid}</p>
                ) : null}
              </div>
              <div className="select-div  col-md-4">
                <label className="modal-label">
                  User Type<span className="required">*</span>
                </label>
                <CommonSelect
                  placeholder={"User Type"}
                  disabled={
                    location?.state?.device === 1 &&
                    checkproductdata?.product_type === 1
                      ? true
                      : checkproductdata?.product_type === 2 ||
                        checkproductdata?.product_type === 1
                      ? false
                      : true
                  }
                  styles={{
                    background:
                      location?.state?.device === 1 &&
                      checkproductdata?.product_type === 1
                        ? "#a9a9a92e"
                        : checkproductdata?.product_type === 2 ||
                          checkproductdata?.product_type === 1
                        ? null
                        : "#a9a9a92e",
                    width: "100%"
                  }}
                  onChange={(e) =>
                    setValues({
                      ...values,
                      usertype: e
                    })
                  }
                  allowClear={false}
                  value={values?.usertype}
                  options={UserTypeOptions.filter((ele) => ele.value !== 0)}
                />
                {/* <select
                  type="text"
                  className="filterinput background-select"
                  id="usertype"
                  name="usertype"
                  disabled={
                    location?.state?.device === 1 &&
                    checkproductdata?.product_type === 1
                      ? true
                      : checkproductdata?.product_type === 2 ||
                        checkproductdata?.product_type === 1
                      ? false
                      : true
                  }
                  style={{
                    background:
                      location?.state?.device === 1 &&
                      checkproductdata?.product_type === 1
                        ? "#a9a9a92e"
                        : checkproductdata?.product_type === 2 ||
                          checkproductdata?.product_type === 1
                        ? null
                        : "#a9a9a92e",
                  }}
                  onChange={(e) =>
                    setValues({
                      ...values,
                      usertype: e.target.value,
                    })
                  }
                >
                  <option selected disabled hidden>
                    Group
                  </option>
                  <option selected disabled>
                    User Type
                  </option>
                  <option value={1}>Private</option>
                  <option value={2}>Goverment</option>
                </select> */}
                {errors.usertype && touched.usertype ? (
                  <p className="inputerror">{errors.usertype}</p>
                ) : null}
              </div>

              <div className="select-div  col-md-4">
                <label className="modal-label">
                  State<span className="required">*</span>
                </label>
                <CommonSelect
                  placeholder={"State"}
                  disabled={
                    location?.state?.device === 1 &&
                    checkproductdata?.product_type === 1
                      ? true
                      : checkproductdata?.product_type === 2 ||
                        checkproductdata?.product_type === 1
                      ? false
                      : true
                  }
                  styles={{
                    background:
                      location?.state?.device === 1 &&
                      checkproductdata?.product_type === 1
                        ? "#a9a9a92e"
                        : checkproductdata?.product_type === 2 ||
                          checkproductdata?.product_type === 1
                        ? null
                        : "#a9a9a92e",
                    width: "100%"
                  }}
                  allowClear={false}
                  onChange={(e) => {
                    GetCityDropdown(e);
                    setValues({
                      ...values,
                      state: e
                    });
                  }}
                  options={states}
                  value={values?.state}
                />
                {/* <select
                  type="text"
                  className="filterinput background-select"
                  placeholder="state"
                  id="state"
                  name="state"
                  disabled={
                    location?.state?.device === 1 &&
                    checkproductdata?.product_type === 1
                      ? true
                      : checkproductdata?.product_type === 2 ||
                        checkproductdata?.product_type === 1
                      ? false
                      : true
                  }
                  style={{
                    background:
                      location?.state?.device === 1 &&
                      checkproductdata?.product_type === 1
                        ? "#a9a9a92e"
                        : checkproductdata?.product_type === 2 ||
                          checkproductdata?.product_type === 1
                        ? null
                        : "#a9a9a92e",
                  }}
                  onClick={(e) => {
                    GetCityDropdown(e.target.value);
                    setValues({
                      ...values,
                      state: e.target.value,
                    });
                  }}
                >
                  <option selected disabled hidden>
                    State
                  </option>
                  {states?.map((data, index) => {
                    return (
                      <option
                        value={data?.state_id}
                        className="option-field"
                        key={index}
                      >
                        {data.name}
                      </option>
                    );
                  })}
                </select> */}
                {errors.state && touched.state ? (
                  <p className="inputerror">{errors.state}</p>
                ) : null}
              </div>

              <div className="select-div  col-md-4">
                <label className="modal-label">
                  District<span className="required">*</span>
                </label>

                <CommonSelect
                  placeholder={"District"}
                  disabled={
                    location?.state?.device === 1 &&
                    checkproductdata?.product_type === 1
                      ? true
                      : checkproductdata?.product_type === 2 ||
                        checkproductdata?.product_type === 1
                      ? false
                      : true
                  }
                  styles={{
                    background:
                      location?.state?.device === 1 &&
                      checkproductdata?.product_type === 1
                        ? "#a9a9a92e"
                        : checkproductdata?.product_type === 2 ||
                          checkproductdata?.product_type === 1
                        ? null
                        : "#a9a9a92e",
                    width: "100%"
                  }}
                  allowClear={false}
                  onChange={(e) => {
                    setValues({
                      ...values,
                      distric: e
                    });
                  }}
                  options={district}
                  value={values?.distric}
                />
                {/* <select
                  type="text"
                  className="filterinput background-select"
                  id="distric"
                  name="distric"
                  disabled={
                    location?.state?.device === 1 &&
                    checkproductdata?.product_type === 1
                      ? true
                      : checkproductdata?.product_type === 2 ||
                        checkproductdata?.product_type === 1
                      ? false
                      : true
                  }
                  style={{
                    background:
                      location?.state?.device === 1 &&
                      checkproductdata?.product_type === 1
                        ? "#a9a9a92e"
                        : checkproductdata?.product_type === 2 ||
                          checkproductdata?.product_type === 1
                        ? null
                        : "#a9a9a92e",
                  }}
                  onChange={(e) =>
                    setValues({
                      ...values,
                      distric: e.target.value,
                    })
                  }
                >
                  <option selected disabled hidden>
                    District
                  </option>
                  {district?.map((dist, index) => {
                    return (
                      <option value={dist?.city_id} key={index}>
                        {dist?.name}
                      </option>
                    );
                  })}
                </select> */}
                {errors.distric && touched.distric ? (
                  <p className="inputerror">{errors.distric}</p>
                ) : null}
              </div>

              <div className="select-div  col-md-4">
                <label className="modal-label">
                  Controller Name<span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="filterinput"
                  placeholder="Controller name"
                  id="name"
                  name="name"
                  value={values.name}
                  disabled={
                    location?.state?.device === 1 &&
                    checkproductdata?.product_type === 1
                      ? true
                      : checkproductdata?.product_type === 2 ||
                        checkproductdata?.product_type === 1
                      ? false
                      : true
                  }
                  style={{
                    background:
                      location?.state?.device === 1 &&
                      checkproductdata?.product_type === 1
                        ? "#a9a9a92e"
                        : checkproductdata?.product_type === 2 ||
                          checkproductdata?.product_type === 1
                        ? null
                        : "#a9a9a92e"
                  }}
                  onChange={(e) =>
                    setValues({ ...values, name: e.target.value })
                  }
                ></input>
                {errors.name && touched.name ? (
                  <p className="inputerror">{errors.name}</p>
                ) : null}
              </div>
              {location?.state?.device === 1 ||
              checkproductdata?.product_type === 2 ? null : (
                <div className="select-div  col-md-4">
                  <label className="modal-label">
                    Group Name<span className="required">*</span>
                  </label>

                  <div className="addgroup col-12">
                    <CreatableSelect
                      // ref={ref}
                      isDisabled={
                        location?.state?.device === 1 &&
                        checkproductdata?.product_type === 1
                          ? true
                          : checkproductdata?.product_type === 2 ||
                            checkproductdata?.product_type === 1
                          ? false
                          : true
                      }
                      value={
                        values.groupid
                          ? groupoptions?.find(
                              (ele) => ele?.value === values.groupid
                            )
                          : ""
                      }
                      onChange={(e, test) => {
                        setFieldValue("groupid", e ? e.value : "");
                        setgroupname(e.label);
                        setInputVal("");
                      }}
                      options={groupoptions || []}
                      name="groupid"
                      onInputChange={handleInputValue}
                      inputValue={inputVal}
                      isValidNewOption={clearcreateoption}
                      // Standard creatable-select behavior: pressing Enter
                      // (or clicking the "Create '...'" row the fixed
                      // isValidNewOption above now actually shows) creates
                      // the group directly, the same as clicking the "+"
                      // button already did — no longer the only way in.
                      onCreateOption={() => handleaddGroup()}
                      formatCreateLabel={(inputValue) =>
                        `Create "${inputValue}"`
                      }
                      noOptionsMessage={({ inputValue }) =>
                        !inputValue
                          ? ""
                          : "Press the button to add this new Group"
                      }
                    />

                    {(checkproductdata?.product_type === 2 ||
                      checkproductdata?.product_type === 1) &&
                    (inputVal !== "" || groupname !== "") ? (
                      <button
                        type="button"
                        className="addgroupbtn"
                        onClick={() => {
                          handleaddGroup();
                        }}
                      >
                        +
                      </button>
                    ) : null}
                  </div>
                  {errors.groupid && touched.groupid ? (
                    <p className="inputerror">{errors.groupid}</p>
                  ) : null}
                </div>
              )}
              <div className="select-div  col-md-4">
                <button
                  type="button"
                  className="add-btn col-lg-3 col-md-4 col-5"
                  onClick={() => {
                    handleSubmit();
                    setshowmodal({
                      show: true,
                      showvaluemodal: checkproductdata.product_type
                    });
                  }}
                  disabled={
                    location?.state?.device === 1 &&
                    checkproductdata?.product_type === 1
                      ? true
                      : checkproductdata?.product_type === 2 ||
                        checkproductdata?.product_type === 1
                      ? false
                      : true
                  }
                >
                  {" "}
                  FINISH
                </button>
              </div>
            </form>
            <br />
            <br />

            <br />
          </div>
        </div>
      </div>
    </>
  );
}
