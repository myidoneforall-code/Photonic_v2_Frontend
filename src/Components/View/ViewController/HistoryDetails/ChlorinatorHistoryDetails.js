import moment from "moment";
import devicestyle from "../../ViewController/motorcontroller.module.css";
import { useFormik } from "formik";
import * as yup from "yup";
import { devicehistorydetailsapi } from "../../../../Service/ApiService";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ReactPaginate from "react-paginate";
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import Loader from "../../../Loader";
import CommonDateTimePicker from "../../../CommonComponents/CommonDatePicker";
import CommonSelect from "../../../CommonComponents/CommonSelect";
import chlorineImage from "../../../../Assets/image/chlorine.png";

const validate = yup.object().shape({
  startDate: yup.date().default(() => new Date()),
  endDate: yup
    .date()
    .min(yup.ref("startDate"), "End date can't be before Start date"),
  fromtime: yup.number().required(),
  totime: yup.number().required(),
});

const hasValue = (value) =>
  value !== null && value !== undefined && value !== "";

export const onOffText = (value) =>
  !hasValue(value) ? "-" : parseInt(value, 10) === 1 ? "On" : "Off";

export const pumpText = (value) => {
  if (!hasValue(value)) {
    return "-";
  }
  const pump = parseInt(value, 10);
  return pump === 1 ? "Pump 1" : pump === 2 ? "Pump 2" : "Off";
};

// The chlorinator sends pH (R2) and chlorine (R4) multiplied by 100, so 738 is
// shown as 7.38.
export const reading100 = (value) => {
  const parsed = parseFloat(value);
  if (!hasValue(value) || Number.isNaN(parsed)) {
    return value;
  }
  return Number((parsed / 100).toFixed(2));
};

