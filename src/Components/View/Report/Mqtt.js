import { FaArrowLeft } from "react-icons/fa";
import classes from "./reports.module.css";
import { useNavigate } from "react-router";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { getCatchMsg } from "../../../Utilities/Methods";
import { PublishMqttService } from "../../../Service/ApiService";
import toast from "react-hot-toast";
import dayjs from "dayjs";

import { GetCookieStorage } from "../../../Utilities/Storage";
import { ExportedImages } from "../../../Utilities/ImageExport";

const validationSchema = Yup.object().shape({
  msg: Yup.string().required("Message is required"),
  topic: Yup.string().required("Topic is required"),
});
export default function Mqtt() {
  let navigate = useNavigate();
  let cookie = JSON.parse(GetCookieStorage("cookiedata"));
  let usertype = cookie?.user_type;
  const [publishedMessages, setpublishedMessages] = useState([]);
  const { values, setFieldValue, resetForm, handleSubmit, errors, touched } =
    useFormik({
      initialValues: {
        msg: "",
        topic: "",
      },
      validationSchema,
      onSubmit: (values) => {
        handlePublishData(values);
      },
    });

  const handlePublishData = (values) => {
    let Formdata = new FormData();
    Formdata.append("msg", values.msg);
    Formdata.append("topic", values.topic);
    // let FinalData = [
    //   {
    //     msg: values.msg,
    //     date: dayjs(new Date()).format("DD-MM-YYYY HH:mm:ss"),
    //   },
    //   ...publishedMessages,
    // ];
    // setpublishedMessages(FinalData);
    PublishMqttService(Formdata)
      .then(({ data }) => {
        if (data.status === 1) {
          let FinalData = [
            {
              msg: data.msg,
              date: dayjs(new Date()).format("DD-MM-YYYY HH:mm:ss"),
            },
            ...publishedMessages,
          ];
          setpublishedMessages(FinalData);
        } else {
          toast.error(data.msg);
        }
      })
      .catch((err) => {
        getCatchMsg(err);
      });
  };

  const Dataitems = [
    {
      key: "1",
      label: "Controller",
      // children: "",
    },
    {
      key: "2",
      label: "Device",
      // children: "",
    },
  ];
  return (
    <div className={classes.router_pages}>
      <div className={classes.historyheader}>
        <div className="pre-page">
          <FaArrowLeft
            className="arrow"
            onClick={() =>
              usertype === 4 ? navigate("/production") : navigate("/dashboard")
            }
          />
          <h3 className={classes.header}>MQTT</h3>
        </div>
      </div>

      <div className={classes.mqttcontainer}>
        <div className={`${classes.formContainer} `}>
          <div className="col-sm-12">
            <label className="modal-label">Topic</label>
            <br />
            <input
              type="text"
              className="filterinput w-100"
              name="topic"
              id="topic"
              value={values.topic ? values.topic : values.topic}
              onChange={(e) => setFieldValue("topic", e.target.value)}
              placeholder="Topic"
            />

            <p className={classes.errorText}>
              {errors.topic && touched.topic ? errors.topic : ""}
            </p>
          </div>
          <div className="col-sm-12 gutter-10">
            <label className="modal-label">Message</label>
            <br />
            <textarea
              type="text"
              className="filterinput w-100"
              name="msg"
              id="msg"
              style={{ height: "150px" }}
              value={values.msg ? values.msg : values.msg}
              onChange={(e) => setFieldValue("msg", e.target.value)}
              placeholder="Message"
            />

            <p className={classes.errorText}>
              {errors.msg && touched.msg ? errors.msg : ""}
            </p>
          </div>
          <div className="col-sm-12">
            <button
              type="button"
              className={classes.publishButton}
              onClick={handleSubmit}
            >
              Publish
            </button>
          </div>
        </div>

        <div className={` ${classes.messageContainer}`}>
          <h3 className={classes.messageText}>Messages</h3>
          <div className={classes.DatasContainer}>
            {publishedMessages?.map((item, index) => {
              return (
                <div key={index} className={classes.messageBox}>
                  <span>{item.date}</span>
                  <p>{item.msg}</p>
                </div>
              );
            })}{" "}
          </div>

          <button
            type="button"
            className={classes.messageDeletebtn}
            onClick={() => {
              setpublishedMessages([]);
            }}
            style={{
              background:
                publishedMessages.length > 0 ? "#f22f4a" : "#f22f4a99",
            }}
          >
            <img
              src={ExportedImages.DELETE_ICON_WHITE}
              style={{ width: "16px" }}
            />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
