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
export default function SimTable({
  items,
  filters,
  total,
  page,
  size,
  handleListSimData,
}) {
  const [showEditModal, setShowEditModal] = useState({
    data: null,
    show: false,
  });
  const [deleteModal, setdeleteModal] = useState({ show: false, data: null });
  const handlePageClick = (event) => {
    handleListSimData(event.selected + 1, 10, filters);
  };

  return (
    <>
      {showEditModal.show && (
        <ModifySimModal
          show={showEditModal.show}
          onClose={(type) => {
            setShowEditModal({ show: false, data: null });
            if (type) {
              handleListSimData(page, size, filters);
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
              handleListSimData(page, size, filters);
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
                <th>Sim No</th>
                <th>Mobile No</th>
                <th>IMSI No</th>
                <th>Network</th>

                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {total > 0 ? (
                items?.map((data, index) => {
                  return (
                    <tr key={index}>
                      <td>{GetSerialNo(page, size, index)}</td>
                      <td>{TableCheckData(data.sim_number)}</td>
                      <td>{TableCheckData(data.mobile_no)}</td>
                      <td>{TableCheckData(data.imsi_number)}</td>
                      <td>{TableCheckData(data.network)}</td>

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
            pageCount={Math.ceil(total / 10)}
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