// History of a chlorinator: pH, TDS and chlorine readings with the state of the
// dosing switch, dosing pump, agitator, float and pressure switch.
export default function Chlorinatorhistorydetails({
  historyview,
  location,
  controllerdata,
  chlorinatorList,
}) {
  const [historydetail, sethistorydetail] = useState();
  const [loader, setloader] = useState(false);

  const { values, errors, touched, setValues, handleSubmit } = useFormik({
    initialValues: {
      startDate: new Date(
        moment().subtract(7, "d").format("YYYY-MM-DD HH:mm:ss")
      ),
      endDate: new Date(),
      fromtime: 1,
      totime: 1,
      device_id: "",
    },
    validationSchema: validate,
    onSubmit: () => {
      handleGetHistory();
    },
  });

  useEffect(() => {
    if (controllerdata?.chlorinator?.length > 0) {
      handleGetHistory();
    }
  }, [controllerdata]);

  const handleGetHistory = (page = 1, size = 25) => {
    setloader(true);

    let formData = new FormData();
    formData.append("controller_id", location?.state.id);
    formData.append(
      "from_date",
      moment(values.startDate).format("YYYY-MM-DD 00:00:00")
    );
    formData.append(
      "to_date",
      moment(values.endDate).format("YYYY-MM-DD 23:59:59")
    );
    formData.append("device_type", 6);
    formData.append("for_web", 1);
    formData.append("report", 1);
    if (values?.device_id) {
      formData.append("device_id", values.device_id);
    }

    devicehistorydetailsapi(formData, page, size)
      .then(({ data }) => {
        sethistorydetail(data);
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

  const currentItems = historydetail?.data;
  const PageCount = Math.ceil(historydetail?.total / 25);
  const handlePageClickEvent = (event) => {
    handleGetHistory(JSON.parse(event.selected) + 1);
  };

  const Items = ({ currentItems }) => {
    return (
      <>
        {currentItems?.length > 0 ? (
          currentItems?.map((row, ind) => {
            return (
              <div key={ind} className={devicestyle.subdetail}>
                <div className="status-div-flex">
                  <p>
                    <span className="allsubhead">date & time&nbsp;:&nbsp;</span>
                    <span>{row?.datetime}</span>
                  </p>
                  <img
                    src={chlorineImage}
                    alt="chlorinator"
                    style={{ height: "28px", width: "28px" }}
                  />
                </div>
                <div className="status-div-flex">
                  <p>
                    <span className="allsubhead">pH&nbsp;:&nbsp;</span>
                    <span>{hasValue(row?.ph) ? reading100(row.ph) : "-"}</span>
                  </p>
                  <p>
                    <span className="allsubhead">TDS&nbsp;:&nbsp;</span>
                    <span>{hasValue(row?.tds) ? row.tds : "-"}</span>
                  </p>
                  <p>
                    <span className="allsubhead">chlorine&nbsp;:&nbsp;</span>
                    <span>{hasValue(row?.chlorine) ? reading100(row.chlorine) : "-"}</span>
                  </p>
                </div>
                <div className="status-div-flex">
                  <p>
                    <span className="allsubhead">dosing switch&nbsp;:&nbsp;</span>
                    <span>{onOffText(row?.dosing_switch)}</span>
                  </p>
                  <p>
                    <span className="allsubhead">dosing pump&nbsp;:&nbsp;</span>
                    <span>{pumpText(row?.dosing_pump)}</span>
                  </p>
                  <p>
                    <span className="allsubhead">agitator&nbsp;:&nbsp;</span>
                    <span>{onOffText(row?.agitator)}</span>
                  </p>
                </div>
                <div className="status-div-flex">
                  <p>
                    <span className="allsubhead">float&nbsp;:&nbsp;</span>
                    <span>{onOffText(row?.float_status)}</span>
                  </p>
                  <p>
                    <span className="allsubhead">pressure&nbsp;:&nbsp;</span>
                    <span>{onOffText(row?.pressure_switch)}</span>
                  </p>
                </div>
                <p>
                  <span className="allsubhead">Device&nbsp;:&nbsp;</span>
                  <span>{row?.device_name}</span>
                </p>
                <p>
                  <span className="allsubhead">Device ID&nbsp;:&nbsp;</span>
                  <span>{row?.device_code}</span>
                </p>
              </div>
            );
          })
        ) : (
          <p className="servicenodatafound">no data found</p>
        )}
      </>
    );
  };

  return (
    <>
      <Loader isLoader={loader} />
      {historyview.chlorinator === true ? (
        <>
          <div className="flow_datas datepadding">
            <div className="Dates">
              <div className="from-to-date to-date">
                <label className="date-label">Device</label>
                <CommonSelect
                  onChange={(data) => {
                    setValues({ ...values, device_id: data });
                  }}
                  allowClear={true}
                  value={values?.device_id}
                  options={chlorinatorList?.map((ele) => ({
                    ...ele,
                    label: ele?.device_name,
                    value: ele?.device_id,
                  }))}
                  placeholder={"Select Device"}
                  responsiveClassName={true}
                />
              </div>
              <div className="from-to-date">
                <label className="date-label">From</label>
                <div>
                  <CommonDateTimePicker
                    value={values.startDate}
                    onChange={(date) => {
                      setValues({ ...values, startDate: new Date(date) });
                    }}
                    formate={"DD-MM-YYYY"}
                    disableDate={true}
                    isFuture={true}
                    allowClear={false}
                  />
                  {errors?.startDate && touched?.startDate ? (
                    <p className="inputerror">{errors?.startDate}</p>
                  ) : null}
                </div>
              </div>
              <div className="from-to-date to-date">
                <label className="date-label">To</label>
                <div>
                  <CommonDateTimePicker
                    value={values.endDate}
                    onChange={(date) => {
                      setValues({ ...values, endDate: new Date(date) });
                    }}
                    formate={"DD-MM-YYYY"}
                    disableDate={true}
                    isFuture={true}
                    allowClear={false}
                  />
                  <br />
                  {errors?.endDate && touched?.endDate ? (
                    <p className="inputerror">{errors?.endDate}</p>
                  ) : null}
                </div>
              </div>

              <button type="button" className="add-btn" onClick={handleSubmit}>
                Submit
              </button>
            </div>
          </div>
          <div
            className={`${
              historydetail?.data?.length > 0
                ? devicestyle.history_detail
                : devicestyle.history_detail_nodata_found
            } status-div`}
          >
            <Items currentItems={currentItems} />
          </div>
        </>
      ) : null}

      {historyview.chlorinator === true && historydetail?.total > 25 ? (
        <div className="col-12 float-start d-flex justify-content-center">
          <ReactPaginate
            breakLabel="..."
            nextLabel={<FaAngleDoubleRight />}
            forcePage={historydetail?.page - 1}
            onPageChange={handlePageClickEvent}
            pageRangeDisplayed={5}
            pageCount={PageCount}
            previousLabel={<FaAngleDoubleLeft />}
            renderOnZeroPageCount={null}
            containerClassName={"container-class"}
            pageLinkClassName={"page-link"}
            pageClassName={"page-item"}
            previousClassName={"next-page-item"}
            previousLinkClassName={"pre-link-item"}
            nextClassName={"next-page-item"}
            nextLinkClassName={"pre-link-item"}
            activeClassName={"active-page"}
          />
        </div>
      ) : null}
    </>
  );
}
