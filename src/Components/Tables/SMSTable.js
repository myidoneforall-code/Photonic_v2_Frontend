import { Table } from "react-bootstrap";
import classes from "./Tables.module.css";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import {
  getCatchMsg,
  GetSerialNo,
  TableCheckData,
} from "../../Utilities/Methods";
import ReactPaginate from "react-paginate";
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import { Checkbox, Tooltip } from "antd";

import ViewMessageModal from "../../Modalcomponents/ViewMessageModal";
import PaginationSizeChanger from "../CommonComponents/PaginationSizeChanger";
import UpdateSMSReport from "../../Modalcomponents/UpdateSMSReport";
import { ExportedImages } from "../../Utilities/ImageExport";
import { GetNotificationDropdown } from "../../Service/ApiService";

export const SMSTable = forwardRef(function SMSTable(
  { items, filters, total, page, size, handleListSMSReport },
  ref
) {
  const [showEditModal, setShowEditModal] = useState({
    data: null,
    show: false,
  });
  const [showMultiEditModal, setShowMultiEditModal] = useState({
    data: null,
    show: false,
  });
  const [contentModal, setshowContentModal] = useState({
    show: false,
    data: "",
    displayName: "",
  });
  const [bulkUpdate, setbulkUpdate] = useState([]);
  const [notificationList, setnotificationList] = useState([]);

  const handlePageClick = (event) => {
    handleListSMSReport(event.selected + 1, size, filters);
  };

  // handle clear bulk data when list api called
  useImperativeHandle(
    ref,
    () => {
      return {
        clearBulkData() {
          setbulkUpdate([]);
        },
      };
    },
    []
  );
  const getListNotifications = () => {
    GetNotificationDropdown()
      .then((res) => {
        if (res.data.status === 1) {
          setnotificationList(res.data?.data);
        }
      })
      .catch((err) => {
        getCatchMsg(err);
      });
  };

  useEffect(() => {
    getListNotifications();
  }, []);

  const getSMSForName = (sms_for) => {
    let finalArray = sms_for ? sms_for.split(",").map(Number) : [];

    let result = finalArray?.map((data) => {
      let finalName = notificationList.find((ele) => ele.id === data);
      return finalName?.name;
    });
    return result?.length > 0
      ? result.map((ele, ind) => {
          return (
            <span key={ind}>
              {ele} {ind === result.length - 1 ? "" : " , "}
            </span>
          );
        })
      : "-";
  };
  const getClassName = (item) => {
    return bulkUpdate.includes(item.unit_id) ? classes.highlightRow : "";
  };
  return (
    <>
      {contentModal.show && (
        <ViewMessageModal
          close={() => {
            setshowContentModal({ show: false, data: "", displayName: "" });
          }}
          data={{ displayName: contentModal.displayName }}
          msg={contentModal.data}
          show={contentModal.show}
        />
      )}
      {showEditModal.show && (
        <UpdateSMSReport
          show={showEditModal.show}
          onClose={(type) => {
            setShowEditModal({ show: false, data: null });
            if (type) {
              handleListSMSReport(page, size, filters);
            }
          }}
          type={filters.unit_type}
          UpdateData={showEditModal.data}
        />
      )}
      {showMultiEditModal.show && (
        <UpdateSMSReport
          show={showMultiEditModal.show}
          onClose={(type) => {
            setShowMultiEditModal({ show: false, data: null });
            if (type) {
              handleListSMSReport(page, size, filters);
            }
          }}
          type={filters.unit_type}
          AMC_IDs={bulkUpdate}
          isMulti={true}
        />
      )}
      <div className={classes.tableContainer}>
        {bulkUpdate.length > 0 && (
          <button
            type="button"
            className={`mt-0 mb-2 ${classes.messageDeletebtn}`}
            onClick={() => {
              setShowMultiEditModal({
                data: {},
                show: true,
              });
            }}
          >
            Multiple Update
          </button>
        )}
        <div className={classes.SMSTable}>
          <Table>
            <thead>
              <tr>
                {total > 0 && (
                  <th>
                    <Checkbox
                      className="CheckBox_innerStyle"
                      checked={bulkUpdate.length === items.length}
                      onClick={() => {
                        if (bulkUpdate.length === items.length) {
                          setbulkUpdate([]);
                        } else {
                          setbulkUpdate(items.map((ele) => ele.unit_id));
                        }
                      }}
                    />
                  </th>
                )}
                <th>S.No</th>
                <th className={classes.tablewidth100}>Product Id</th>
                <th className={classes.tablewidth100}>Product Name</th>
                <th className={classes.tablewidth200}>User Name</th>
                <th className={classes.tablewidth150}>Mobile No</th>
                <th className={classes.tablewidth150}>SMS Mobile No</th>

                <th>SMS For</th>
                <th>Message</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {total > 0 ? (
                items?.map((data, index) => {
                  return (
                    <tr key={index} className={getClassName(data)}>
                      {total > 0 && (
                        <td>
                          <Checkbox
                            className="CheckBox_innerStyle"
                            checked={
                              bulkUpdate.includes(data.unit_id) ? true : false
                            }
                            onChange={() => {
                              if (bulkUpdate.includes(data.unit_id)) {
                                setbulkUpdate(
                                  bulkUpdate.filter(
                                    (ele) => ele !== data.unit_id
                                  )
                                );
                              } else {
                                setbulkUpdate([...bulkUpdate, data.unit_id]);
                              }
                            }}
                          />
                        </td>
                      )}
                      <td>{GetSerialNo(page, size, index)}</td>
                      <td>{TableCheckData(data?.unit_code)}</td>
                      <td>{TableCheckData(data?.unit_name)}</td>
                      <td>{TableCheckData(data?.name)}</td>
                      <td>{TableCheckData(data?.mobile_no)}</td>
                      <td className={classes.TableWrapWidth}>
                        {TableCheckData(data.sms_mobile_no)}
                      </td>

                      <td className={classes.TableWrapWidth}>
                        {getSMSForName(data.sms_for)}
                        {/* {TableCheckData(data.sms_for)} */}
                      </td>

                      <td
                        onClick={() => {
                          if (data.message) {
                            setshowContentModal({
                              show: true,
                              data: data.message,
                              displayName: "Message",
                            });
                          }
                        }}
                      >
                        {" "}
                        <p className={classes.tabelHightWidth}>
                          {TableCheckData(data.message)}
                        </p>
                      </td>
                      <td>
                        <div className="d-flex gap-2 align-items-center">
                          <Tooltip title="Edit">
                            <img
                              src={ExportedImages.EDIT_ICON_BLUE}
                              className={classes.editIcon}
                              onClick={() => {
                                setShowEditModal({ show: true, data: data });
                              }}
                            />
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr rowSpan={3}>
                  <td colSpan={20}>
                    <p className={classes.tablenoDatatext}>No Data Found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>
      {bulkUpdate.length > 0 && (
        <button
          type="button"
          className={classes.messageDeletebtn}
          onClick={() => {
            setShowMultiEditModal({
              data: {},
              show: true,
            });
          }}
        >
          Multiple Update
        </button>
      )}
      {total > 10 ? (
        <div className="col-12 justify-content-end d-flex gap-3 align-items-center  mt-4">
          <ReactPaginate
            breakLabel="..."
            nextLabel={<FaAngleDoubleRight />}
            onPageChange={handlePageClick}
            pageRangeDisplayed={5}
            pageCount={Math.ceil(total / size)}
            previousLabel={<FaAngleDoubleLeft />}
            renderOnZeroPageCount={null}
            containerClassName={"container-class mb-0"}
            pageLinkClassName={"page-link"}
            pageClassName={"page-item"}
            previousClassName={"next-page-item"}
            previousLinkClassName={"pre-link-item"}
            nextClassName={"next-page-item"}
            nextLinkClassName={"pre-link-item"}
            activeClassName={"active-page"}
            forcePage={page - 1}
          />
          <PaginationSizeChanger
            size={size}
            onChange={(data) => handleListSMSReport(1, data, filters)}
          />
        </div>
      ) : null}
    </>
  );
});
