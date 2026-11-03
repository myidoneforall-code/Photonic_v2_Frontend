import { useFormik } from "formik";
import React, { useState } from "react";
import { useNavigate } from "react-router";
import { checkproduct } from "../../../Service/ApiService";
import * as Yup from "yup";
import setCookie from "../../../Utilities/Cookie";
import { toast } from "react-hot-toast";
import { propTypes } from "react-bootstrap/esm/Image";
import productionstyle from "../Productionunit/production.module.css";

const validate = Yup.object().shape({
  id: Yup.string()
    .min(6, "Unique ID is not valid")
    .required("Unique ID is required"),
});
export default function ProductionController() {
  let navigate = useNavigate();
  const { values, touched, errors, handleChange, handleSubmit } = useFormik({
    initialValues: { id: "" },
    validationSchema: validate,
    onSubmit: (values) => {
      toview();
    },
  });

  const toview = () => {
    let formdata = new FormData();
    formdata.append("product_code", values?.id);
    checkproduct(formdata)
      .then((res) => {
        if (res?.data?.error === 0) {
          sessionStorage.setItem("details", JSON.stringify(res?.data));
          navigate("view");
        } else if (res?.data?.error === 1) {
          toast(res?.data?.msg, { type: "error" });
        } else {
          toast("Something went wrong!!!", { type: "error" });
        }
      })
      .catch((err) => {});
  };

  return (
    <>
      <div>
        <label className="modal-label">
          Unique Id<span className="required">*</span>
        </label>
        <br />
        <input
          type="text"
          name="id"
          className="input-field inputwidth"
          onChange={handleChange}
          maxLength={15}
        />
        &nbsp;&nbsp;&nbsp;&nbsp;
        <button type="button" className="add-btn" onClick={handleSubmit}>
          Submit
        </button>
        <br />
        <br />
        {touched?.id && errors?.id ? (
          <p className="inputerror">{errors?.id}</p>
        ) : null}
      </div>
    </>
  );
}
