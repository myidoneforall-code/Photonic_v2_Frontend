import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { Modal, ModalHeader } from "react-bootstrap";
import Select from "react-select";
import * as Yup from "yup";
import classes from "./Modal.module.css";
import styles from "./../Components/View/profile/profile.module.css";
import {
  createusergroupapi,
  userdropdown,
  usergroupdropdown
} from "../Service/ApiService";
import { toast } from "react-hot-toast";
import { getCookie } from "../Utilities/Cookie";
import CommonSelect from "../Components/CommonComponents/CommonSelect";
import { GetCookieStorage } from "../Utilities/Storage";
import { AccessTypes } from "../Utilities/Constants";

const validate = Yup.object().shape({
  username: Yup.string().required("User name is required"),
  accesstype: Yup.string().required("Access type is required")
});

export default function Assigngroup({ show, groupid, close }) {
  const { handleChange, handleSubmit, errors, values, touched, setFieldValue } =
    useFormik({
      initialValues: { username: "", accesstype: "" },
      validationSchema: validate,
      onSubmit: (values) => {
        handleAssignUser();
      }
    });
  let cookie = JSON.parse(GetCookieStorage("cookiedata"));
  let usertype = cookie?.user_type;
  const [UserList, setUserList] = useState([]);

  const getUserDropdown = () => {
    let formData = new FormData();
    formData.append("group_id", groupid?.group_id);
    usergroupdropdown(formData).then(({ data }) => {
      if (data) {
        let finalOptions = data?.map((ele) => ({
          ...ele,
          label: ele?.name,
          value: ele.user_id
        }));
        setUserList(finalOptions);
      } else {
        setUserList(data);
      }
    });
  };

  const handleAssignUser = () => {
    let formdata = new FormData();
    formdata.append("group_id", groupid?.group_id);
    formdata.append("user_id", values?.username);
    formdata.append("access_type", values?.accesstype);
    createusergroupapi(formdata)
      .then((res) => {
        toast(res.data, { type: "success" });
        close();
      })
      .catch((err) => {
        if (err.response?.detail) {
          // toast(err.response?.detail, { type: "error" });
          if (err?.response?.data?.detail?.[0]?.msg) {
            toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
          } else if (err?.response?.data?.detail) {
            toast(err?.response?.data?.detail, { type: "error" });
          } else {
            toast("Something went wrong!!", { type: "error" });
          }
        }
      });
  };

  useEffect(() => {
    getUserDropdown();
  }, []);
  return (
    <>
      <Modal show={show} onHide={close}>
        <ModalHeader closeButton>
          <h3 className="modal-head">Assign User</h3>
        </ModalHeader>
        <div className={classes.modalflex}>
          <div className="select-div ">
            <label className="modal-label">
              group<span className="required">*</span>
            </label>
            <select
              type="text"
              className={"filterinput background-select"}
              placeholder="group"
              id="group"
              name="group"
              value={groupid?.group_id}
              disabled
            >
              <option selected disabled hidden>
                {groupid?.group_name}
              </option>
            </select>
          </div>
          <div className="select-div">
            <label className="modal-label">
              User Name<span className="required">*</span>
            </label>
            <CommonSelect
              placeholder="User Name"
              onChange={(e) => {
                // value={values?.accesstype}
                setFieldValue("username", e);
              }}
              allowClear={false}
              styles={{ width: "100%" }}
              options={UserList}
              value={values.username ? values.username : null}
              name="username"
            />
            {/* <select
              type="text"
              className={"filterinput background-select"}
              placeholder="User name"
              id="username"
              name="username"
              // value={values?.username}
              onChange={handleChange}
            >
              <option selected disabled hidden>
                User name
              </option>
              {UserList?.map((ele, index) => {
                return <option value={ele?.user_id}>{ele?.name}</option>;
              })}
            </select> */}
            {errors?.username && touched?.username ? (
              <p className="inputerror">{errors?.username}</p>
            ) : null}
          </div>
          <div className="select-div ">
            <label className="modal-label">
              access type<span className="required">*</span>
            </label>
            <CommonSelect
              placeholder="Access Type"
              onChange={(e) => {
                // value={values?.accesstype}
                setFieldValue("accesstype", e);
              }}
              name="accesstype"
              allowClear={false}
              styles={{ width: "100%" }}
              options={AccessTypes}
              value={values.accesstype !== "" ? values.accesstype : null}
            />
            {/* <select
              type="text"
              className={"filterinput background-select"}
              placeholder="Access type"
              id="accesstype"
              name="accesstype"
              onChange={handleChange}
            >
              <option selected={true} disabled hidden>
                Access type
              </option>
              <option value={0} hidden={usertype === 2 ? true : false}>
                Admin
              </option>
              <option value={1}>Control</option>
              <option value={2}>Operator</option>
              <option value={3}>View only</option>
            </select> */}
            {errors?.accesstype && touched?.accesstype ? (
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
