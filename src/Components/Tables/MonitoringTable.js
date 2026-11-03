import { Checkbox } from "antd";
import classes from "./Tables.module.css";
import { Table } from "react-bootstrap";
import {
  GetSerialNo,
  TableCheckData,
  TypeBasednames,
} from "../../Utilities/Methods";
import dayjs from "dayjs";
import ReactPaginate from "react-paginate";
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import PaginationSizeChanger from "../CommonComponents/PaginationSizeChanger";
export default function MonitoringTable({
  items,
  filters,

  total,
  page,
  size,
  handleListPaymentHistory,
}) {
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
                <th className={classes.tablewidth100}>
                  {TypeBasednames(filters).code}
                </th>
                <th className={classes.tablewidth100}>
                  {TypeBasednames(filters).name}
                </th>
                <th className={classes.tablewidth200}>
                  {TypeBasednames(filters).type}
                </th>
                <th className={classes.tablewidth150}>
                  Last Communicated Date
                </th>
              </tr>
            </thead>
            <tbody>
              {total > 0 ? (
                items?.map((data, index) => {
                  return (
                    <tr key={index}>
                      <td>{GetSerialNo(page, size, index)}</td>
                      <td>
                        {TableCheckData(
                          data?.[TypeBasednames(filters).key_code]
                        )}
                      </td>
                      <td>
                        {TableCheckData(
                          data?.[TypeBasednames(filters).key_name]
                        )}
                      </td>

                      <td>
                        {TableCheckData(
                          data?.[TypeBasednames(filters).key_type]
                        )}
                      </td>
                      <td>
                        {data?.last_communicated_time
                          ? dayjs(data?.last_communicated_time).format(
                              "YYYY-MM-DD"
                            )
                          : ""}
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
