import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { Modal, ModalHeader } from "react-bootstrap";
import * as Yup from "yup";
import classes from "./Modal.module.css";
import styles from "../Components/View/profile/profile.module.css";
import Select from "react-select";
import {
  controllerdropdown,
  createusercontrollerapi
} from "../Service/ApiService";
import { toast } from "react-hot-toast";
import { getCookie } from "../Utilities/Cookie";
import CommonSelect from "../Components/CommonComponents/CommonSelect";

const validate = Yup.object().shape({
  controllercode: Yup.array().required("Controller name is required"),
  accesstype: Yup.string().required("Access type is required")
});

export default function Assigncontroller({ show, close, user }) {
  const [codelist, setcode] = useState();
  const { handleSubmit, errors, values, touched, setValues } = useFormik({
    initialValues: { controllercode: "", accesstype: "" },
    validationSchema: validate,
    onSubmit: (values) => {
      save(values);
    }
  });
  let controllertype = JSON.parse(localStorage.getItem("contollertype"));
  let cookie = JSON.parse(getCookie("cookiedata"));
  let usertype = cookie?.user_type;

  useEffect(() => {
    controllercodefunc();
  }, []);

  const controllercodefunc = () => {
    let formdata = new FormData();
    formdata.append("user_id", user?.user);
    formdata.append("controller_type", controllertype);
    controllerdropdown(formdata).then(({ data }) => {
      let dubdata = data?.map((ele, ind) => {
        return {
          value: ele?.controller_id,
          label:
            ele?.controller_code?.length > 0 && ele?.controller_name?.length > 0
              ? `${ele?.controller_code}-${ele?.controller_name}`
              : ele?.controller_name
        };
      });
      setcode(dubdata);
    });
  };

  const save = (values) => {
    let dupdata = (values?.controllercode).map((ele, ind) => {
      return ele?.value;
    });
    let formData = new FormData();
    formData.append("user_id", user?.user);
    formData.append("controller_id", dupdata);
    formData.append("access_type", values?.accesstype);
    createusercontrollerapi(formData)
      .then((res) => {
        toast(res.data, { type: "success" });
        close();
      })
      .catch((err) => {
        // toast(err?.response?.detail, { type: "error" });
        if (err?.response?.data?.detail?.[0]?.msg) {
          toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
        } else if (err?.response?.data?.detail) {
          toast(err?.response?.data?.detail, { type: "error" });
        } else {
          toast("Something went wrong!!", { type: "error" });
        }
      });
  };
  const accesstype = [
    { label: "Admin", value: 0 },
    { label: "Control", value: 1 },
    { label: "Operator", value: 2 },
    { label: "View Only", value: 3 }
  ];

  const FilterOptions = (accesstype) => {
    let data = accesstype.filter((e) => {
      if (usertype == 2 && e.value !== 0) {
        return e;
      } else if (usertype !== 2) {
        return e;
      }
    });
    return data;
  };
  console.log(codelist, "codeList");

  return (
    <>
      <Modal show={show} onHide={close}>
        <ModalHeader closeButton>
          <h3 className="modal-head">Assign Controller</h3>
        </ModalHeader>
        <div className={classes.modalflex}>
          <div className="select-div ">
            <label className="modal-label">
              Controller Name<span className="star">*</span>
            </label>
            <Select
              closeMenuOnSelect={false}
              className={"filterinput"}
              name=""
              onChange={(e) => {
                setValues({ ...values, controllercode: e });
              }}
              // defaultValue={[options[1], options[2]]}
              isMulti
              options={codelist}
            />
            {touched?.controllercode && errors?.controllercode ? (
              <p className="inputerror">{errors?.controllercode}</p>
            ) : null}
            {/* <option selected disabled hidden>controller code</option>
            </select> */}

            {touched.firstName && errors.firstName ? (
              <div>{errors.firstName}</div>
            ) : null}
          </div>
          <div className="select-div ">
            <label className="modal-label">
              Access type<span className="star">*</span>
            </label>
            <CommonSelect
              options={FilterOptions(accesstype)}
              styles={{ width: "100%" }}
              placeholder={"Access Type"}
              onChange={(e) => setValues({ ...values, accesstype: e })}
              value={values.accesstype !== "" ? values.accesstype : null}
              allowClear={false}
            />
            {/* <Select
              className={"filterinput"}
              options={FilterOptions(accesstype)}
              name=""
              isOptionDisabled={(option) => option.isdisabled}
              onChange={(e) => setValues({ ...values, accesstype: e.value })}
            /> */}
            {touched?.accesstype && errors?.accesstype ? (
              <p className="inputerror">{errors?.accesstype}</p>
            ) : null}
          </div>
        </div>
        <Modal.Footer>
          <button
            type="button"
            className={styles.usersave}
            onClick={handleSubmit}
          >
            Save
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
