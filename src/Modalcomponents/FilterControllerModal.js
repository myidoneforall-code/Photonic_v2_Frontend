import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Updatefilterdata } from "../Components/Store/Config/Configuration";
import { userdropdown } from "../Service/ApiService";
import CommonSelect from "../Components/CommonComponents/CommonSelect";
import { GetSessionStorage } from "../Utilities/Storage";
import { SORT_OPTIONS, UserTypeOptions } from "../Utilities/Constants";

export default function FilterControllerModal({
  show,
  close,
  groupname,
  ListController
}) {
  let dispatch = useDispatch();
  const { handleSubmit } = useFormik({
    initialValues: {
      isLoader: false
    },
    onSubmit: (values) => {
      ListController();
      close();
    }
  });
  const { filterdata } = useSelector((state) => state);
  let sessiongroup = JSON.parse(sessionStorage.getItem("groupid"));
  let sessiontype = JSON.parse(sessionStorage.getItem("usertype"));
  let sessiontypelight = JSON.parse(sessionStorage.getItem("usertypelight"));
  let controllertype = JSON.parse(localStorage.getItem("contollertype"));
  let sessiongrouplight = JSON.parse(sessionStorage.getItem("groupidlight"));
  const [userData, setUserData] = useState([]);
  let SessionUserId = JSON.parse(GetSessionStorage("mainUserId"));
  const { motor, light } = SessionUserId || {};

  const Resetform = () => {
    dispatch(
      Updatefilterdata({
        controllername: "",
        controllercode: "",
        devicecode: "",
        usertype: "",
        sortby: "",
        groupid: "",
        user_id: "",
        empty_controller: ""
      })
    );
  };

  const GetUserDropdown = () => {
    let formdata = new FormData();
    if (sessiongroup) {
      formdata.append("group_id", sessiongroup);
    }

    formdata.append("controller_type", controllertype);
    userdropdown(formdata).then(({ data }) => {
      let dubdata = data?.map((ele, ind) => {
        return { value: ele?.user_id, label: ele?.username };
      });
      setUserData([{ label: "All", value: 0 }, ...dubdata]);
    });
  };
  useEffect(() => {
    GetUserDropdown();
  }, []);
  console.log(sessiongroup, "FilteredData123");

  return (
    <>
      <Modal size="lg" show={show} onHide={close}>
        <Modal.Header closeButton>
          <h3 className="modal-head">Controller</h3>
        </Modal.Header>
        <Modal.Body>
          <form className="filterformflex">
            <div className="col-lg-5 col-md-12">
              <label className="modal-label">Controller name</label>
              <br />
              <input
                type="text"
                className="filterinput w-100"
                name="name"
                id="name"
                value={filterdata.controllername}
                onChange={(e) => {
                  dispatch(
                    Updatefilterdata({
                      ...filterdata,
                      controllername: e.target?.value
                    })
                  );
                }}
                placeholder="enter controller name"
              />
            </div>

            <div className="col-lg-5 col-md-12">
              <label className="modal-label">Controller Code</label>
              <br />
              <input
                type="text"
                className="filterinput w-100"
                name="contcode"
                id="contcode"
                value={filterdata.controllercode}
                maxLength={20}
                onChange={(e) => {
                  dispatch(
                    Updatefilterdata({
                      ...filterdata,
                      controllercode: e.target?.value
                    })
                  );
                }}
                placeholder="enter controller code"
              />
            </div>

            <div className="col-lg-5 col-md-12">
              <label className="modal-label">device code</label>
              <br />
              <input
                type="text"
                placeholder="enter device code"
                className="filterinput w-100"
                name="devicecode"
                id="devicecode"
                maxLength={20}
                value={filterdata.devicecode}
                onChange={(e) => {
                  dispatch(
                    Updatefilterdata({
                      ...filterdata,
                      devicecode: e.target?.value
                    })
                  );
                }}
              />
            </div>
            <div className="col-lg-5 col-md-12">
              <label className="modal-label">User Name</label>
              <br />
              <CommonSelect
                placeholder={"Select User ID"}
                styles={{ width: "100%" }}
                onChange={(e) => {
                  dispatch(
                    Updatefilterdata({
                      ...filterdata,
                      user_id: e
                    })
                  );
                }}
                value={
                  filterdata.user_id !== ""
                    ? filterdata.user_id
                    : controllertype === 1
                    ? motor?.id || 0
                    : light?.id || 0
                }
                options={[...userData]}
                allowClear={false}
              />
            </div>

            <div className="col-lg-5 col-md-12">
              <label className="modal-label">user type</label>
              <br />
              <CommonSelect
                options={UserTypeOptions}
                placeholder={"User Type"}
                onChange={(data) => {
                  dispatch(
                    Updatefilterdata({
                      ...filterdata,
                      usertype: data
                    })
                  );
                }}
                value={
                  filterdata.usertype
                    ? filterdata.usertype
                    : controllertype === 1
                    ? sessiontype
                    : sessiontypelight
                }
                allowClear={false}
                styles={{ width: "100%" }}
              />
            </div>

            <div className="col-lg-5 col-md-12">
              <label className="modal-label">sort</label>
              <br />
              <CommonSelect
                options={SORT_OPTIONS}
                onChange={(data) => {
                  dispatch(Updatefilterdata({ ...filterdata, sortby: data }));
                }}
                value={filterdata.sortby >= 0 ? filterdata.sortby : null}
                styles={{ width: "100%" }}
                allowClear={false}
                placeholder={"Sort Type"}
              />
            </div>

            <div className="col-lg-5 col-md-12">
              <label className="modal-label">group</label>
              <br />
              <CommonSelect
                placeholder={"Group"}
                styles={{ width: "100%" }}
                onChange={(e) => {
                  dispatch(
                    Updatefilterdata({
                      ...filterdata,
                      groupid: e
                    })
                  );
                }}
                value={
                  filterdata?.groupid !== ""
                    ? filterdata.groupid || 0
                    : controllertype === 1
                    ? sessiongroup ?? 0
                    : sessiongrouplight ?? 0
                }
                options={[{ label: "All", value: 0 }, ...groupname]}
                allowClear={false}
              />
            </div>

            <div className="col-lg-5 col-md-12">
              <label className="modal-label"></label>
              <br />
              <Form.Check
                inline
                label="Empty Controller"
                name="empty_controller"
                type={"radio"}
                checked={filterdata.empty_controller}
                onClick={() => {
                  if (filterdata.empty_controller) {
                    dispatch(
                      Updatefilterdata({
                        ...filterdata,
                        empty_controller: 0
                      })
                    );
                  } else {
                    dispatch(
                      Updatefilterdata({
                        ...filterdata,
                        empty_controller: 1
                      })
                    );
                  }
                }}
              />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              Resetform();
            }}
          >
            Reset
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Apply
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
