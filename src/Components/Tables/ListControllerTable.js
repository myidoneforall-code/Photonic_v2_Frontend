import { Table } from "react-bootstrap";
import classes from "./Tables.module.css";
import { useState } from "react";
import { GetSerialNo, TableCheckData } from "../../Utilities/Methods";
import ReactPaginate from "react-paginate";
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";

import ModifySimModal from "../../Modalcomponents/ModifySimModal";
import DeleteConfirmationModal from "../../Modalcomponents/DeleteConfirmationModal";
import { Tooltip } from "antd";
import { ExportedImages } from "../../Utilities/ImageExport";
export default function ListControllerTable({
  items,
  filters,
  total,
  page,
  size,
  handleListController
}) {
  const [showEditModal, setShowEditModal] = useState({
    data: null,
    show: false
  });
  const [deleteModal, setdeleteModal] = useState({ show: false, data: null });
  const handlePageClick = (event) => {
    console.log(page, size, total, items, event, "ITEMSSS1231");
    handleListController(event.selected + 1, 100, filters);
  };

  return (
    <>
      {showEditModal.show && (
        <ModifySimModal
          show={showEditModal.show}
          onClose={(type) => {
            setShowEditModal({ show: false, data: null });
            if (type) {
              handleListController(page, size, filters);
            }
          }}
          UpdateData={showEditModal.data}
          type="Edit"
        />
      )}
      {deleteModal.show && (
        <DeleteConfirmationModal
          Deletekey={17}
          show={deleteModal.show}
          close={(type) => {
            setdeleteModal({ show: false, data: null });
            if (type) {
              handleListController(page, size, filters);
            }
          }}
          ServiceId={deleteModal.data.id}
        />
      )}
      <div className={classes.tableContainer}>
        <div className={classes.ReportTable}>
          <Table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>User Name</th>
                <th>Controller/Device Name</th>
                <th>Controller/Device Code </th>
                <th>Type </th>
                <th>Request Type</th>

                <th>On/Off</th>
              </tr>
            </thead>
            <tbody>
              {total > 0 ? (
                items?.map((data, index) => {
                  return (
                    <tr key={index}>
                      <td>{GetSerialNo(page, size, index)}</td>
                      <td>{TableCheckData(data.username)}</td>
                      <td>{TableCheckData(data.controller_name)}</td>
                      <td>
                        {TableCheckData(
                          data?.device_code
                            ? data?.device_code
                            : data.controller_code
                        )}
                      </td>
                      <td>
                        {TableCheckData(
                          Number(data.request_from) === 1
                            ? "Controller"
                            : "Device"
                        )}
                      </td>
                      <td>{TableCheckData(data.request_type)}</td>

                      <td>{TableCheckData(data.created_at)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr rowSpan={3}>
                  <td colSpan={6}>
                    <p className={classes.tablenoDatatext}>No Data Found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>

      <div className="col-12 float-start d-flex justify-content-center mt-4">
        {total > 10 ? (
          <ReactPaginate
            breakLabel="..."
            nextLabel={<FaAngleDoubleRight />}
            onPageChange={handlePageClick}
            pageRangeDisplayed={5}
            pageCount={Math.ceil(total / 100)}
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
            forcePage={page - 1}
          />
        ) : null}
      </div>
    </>
  );
}
