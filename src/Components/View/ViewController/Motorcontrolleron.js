import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  UpdatePageState,
  Updatedeletefilter,
  UpdatedeletepageState,
  Updatefilterdata,
  UpdatemotorViewDatas
} from "../../Store/Config/Configuration";

import {
  FaArrowLeft,
  FaAngleDoubleLeft,
  FaAngleDoubleRight
} from "react-icons/fa";
import {
  buttonapi,
  devicerefreshapi,
  groupdropdownapi,
  listcontrollerapi,
  listControllerDeviceapi
} from "../../../Service/ApiService";
import ReactPaginate from "react-paginate";
import FilterControllerModal from "../../../Modalcomponents/FilterControllerModal";
import Loader from "../../Loader";

import EmailModal from "../../../Modalcomponents/EmailModal";
import commonstyle from "../../../Assets/css/CommonStyle.module.css";
import motorstyle from "../ViewController/motorcontroller.module.css";
import {
  GetSessionStorage,
  SetSessionStorage
} from "../../../Utilities/Storage";
import { getCookie } from "../../../Utilities/Cookie";
import { notification } from "antd";
import { ExportedImages } from "../../../Utilities/ImageExport";
import MotorControllerCard from "../MotorControllerCard";

export default function Motorcontrolleron() {
  let navigate = useNavigate();
  let location = useLocation();

  const filterdata = useSelector((state) => state.filterdata);

  let dispatch = useDispatch();
  const [isloading, setloading] = useState(false);
  const [refresh, setrefresh] = useState(0);
  const [motorindex, setindex] = useState();
  const [totaldatacount, settotaldata] = useState();
  const [lgShow, setLgShow] = useState(false);
  const [groupname, setgroup] = useState();
  const [loader, setloader] = useState(false);
  const [buttongreyid, setbuttongreyid] = useState("");
  const [valvebuttontype, setvalvebuttontype] = useState(1);
  let sessiongroup = JSON.parse(sessionStorage.getItem("groupid"));
  let sessiontype = JSON.parse(sessionStorage.getItem("usertype"));
  const [showEmail, setEmail] = useState(false);
  const pagestate = useSelector((state) => state.pagestate);
  const sorttype = sessionStorage.getItem("sorttype");
  const [dataList, setDataList] = useState([]);
  let cookie = JSON.parse(getCookie("cookiedata"));
  const [loadingControllerId, setLoadingControllerId] = useState(null);
  let abortcontroller = useRef(null);

  let usertype = cookie?.user_type;
  let SessionUserId = JSON.parse(GetSessionStorage("mainUserId"));
  const { motor } = SessionUserId || {};
  const toalldetails = (conid, data) => {
    navigate("/dashboard/details", {
      state: {
        id: conid,
        ControllerFilters: {
          page: pagestate,
          values: filterdata
        }
      }
    });
    dispatch(UpdatemotorViewDatas(data));
    SetSessionStorage("MotorViewDatas", JSON.stringify(data));

    sessionStorage.setItem(
      "controllerdetailspage",
      "/dashboard/motorcontrolleron"
    );
    sessionStorage.setItem(
      "sorttype",
      Number(sorttype) === 3 ? 3 : Number(sorttype) === 4 ? 4 : 1
    );
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    // filterdata.sortby lives in Redux and only resets on a full page
    // reload, not on in-app navigation. If the user applied an ON/OFF
    // filter here (or it got set some other way) and then navigates
    // away and back, this component remounts with that stale value
    // already in the store — so the same URL can alternate between
    // showing everything and "No Data Found" depending on whether the
    // leftover filter happens to match the current device state. A
    // fresh visit with no explicit nav-state intent should always show
    // everything by default.
    if (!location?.state?.sorttype && filterdata?.sortby) {
      dispatch(Updatefilterdata({ ...filterdata, sortby: "" }));
      ListController("");
    } else {
      ListController();
    }
  }, [pagestate, refresh]);

  useEffect(() => {
    const interval = setInterval(() => {
      ListController(undefined, true);
      dispatch(Updatefilterdata(filterdata));
      dispatch(UpdatePageState(pagestate));
    }, 60000);
    return () => clearInterval(interval);
  }, [pagestate, filterdata]);

  const todashboard = () => {
    navigate("/dashboard");
    sessionStorage.removeItem("controllerpage");
    sessionStorage.removeItem("controllerdetailspage");
    dispatch(UpdatePageState(1));
  };
  console.log(sorttype, "sorttype");

  const ListController = (overrideSortby, silent = false) => {
    if (!silent) setloader(true);
    let formData = new FormData();
    formData.append("controller_type", 1);
    console.log(
      filterdata?.sortby,
      location?.state?.sorttype,
      sorttype,
      "Printed1231"
    );

    // Was `filterdata?.sortby >= 0` — true even when sortby is still its
    // default "" (JS coerces "" to 0 for >= comparisons), so this always
    // fired and fell back to `sorttype`: a sessionStorage value left
    // over from whatever ON/OFF/notification list was last clicked
    // ANYWHERE in the app, not specific to this page. That's why a
    // freshly-added controller could vanish here — it was silently
    // inheriting a stale on/off filter instead of showing everything by
    // default. Only apply a filter when one was actually, explicitly
    // chosen (via this page's own filter control, or real nav state) —
    // on/off is shown per-card via the toggle below either way.
    // overrideSortby lets the mount effect force "no filter" for the very
    // first fetch after resetting a stale Redux filterdata.sortby, without
    // waiting on a re-render to see the dispatched value.
    const sortbyToUse =
      overrideSortby !== undefined ? overrideSortby : filterdata?.sortby;
    const hasExplicitSort =
      (sortbyToUse !== "" && sortbyToUse !== undefined && sortbyToUse !== null) ||
      location?.state?.sorttype;
    if (hasExplicitSort) {
      const chosenSort =
        sortbyToUse !== "" ? sortbyToUse : location?.state?.sorttype;
      if (Number(chosenSort) !== 3 && Number(chosenSort) !== 4) {
        formData.append("sort_type", chosenSort);
      }
    }

    // formData.append("page", pagestate);
    // formData.append("size", 12);
    if (sessiongroup || filterdata?.groupid) {
      formData.append(
        "group_id",
        filterdata?.groupid ? filterdata?.groupid : sessiongroup
      );
    }
    if (sessiontype || filterdata?.usertype) {
      formData.append(
        "user_type",
        filterdata?.usertype ? filterdata?.usertype : sessiontype
      );
    }
    if (motor?.id || filterdata?.user_id) {
      formData.append(
        "user_id",
        filterdata.user_id !== "" ? filterdata?.user_id || "" : motor?.id
      );
    }
    if (filterdata?.controllername) {
      formData.append("controller_name", filterdata?.controllername);
    }
    if (filterdata?.controllercode) {
      formData.append("controller_code", filterdata?.controllercode);
    }
    if (filterdata?.devicecode) {
      formData.append("device_code", filterdata?.devicecode);
    }

    if (filterdata?.empty_controller) {
      formData.append("empty_controller", 1);
    }
    let apiCall;

    if (Number(sorttype) === 4) {
      apiCall = listControllerDeviceapi(formData, pagestate);
    } else {
      apiCall = listcontrollerapi(formData, pagestate);
    }

    apiCall
      .then(({ data }) => {
        setDataList(data?.items || []);
        settotaldata(data?.total || 0);
      })

      .catch((err) => {})
      .finally(() => setloader(false));

    groupdropdownapi().then(({ data }) => {
      if (data) {
        setgroup(
          data?.map((ele) => ({
            ...ele,
            label: ele?.group_name,
            value: ele?.group_id
          }))
        );
      } else {
        setgroup([]);
      }
    });
  };

  const Changebutton = (id, togglestatus, accesstype, buttontype) => {
    if (buttongreyid === id) return;

    // FIXED: View only (access_type 3) sub-users could still trigger
    // this — the ToggleButton component doesn't actually use the
    // `disabled` prop passed to it, so that alone never blocked the
    // click. The backend now rejects it (403), but that just meant a
    // pointless round trip ending in a stuck grey toggle. Stop it here
    // instead, same place the buttongreyid re-entrancy guard already is.
    if (accesstype === 3) {
      return;
    }

    setbuttongreyid(id); // 🔒 lock immediately
    setloader(true);

    let formData = new FormData();

    if (buttontype === 1) {
      formData.append("device_id", id);
      formData.append("device_type", 3);
    } else {
      formData.append("controller_id", id);
      formData.append("controller_type", 1);
    }

    formData.append("request_type", togglestatus ? 3 : 4);

    const apiCall =
      buttontype === 1 ? devicerefreshapi(formData) : buttonapi(formData);

    apiCall
      .then(() => {
        ListController();
        // ⏳ Wait 5 seconds before allowing next toggle — the real
        // command is in flight, give it time before re-enabling.
        setTimeout(() => {
          setbuttongreyid("");
        }, 5000);
      })
      .catch((err) => {
        // FIXED: a rejected request (e.g. 403 "View only access" for a
        // view-only sub-user) used to fall through to the same 5s-grey
        // wait as a real success — nothing was ever sent, so there was
        // no reason to wait, and the toggle just sat grey with no
        // explanation. Clear it immediately and say why.
        toast.error(
          err?.response?.data?.detail || "Unable to send command"
        );
        setbuttongreyid("");
      })
      .finally(() => {
        setloader(false);
      });
  };

  // const Changebutton = (id, togglestatus, accesstype, buttontype) => {
  //   setloader(true);
  //   if (abortcontroller) {
  //     abortcontroller.abort("error cancelled");
  //   }

  //   abortcontroller = new AbortController();
  //   if (
  //     accesstype === 0 ||
  //     accesstype === 1 ||
  //     accesstype === null ||
  //     accesstype === 2
  //   ) {
  //     if (buttontype === 1) {
  //       let formData = new FormData();
  //       formData.append("device_id", id);
  //       formData.append("device_type", 3);
  //       formData.append("request_type", togglestatus ? 3 : 4);
  //       setbuttongreyid(id);
  //       devicerefreshapi(formData, abortcontroller)
  //         .then(({ data }) => {
  //           setTimeout(() => {
  //             ListController();
  //             setbuttongreyid("");
  //           }, 1000);
  //         })
  //         .catch((err) => {}).finally(()=>setloader(false));
  //     } else {
  //       let formData = new FormData();
  //       formData.append("controller_id", id);
  //       formData.append("controller_type", 1);
  //       formData.append("request_type", togglestatus ? 3 : 4);
  //       setbuttongreyid(id);
  //       buttonapi(formData, abortcontroller)
  //         .then(({ data }) => {
  //           setTimeout(() => {
  //             ListController();
  //             setbuttongreyid("");
  //           }, 1000);
  //         })
  //         .catch((err) => {}).finally(()=>setloader(false));
  //     }
  //   }
  // };

  ///s
  const loadingspinner = (id, accesstype, devicetype) => {
    if (
      accesstype === 0 ||
      accesstype === 1 ||
      accesstype === null ||
      accesstype === 2
    )
      if (devicetype) {
        setloading(true);
        setTimeout(() => {
          setloading(false);
        }, 3000);
        setTimeout(() => {
          setrefresh(refresh + 1);
        }, 5000);
        let formData = new FormData();
        formData.append("device_id", id);
        formData.append("device_type", devicetype);
        formData.append("request_type", 1);

        devicerefreshapi(formData)
          .then(({ data }) => {})
          .catch((err) => {});
      } else {
        setloading(true);

        setTimeout(() => {
          setloading(false);
        }, 3000);
        setTimeout(() => {
          setrefresh(refresh + 1);
        }, 5000);

        let formData = new FormData();
        formData.append("controller_id", id);
        formData.append("controller_type", 1);
        formData.append("request_type", 1);

        buttonapi(formData)
          .then(({ data }) => {})
          .catch((err) => {});
      }
  };
  const currentItems = dataList;
  const pageCount = Math.ceil(totaldatacount / 12);
  const handlePageClick = (event) => {
    dispatch(UpdatePageState(JSON.parse(event.selected) + 1));
  };
  // work

  const Deletecontroller = () => {
    dispatch(
      Updatedeletefilter({
        controllername: "",
        controllercode: "",
        devicecode: "",
        usertype: "",
        sortby: "",
        groupid: "",
        empty_controller: ""
      })
    );
    dispatch(UpdatedeletepageState(1));
    navigate("/dashboard/deletecontroller", {
      state: {
        ...location.state,
        pevpath: location?.pathname,

        ControllerFilters: {
          page: pagestate,
          values: filterdata
        }
      }
    });
    sessionStorage.setItem("controllerpage", "/dashboard/motorcontrolleron");
  };

  const Items = ({ currentItems }) => {
    return (
      <>
        <div className="view-page">
          {currentItems?.length > 0 ? (
            <div className={motorstyle.total_motors}>
              {currentItems.map((motoron, index) => (
                <MotorControllerCard
                  key={index}
                  motoron={motoron}
                  index={index}
                  isloading={isloading}
                  motorindex={motorindex}
                  setindex={setindex}
                  loadingspinner={loadingspinner}
                  Changebutton={Changebutton}
                  buttongreyid={buttongreyid}
                  usertype={usertype}
                  openNotification={openNotification}
                  valvebuttontype={valvebuttontype}
                  onCardClick={() => toalldetails(motoron?.controller_id, motoron)}
                />
              ))}
            </div>
          ) : (
            <p className="view-msg">no data found</p>
          )}
        </div>
      </>
    );
  };
  const toadd = () => {
    navigate("/dashboard/addcontroller", {
      state: {
        ControllerFilters: {
          page: pagestate,
          values: filterdata
        }
      }
    });
    sessionStorage.setItem("controllerpage", "/dashboard/motorcontrolleron");
  };
  const [api, contextHolder] = notification.useNotification();
  const openNotification = (warning_data) => {
    api.destroy();
    api.warning({
      message: <p className="amc_expiry_title">AMC Expiry Warning!</p>,
      description: (
        <div className="amc_expiry_notification">
          Number of days to expiry :&nbsp;&nbsp;
          <span>{warning_data.no_of_days}</span>
        </div>
      ),
      placement: "top"
    });
  };
  console.log(currentItems, "currentItems");

  return (
    <>
      {contextHolder}
      {lgShow ? (
        <FilterControllerModal
          show={lgShow}
          close={() => setLgShow(false)}
          pagestate={pagestate}
          groupname={groupname}
          ListController={ListController}
          settotaldata={settotaldata}
        />
      ) : null}

      {showEmail ? (
        <EmailModal show={showEmail} close={() => setEmail(false)} />
      ) : null}
      <Loader isLoader={loader} />
      <div className="motorbackground_images">
        <div className="router-pages">
          <div className={commonstyle.controller_head}>
            <div className="pre-page">
              <FaArrowLeft
                className="arrow total_head"
                onClick={() => todashboard()}
              />
              <p className="controller-name total_head">
                Motor Controller({totaldatacount})
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
              {usertype === 3 ? null : (
                <button
                  type="button"
                  className={`${commonstyle.add_controller_btn} 
                    ${commonstyle.outer_card_btn}`}
                  onClick={() => toadd()}
                >
                  Add Controller
                </button>
              )}
              {/* <Link
                to="/dashboard/deletecontroller"
                state={{ ...location.state, pevpath: location?.pathname }}
              >
                <FaTrashAlt className="icontrash" />
                <br />
              </Link> */}
              {usertype === 3 ? null : (
                <button
                  type="button"
                  className={`${commonstyle.delete_controller_btn} 
                    ${commonstyle.outer_card_btn}`}
                  onClick={() => Deletecontroller()}
                >
                  Delete Controller
                </button>
              )}
            </div>
          </div>
          <div className="controller-bottom ">
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
                  forcePage={pagestate - 1}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
