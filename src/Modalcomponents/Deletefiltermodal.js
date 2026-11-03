import { useFormik } from "formik";
import React, { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useLoaderData, useLocation } from "react-router";
import Loader from "../Components/Loader";
import { Updatedeletefilter } from "../Components/Store/Config/Configuration";
import { listcontrollerapi } from "../Service/ApiService";
import CommonSelect from "../Components/CommonComponents/CommonSelect";

export default function Deletefiltermodal({
  show,
  close,
  groupname,
  ListController,
  // controllertype,
}) {
  let dispatch = useDispatch();
  const {
    values,
    errors,
    handleChange,
    setValues,
    handleSubmit,
    setFieldValue,
  } = useFormik({
    initialValues: {
      isLoader: false,
    },
    onSubmit: (values) => {
      Apply(values);
    },
  });

  let location = useLocation();
  const { deletefilter } = useSelector((state) => state);
  let type = JSON.parse(localStorage.getItem("contollertype"));
  let sessiongroup = JSON.parse(sessionStorage.getItem("groupid"));
  let sessiontype = JSON.parse(sessionStorage.getItem("usertype"));
  let sessiongrouplight = JSON.parse(sessionStorage.getItem("groupidlight"));
  let sessiontypelight = JSON.parse(sessionStorage.getItem("usertypelight"));
  let controllertype = JSON.parse(localStorage.getItem("contollertype"));
  const Apply = (data) => {
    ListController();
    close();
  };

  const Resetform = () => {
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
  };
  return (
    <>
      {/* <Loader isLoader={values.isLoader} /> */}
      <Modal
        size="lg"
        show={show}
        // backdrop="static"
        // keyboard={false}
        aria-labelledby="example-modal-sizes-title-lg"
        onHide={close}
      >
        <Modal.Header closeButton>
          <h3 className="modal-head">Controller</h3>
        </Modal.Header>
        <Modal.Body>
          <form className="filterformflex">
            <div className="col-lg-5 col-md-12">
              <label className="modal-label">controller name</label>
              <br />
              <input
                type="text"
                className="filterinput w-100"
                name="name"
                id="name"
                value={deletefilter.controllername}
                onChange={(e) => {
                  dispatch(
                    Updatedeletefilter({
                      ...deletefilter,
                      controllername: e.target?.value,
                    })
                  );
                }}
                placeholder="enter controller name"
              />
            </div>

            <div className="col-lg-5 col-md-12">
              <label className="modal-label">controller ID</label>
              <br />
              <input
                type="text"
                className="filterinput w-100"
                name="contcode"
                id="contcode"
                value={deletefilter.controllercode}
                onChange={(e) => {
                  dispatch(
                    Updatedeletefilter({
                      ...deletefilter,
                      controllercode: e.target?.value,
                    })
                  );
                }}
                placeholder="enter controller id"
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
                value={deletefilter.devicecode}
                onChange={(e) => {
                  dispatch(
                    Updatedeletefilter({
                      ...deletefilter,
                      devicecode: e.target?.value,
                    })
                  );
                }}
              />
            </div>

            <div className="col-lg-5 col-md-12">
              <label className="modal-label">user type</label>
              <br />
              <select
                type="text"
                placeholder="user type"
                className="filterselectinput w-100"
                name="usertype"
                id="usertype"
                onChange={(e) => {
                  dispatch(
                    Updatedeletefilter({
                      ...deletefilter,
                      usertype: e.target?.value,
                    })
                  );
                }}
              >
                <option disabled>User Type</option>
                <option
                  value="0"
                  selected={
                    deletefilter?.usertype
                      ? deletefilter?.usertype == 0
                        ? true
                        : false
                      : controllertype === 1
                      ? sessiontype == 0
                        ? true
                        : false
                      : sessiontypelight == 0
                      ? true
                      : false
                  }
                >
                  All
                </option>
                <option
                  value="1"
                  selected={
                    deletefilter?.usertype
                      ? deletefilter?.usertype == 1
                        ? true
                        : false
                      : controllertype === 1
                      ? sessiontype == 1
                        ? true
                        : false
                      : sessiontypelight == 1
                      ? true
                      : false
                  }
                >
                  Private
                </option>
                <option
                  value="2"
                  selected={
                    deletefilter?.usertype
                      ? deletefilter?.usertype == 2
                        ? true
                        : false
                      : controllertype === 1
                      ? sessiontype == 2
                        ? true
                        : false
                      : sessiontypelight == 2
                      ? true
                      : false
                  }
                >
                  Government
                </option>
              </select>
            </div>

            <div className="col-lg-5 col-md-12">
              <label className="modal-label">sort</label>
              <br />
              <select
                type="text"
                placeholder="sort"
                className="filterselectinput w-100"
                name="sort"
                id="sort"
                // value={values.sort}

                onChange={(e) => {
                  dispatch(
                    Updatedeletefilter({
                      ...deletefilter,
                      sortby: e.target?.value,
                    })
                  );
                }}
              >
                <option disabled>Sort By</option>
                <option
                  value="0"
                  selected={deletefilter?.sortby == 0 ? true : false}
                >
                  All
                </option>
                <option
                  value="1"
                  selected={deletefilter?.sortby == 1 ? true : false}
                >
                  On
                </option>
                <option
                  value="2"
                  selected={deletefilter?.sortby == 2 ? true : false}
                >
                  Off
                </option>
                <option
                  value="3"
                  selected={deletefilter?.sortby == 3 ? true : false}
                >
                  Notification
                </option>
              </select>
            </div>

            <div className="col-lg-5 col-md-12">
              <label className="modal-label">group</label>
              <br />
              <CommonSelect
                placeholder={"Group"}
                styles={{ width: "100%" }}
                onChange={(e) => {
                  dispatch(
                    Updatedeletefilter({
                      ...deletefilter,
                      groupid: e,
                    })
                  );
                }}
                value={
                  deletefilter?.groupid
                    ? deletefilter?.groupid
                    : controllertype === 1
                    ? sessiongroup ?? 0
                    : sessiongrouplight ?? 0
                }
                options={[{ label: "All", value: 0 }, ...groupname]}
                allowClear={false}
              />
              {/* <select
                type="text"
                placeholder="group"
                className="filterselectinput w-100"
                name="groupid"
                id="groupid"
                // value={values.groupnames}

                onChange={(e) => {
                  dispatch(
                    Updatedeletefilter({
                      ...deletefilter,
                      groupid: e.target?.value,
                    })
                  );
                }}
              >
                <option disabled>Group</option>
                <option value="0">All</option>
                {groupname?.map((group) => {
                  return (
                    <>
                      <option
                        value={group.group_id}
                        selected={
                          deletefilter?.groupid
                            ? deletefilter?.groupid == group.group_id
                              ? true
                              : false
                            : controllertype === 1
                            ? sessiongroup == group.group_id
                              ? true
                              : false
                            : sessiongrouplight == group.group_id
                            ? true
                            : false
                        }
                      >
                        {group.group_name}
                      </option>
                    </>
                  );
                })}
              </select> */}
            </div>
            <div className="col-lg-5 col-md-12">
              <label className="modal-label"></label>
              <br />
              <Form.Check
                inline
                label="Empty Controller"
                name="empty_controller"
                type={"radio"}
                checked={deletefilter.empty_controller}
                onClick={() => {
                  if (deletefilter.empty_controller) {
                    dispatch(
                      Updatedeletefilter({
                        ...deletefilter,
                        empty_controller: 0,
                      })
                    );
                  } else {
                    dispatch(
                      Updatedeletefilter({
                        ...deletefilter,
                        empty_controller: 1,
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
