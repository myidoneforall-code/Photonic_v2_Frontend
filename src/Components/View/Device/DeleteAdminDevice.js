import "../ViewController.modules.css";
import commonstyle from "../../../Assets/css/CommonStyle.module.css";
import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaArrowLeft,
  FaTrashAlt,
} from "react-icons/fa";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Viewadmindevicedelete } from "../../../Service/ApiService";
import Loader from "../../Loader";
import ReactPaginate from "react-paginate";
import { useLocation, useNavigate } from "react-router";
import { getCatchMsg, JSONtoformdata } from "../../../Utilities/Methods";
import DeleteConfirmationModal from "../../../Modalcomponents/DeleteConfirmationModal";
import DeleteDeviceStyle from "../../View/DeleteDevice.module.css";
import productionstyle from "../Productionunit/production.module.css";
import Filterdeleteddevice from "../../../Modalcomponents/FilterDeletedDevice";
import { ExportedImages } from "../../../Utilities/ImageExport";
import { UpdateDeviceFilter } from "../../Store/Config/Configuration";
import { useDispatch } from "react-redux";

export default function Deleteadmindevice({ value }) {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [loader, setloader] = useState(false);
  const [list, setlist] = useState({});
  let dispatch = useDispatch();
  let controllertype = parseInt(localStorage.getItem("contollertype"));
  const [filterShow, setFilterShow] = useState(false);

  const [deletemodal, setdeletemodal] = useState({
    show: false,
    id: "",
  });

  const { items, page, total } = list;

  const [Values, setValues] = useState({
    device_code: "",
    device_name: "",
  });

  useEffect(() => {
    ListData();
  }, []);

  const ResetForm = () => {
    setValues({ device_code: "", device_name: "" });
  };

  const ListData = (page = 1, size = 25, filterData, isreset = false) => {
    setloader(true);

    let finalObj = {
      controller_type: controllertype,
    };

    const WithValues = !isreset
      ? Object.assign(finalObj, filterData ? filterData : Values)
      : finalObj;

    Viewadmindevicedelete(JSONtoformdata(WithValues), page, size)
      .then(({ data }) => {
        setlist(data);
        setFilterShow(false);
        if (!isreset && filterData) {
          setValues(filterData);
        }
      })
      .catch((err) => {
        getCatchMsg(err);
      })
      .finally(() => setloader(false));
  };

  const pageCount = Math.ceil(total / 25);
  const handlePageClick = (event) => {
    ListData(JSON.parse(event.selected) + 1);
  };

  useEffect(() => {
    if (state?.DeviceFilter) {
      dispatch(UpdateDeviceFilter(state?.DeviceFilter));
    }
  }, [state]);

  return (
    <>
      <Loader isLoader={loader} />

      {deletemodal.show ? (
        <DeleteConfirmationModal
          show={deletemodal.show}
          close={() => setdeletemodal({ show: false, id: "" })}
          Id={deletemodal.id}
          GetList={ListData}
          Deletekey={16}
        />
      ) : null}

      {filterShow && (
        <Filterdeleteddevice
          show={filterShow}
          close={() => {
            setFilterShow(false);
          }}
          // setValues={setValues}
          Values={Values}
          GetList={ListData}
          Reset={ResetForm}
        />
      )}
      <div className="router-pages">
        <div className={DeleteDeviceStyle.delcon_head}>
          <div className="pre-page">
            <FaArrowLeft
              className="arrow"
              onClick={() => navigate("/dashboard/controllerdevice")}
            />
            <p
              className={`${commonstyle.parent_heading_in_all_page} ${DeleteDeviceStyle.delete_device_name}`}
            >
              Delete Device ({total})
            </p>
          </div>
          <img
            src={ExportedImages.FILTER_ICON}
            className={`${commonstyle.filter_icon} 
                ${commonstyle.outer_card_btn}`}
            onClick={() => {
              setFilterShow(true);
            }}
          />
        </div>
        <div className={DeleteDeviceStyle.deldev_pagination_flex}>
          <div className={DeleteDeviceStyle.delete_device_div}>
            {items?.length > 0 ? (
              <>
                {items?.map((ele, index) => {
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
                            {ele?.device_name}
                          </p>
                          {ele?.device_code ? (
                            <p className="tank-header">
                              <span className="tank-header">ID : </span>
                              <span className="tank-date">
                                {ele?.device_code}
                              </span>
                            </p>
                          ) : null}

                          <div>
                            <FaTrashAlt
                              className={commonstyle.Delete_icon_color}
                              onClick={() => {
                                setdeletemodal({ show: true, id: ele?.id });
                              }}
                            />
                          </div>
                        </div>
                        <div className={DeleteDeviceStyle.delcon_flex_one}>
                          <p className="tank-header">
                            <span className="tank-header">Status : </span>
                            <span
                              className={
                                ele?.status === -1
                                  ? productionstyle.production_status_deleted
                                  : ele?.status === 0
                                  ? productionstyle.production_status_inactive
                                  : ele?.status === 1
                                  ? productionstyle.production_status_on
                                  : ele?.status === 2
                                  ? productionstyle.production_status_waiting
                                  : ele?.status === 3
                                  ? productionstyle.production_status_off
                                  : null
                              }
                            >
                              {ele?.status === -1
                                ? "Deleted"
                                : ele?.status === 0
                                ? "In Active"
                                : ele?.status === 1
                                ? "Tested Ok"
                                : ele?.status === 2
                                ? "Waiting for Test"
                                : ele?.status === 3
                                ? "Fault"
                                : null}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <p className="view-msg">No datas Found</p>
            )}
          </div>
          <div className="col25 float-start d-flex justify-content-center paginator">
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
              forcePage={page ? page - 1 : 0}
            />
          </div>
          {/* ) : null} */}
        </div>
      </div>
    </>
  );
}
