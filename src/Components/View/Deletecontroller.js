import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaArrowLeft,
  FaTrashAlt,
} from "react-icons/fa";

import React, { useRef, useState } from "react";
import ReactPaginate from "react-paginate";
import { useNavigate, useLocation } from "react-router";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { groupdropdownapi, listcontrollerapi } from "../../Service/ApiService";
import {
  UpdateDeletecontrollerview,
  Updatedeletefilter,
  Updatefilterdata,
  UpdatePageState,
} from "../../Components/Store/Config/Configuration";
import DeleteConfirmationModal from "../../Modalcomponents/DeleteConfirmationModal";
import Deletefiltermodal from "../../Modalcomponents/Deletefiltermodal";
import Loader from "../Loader";
import commonstyle from "../../Assets/css/CommonStyle.module.css";
import DeleteDeviceStyle from "../View/DeleteDevice.module.css";
import EmailModal from "../../Modalcomponents/EmailModal";
import { ExportedImages } from "../../Utilities/ImageExport";

export default function Motorcontrollerview() {
  let navigate = useNavigate();
  let location = useLocation();
  const [refresh, setrefresh] = useState(0);
  const [totaldatacount, settotaldata] = useState();
  const [reset, setreset] = useState(false);
  const [lgShow, setLgShow] = useState(false);
  const [groupname, setgroup] = useState();
  let controllertype = localStorage.getItem("contollertype");
  const [deletestate, setstate] = useState(false);
  const [confermation, setconf] = useState(false);
  const [contid, setid] = useState();
  const [loader, setloader] = useState(false);
  const { deletefilter, deletepageState } = useSelector((state) => state);
  const [showEmail, setEmail] = useState(false);
  const deleteRef = useRef(null);
  deleteRef.current = deletefilter;

  // const toview = (id) => {
  //   navigate("/dashboard/details/devicedetails", {
  //     state: {
  //       id: id,
  //       size: location?.state.size,
  //       groupid: location?.state?.groupid,
  //       usertype: location?.state?.usertype,
  //     },
  //   });
  // };

  let controllerpage = sessionStorage.getItem("controllerpage");
  let lightcontrollerpage = sessionStorage.getItem("lightcontrollerpage");

  const todashboard = () => {
    if (controllertype == 1) {
      dispatch(
        Updatedeletefilter({
          controllername: "",
          controllercode: "",
          devicecode: "",
          usertype: "",
          sortby: "",
          groupid: "",
          empty_controller: "",
        })
      );
      navigate(controllerpage);
      sessionStorage.removeItem("deletecontrollerpage");
    } else {
      dispatch(
        Updatedeletefilter({
          controllername: "",
          controllercode: "",
          devicecode: "",
          usertype: "",
          sortby: "",
          groupid: "",
          empty_controller: "",
        })
      );
      navigate(lightcontrollerpage);
      sessionStorage.removeItem("deletelightcontrollerpage");
    }
  };

  // const handleClose = () => {
  //   setLgShow(false);
  // };

  const { Deletecontrollerview } = useSelector((state) => state);
  let dispatch = useDispatch();
  const [pagestate, setpage] = useState(1);

  useEffect(() => {
    ListController(deletepageState ?? 1);
  }, [pagestate, refresh, reset, deletestate]);

  useEffect(() => {
    const interval = setInterval(() => {
      ListController(undefined, true);
    }, 60000);
    return () => clearInterval(interval);
  }, [pagestate]);

  useEffect(() => {
    if (location?.state?.ControllerFilters) {
      dispatch(Updatefilterdata(location?.state?.ControllerFilters?.values));
      dispatch(UpdatePageState(location?.state?.ControllerFilters?.page));
    }
    if (deletepageState) {
      setpage(deletepageState);
    }
  }, [location?.state]);

  const ListController = (page, silent = false) => {
    if (!silent) setloader(true);
    const filterData = deleteRef?.current;
    let formData = new FormData();
    formData.append("controller_type", controllertype);

    if (filterData?.sortby) {
      formData.append("sort_type", filterData?.sortby);
    }
    // formData.append("page", pagestate);
    // formData.append("size", 10);
    if (filterData?.groupid) {
      formData.append("group_id", filterData?.groupid);
    }
    if (filterData?.usertype) {
      formData.append("user_type", filterData?.usertype);
    }
    if (filterData?.controllername) {
      formData.append("controller_name", filterData?.controllername);
    }
    if (filterData?.controllercode) {
      formData.append("controller_code", filterData?.controllercode);
    }
    if (filterData?.devicecode) {
      formData.append("device_code", filterData?.devicecode);
    }
    if (filterData?.empty_controller) {
      formData.append("empty_controller", filterData?.empty_controller);
    }

    listcontrollerapi(formData, page ?? pagestate)
      .then(({ data }) => {
        dispatch(UpdateDeletecontrollerview(data.items));
        settotaldata(data.total);
      })
      .catch(() => {})
      .finally(() => setloader(false));

    groupdropdownapi()
      .then(({ data }) => {
        if (data) {
          setgroup(
            data?.map((ele) => ({
              ...ele,
              label: ele?.group_name,
              value: ele?.group_id,
            }))
          );
        } else {
          setgroup([]);
        }
      })
      .catch((err) => {});
    setreset(false);
  };

  // const Changebutton = (status, id) => {
  //   let formData = new FormData();
  //   formData.append("controller_id", id);
  //   formData.append("controller_type", controllertype);
  //   formData.append("request_type", status == 1 ? 4 : 3);

  //   buttonapi(formData)
  //     .then(({ data }) => {})
  //     .catch((err) => {});
  // };

  // const loadingspinner = (ind, id) => {
  //   setrefresh(refresh + 1);
  //   setloading(true);

  //   setTimeout(() => {
  //     setloading(false);
  //   }, 3000);

  //   let formData = new FormData();
  //   formData.append("controller_id", id);
  //   formData.append("controller_type", controllertype);
  //   formData.append("request_type", 1);

  //   buttonapi(formData)
  //     .then(({ data }) => {})
  //     .catch((err) => {});
  // };

  const currentItems = Deletecontrollerview;
  const pageCount = Math.ceil(totaldatacount / 12);
  const handlePageClick = (event) => {
    setpage(JSON.parse(event.selected) + 1);
  };

  const Items = ({ currentItems }) => {
    return (
      <>
        {confermation ? (
          <DeleteConfirmationModal
            show={confermation}
            close={() => setconf(false)}
            id={contid}
            Deletekey={2}
            ListController={ListController}
          />
        ) : null}

        <div className={DeleteDeviceStyle.delete_device_div}>
          {currentItems?.length > 0 ? (
            <>
              {currentItems?.map((motors, index) => {
                let m = motors.tank_level;
                return (
                  <div
                    className={`${DeleteDeviceStyle.delcon_bg} ${commonstyle.cards_border_radius}`}
                    key={index}
                  >
                    <div
                      className={`${commonstyle.cards_padding} ${DeleteDeviceStyle.delcon_flex}`}
                    >
                      <div className={DeleteDeviceStyle.delcon_flex_one}>
                        <p className={DeleteDeviceStyle.delete_dev_name}>
                          {!motors?.controller_code &&
                          motors?.chlorinator?.length > 0 &&
                          (!motors?.controller_name ||
                            motors.controller_name === "Controller 0")
                            ? motors.chlorinator[0]?.device_name ||
                              motors?.controller_name
                            : motors?.controller_name}
                        </p>
                        {motors?.controller_code ? (
                          <p className="tank-header">
                            <span className="tank-header">ID : </span>
                            <span className="tank-date">
                              {motors?.controller_code}
                            </span>
                          </p>
                        ) : motors?.chlorinator?.length > 0 ? (
                          // A chlorinator added on its own has no controller code: its ID is the device code.
                          <p className="tank-header">
                            <span className="tank-header">ID : </span>
                            <span className="tank-date">
                              {motors.chlorinator
                                .map((unit) => unit?.device_code)
                                .join(", ")}
                            </span>
                          </p>
                        ) : null}
                        {motors?.access_type == 2 ||
                        motors?.access_type == 3 ? null : (
                          <div>
                            <FaTrashAlt
                              className={commonstyle.Delete_icon_color}
                              onClick={() => {
                                setconf(true);
                                setid(motors?.controller_id);
                                // todelete(motors?.controller_id)}}
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {controllertype == 1 ? (
                        <div className={DeleteDeviceStyle.delcon_flex_one}>
                          <p className={commonstyle.margin_zero}>
                            <span className="tank-header">tank</span> -
                            <span className="tank-date">
                              {motors.device?.level}
                            </span>
                          </p>
                          <p className={commonstyle.margin_zero}>
                            <span className="tank-header">flow meter</span> -
                            <span className="tank-date">
                              {motors.device?.flow}
                            </span>
                          </p>
                          <p className={commonstyle.margin_zero}>
                            <span className="tank-heder">valve</span> -
                            <span className="tank-date">
                              {motors.device?.valve}
                            </span>
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <p className="view-msg">No datas Found</p>
          )}
        </div>
      </>
    );
  };

  const toadd = () => {
    navigate("/dashboard/addcontroller", {
      state: {
        pevpath: location?.pathname,
        ControllerFilters: location?.state?.ControllerFilters || {
          page: 1,
          values: {},
        },
        DeleteControllerFilters: {
          page: pagestate || 1,
          values: deleteRef?.current,
        },
      },
    });
    if (controllertype == 1) {
      sessionStorage.setItem(
        "deletecontrollerpage",
        "/dashboard/deletecontroller"
      );
    } else {
      sessionStorage.setItem(
        "deletelightcontrollerpage",
        "/dashboard/deletecontroller"
      );
    }
  };
  return (
    <>
      <Loader isLoader={loader} />

      {showEmail ? (
        <EmailModal show={showEmail} close={() => setEmail(false)} />
      ) : null}
      {lgShow ? (
        <Deletefiltermodal
          show={lgShow}
          close={() => setLgShow(false)}
          pagestate={pagestate}
          groupname={groupname}
          ListController={() => ListController(1)}
          settotaldata={settotaldata}
        />
      ) : null}
      <div>
        <div className="router-pages">
          <div className={DeleteDeviceStyle.delcon_head}>
            <div className="pre-page">
              <FaArrowLeft className="arrow" onClick={() => todashboard()} />
              <p
                className={`${commonstyle.parent_heading_in_all_page} ${DeleteDeviceStyle.delete_device_name}`}
              >
                Delete {controllertype == 1 ? "Motor" : "Light"} Controller
              </p>
            </div>
            <div className={commonstyle.cnt_buttons}>
              <img
                src={ExportedImages.FILTER_ICON}
                className={`${commonstyle.filter_icon} 
                ${commonstyle.outer_card_btn}`}
                onClick={() => {
                  setLgShow(true);
                }}
              />
              <button
                type="button"
                className={`${commonstyle.email_btn} 
        
                ${commonstyle.outer_card_btn}`}
                onClick={() => setEmail(true)}
              >
                Email
              </button>
              <button
                type="button"
                className={`${commonstyle.add_controller_btn}
                ${commonstyle.outer_card_btn}`}
                onClick={() => toadd()}
              >
                Add Controller
              </button>
            </div>
          </div>
          <div className={DeleteDeviceStyle.deldev_pagination_flex}>
            <Items currentItems={currentItems} />
            {totaldatacount > 12 ? (
              <div className="col-12 float-start d-flex justify-content-center paginator">
                <ReactPaginate
                  breakLabel="..."
                  nextLabel={<FaAngleDoubleRight />}
                  onPageChange={handlePageClick}
                  pageRangeDisplayed={5}
                  pageCount={pageCount}
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
                  forcePage={pagestate - 1 || 0}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
