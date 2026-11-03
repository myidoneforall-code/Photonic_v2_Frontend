import { useState } from "react";
import { useSelector } from "react-redux";

import styles from "../Users/user.module.css";
import ReactPaginate from "react-paginate";
import { FaTrashAlt } from "react-icons/fa";
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import { useOutletContext } from "react-router-dom";

import DeleteConfirmationModal from "../../../Modalcomponents/DeleteConfirmationModal";
import commonstyle from "../../../Assets/css/CommonStyle.module.css";

export default function Deleteuserproduction() {
  const { handleDeleteUserList } = useOutletContext();
  let { userlist } = useSelector((state) => state);
  const { total, page, items } = userlist;

  const [id, setid] = useState();
  const [index, setindex] = useState();
  const [conformation, setconf] = useState(false);

  const pageCount = Math.ceil(total / 12);
  const handlePageClick = (event) => {
    handleDeleteUserList(JSON.parse(event.selected) + 1);
  };

  const Items = ({ currentItems }) => {
    return (
      <>
        <div className={styles.admin_user}>
          {currentItems?.map((user, ind) => {
            return (
              <div
                className={`${styles.user_bg} ${commonstyle.cards_border_radius}`}
                key={ind}
              >
                <div
                  className={`${styles.usercontainer} ${commonstyle.cards_padding}`}
                >
                  <div className={styles.deleteuserflex}>
                    <p className={styles.deluser_name}>{user?.username}</p>

                    <FaTrashAlt
                      className="icontrash"
                      onClick={() => {
                        setconf(true);
                        setid(user?.user_id);
                        setindex(ind);
                      }}
                    />
                  </div>
                  <div className={styles.deleteuserflex}>
                    <p className="tank-header">
                      Mobile No:{" "}
                      <span className="tank-date">{user?.mobile_no}</span>{" "}
                    </p>
                    <p className={commonstyle.margin_zero}>Production unit</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <>
      {conformation ? (
        <DeleteConfirmationModal
          show={conformation}
          close={() => setconf(false)}
          id={id}
          index={index}
          Deletekey={8}
        />
      ) : null}
      <div className={styles.pagestyle}>
        <Items currentItems={items} />

        {total > 12 ? (
          <div className="col-12 float-start d-flex justify-content-center">
            <ReactPaginate
              breakLabel="..."
              nextLabel={<FaAngleDoubleRight />}
              onPageChange={handlePageClick}
              pageRangeDisplayed={5}
              pageCount={pageCount}
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
          </div>
        ) : null}
      </div>
    </>
  );
}
