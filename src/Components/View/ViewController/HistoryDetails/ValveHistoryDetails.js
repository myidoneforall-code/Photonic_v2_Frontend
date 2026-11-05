import moment from "moment";
import devicestyle from "../../ViewController/motorcontroller.module.css";
import DatePicker from "react-datepicker";
import { useFormik } from "formik";
import * as yup from "yup";
import { devicehistorydetailsapi } from "../../../../Service/ApiService";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { GoAlert } from "react-icons/go";
import ReactPaginate from "react-paginate";
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import Loader from "../../../Loader";
import CommonDateTimePicker from "../../../CommonComponents/CommonDatePicker";
import CommonSelect from "../../../CommonComponents/CommonSelect";

const validate = yup.object().shape({
  startDate: yup.date().default(() => new Date()),
  endDate: yup
    .date()
    .min(yup.ref("startDate"), "End date can't be before Start date"),
  fromtime: yup.number().required(),
  totime: yup.number().required(),
});

export default function Valvehistorydetails({
  historyview,
  avoidletters,
  location,
  controllerdata,
  valveList,
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
    onSubmit: (values) => {
      handleGetHistory();
    },
  });

  // Load the first page when the units are there, not at every refresh of the controller
  // data: that put the list back on page 1 while the user was paging.
  const hasValve = controllerdata?.valve?.length > 0;
  useEffect(() => {
    if (hasValve) {
      handleGetHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasValve]);

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
      moment(values.toDate).format("YYYY-MM-DD 23:59:59")
    );
    formData.append("device_type", 3);
    formData.append("for_web", 1);
    {
      values?.device_id && formData.append("device_id", values.device_id);
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
          currentItems?.map((valve, ind) => {
            return (
              <div key={ind} className={devicestyle.subdetail}>
                <div className="status-div-flex">
                  <p>
                    <span className="allsubhead">date & time&nbsp;:&nbsp;</span>
                    <span>{valve?.datetime}</span>
                  </p>
                  {valve?.notification === 1 ? (
                    <p className="alerts">
                      <span className="alerspan">
                        <GoAlert />
                        Alert
                      </span>
                    </p>
                  ) : null}
                </div>
                <div className="status-div-flex">
                  {valve.reason ? (
                    <p>
                      <span className="allsubhead">reason&nbsp;:&nbsp;</span>{" "}
                      <span>{valve.reason}</span>
                    </p>
                  ) : null}
                </div>
                <div className="status-div-flex">
                  <p>
                    <span className="allsubhead">Device&nbsp;:&nbsp;</span>
                    <span>{valve?.device_name}</span>
                  </p>
                  <p>
                    <span className="allsubhead">Device ID&nbsp;:&nbsp;</span>
                    <span>{valve?.device_code}</span>
                  </p>
                  <p>
                    <span className="allsubhead">status&nbsp;:&nbsp;</span>
                    <span
                      className={
                        valve.valve_status === 1 ? "status-on" : "status-off"
                      }
                    >
                      {valve.valve_status === 1 ? "open" : "close"}
                    </span>
                  </p>
                </div>
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
      {historyview.valve === true ? (
        <>
          <div className="flow_datas datepadding">
            <div className="Dates">
              <div className="from-to-date to-date">
                <label className="date-label">Device</label>
                <CommonSelect
                  onChange={(data, opt) => {
                    setValues({ ...values, device_id: data });
                  }}
                  allowClear={true}
                  value={values?.device_id}
                  options={valveList?.map((ele) => ({
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

      {historyview.valve === true && historydetail?.total > 25 ? (
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
