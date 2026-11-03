import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import styles from "../Modalcomponents/Modal.module.css";
import { ClassNames } from "@emotion/react";
import { toast } from "react-hot-toast";
import {
  DeleteAdminDevice,
  DeleteSimService,
  adddeviceapi,
  deletecontrollerapi,
  deletedevice,
  deleteuserapi,
  detetedevicetime,
  detetemotortime,
  editlight,
  removecontrollergroupapi,
  removedevice,
  removegroup,
  removeservice,
  removeusercontrollerapi,
  removeusergroupapi
} from "../Service/ApiService";
import { useDispatch, useSelector } from "react-redux";
import {
  Updatecontrollermap,
  Updategroupcontroller,
  Updategroupmap,
  Updategroupuser,
  Updatemotorscheduleedit,
  Updateuserlist,
  Updatevalvescheduleedit
} from "../Components/Store/Config/Configuration";
import { useNavigate } from "react-router";
import setCookie from "../Utilities/Cookie";
import { getCatchMsg, JSONtoformdata } from "../Utilities/Methods";
import { ExportedImages } from "../Utilities/ImageExport";

export default function DeleteConfirmationModal({
  show,
  close,
  ServiceId,
  handleGetServiceDetails,
  Deletekey,
  id,
  ListController,
  index,
  functioncall,
  groupid,
  controllertype,
  values,
  producttype,
  devicetype,
  district,
  states,
  ListDevice,
  mappingid,
  deviceid,
  valvetimeid,
  valveindex,
  motortimeid,
  motorindex,
  lightid,
  Watt,
  GetList,
  Id,
  count,
  LightController,
  msg,
  autoLogoutModal = false,
  divicename
}) {
  let navigate = useNavigate();
  const [loader, setloader] = useState(false);
  // Same fix as Addcontroller.js's resolveLabel — this modal builds its
  // OWN separate AddDevice payload (below, Deletekey===9) for the
  // "not assigned to any controller, continue?" confirmation flow, which
  // never got this fix applied. district/states dropdowns store
  // numeric ids; the backend's district/state columns expect the name.
  const resolveLabel = (options, value) =>
    options?.find((opt) => opt?.value === value)?.label ?? "";
  const { groupcontroller } = useSelector((state) => state);
  let dispatch = useDispatch();
  const { grouplist } = useSelector((state) => state);
  const { groupuser } = useSelector((state) => state);
  const { groupmap } = useSelector((state) => state);
  const { userlist } = useSelector((state) => state);
  const { controllermap } = useSelector((state) => state);
  const { motorscheduleedit } = useSelector((state) => state);
  const { valvescheduleedit } = useSelector((state) => state);

  const DeleteService = (ServiceId) => {
    // delete service details
    if (Deletekey === 1) {
      setloader(true);
      let formdata = new FormData();
      formdata.append("service_id", ServiceId);
      removeservice(formdata)
        .then((res) => {
          close();
          toast(res.data, { type: "success" });
          handleGetServiceDetails();
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
    } else if (Deletekey === 2) {
      deletecontrollerapi(id)
        .then(({ data }) => {
          close();
          toast(data, { type: "success" });
          ListController();
        })
        .catch((err) => {
          if (err?.response?.data?.detail?.[0]?.msg) {
            toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
          } else if (err?.response?.data?.detail) {
            toast(err?.response?.data?.detail, { type: "error" });
          } else {
            toast("Something went wrong!!", { type: "error" });
          }
        });
    } else if (Deletekey === 3) {
      let formData = new FormData();
      formData.append("group_id", id);
      removegroup(formData)
        .then((res) => {
          toast(res.data, { type: "success" });
          functioncall();
          close();
        })
        .catch((err) => {
          // if (err.response?.data?.detail) {
          //   toast(err.response?.data?.detail, { type: "error" });
          // }
          if (err?.response?.data?.detail?.[0]?.msg) {
            toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
          } else if (err?.response?.data?.detail) {
            toast(err?.response?.data?.detail, { type: "error" });
          } else {
            toast("Something went wrong!!", { type: "error" });
          }
        });
    } else if (Deletekey === 4) {
      let formdata = new FormData();
      formdata.append("mapping_id", id);
      removecontrollergroupapi(formdata)
        .then((res) => {
          let dupdata = [...groupcontroller];
          dupdata.splice(index, 1);
          dispatch(Updategroupcontroller(dupdata));
          toast(res?.data, { type: "success" });
          close();
        })
        .catch((err) => {
          // toast(err.response.detail, { type: "error" });
          if (err?.response?.data?.detail?.[0]?.msg) {
            toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
          } else if (err?.response?.data?.detail) {
            toast(err?.response?.data?.detail, { type: "error" });
          } else {
            toast("Something went wrong!!", { type: "error" });
          }
        });
    } else if (Deletekey === 5) {
      let formdata = new FormData();
      formdata.append("mapping_id", id);
      formdata.append("group_id", groupid);
      removeusergroupapi(formdata)
        .then((res) => {
          let dupdata = [...groupuser];
          dupdata.splice(index, 1);
          dispatch(Updategroupuser(dupdata));
          toast(res?.data, { type: "success" });
          close();
        })
        .catch((err) => {
          // toast(err?.response, { type: "error" });
          if (err?.response?.data?.detail?.[0]?.msg) {
            toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
          } else if (err?.response?.data?.detail) {
            toast(err?.response?.data?.detail, { type: "error" });
          } else {
            toast("Something went wrong!!", { type: "error" });
          }
        });
    } else if (Deletekey === 6) {
      if (id) {
        let formdata = new FormData();
        formdata.append("mapping_id", id);
        formdata.append("group_id", groupid);
        removeusergroupapi(formdata)
          .then((res) => {
            toast(res?.data, { type: "success" });
            let dupdata = [...groupmap];
            dupdata.splice(index, 1);
            dispatch(Updategroupmap(dupdata));
            close();
          })
          .catch((err) => {
            // toast(err?.response?.detail, { type: "error" });
            if (err?.response?.data?.detail?.[0]?.msg) {
              toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
            } else if (err?.response?.data?.detail) {
              toast(err?.response?.data?.detail, { type: "error" });
            } else {
              toast("Something went wrong!!", { type: "error" });
            }
          });
      } else {
        let formdata = new FormData();
        formdata.append("group_id", groupid);
        removegroup(formdata)
          .then((res) => {
            toast(res?.data, { type: "success" });
            let dupdata = [...groupmap];
            dupdata.splice(index, 1);
            dispatch(Updategroupmap(dupdata));
            close();
          })
          .catch((err) => {
            // toast(err?.response?.detail, { type: "error" });
            if (err?.response?.data?.detail?.[0]?.msg) {
              toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
            } else if (err?.response?.data?.detail) {
              toast(err?.response?.data?.detail, { type: "error" });
            } else {
              toast("Something went wrong!!", { type: "error" });
            }
          });
      }
    } else if (Deletekey === 7) {
      let formdata = new FormData();
      formdata.append("mapping_id", id);
      removeusercontrollerapi(formdata)
        .then((res) => {
          toast(res.data, { type: "success" });
          let dupdata = [...controllermap];
          dupdata.splice(index, 1);
          dispatch(Updatecontrollermap(dupdata));
          close();
        })
        .catch((err) => {
          // toast(err?.response?.detail, { type: "error" });
          if (err?.response?.data?.detail?.[0]?.msg) {
            toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
          } else if (err?.response?.data?.detail) {
            toast(err?.response?.data?.detail, { type: "error" });
          } else {
            toast("Something went wrong!!", { type: "error" });
          }
        });
    } else if (Deletekey === 8) {
      deleteuserapi(id)
        .then((res) => {
          toast(res.data, { type: "success" });
          let dupdata = [...userlist.items];
          dupdata.splice(index, 1);
          dispatch(Updateuserlist({ ...userlist, items: dupdata }));
          close();
        })
        .catch((err) => {
          // if (err?.response?.data?.detail) {
          //   toast(err.response.data.detail, { type: "error" });
          // } else {
          //   toast("Something went wrong!!", { type: "error" });
          // }
          if (err?.response?.data?.detail?.[0]?.msg) {
            toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
          } else if (err?.response?.data?.detail) {
            toast(err?.response?.data?.detail, { type: "error" });
          } else {
            toast("Something went wrong!!", { type: "error" });
          }
        });
    } else if (Deletekey === 9) {
      if (producttype === 2) {
        let AddDevice = {
          device_code: values.Uniqueid,
          device_type: devicetype,
          controller_type: JSON.parse(controllertype),
          device_name: values.name,
          user_type: JSON.parse(values.usertype),
          district: resolveLabel(district, values.distric),
          state: resolveLabel(states, values.state),
          latitude: "",
          longitude: "",
          msg: "",
          status: 1
        };
        adddeviceapi(AddDevice)
          .then(({ data }) => {
            toast(data, { type: "success" });
            navigate(-1);
            close();
          })
          .catch((err) => {
            // toast(err.response.data.detail, { type: "error" });
            if (err?.response?.data?.detail?.[0]?.msg) {
              toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
            } else if (err?.response?.data?.detail) {
              toast(err?.response?.data?.detail, { type: "error" });
            } else {
              toast("Something went wrong!!", { type: "error" });
            }
          });
      }
    } else if (Deletekey === 10) {
      toast("Logout Successfully", { type: "success" });
      setCookie("cookiedata", null, null);
      sessionStorage.removeItem("usertype");
      sessionStorage.removeItem("groupid");
      sessionStorage.removeItem("groupname");
      sessionStorage.removeItem("grouplightname");

      sessionStorage.removeItem("usertypelight");
      sessionStorage.removeItem("groupidlight");
      localStorage.removeItem("contollertype");
      // sessionStorage.removeItem("groupmaplength");
      // sessionStorage.removeItem("controllermaplength");
      sessionStorage.removeItem("FlowReading");
      sessionStorage.removeItem("webtext");
      sessionStorage.removeItem("controllerpage");
      sessionStorage.removeItem("deletecontrollerpage");
      sessionStorage.removeItem("controllerdetailspage");
      sessionStorage.removeItem("lightcontrollerpage");
      sessionStorage.removeItem("lightdetailspage");
      sessionStorage.removeItem("deletelightcontrollerpage");
      sessionStorage.removeItem("sorttype");
      sessionStorage.removeItem("lightViewDatas");
      sessionStorage.removeItem("MotorViewDatas");
      sessionStorage.removeItem("mainUserId");
      navigate("/");
      close();
      window.location.reload();
    } else if (Deletekey === 11) {
      let formData = new FormData();
      formData.append("mapping_id", mappingid);
      removedevice(formData)
        .then(({ data }) => {
          ListDevice();
          close();
        })
        .catch((err) => {});
    } else if (Deletekey === 12) {
      deletedevice(deviceid)
        .then(({ data }) => {
          ListDevice();
          close();
        })
        .catch((err) => {});
    } else if (Deletekey === 13) {
      if (!valvetimeid) {
        let dupdata = [...valvescheduleedit];
        dupdata.splice(valveindex, 1);
        dispatch(Updatevalvescheduleedit(dupdata));
        close();
      }
      if (valvetimeid) {
        let formdata = new FormData();
        formdata.append("time_setting_id", valvetimeid);
        detetedevicetime(formdata).then((res) => {
          let dupdata = [...valvescheduleedit];
          dupdata.splice(valveindex, 1);
          dispatch(Updatevalvescheduleedit(dupdata));
          close();
        });
      }
    } else if (Deletekey === 14) {
      if (motortimeid) {
        let formdata = new FormData();
        formdata.append("time_setting_id", motortimeid);
        detetemotortime(formdata)
          .then((res) => {
            let dupdata = [...motorscheduleedit];
            dupdata.splice(motorindex, 1);
            dispatch(Updatemotorscheduleedit(dupdata));
            toast(res?.data, { type: "success" });
            close();
          })
          .catch((err) => {
            // toast(err?.response(err?.response?.detail, { type: "error" }));
            if (err?.response?.data?.detail?.[0]?.msg) {
              toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
            } else if (err?.response?.data?.detail) {
              toast(err?.response?.data?.detail, { type: "error" });
            } else {
              toast("Something went wrong!!", { type: "error" });
            }
          });
      } else {
        let dupdata = [...motorscheduleedit];
        dupdata.splice(motorindex, 1);
        dispatch(Updatemotorscheduleedit(dupdata));
        toast("success", { type: "success" });
        close();
      }
    } else if (Deletekey === 15) {
      let formdata = new FormData();
      formdata.append("light_id", lightid);
      formdata.append("status", -1);
      formdata.append("watt", Watt);
      formdata.append("count", count);
      editlight(formdata)
        .then((res) => {
          toast("Deleted Successfully", { type: "success" });
          LightController();
          close();
        })
        .catch((err) => {
          // if (err?.response?.data?.detail?.[0]?.msg) {
          //   toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
          // } else if (err?.response?.data?.detail) {
          //   toast(err?.response?.data?.detail, { type: "error" });
          // }
          if (err?.response?.data?.detail?.[0]?.msg) {
            toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
          } else if (err?.response?.data?.detail) {
            toast(err?.response?.data?.detail, { type: "error" });
          } else {
            toast("Something went wrong!!", { type: "error" });
          }
        });
    } else if (Deletekey === 16) {
      DeleteAdminDevice(Id)
        .then((res) => {
          toast("Deleted Successfully", { type: "success" });
          GetList();
          close();
        })
        .catch((err) => {
          // if (err?.response?.data?.detail?.[0]?.msg) {
          //   toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
          // } else if (err?.response?.data?.detail) {
          //   toast(err?.response?.data?.detail, { type: "error" });
          // }
          if (err?.response?.data?.detail?.[0]?.msg) {
            toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
          } else if (err?.response?.data?.detail) {
            toast(err?.response?.data?.detail, { type: "error" });
          } else {
            toast("Something went wrong!!", { type: "error" });
          }
        });
    } else if (Deletekey === 17) {
      let formData = new FormData();
      formData.append("sim_id", ServiceId);
      DeleteSimService(formData)
        .then(({ data }) => {
          if (data.status === 1) {
            close(true);
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
    } else if (Deletekey === 18) {
      if (divicename?.key < 3) {
        deletecontrollerapi(ServiceId)
          .then(({ data }) => {
            toast(data, { type: "success" });
            close();
          })
          .catch((err) => {
            getCatchMsg(err);
          });
      } else {
        DeleteAdminDevice(ServiceId)
          .then(({ data }) => {
            close();
          })
          .catch((err) => {
            getCatchMsg(err);
          });
      }
    }
  };

  const isControllerDelete =
    Deletekey === 2 || (Deletekey === 18 && divicename?.key < 3);

  return (
    <>
      <div className={styles.modal}>
        <Modal
          size={autoLogoutModal ? "md" : "sm"}
          show={show}
          onHide={() => {
            if (!autoLogoutModal) {
              close();
            }
          }}
        >
          {!autoLogoutModal && <Modal.Header closeButton></Modal.Header>}
          {isControllerDelete ? (
            <div className={styles.modalbody}>
              <img
                src={ExportedImages.WARNING_ICON}
                alt="warning"
                className={styles.warning}
              />
              <p className={styles.controllerDeleteTitle}>
                Delete this controller?
              </p>
              <div className={styles.controllerDeleteWarnBox}>
                <p className={styles.controllerDeleteWarnText}>
                  If this device connects again later, it will be added back
                  as a <b>new</b> controller. Settings, district and history
                  will not carry over.
                </p>
              </div>
            </div>
          ) : (
            <div className={styles.modalbody}>
              <img
                src={ExportedImages.WARNING_ICON}
                alt="warning"
                className={styles.warning}
              />
              <p
                className={[
                  styles.warningpera,
                  { paddingBottom: autoLogoutModal ? "10px" : 0 }
                ]}
              >
                {Deletekey === 1
                  ? "Are you sure do you want to delete this service?"
                  : null}
                {Deletekey === 3 || Deletekey === 6
                  ? "Are you sure do you want to delete this group?"
                  : null}
                {Deletekey === 4 || Deletekey === 7
                  ? "Are you sure do you want to delete this controller?"
                  : null}
                {Deletekey === 5 || Deletekey === 8
                  ? "Are you sure do you want to delete this user?"
                  : null}
                {Deletekey === 9
                  ? "This device is not assigned to any controller.Do you want to continue?"
                  : null}
                {autoLogoutModal
                  ? msg
                  : Deletekey === 10
                  ? "Are you sure do you want to logout?"
                  : null}
                {Deletekey === 11
                  ? "Are you sure do you want to remove this device?"
                  : null}
                {Deletekey === 12
                  ? "Are you sure do you want to delete this device?"
                  : null}
                {Deletekey === 13
                  ? "Are you sure do you want to delete this valve schedule time?"
                  : null}
                {Deletekey === 14
                  ? "Are you sure do you want to delete this motor schedule time?"
                  : null}
                {Deletekey === 15
                  ? "Are you sure do you want to delete this light data?"
                  : null}
                {Deletekey === 16
                  ? "Are you sure do you want to delete this device?"
                  : Deletekey === 17
                  ? "Are you sure do you want to delete this SIM?"
                  : Deletekey === 18
                  ? `Are you sure do you want to delete this ${
                      divicename ? divicename?.label : ""
                    }?`
                  : null}
              </p>
            </div>
          )}
          {!autoLogoutModal && (
            <Modal.Footer>
              <Button className="cancel" onClick={close}>
                Cancel
              </Button>

              <Button
                className="ok"
                style={{
                  width: autoLogoutModal ? "100%" : "",
                  alignSelf: "center",
                  fontFamily: autoLogoutModal ? "Nunito-bold-700" : "",
                  fontWeight: autoLogoutModal ? 700 : ""
                }}
                onClick={() => DeleteService(ServiceId)}
              >
                Ok
              </Button>
            </Modal.Footer>
          )}
        </Modal>
      </div>
    </>
  );
}
