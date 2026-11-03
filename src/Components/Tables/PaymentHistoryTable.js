import { Checkbox } from "antd";
import classes from "./Tables.module.css";
import { Table } from "react-bootstrap";
import { GetSerialNo, TableCheckData } from "../../Utilities/Methods";
import dayjs from "dayjs";
import ReactPaginate from "react-paginate";
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import PaginationSizeChanger from "../CommonComponents/PaginationSizeChanger";
import { useLocation } from "react-router";
export default function PaymentHistoryTable({
  items,
  filters,

  total,
  page,
  size,
  handleListPaymentHistory,
}) {
  const { state } = useLocation();
  const handlePageClick = (event) => {
    handleListPaymentHistory(event.selected + 1, size, filters);
  };
  return (
    <>
      <div className={classes.tableContainer}>
        <div className={classes.ReportTable}>
          <Table>
            <thead>
              <tr>
                <th>S.No</th>
                {!state && (
                  <>
                    <th className={classes.tablewidth100}>Product Id</th>
                    <th className={classes.tablewidth100}>Product Name</th>
                    <th className={classes.tablewidth200}>User Name</th>
                  </>
                )}
                <th className={classes.tablewidth150}>Mobile No</th>
                <th className={classes.tablewidth200}>Payment Status</th>
                <th className={classes.tablewidth150}>Currency</th>
                <th className={classes.tablewidth150}>Amount</th>
                <th>Request Time</th>
                <th>Response Time</th>
              </tr>
            </thead>
            <tbody>
              {total > 0 ? (
                items?.map((data, index) => {
                  return (
                    <tr key={index}>
                      <td>{GetSerialNo(page, size, index)}</td>
                      {!state && (
                        <>
                          <td>
                            {TableCheckData(
                              data.unit_type === 1
                                ? data.controller_code
                                : data.device_code
                            )}
                          </td>
                          <td>
                            {TableCheckData(
                              data.unit_type === 1
                                ? data.controller_name
                                : data.device_name
                            )}
                          </td>

                          <td>{TableCheckData(data.user_name)}</td>
                        </>
                      )}
                      <td>{TableCheckData(data.mobile_no)}</td>
                      <td>
                        {data.payment_status_name ? (
                          <p
                            style={{
                              color:
                                data?.payment_status <= 0
                                  ? "firebrick"
                                  : data?.payment_status === 1
                                  ? "green"
                                  : "orange",
                            }}
                          >
                            {data.payment_status_name}
                          </p>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>{TableCheckData(data.currency)}</td>
                      <td>{TableCheckData(data.payment_amount)}</td>
                      <td>
                        {data.request_time
                          ? dayjs(data.request_time).format(
                              "DD-MM-YYYY HH:mm:ss"
                            )
                          : "-"}
                      </td>
                      <td>
                        {data.response_time
                          ? dayjs(data.response_time).format(
                              "DD-MM-YYYY HH:mm:ss"
                            )
                          : "-"}
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
            onChange={(data) => handleListPaymentHistory(1, data, filters)}
          />
        </div>
      ) : null}
    </>
  );
}
