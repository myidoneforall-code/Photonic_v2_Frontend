import { Button, Modal } from "react-bootstrap";
import Loader from "../Components/Loader";
import { useEffect, useState } from "react";
import styles from "./Modal.module.css";
import { useFormik } from "formik";
import {
  AddSimService,
  DeleteSimService,
  EditSimService,
} from "../Service/ApiService";
import { getCatchMsg, JSONtoformdata } from "../Utilities/Methods";
import toast from "react-hot-toast";
import CommonInput from "../Components/CommonComponents/CommonInput";
import * as Yup from "yup";
import { REGEX } from "../Utilities/Constants";

const validationSchema = Yup.object().shape({
  // sim_number: Yup.string().trim().required("Sim Number is required"),
  // mobile_no: Yup.string()
  //   .trim()
  //   // .matches(REGEX.MOBILE_REGEX, "Mobile no is invalid")
  //   .required("Mobile Number is required"),
  imsi_number: Yup.string().trim().required("IMSI Number is required"),
  // network: Yup.string().trim().required("Network is required"),
});
export default function ModifySimModal({ show, onClose, UpdateData, type }) {
  const [loader, setloader] = useState(false);
  const { values, setFieldValue, setValues, handleSubmit, errors, touched } =
    useFormik({
      initialValues: {
        sim_number: "",
        mobile_no: "",
        imsi_number: "",
        network: "",
      },
      validationSchema,
      onSubmit: (values) => {
        if (type === "Add") {
          handleAddSim(values);
        } else {
          handleUpdateSim(values);
        }
      },
    });

  const handleAddSim = (values) => {
    setloader(true);
    let finalObj = { ...values };
    AddSimService(JSONtoformdata(finalObj))
      .then(({ data }) => {
        if (data.status === 1) {
          onClose(true);
          toast.success(data.msg);
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

  const handleUpdateSim = (values) => {
    setloader(true);
    let finalObj = { ...values, sim_id: UpdateData.id };
    EditSimService(JSONtoformdata(finalObj))
      .then(({ data }) => {
        if (data.status === 1) {
          onClose(true);
          toast.success(data.msg);
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

  useEffect(() => {
    if (UpdateData) {
      setValues({
        sim_number: UpdateData.sim_number || "",
        mobile_no: UpdateData.mobile_no || "",
        imsi_number: UpdateData.imsi_number || "",
        network: UpdateData.network || "",
      });
    }
  }, []);

  return (
    <>
      {loader && <Loader isLoader={loader} />}
      <div className={styles.modal}>
        <Modal show={show} size="lg" onHide={onClose}>
          <Modal.Header closeButton className={styles.messageHead}>
            {type} Sim
          </Modal.Header>
          <Modal.Body>
            <form className="row ">
              <div className="col-sm-12 col-md-12  col-lg-6 col-xl-6  px-2 mb-3">
                <label className="modal-label">
                  SIM Number&nbsp;
                  {/* <span className="required">*</span> */}
                </label>
                <br />
                <CommonInput
                  maxLength={20}
                  value={values.sim_number}
                  onChange={(data) => {
                    setFieldValue("sim_number", data);
                  }}
                  isAlphaNumeric={true}
                  placeholder="SIM Number"
                  styles={{ width: "100%" }}
                />
                {errors.sim_number && touched.sim_number ? (
                  <p className="errorText">{errors.sim_number}</p>
                ) : (
                  ""
                )}
              </div>
              <div className="col-sm-12 col-md-12  col-lg-6 col-xl-6  px-2 mb-3">
                <label className="modal-label">
                  Mobile Number&nbsp;
                  {/* <span className="required">*</span> */}
                </label>
                <br />
                <CommonInput
                  maxLength={15}
                  isNumber={true}
                  value={values.mobile_no}
                  onChange={(data) => {
                    setFieldValue("mobile_no", data);
                  }}
                  placeholder="Mobile Number"
                  styles={{ width: "100%" }}
                />
                {errors.mobile_no && touched.mobile_no ? (
                  <p className="errorText">{errors.mobile_no}</p>
                ) : (
                  ""
                )}
              </div>
              <div className="col-sm-12 col-md-12  col-lg-6 col-xl-6  px-2 mb-3">
                <label className="modal-label">
                  IMSI Number&nbsp;<span className="required">*</span>
                </label>
                <br />
                <CommonInput
                  maxLength={15}
                  value={values.imsi_number}
                  onChange={(data) => {
                    setFieldValue("imsi_number", data);
                  }}
                  isNumber={true}
                  placeholder="IMSI Number"
                  styles={{ width: "100%" }}
                />
                {errors.imsi_number && touched.imsi_number ? (
                  <p className="errorText">{errors.imsi_number}</p>
                ) : (
                  ""
                )}
              </div>
              <div className="col-sm-12 col-md-12  col-lg-6 col-xl-6  px-2 mb-3">
                <label className="modal-label">
                  NetWork&nbsp;
                  {/* <span className="required">*</span> */}
                </label>
                <br />
                <CommonInput
                  maxLength={20}
                  value={values.network}
                  onChange={(data) => {
                    setFieldValue("network", data);
                  }}
                  placeholder="NetWork"
                  styles={{ width: "100%" }}
                />
                {errors.network && touched.network ? (
                  <p className="errorText">{errors.network}</p>
                ) : (
                  ""
                )}
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick={() => {
                onClose();
              }}
              className={styles.modalButton}
              style={{ background: "#bf0101" }}
            >
              Cancel
            </Button>
            <Button
              className={styles.modalButton}
              onClick={handleSubmit}
              style={{ background: "#004758" }}
            >
              {type}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
}
