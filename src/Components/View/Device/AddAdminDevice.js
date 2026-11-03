import { useEffect, useState } from "react";
import Loader from "../../Loader";
import { useFormik } from "formik";
import * as yup from "yup";
import { AddadminDevice, city, state } from "../../../Service/ApiService";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

const validate = yup.object().shape({
  device_code: yup.string().required("Device Code is requied"),
  device_type: yup.string().required("Device Type is requied"),
  controller_type: yup.string().required("Controller Type is requied"),
  device_name: yup.string().required("Device Name is requied"),
  user_type: yup.string().required("User Type is requied"),
  district: yup.string().required("District is requied"),
  state: yup.string().required("State is requied"),
  latitude: yup.string().required("Latitude is requied"),
  longitude: yup.string().required("Longitude is requied"),
  msg: yup.string().required("Message is requied"),
  controller_code: yup.string().required("Controller Code is requied"),
  controller_id: yup.string().required("Controller Id is requied"),
});

export default function Addadmindevice() {
  const navigate = useNavigate();
  const [loader, setloader] = useState(false);
  const [states, setstates] = useState();
  const [showmodal, setshowmodal] = useState({
    show: false,
    showvaluemodal: "",
  });
  const [district, setdistrict] = useState([]);
  const { values, errors, setFieldValue, handleChange, handleSubmit, touched } =
    useFormik({
      initialValues: {
        device_code: "",
        device_type: "",
        controller_type: "",
        device_name: "",
        user_type: "",
        district: "",
        state: "",
        latitude: "",
        longitude: "",
        msg: "",
        status: 1,
        controller_code: "",
        controller_id: "",
      },
      validationSchema: validate,
      onSubmit: (value) => {
        AddDevice();
      },
    });

  useEffect(() => {
    state().then(({ data }) => {
      setstates(data);
    }, []);
  }, []);

  const tocity = (stateid) => {
    let formdata = new FormData();
    formdata.append("state_id", stateid.target.value);
    city(formdata).then(({ data }) => {
      setdistrict(data);
    });
  };

  const AddDevice = () => {
    AddadminDevice(values)
      .then((res) => {
        toast.success(res?.data);
        navigate("/dashboard/controllerdevice");
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
  };

  return (
    <>
      <Loader isLoader={loader} />

      <div>
        <div className="router-pages">
          <div className="controller-head">
            <div className="pre-page">
              <FaArrowLeft
                className="arrow"
                onClick={() => navigate("/dashboard/controllerdevice")}
              />
              <p className="controller-name">Add device</p>
            </div>
          </div>
          <div className="view-page">
            <form
              className="add-form  row justify-content-center"
              style={{ marginBottom: "89px" }}
              onSubmit={handleSubmit}
            >
              <div className="select-div  col-md-4">
                <label className="modal-label">
                  Device Code<span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="filterinput"
                  placeholder="Device Code"
                  id="device_code"
                  name="device_code"
                  value={values.device_code}
                  onChange={handleChange}
                  maxLength={20}
                ></input>
                {errors.device_code && touched.device_code ? (
                  <p className="inputerror">{errors.device_code}</p>
                ) : null}
              </div>
              <div className="select-div  col-md-4">
                <label className="modal-label">
                  Device Type<span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="filterinput"
                  placeholder="Device Type"
                  id="device_type"
                  name="device_type"
                  value={values.device_type}
                  onChange={(e) =>
                    setFieldValue(
                      "device_type",
                      e.target.value && e.target.value <= 4
                        ? parseInt(e.target.value)
                        : ""
                    )
                  }
                  maxLength={1}
                  min={1}
                  max={4}
                ></input>
                {errors.device_type && touched.device_type ? (
                  <p className="inputerror">{errors.device_type}</p>
                ) : null}
              </div>
              <div className="select-div  col-md-4">
                <label className="modal-label">
                  Controller Type<span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="filterinput"
                  placeholder="Controller Type"
                  id="controller_type"
                  name="controller_type"
                  value={values.controller_type}
                  onChange={(e) =>
                    setFieldValue(
                      "controller_type",
                      e.target.value && e.target.value <= 2
                        ? parseInt(e.target.value)
                        : ""
                    )
                  }
                  maxLength={1}
                  min={1}
                  max={2}
                ></input>
                {errors.controller_type && touched.controller_type ? (
                  <p className="inputerror">{errors.controller_type}</p>
                ) : null}
              </div>
              <div className="select-div  col-md-4">
                <label className="modal-label">
                  Device Name<span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="filterinput"
                  placeholder="Device Name"
                  id="device_name"
                  name="device_name"
                  value={values.device_name}
                  onChange={handleChange}
                ></input>
                {errors.device_name && touched.device_name ? (
                  <p className="inputerror">{errors.device_name}</p>
                ) : null}
              </div>
              <div className="select-div  col-md-4">
                <label className="modal-label">
                  User Type<span className="required">*</span>
                </label>
                <select
                  type="text"
                  className="filterinput background-select"
                  id="user_type"
                  name="user_type"
                  onChange={(e) => {
                    setFieldValue("user_type", e.target.value);
                  }}
                >
                  <option selected disabled hidden>
                    Group
                  </option>
                  <option selected disabled>
                    User Type
                  </option>
                  <option value={1}>Private</option>
                  <option value={2}>Goverment</option>
                </select>
                {errors.user_type && touched.user_type ? (
                  <p className="inputerror">{errors.user_type}</p>
                ) : null}
              </div>
              <div className="select-div  col-md-4">
                <label className="modal-label">
                  State<span className="required">*</span>
                </label>
                <select
                  type="text"
                  className="filterinput background-select"
                  placeholder="state"
                  id="state"
                  name="state"
                  onClick={(e) => {
                    tocity(e);
                    setFieldValue("state", e.target.value);
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
                </select>
                {errors.state && touched.state ? (
                  <p className="inputerror">{errors.state}</p>
                ) : null}
              </div>
              <div className="select-div  col-md-4">
                <label className="modal-label">
                  District<span className="required">*</span>
                </label>
                <select
                  type="text"
                  className="filterinput background-select"
                  id="district"
                  name="district"
                  onClick={(e) => {
                    setFieldValue("district", e.target.value);
                  }}
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
                </select>
                {errors.district && touched.district ? (
                  <p className="inputerror">{errors.district}</p>
                ) : null}
              </div>

              <div className="select-div  col-md-4">
                <label className="modal-label">
                  Latitude<span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="filterinput"
                  placeholder="Latitude"
                  id="latitude"
                  name="latitude"
                  value={values.latitude}
                  onChange={handleChange}
                ></input>
                {errors.latitude && touched.latitude ? (
                  <p className="inputerror">{errors.latitude}</p>
                ) : null}
              </div>

              <div className="select-div  col-md-4">
                <label className="modal-label">
                  Longitude<span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="filterinput"
                  placeholder="Longitude"
                  id="longitude"
                  name="longitude"
                  value={values.longitude}
                  onChange={handleChange}
                ></input>
                {errors.longitude && touched.longitude ? (
                  <p className="inputerror">{errors.longitude}</p>
                ) : null}
              </div>
              <div className="select-div  col-md-4">
                <label className="modal-label">
                  Message<span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="filterinput"
                  placeholder="Message"
                  id="msg"
                  name="msg"
                  value={values.msg}
                  onChange={handleChange}
                ></input>
                {errors.msg && touched.msg ? (
                  <p className="inputerror">{errors.msg}</p>
                ) : null}
              </div>
              <div className="select-div  col-md-4">
                <label className="modal-label">
                  Controller Code<span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="filterinput"
                  placeholder="Controller Code"
                  id="controller_code"
                  name="controller_code"
                  value={values.controller_code}
                  onChange={handleChange}
                  maxLength={20}
                ></input>
                {errors.controller_code && touched.controller_code ? (
                  <p className="inputerror">{errors.controller_code}</p>
                ) : null}
              </div>
              <div className="select-div  col-md-4">
                <label className="modal-label">
                  Controller Id<span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="filterinput"
                  placeholder="Controller Id"
                  id="controller_id"
                  name="controller_id"
                  value={values.controller_id}
                  onChange={handleChange}
                ></input>
                {errors.controller_id && touched.controller_id ? (
                  <p className="inputerror">{errors.controller_id}</p>
                ) : null}
              </div>
              <div className="select-div  col-md-6 col-lg-6">
                <button
                  type="submit"
                  className="add-btn col-lg-3 col-md-4 col-5"
                  onClick={handleSubmit}
                  style={{ width: "160px" }}
                >
                  {" "}
                  Add Device
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
