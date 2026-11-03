import React, { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { useLocation, useNavigate } from "react-router";
import { ListDeviceApi, motordata } from "../../Service/ApiService";
import Loader from "../Loader";
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import DeleteConfirmationModal from "../../Modalcomponents/DeleteConfirmationModal";
import { FaArrowLeft } from "react-icons/fa";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import DeleteDeviceStyle from "../View/DeleteDevice.module.css";
import commonstyle from "../../Assets/css/CommonStyle.module.css";
import {
  Updatefilterdata,
  UpdatePageState
} from "../Store/Config/Configuration";
import { useDispatch } from "react-redux";

export default function Deletedevice() {
  let location = useLocation();
  let navigate = useNavigate();
  let dispatch = useDispatch();
  let controllertype = parseInt(localStorage.getItem("contollertype"));
  const [removeshow, setremoveshow] = useState({
    show: false,
    mappingid: ""
  });
  const [deleteshow, setdeleteshow] = useState({ show: false, deviceid: "" });
  const [loader, setloader] = useState(false);
  const [DeviceData, setDeviceData] = useState();

  const ListDevice = () => {
    setloader(true);
    motordata(location?.state?.controllerid)
      .then(({ data }) => {
        setDeviceData(data);
      })
      .catch((err) => {})
      .finally(() => setloader(false));
  };

  const todashboard = () => {
    if (controllertype === 2)
      navigate("/dashboard/lightdetails", {
        state: {
          id: location?.state?.controllerid,
          ControllerFilters: location?.state?.ControllerFilters
        }
      });
    if (controllertype === 1)
      navigate("/dashboard/details", {
        state: {
          id: location?.state?.controllerid,
          ControllerFilters: location?.state?.ControllerFilters
        }
      });
  };

  useEffect(() => {
    ListDevice();
  }, []);

  useEffect(() => {
    if (location?.state?.ControllerFilters) {
      dispatch(Updatefilterdata(location?.state?.ControllerFilters?.values));
      dispatch(UpdatePageState(location?.state?.ControllerFilters?.page));
    }
  }, [location?.state]);
  console.log(removeshow, DeviceData, "removeshow");

  return (
    <>
      <Loader isLoader={loader} />
      {removeshow.show ? (
        <DeleteConfirmationModal
          ListDevice={ListDevice}
          mappingid={removeshow.mappingid}
          show={removeshow.show}
          close={() =>
            setremoveshow((prev) => {
              return {
                ...prev,
                show: false
              };
            })
          }
          Deletekey={11}
        />
      ) : null}
      {deleteshow.show ? (
        <DeleteConfirmationModal
          ListDevice={ListDevice}
          deviceid={deleteshow?.deviceid}
          show={deleteshow.show}
          close={() =>
            setdeleteshow((prev) => {
              return {
                ...prev,
                show: false
              };
            })
          }
          Deletekey={12}
        />
      ) : null}

      <div className="router-pages">
        <div className={DeleteDeviceStyle.deldev_head}>
          <FaArrowLeft className="arrow" onClick={() => todashboard()} />
          <p
            className={`${commonstyle.parent_heading_in_all_page} ${DeleteDeviceStyle.delete_device_name}`}
          >
            Delete {controllertype === 1 ? "Motor" : "Light"} Device
          </p>
        </div>
        <div className={DeleteDeviceStyle.delete_device_div}>
          {DeviceData?.light_data?.length > 0 ? (
            <>
              {DeviceData?.light_data?.map((device, index) => {
                return (
                  <div key={index} className={DeleteDeviceStyle.deldev_bg}>
                    <div className={DeleteDeviceStyle.deldev_flex}>
                      <div className={DeleteDeviceStyle.deldev_flexone}>
                        {/* <OverlayTrigger
                          key="top"
                          placement="top"
                          overlay={
                            <Tooltip id="tooltip-top">
                              <strong>{device?.device_name}</strong>
                            </Tooltip>
                          }
                        > */}
                        <p className={DeleteDeviceStyle.deldev_name}>
                          {device?.device_name}
                        </p>
                        {/* </OverlayTrigger> */}
                        <div className={DeleteDeviceStyle.deldev_buttonflex}>
                          <button
                            onClick={() =>
                              setremoveshow({
                                show: true,
                                mappingid: device?.mapping_id
                              })
                            }
                            className="remove_button"
                          >
                            remove
                          </button>
                          <button
                            onClick={() =>
                              setdeleteshow({
                                show: true,
                                deviceid: device?.device_id
                              })
                            }
                            className="delete_button"
                          >
                            delete
                          </button>
                        </div>
                      </div>
                      <div className={DeleteDeviceStyle.deldev_flexone}>
                        <p className="tank-header">
                          ID:
                          <span className="tank-date">
                            {device?.device_code}
                          </span>
                        </p>
                        <p className={commonstyle.margin_zero}>Light</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          ) : null}

          {DeviceData?.tank?.length > 0 ? (
            <>
              {DeviceData?.tank?.map((device, index) => {
                return (
                  <div key={index} className={DeleteDeviceStyle.deldev_bg}>
                    <div className={DeleteDeviceStyle.deldev_flex}>
                      <div className={DeleteDeviceStyle.deldev_flexone}>
                        {/* <OverlayTrigger
                          key="top"
                          placement="top"
                          overlay={
                            <Tooltip id="tooltip-top">
                              <strong>{device?.device_name}</strong>
                            </Tooltip>
                          }
                        > */}
                        <p className={DeleteDeviceStyle.deldev_name}>
                          {device?.device_name}
                        </p>
                        {/* </OverlayTrigger> */}
                        <div className={DeleteDeviceStyle.deldev_buttonflex}>
                          <button
                            onClick={() =>
                              setremoveshow({
                                show: true,
                                mappingid: device?.mapping_id
                              })
                            }
                            className="remove_button"
                          >
                            remove
                          </button>
                          <button
                            onClick={() =>
                              setdeleteshow({
                                show: true,
                                deviceid: device?.device_id
                              })
                            }
                            className="delete_button"
                          >
                            delete
                          </button>
                        </div>
                      </div>
                      <div className={DeleteDeviceStyle.deldev_flexone}>
                        <p className="tank-header">
                          ID:
                          <span className="tank-date">
                            {device?.device_code}
                          </span>
                        </p>
                        <p className={commonstyle.margin_zero}>Tank Level</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          ) : null}
          {DeviceData?.flow_meter?.length > 0 ? (
            <>
              {DeviceData?.flow_meter?.map((device, index) => {
                return (
                  <div key={index} className={DeleteDeviceStyle.deldev_bg}>
                    <div className={DeleteDeviceStyle.deldev_flex}>
                      <div className={DeleteDeviceStyle.deldev_flexone}>
                        {/* <OverlayTrigger
                          key="top"
                          placement="top"
                          overlay={
                            <Tooltip id="tooltip-top">
                              <strong>{device?.device_name}</strong>
                            </Tooltip>
                          }
                        > */}
                        <p className={DeleteDeviceStyle.deldev_name}>
                          {device?.device_name}
                        </p>
                        {/* </OverlayTrigger> */}
                        <div className={DeleteDeviceStyle.deldev_buttonflex}>
                          <button
                            onClick={() =>
                              setremoveshow({
                                show: true,
                                mappingid: device?.mapping_id
                              })
                            }
                            className="remove_button"
                          >
                            remove
                          </button>
                          <button
                            onClick={() =>
                              setdeleteshow({
                                show: true,
                                deviceid: device?.device_id
                              })
                            }
                            className="delete_button"
                          >
                            delete
                          </button>
                        </div>
                      </div>
                      <div className={DeleteDeviceStyle.deldev_flexone}>
                        <p className="tank-header">
                          ID:
                          <span className="tank-date">
                            {device?.device_code}
                          </span>
                        </p>
                        <p className={commonstyle.margin_zero}>Flow Meter</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          ) : null}
          {DeviceData?.valve?.length > 0 ? (
            <>
              {DeviceData?.valve?.map((device, index) => {
                return (
                  <div key={index} className={DeleteDeviceStyle.deldev_bg}>
                    <div className={DeleteDeviceStyle.deldev_flex}>
                      <div className={DeleteDeviceStyle.deldev_flexone}>
                        {/* <p className="deldev_name"> */}
                        {/* <OverlayTrigger
                          key="top"
                          placement="top"
                          overlay={
                            <Tooltip id="tooltip-top">
                              <strong>{device?.device_name}</strong>
                            </Tooltip>
                          }
                        > */}
                        <p className={DeleteDeviceStyle.deldev_name}>
                          {device?.device_name}
                        </p>
                        {/* </OverlayTrigger> */}
                        {/* </p> */}
                        <div className={DeleteDeviceStyle.deldev_buttonflex}>
                          <button
                            onClick={() =>
                              setremoveshow({
                                show: true,
                                mappingid: device?.mapping_id
                              })
                            }
                            className="remove_button"
                          >
                            remove
                          </button>
                          <button
                            onClick={() =>
                              setdeleteshow({
                                show: true,
                                deviceid: device?.device_id
                              })
                            }
                            className="delete_button"
                          >
                            delete
                          </button>
                        </div>
                      </div>
                      <div className={DeleteDeviceStyle.deldev_flexone}>
                        <p className="tank-header">
                          ID:
                          <span className="tank-date">
                            {device?.device_code}
                          </span>
                        </p>
                        <p className={commonstyle.margin_zero}>Valve</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          ) : null}
          {DeviceData?.multi?.[0]?.valve_data?.length > 0 ? (
            <>
              {DeviceData?.multi?.map((device, index) => {
                return (
                  <div key={index} className={DeleteDeviceStyle.deldev_bg}>
                    <div className={DeleteDeviceStyle.deldev_flex}>
                      <div className={DeleteDeviceStyle.deldev_flexone}>
                        <p className={DeleteDeviceStyle.deldev_name}>
                          {device?.device_name}
                        </p>

                        <div className={DeleteDeviceStyle.deldev_buttonflex}>
                          <button
                            onClick={() =>
                              setremoveshow({
                                show: true,
                                mappingid: device?.mapping_id
                              })
                            }
                            className="remove_button"
                          >
                            remove
                          </button>
                          <button
                            onClick={() =>
                              setdeleteshow({
                                show: true,
                                deviceid: device?.device_id
                              })
                            }
                            className="delete_button"
                          >
                            delete
                          </button>
                        </div>
                      </div>
                      <div className={DeleteDeviceStyle.deldev_flexone}>
                        <p className="tank-header">
                          ID:
                          <span className="tank-date">
                            {device?.device_code}
                          </span>
                        </p>
                        <p className={commonstyle.margin_zero}>Multi</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
