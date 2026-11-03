import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { Modal, ModalHeader } from "react-bootstrap";
import * as Yup from "yup";
import Loader from "../Components/Loader";
import styles from "../Components/View/profile/profile.module.css";
import { groupdropdownapi, Mergegroupapi } from "../Service/ApiService";
import classes from "./Modal.module.css";
import { toast } from "react-hot-toast";
import CommonSelect from "../Components/CommonComponents/CommonSelect";

const validate = Yup.object().shape({
  fromgroup: Yup.string().required("From group is required"),
  togroup: Yup.string().required("To group is required"),
});

export default function Mergegroup({ show, close }) {
  const { handleSubmit, values, touched, errors, setFieldValue } = useFormik({
    initialValues: { fromgroup: "", togroup: "" },
    validationSchema: validate,
    onSubmit: (values) => {
      handleMergeGroup(values);
    },
  });
  const [load, setload] = useState(false);
  const [list, setlist] = useState();

  const getGroupDropdown = () => {
    setload(true);
    groupdropdownapi()
      .then(({ data }) => {
        let listdata = data?.map((ele, index) => {
          return { value: ele?.group_id, label: ele?.group_name };
        });
        setlist(listdata);
      })
      .catch((err) => {})
      .finally(() => setload(false));
  };

  const handleMergeGroup = (values) => {
    let formData = new FormData();
    formData.append("from_group_id", values.fromgroup);
    formData.append("to_group_id", values.togroup);
    Mergegroupapi(formData)
      .then((res) => {
        toast(res.data, { type: "success" });
        close();
      })
      .catch((err) => {
        // toast(err.response?.data?.detail, { type: "error" });
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
    getGroupDropdown();
  }, []);
  return (
    <>
      <Loader isLoader={load} />
      <Modal show={show} onHide={close} size="md" centered>
        <ModalHeader closeButton>
          <h3 className="modal-head">Merge Group</h3>
        </ModalHeader>
        <div className={classes.modalflex}>
          <div className="select-div">
            <label className="modal-label">
              from Group<span className="required">*</span>
            </label>
            <CommonSelect
              options={list}
              placeholder="From group"
              allowClear={false}
              styles={{ width: "100%" }}
              value={values.fromgroup ? values.fromgroup : null}
              onChange={(e) => setFieldValue("fromgroup", e)}
            />
            {/* <Select
              options={list}
              type="text"
              className={"filterinput"}
              placeholder="From group"
              id="fromgroup"
              name="fromgroup"
              onChange={(e) => setValues({ ...values, fromgroup: e.value })}
            ></Select> */}
            {touched.fromgroup && errors.fromgroup ? (
              <div className="inputerror">{errors.fromgroup}</div>
            ) : null}
          </div>
          <div className="select-div">
            <label className="modal-label">
              to Group<span className="required">*</span>
            </label>
            <CommonSelect
              options={list}
              placeholder="To group"
              allowClear={false}
              styles={{ width: "100%" }}
              value={values.togroup ? values.togroup : null}
              onChange={(e) => setFieldValue("togroup", e)}
            />
            {/* <Select
              options={tolist}
              type="text"
              className={"filterinput"}
              placeholder="To group"
              id="togroup"
              name="togroup"
              onChange={(e) => setValues({ ...values, togroup: e.value })}
            /> */}
            {touched.togroup && errors.togroup ? (
              <div className="inputerror" s>
                {errors.togroup}
              </div>
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
