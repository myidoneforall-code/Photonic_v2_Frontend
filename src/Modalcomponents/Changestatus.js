import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import Loader from "../Components/Loader";
import styles from "./../Components/View/profile/profile.module.css";
import * as Yup from "yup";
import { editcontroller, editdevice } from "../Service/ApiService";
import { toast } from "react-hot-toast";

const validate = Yup.object().shape({
  status: Yup.string().required("Status is required"),
  msg: Yup.string().when("status", {
    is: (status) => {
      return status == 3 ? true : false;
    },
    then: () => Yup.string().required("Message is required"),
  }),
});

export default function Changestatus({
  show,
  close,
  status,
  data,
  funcall,
  devicePositionList,
}) {
  const [loader, setloader] = useState(false);
  let productiondata = JSON.parse(sessionStorage.getItem("details"));

  useEffect(() => {
    // setValues({ ...values, status: status });
    // setload(true);
  }, []);

  const { values, errors, touched, handleSubmit, handleChange, setValues } =
    useFormik({
      initialValues: { status: status == 2 ? 1 : status || "", msg: "" },
      validationSchema: validate,
      onSubmit: (values) => {
        changestatus();
      },
    });

  const changestatus = () => {
    if (productiondata?.controller_type) {
      setloader(true);

      let formdata = {
        controller_name: data?.controller_name,
        latitude: data?.latitude,
        longitude: data?.longitude,
        msg: values.msg,
        status: values?.status,
      };
      editcontroller(productiondata?.controller_id, formdata)
        .then(({ data }) => {
          toast(data, { type: "success" });
          funcall();
          close();
        })
        .catch()
        .finally(() => setloader(false));
    } else {
      if (productiondata?.device_type === 4) {
        setloader(true);

        let formdata = {
          device_name: data?.device_name,
          latitude: data?.latitude,
          longitude: data?.longitude,
          msg: values.msg,
          status: values?.status,
          dim: data?.dim_level,
        };
        editdevice(formdata, productiondata?.device_id)
          .then(({ data }) => {
            funcall();
            close();
          })
          .catch()
          .finally(() => setloader(false));
      } else if (productiondata?.device_type === 1) {
        setloader(true);

        let formdata = {
          device_name: data?.device_name,
          low_limit: data?.low_limit,
          high_limit: data?.high_limit !== "" ? data?.high_limit : null,
          edit_action: 0,
          tank_height: data?.tank_height,
          eb_number: data?.eb_number,
          latitude: data?.latitude,
          longitude: data?.longitude,
          msg: values.msg,
          status: values?.status,
          lora_status: data?.lora_status,
        };
        editdevice(formdata, productiondata?.device_id)
          .then(({ data }) => {
            funcall();
            close();
            toast(data, { type: "success" });
          })
          .catch()
          .finally(() => setloader(false));
      } else if (productiondata?.device_type === 2) {
        setloader(true);

        let formdata = {
          device_name: data?.device_name,
          usage_limit: data?.usage_limit,
          eb_number: data?.eb_number,
          latitude: data?.latitude,
          longitude: data?.longitude,
          msg: values.msg,
          status: values?.status,
          lora_status: 0,
        };
        editdevice(formdata, productiondata?.device_id)
          .then(({ data }) => {
            funcall();
            close();
            toast(data, { type: "success" });
          })
          .catch()
          .finally(() => setloader(false));
      } else if (productiondata?.device_type === 3) {
        setloader(true);

        let formdata = {
          device_name: data?.device_name,
          eb_number: data?.eb_number,
          latitude: data?.latitude,
          longitude: data?.longitude,
          msg: values.msg,
          status: values?.status,
        };
        editdevice(formdata, productiondata?.device_id)
          .then(({ data }) => {
            funcall();
            close();
            toast(data, { type: "success" });
          })
          .catch()
          .finally(() => setloader(false));
      } else if (productiondata?.device_type === 6) {
        // Chlorinator: only the name, place and status are saved here.
        setloader(true);

        let formdata = {
          device_name: data?.device_name || "Chlorinator",
          eb_number: data?.eb_number,
          latitude: data?.latitude,
          longitude: data?.longitude,
          msg: values.msg,
          status: values?.status,
        };
        editdevice(formdata, productiondata?.device_id)
          .then(({ data }) => {
            funcall();
            close();
            toast(data, { type: "success" });
          })
          .catch((err) => {
            toast(
              err?.response?.data?.detail?.toString() || "Something went wrong!!",
              { type: "error" }
            );
          })
          .finally(() => setloader(false));
      } else if (productiondata?.device_type === 5) {
        setloader(true);

        let formdata = {
          tank_position: devicePositionList?.tank.toString(),
          valve_position: devicePositionList?.valve.toString(),
          flow_position: devicePositionList?.flow.toString(),
          device_name: data?.device_name,
          latitude: data?.latitude,
          longitude: data?.longitude,
          msg: values.msg,
          status: values?.status,
          dim: data?.dim_level,
        };
        editdevice(formdata, productiondata?.device_id)
          .then(({ data }) => {
            funcall();
            close();
          })
          .catch()
          .finally(() => setloader(false));
      }
    }
  };
  return (
    <>
      <Loader isLoader={loader} />
      <Modal show={show} onHide={close}>
        <Modal.Header closeButton>
          <h2 className="modal-head">Change Status</h2>
        </Modal.Header>
        <div className="modal-container">
          <div className="select-div">
            <label className="modal-label">
              Status<span className="required">*</span>
            </label>
            <select
              type="text"
              name="status"
              className="filterinput"
              placeholder="From Group"
              onChange={(e) => {
                setValues({ ...values, status: e.target.value });
              }}
            >
              <option value={1} selected={status == 1 ? true : false}>
                Tested Ok
              </option>
              <option value={3} selected={status == 3 ? true : false}>
                Fault
              </option>
            </select>
            {errors?.status && touched?.status ? (
              <p className="inputerror">{errors?.status}</p>
            ) : null}
          </div>

          <div className="select-div">
            <label className="modal-label">
              Message
              {values.status == 3 ? <span className="required">*</span> : null}
            </label>
            <input
              type="text"
              name="msg"
              className="filterinput"
              placeholder="Message"
              onChange={(e) => setValues({ ...values, msg: e.target.value })}
            />
            {errors?.msg && touched?.msg ? (
              <p className="inputerror">{errors?.msg}</p>
            ) : null}
          </div>

          {/* {values.status == 3 ? (
            <div className="select-div">
              <label className="modal-label">
                Message<span className="required">*</span>
              </label>
              <input
                type="text"
                name="msg"
                className="filterinput"
                placeholder="Message"
                onChange={(e) => setValues({ ...values, msg: e.target.value })}
              />
              {errors?.msg && touched?.msg ? (
                <p className="inputerror">{errors?.msg}</p>
              ) : null}
            </div>
          ) : (
            <div className="select-div">
              <label className="modal-label">Message</label>
              <input
                type="text"
                name="msgTwo"
                className="filterinput"
                placeholder="Message"
                onChange={(e) => {
                  setValues({ ...values, msgTwo: e.target.value });
                }}
              />
            </div>
          )} */}
        </div>
        <Modal.Footer>
          <button
            type="submit"
            variant="primary"
            className={styles.usersave}
            onClick={handleSubmit}
          >
            save
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
