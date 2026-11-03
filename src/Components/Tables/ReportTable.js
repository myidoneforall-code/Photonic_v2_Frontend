import classes from "./Tables.module.css";
import { forwardRef, useImperativeHandle, useState } from "react";
import { TableCheckData } from "../../Utilities/Methods";
import ReactPaginate from "react-paginate";
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import { Table, Tooltip } from "antd";
import UpdateAMCReport from "../../Modalcomponents/UpdateAMCreport";
import MultipleUpdateAMCReport from "../../Modalcomponents/MultipleUpdateAMCreport";

import dayjs from "dayjs";
import ViewMessageModal from "../../Modalcomponents/ViewMessageModal";
import PaginationSizeChanger from "../CommonComponents/PaginationSizeChanger";
import CommonSegmented from "../CommonComponents/CommonSegmented";
import { MdCancel, MdCheckCircle, MdViewList } from "react-icons/md";
import { useNavigate } from "react-router";
import { ExportedImages } from "../../Utilities/ImageExport";
import DeleteConfirmationModal from "../../Modalcomponents/DeleteConfirmationModal";
import { createStyles } from "antd-style";
const useStyle = createStyles(({ css, token }) => {
  const { antCls } = token;
  return {
    customTable: css`
      ${antCls}-table {
        ${antCls}-table-container {
          ${antCls}-table-body,

          ${antCls}-table-content {
            scrollbar-width: thin;
            scrollbar-color: #eaeaea transparent;
            scrollbar-gutter: stable;
          }
        }
      }
    `
  };
});
export const ReportTable = forwardRef(function ReportTable(
  {
    items,
    filters,
    handleChangeSim,
    total,
    page,
    size,
    handleListAMCReport,
    options,
    currentTab
  },
  ref
) {
  const { styles } = useStyle();
  let navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState({
    data: null,
    show: false
  });
  const [deleteModal, setdeleteModal] = useState({ show: false, data: null });
  const [showMultiEditModal, setShowMultiEditModal] = useState({
    data: null,
    show: false
  });
  const [contentModal, setshowContentModal] = useState({
    show: false,
    data: "",
    displayName: ""
  });
  const [bulkUpdate, setbulkUpdate] = useState([]);

  const handlePageClick = (event) => {
    handleListAMCReport(event.selected + 1, size, filters);
  };

  // handle clear bulk data when list api called
  useImperativeHandle(
    ref,
    () => {
      return {
        clearBulkData() {
          setbulkUpdate([]);
        }
      };
    },
    []
  );

  const getClassName = (item) => {
    return bulkUpdate.includes(item.unit_id) ? classes.highlightRow : "";
  };
  const tableHeaderStyle = {
    onHeaderCell: () => ({
      style: {
        backgroundColor: "#ffd8d8",
        color: "#000",
        fontFamily: "Nunito-bold-700",
        padding: "8px 10px"
      }
    })
  };
  const columns = [
    {
      title: "S.No",
      dataIndex: "sno",
      width: 70,
      ...tableHeaderStyle
    },
    {
      title: "Sim No",
      dataIndex: "sim_number",
      width: 150,
      render: (data) => TableCheckData(data),
      ...tableHeaderStyle
    },
    {
      title: "Sim Mobile No",
      dataIndex: "sim_mobile_no",
      width: 130,
      render: (data) => TableCheckData(data),
      ...tableHeaderStyle
    },
    {
      title: "IMSI No",
      dataIndex: "imsi_number",
      width: 150,
      render: (data) => TableCheckData(data),
      ...tableHeaderStyle
    },
    {
      title: "Network",
      dataIndex: "network",
      width: 150,
      render: (data) => TableCheckData(data),
      ...tableHeaderStyle
    },
    {
      title: "Product Id",
      dataIndex: "unit_code",
      width: 150,
      render: (data) => TableCheckData(data),
      ...tableHeaderStyle
    },
    {
      title: "User Name",
      dataIndex: "name",
      width: 150,
      render: (data) => TableCheckData(data),
      ...tableHeaderStyle
    },
    {
      title: "Mobile No",
      dataIndex: "mobile_no",
      width: 100,
      render: (data) => TableCheckData(data),
      ...tableHeaderStyle
    },
    {
      title: "Product Name",
      dataIndex: "unit_name",
      width: 150,
      render: (data) => TableCheckData(data),
      ...tableHeaderStyle
    },
    {
      title: "Sim Started Date",
      dataIndex: "amc_start_date",
      width: 130,
      render: (data) =>
        TableCheckData(data ? dayjs(data).format("DD-MM-YYYY") : ""),
      ...tableHeaderStyle
    },
    {
      title: "Sim Expiry Date",
      dataIndex: "amc_end_date",
      width: 130,
      render: (data) =>
        TableCheckData(data ? dayjs(data).format("DD-MM-YYYY") : ""),
      ...tableHeaderStyle
    },
    {
      title: "Validity   (In Months)",
      dataIndex: "validity",
      width: 100,
      render: (data) => TableCheckData(data),
      ...tableHeaderStyle
    },
    {
      title: "No of Days to Blur",
      dataIndex: "inactivate_delay",
      width: 100,
      render: (data) => TableCheckData(data),
      ...tableHeaderStyle
    },
    {
      title: "Charges",
      dataIndex: "amc_cost",
      width: 100,
      render: (data) => TableCheckData(data),
      ...tableHeaderStyle
    },
    {
      title: "Display Content",
      dataIndex: "amc_msg",
      width: 150,
      ...tableHeaderStyle,
      render: (data) => (
        <div
          onClick={() => {
            if (data) {
              setshowContentModal({
                show: true,
                data: data,
                displayName: "Display Content"
              });
            }
          }}
        >
          <p className={classes.tabelHightWidth}>{TableCheckData(data)}</p>
        </div>
      )
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      key: 16,
      width: 150,
      render: (data) => (
        <td
          onClick={() => {
            if (data) {
              setshowContentModal({
                show: true,
                data: data,
                displayName: "Remarks"
              });
            }
          }}
        >
          <p className={classes.tabelHightWidth}>{TableCheckData(data)}</p>
        </td>
      )
    },
    {
      title: "Product Conditions",
      dataIndex: "status",
      key: 17,
      width: 80,
      fixed: "right",
      render: (data, item) => (
        <div className={getClassName(item)}>
          <p className={data === 1 ? classes.activestatusTD : classes.statusTD}>
            {data === 1 ? "Active" : "InActive"}
          </p>
        </div>
      )
    },
    {
      title: "AMC Conditions",
      dataIndex: "amc_status",
      key: 18,
      width: 80,
      fixed: "right",
      render: (data, item) => (
        <div className={getClassName(item)}>
          <p className={data === 1 ? classes.activestatusTD : classes.statusTD}>
            {data === 1 ? "Activate" : "DeActivate"}
          </p>
        </div>
      )
    },
    {
      title: "Charge",
      dataIndex: "not_show_charge",
      key: 17,
      width: 80,
      fixed: "right",
      render: (data, item) => (
        <div className={getClassName(item)}>
          {data !== 1 ? (
            <MdCheckCircle color="green" size={20} title="Charged" />
          ) : (
            <MdCancel color="red" size={20} title="Not Charged" />
          )}
        </div>
      )
    },
    {
      title: "Pay",
      dataIndex: "not_show_pay",
      key: 18,
      width: 80,
      fixed: "right",
      render: (data, item) => (
        <div className={getClassName(item)}>
          {data !== 1 ? (
            <MdCheckCircle color="green" size={20} title="Paid" />
          ) : (
            <MdCancel color="red" size={20} title="Not Paid" />
          )}
        </div>
      )
    },

    {
      title: "Action",
      key: "operation",
      fixed: "right",
      width: 100,
      render: (data) => (
        <div className={getClassName(data)}>
          <div className="d-flex gap-2 align-items-center">
            <Tooltip title="Edit">
              <img
                src={ExportedImages.EDIT_ICON_BLUE}
                alt="Edit Icon"
                className={classes.editIcon}
                onClick={() => {
                  setShowEditModal({ show: true, data: data });
                }}
              />
            </Tooltip>
            <Tooltip title="Payment History">
              <MdViewList
                style={{
                  fontSize: "24px",
                  color: "brown",
                  cursor: "pointer"
                }}
                onClick={() => {
                  navigate("/dashboard/payment_history", {
                    state: {
                      data,
                      amcDatas: { page, size, values: filters }
                    }
                  });
                }}
              />
            </Tooltip>
            <Tooltip title="Delete">
              <img
                alt=""
                src={ExportedImages.DELETE_ICON_RED}
                className={classes.editIcon}
                onClick={() => {
                  setdeleteModal({ show: true, data: data });
                }}
              />
            </Tooltip>
          </div>
        </div>
      )
    }
  ];
  // rowSelection object indicates the need for row selection
  const rowSelection = {
    onChange: (selectedRowKeys) => {
      setbulkUpdate(selectedRowKeys);
    },
    selectedRowKeys: bulkUpdate,
    width: 100,
    fixed: true,
    getCheckboxProps: (record) => ({
      className: "CheckBox_innerStyle"
    })
  };

  console.log("RE AMC REPOSRT");
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
        <UpdateAMCReport
          show={showEditModal.show}
          onClose={(type) => {
            setShowEditModal({ show: false, data: null });
            if (type) {
              handleListAMCReport(page, size, filters);
            }
          }}
          type={filters.unit_type}
          UpdateData={showEditModal.data}
        />
      )}
      {showMultiEditModal.show && (
        <MultipleUpdateAMCReport
          show={showMultiEditModal.show}
          onClose={(type) => {
            setShowMultiEditModal({ show: false, data: null });
            if (type) {
              handleListAMCReport(page, size, filters);
            }
          }}
          type={filters.unit_type}
          AMC_IDs={bulkUpdate}
        />
      )}
      <div className={classes.tableContainer}>
        <CommonSegmented
          value={filters.is_sim}
          onChange={(data) => {
            handleChangeSim(data);
          }}
          options={[
            { label: "All", value: 0 },
            { label: "With Sim", value: 1 },
            { label: "Without Sim", value: 2 }
          ]}
        />
        {bulkUpdate.length > 0 && (
          <button
            type="button"
            className={`mb-2 ${classes.messageDeletebtn}`}
            onClick={() => {
              setShowMultiEditModal({
                data: {},
                show: true
              });
            }}
          >
            Multiple Update
          </button>
        )}
        <Table
          className={styles.customTable}
          columns={columns}
          dataSource={items}
          rowSelection={{
            type: "checkbox",
            ...rowSelection
          }}
          // scroll={{
          //   x: "max-content",
          //   y: "max-content"
          // }}
          pagination={false}
        />
        {/* <div className={classes.ReportTable}>
          <table>
            <thead>
              <tr>
                {total > 0 && (
                  <th className={classes.tableCheckBoxTd}>
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
                <th className={classes.tablewidth100}>Sim No</th>
                <th className={classes.tablewidth100}>Sim Mobile No</th>
                <th className={classes.tablewidth100}>IMSI No</th>
                <th>Network</th>
                <th>Product Id</th>
                <th className={classes.tablewidth200}>User Name</th>
                <th className={classes.tablewidth110}>Mobile No</th>
                <th className={classes.tablewidth110}>Product Name</th>
                <th className={classes.tablewidth110}>Sim Started Date</th>
                <th className={classes.tablewidth110}>Sim Expiry Date</th>
                <th className={classes.tablewidth100}>
                  <div className="d-flex flex-column">
                    <p className="mb-1">Validity</p>
                    <p
                      className="mb-0 "
                      style={{
                        fontSize: "13px",
                        fontWeight: "200",
                      }}
                    >
                      (In Months)
                    </p>
                  </div>
                </th>
                <th className={classes.tablewidth110}>No of Days to Blur</th>
                <th>Charges</th>

                <th>Display Content</th>
                <th>Remarks</th>
                <th>Product Conditions</th>
                <th>AMC Conditions</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {total > 0 ? (
                items?.map((data, index) => {
                  return (
                    <tr key={index} className={getClassName(data)}>
                      {total > 0 && (
                        <td className={classes.tableCheckBoxTd}>
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
                      <td>{TableCheckData(data.sim_number)}</td>
                      <td>{TableCheckData(data.sim_mobile_no)}</td>
                      <td>{TableCheckData(data.imsi_number)}</td>
                      <td>{TableCheckData(data.network)}</td>
                      <td>{TableCheckData(data.unit_code)}</td>
                      <td>{TableCheckData(data.name)}</td>
                      <td>{TableCheckData(data.mobile_no)}</td>

                      <td>{TableCheckData(data.unit_name)}</td>
                      <td>
                        {TableCheckData(
                          data.amc_start_date
                            ? dayjs(data.amc_start_date).format("DD-MM-YYYY")
                            : ""
                        )}
                      </td>
                      <td>
                        {TableCheckData(
                          data.amc_end_date
                            ? dayjs(data.amc_end_date).format("DD-MM-YYYY")
                            : ""
                        )}
                      </td>
                      <td>{TableCheckData(data.validity)}</td>
                      <td>{TableCheckData(data.inactivate_delay)}</td>

                      <td>{TableCheckData(data.amc_cost)}</td>

                      <td
                        onClick={() => {
                          if (data.amc_msg) {
                            setshowContentModal({
                              show: true,
                              data: data.amc_msg,
                              displayName: "Display Content",
                            });
                          }
                        }}
                      >
                        <p className={classes.tabelHightWidth}>
                          {TableCheckData(data.amc_msg)}
                        </p>
                      </td>
                      <td
                        onClick={() => {
                          if (data.remarks) {
                            setshowContentModal({
                              show: true,
                              data: data.remarks,
                              displayName: "Remarks",
                            });
                          }
                        }}
                      >
                        {" "}
                        <p className={classes.tabelHightWidth}>
                          {TableCheckData(data.remarks)}
                        </p>
                      </td>
                      <td className={getClassName(data)}>
                        <p
                          className={
                            data.status === 1
                              ? classes.activestatusTD
                              : classes.statusTD
                          }
                        >
                          {data.status === 1 ? "Active" : "InActive"}
                        </p>
                      </td>
                      <td className={getClassName(data)}>
                        <p
                          className={
                            data.amc_status === 1
                              ? classes.activestatusTD
                              : classes.statusTD
                          }
                        >
                          {data.amc_status === 1 ? "Activate" : "DeActivate"}
                        </p>
                      </td>
                      <td className={getClassName(data)}>
                        <div className="d-flex gap-2 align-items-center">
                          <Tooltip title="Edit">
                            <img
                              src={ExportedImages.EDIT_ICON_BLUE}
                              alt="Edit Icon"
                              className={classes.editIcon}
                              onClick={() => {
                                setShowEditModal({ show: true, data: data });
                              }}
                            />
                          </Tooltip>
                          <Tooltip title="Payment History">
                            <MdViewList
                              style={{
                                fontSize: "24px",
                                color: "brown",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                navigate("/dashboard/payment_history", {
                                  state: {
                                    data,
                                    amcDatas: { page, size, values: filters },
                                  },
                                });
                              }}
                            />
                          </Tooltip>
                          <Tooltip title="Delete">
                            <img
                              src={ExportedImages.DELETE_ICON_RED}
                              className={classes.editIcon}
                              onClick={() => {
                                setdeleteModal({ show: true, data: data });
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
          </table>
        </div> */}
      </div>
      {bulkUpdate.length > 0 && (
        <button
          type="button"
          className={`mt-2 ${classes.messageDeletebtn}`}
          onClick={() => {
            setShowMultiEditModal({
              data: {},
              show: true
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
            options={options || undefined}
            onChange={(data) => handleListAMCReport(1, data, filters)}
          />
        </div>
      ) : null}
      {deleteModal.show && (
        <DeleteConfirmationModal
          Deletekey={18}
          show={deleteModal.show}
          close={(type) => {
            setdeleteModal({ show: false, data: null });
            if (type) {
              handleListAMCReport(page, size, filters);
            }
          }}
          divicename={currentTab || {}}
          ServiceId={deleteModal.data.unit_id}
        />
      )}
    </>
  );
});
