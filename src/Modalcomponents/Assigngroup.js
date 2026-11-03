import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { Modal, ModalHeader } from "react-bootstrap";
import * as Yup from "yup";
import Select from "react-select";
import styles from "./../Components/View/profile/profile.module.css";
import { createusergroupapi, usergroupdropdown } from "../Service/ApiService";
import { toast } from "react-hot-toast";
import { getCookie } from "../Utilities/Cookie";

const validate = Yup.object().shape({
  group: Yup.string().required("Group is required"),
  accesstype: Yup.string().required("Access type is required"),
});

export default function Assigngroup({ show, close, user }) {
  const [groupdata, setgroupdata] = useState();
  const {
    handleChange,
    handleSubmit,
    values,
    setFieldValue,
    setValues,
    touched,
    errors,
  } = useFormik({
    initialValues: { group: "", accesstype: "" },
    validationSchema: validate,
    onSubmit: (values) => {
      save();
    },
  });
  const Cookie = JSON.parse(getCookie("cookiedata"));
  let usertype = Cookie?.user_type;
  const save = () => {
    let formdata = new FormData();
    formdata.append("group_id", values?.group);
    formdata.append("user_id", user?.user);
    formdata.append("access_type", values?.accesstype);
    createusergroupapi(formdata)
      .then((res) => {
        toast(res?.data, { type: "success" });
        close();
      })
      .catch((err) => {
        // toast(err?.response?.detail, { type: "success" });
        if (err?.response?.data?.detail?.[0]?.msg) {
          toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
        } else if (err?.response?.data?.detail) {
          toast(err?.response?.data?.detail, { type: "error" });
        } else {
          toast("Something went wrong!!", { type: "error" });
        }
      });
  };

  useEffect(() => {
    grouplist();
  }, []);

  const grouplist = () => {
    let formData = new FormData();
    formData.append("user_id", user?.user);
    usergroupdropdown(formData).then(({ data }) => {
      let dupdata = data?.map((ele, i) => {
        return { label: ele?.name, value: ele?.group_id };
      });
      setgroupdata(dupdata);
    });
  };

  const accesstype = [
    { label: "Admin", value: 0 },
    { label: "Control", value: 1 },
    { label: "Operator", value: 2 },
    { label: "View Only", value: 3 },
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

  return (
    <>
      <Modal show={show} onHide={close}>
        <ModalHeader closeButton>
          <h3 className="modal-head">Assign Group</h3>
        </ModalHeader>
        <div>
          <div className="select-div">
            <label className="modal-label">
              group name<span className="star">*</span>
            </label>
            <Select
              className={"filterinput"}
              options={groupdata}
              name="group"
              id="group"
              onChange={(e) => setValues({ ...values, group: e.value })}
            />
            {touched?.group && errors?.group ? (
              <p className="inputerror">{errors?.group}</p>
            ) : null}
          </div>
          <div className="select-div ">
            <label className="modal-label">User Name</label>
            <select
              type="text"
              className={"filterinput"}
              placeholder="User Name"
              id="username"
              name="username"
              value={user?.name}
              disabled
              onChange={handleChange}
            >
              <option selected disabled hidden value={user?.user}>
                {user?.name}
              </option>
            </select>
          </div>
          <div className="select-div ">
            <label className="modal-label">
              Access Type<span className="star">*</span>
            </label>
            <Select
              className={"filterinput"}
              options={FilterOptions(accesstype)}
              id="accesstype"
              name="accesstype"
              isOptionDisabled={(option) => option.isdisabled}
              onChange={(e) => setValues({ ...values, accesstype: e.value })}
            />
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
