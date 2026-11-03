import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { toast } from "react-hot-toast";
import { useLocation } from "react-router";
import {
  changegroup,
  createcontrollergroupapi,
  groupdropdownapi,
} from "../Service/ApiService";
import styles from "./../Components/View/profile/profile.module.css";
import Loader from "./../Components/Loader/index";
import { useFormik } from "formik";
import * as Yup from "yup";
import CommonSelect from "../Components/CommonComponents/CommonSelect";
const validate = Yup.object().shape({
  togroup: Yup.string().required("To group is required"),
});
export default function Changegroup({
  show,
  close,
  controller,
  pevid,
  LightController,
}) {
  const [listgroupTwo, setlist] = useState();
  const [groupid, setid] = useState();
  const [load, setload] = useState(false);

  useEffect(() => {
    forgroup();
  }, []);

  const { values, errors, touched, handleSubmit, handleChange, setValues } =
    useFormik({
      initialValues: { togroup: "" },
      validationSchema: validate,
      onSubmit: (values) => {
        changegroups();
      },
    });
  let location = useLocation();
  const forgroup = () => {
    groupdropdownapi().then((res) => {
      if (res.data) {
        let finalOptios = res?.data.map((ele) => ({
          ...ele,
          label: ele?.group_name,
          value: ele?.group_id,
        }));
        setlist(finalOptios);
      } else {
        setlist([]);
      }
    });
  };
  const changegroups = () => {
    setload(true);
    let formdata = new FormData();
    if (pevid?.group_id) {
      formdata.append("group_id", pevid?.group_id);

      formdata.append("controller_id", location?.state?.id);
      formdata.append("new_group_id", values?.togroup);
      changegroup(formdata)
        .then((res) => {
          toast(res?.data, { type: "success" });
          close();
          LightController();
        })
        .catch((err) => {
          // toast(err?.response?.data?.detail, { type: "error" });
          if (err?.response?.data?.detail?.[0]?.msg) {
            toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
          } else if (err?.response?.data?.detail) {
            toast(err?.response?.data?.detail, { type: "error" });
          } else {
            toast("Something went wrong!!", { type: "error" });
          }
        })
        .finally(() => setload(false));
    } else {
      formdata.append("group_id", values?.togroup);
      formdata.append("controller_id", location?.state?.id);
      createcontrollergroupapi(formdata)
        .then((res) => {
          LightController();
          close();
        })
        .catch((err) => {
          // toast(err?.response?.data?.detail, { type: "error" });
          if (err?.response?.data?.detail?.[0]?.msg) {
            toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
          } else if (err?.response?.data?.detail) {
            toast(err?.response?.data?.detail, { type: "error" });
          } else {
            toast("Something went wrong!!", { type: "error" });
          }
        })
        .finally(() => setload(false));
    }
  };

  return (
    <>
      <Loader isLoader={load} />
      <Modal show={show} onHide={close}>
        <Modal.Header closeButton>
          <h2 className="modal-head">Change Group</h2>
        </Modal.Header>
        <div className="modal-container">
          {controller?.group?.length > 0 ? (
            <div className="select-div">
              <label className="modal-label">
                From Group<span className="required">*</span>
              </label>
              <CommonSelect
                placeholder="From Group"
                styles={{ width: "100%" }}
                value={{
                  label: controller?.group[0]?.group_name,
                  value: controller?.group[0]?.group_id,
                }}
                allowClear={false}
                options={controller.group.map((ele) => ({
                  ...ele,
                  label: ele?.group_name,
                  value: ele.group_id,
                }))}
              />
              {/* <select
                type="text"
                className="filterinput background-select"
                placeholder="From Group"
              >
                {controller?.group?.map((ele, ind) => {
                  return (
                    <option selected value={ele.group_id}>
                      {ele.group_name}
                    </option>
                  );
                })}
              </select> */}
            </div>
          ) : null}
          <div className="select-div">
            <label className="modal-label">
              To Group<span className="required">*</span>
            </label>
            <CommonSelect
              placeholder="Group"
              styles={{ width: "100%" }}
              value={values.togroup ? values.togroup : null}
              onChange={(e) => setValues({ togroup: e })}
              allowClear={false}
              options={listgroupTwo}
            />
            {/* <select
              type="text"
              className="filterinput background-select"
              placeholder="To Group"
              onClick={(e) => setid(e.target.value)}
              onChange={(e) => setValues({ togroup: e.target?.value })}
            >
              <option selected disabled hidden>
                Group
              </option>
              {listgroupTwo?.map((list, index) => {
                return (
                  <option value={list?.group_id} key={index}>
                    {list?.group_name}
                  </option>
                );
              })}
            </select> */}
            {errors?.togroup && touched?.togroup ? (
              <p className="inputerror">{errors?.togroup}</p>
            ) : null}
          </div>
        </div>
        <Modal.Footer>
          <button
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
