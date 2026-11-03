import { useDispatch, useSelector } from "react-redux";
import { BiUserCircle } from "react-icons/bi";
import styles from "../Users/user.module.css";
import ReactPaginate from "react-paginate";
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import { useLocation, useNavigate, useOutletContext } from "react-router";
import commonstyle from "../../../Assets/css/CommonStyle.module.css";
import dayjs from "dayjs";
import { useEffect } from "react";
import { UpdateUserFilters } from "../../Store/Config/Configuration";

export default function Productionuser() {
  const { handleListUser, name, groupid, empty_user } = useOutletContext();
  let { userlist } = useSelector((state) => state);
  let navigate = useNavigate();
  let location = useLocation();
  const { items, total, page } = userlist;
  const pageCount = Math.ceil(total / 12);

  const handlePageClick = (event) => {
    handleListUser("", null, JSON.parse(event.selected) + 1);
  };

  const touser = (id) => {
    navigate("/dashboard/user/userdetails/usergroup", {
      state: {
        userid: id,
        pevpath: location?.pathname,
        id: 1,

        UserFilters: {
          page,
          values: {
            is_empty: empty_user || "",
            usertype: 4,
            group_id: groupid || "",
            name: name || "",
          },
        },
      },
    });
  };
  const Items = ({ currentItems }) => {
    return (
      <>
        <div className={`total-motor ${styles.admin_user}`}>
          {currentItems?.map((user, index) => {
            return (
              <div
                className={`${styles.user_bg} ${commonstyle.cards_border_radius}`}
                key={index}
                onClick={() => touser(user.user_id)}
              >
                <div
                  className={`${styles.usercontainer} ${commonstyle.cards_padding}`}
                >
                  <div className={styles.viewtop_div}>
                    <div className={styles.user_logo_txt_div}>
                      <BiUserCircle className={styles.usericon} />
                      <p className={styles.username}>{user?.username}</p>
                    </div>
                    {/* <div className="motor-btn">
                      <button
                        type="button"
                        className={styles.devicebtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          setuserid({
                            user: user?.user_id,
                            username: user?.username,
                          });

                          setmodal(true);
                        }}
                      >
                        <BsPlus className={styles.addicon} /> Device
                      </button>
                      <button
                        type="button"
                        className={styles.groupbtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          setuserid({
                            user: user?.user_id,
                            username: user?.username,
                          });
                          setgroupmodal(true);
                        }}
                      >
                        <BsPlus className={styles.addicon} /> Group
                      </button>
                    </div> */}
                  </div>
                  <div className={styles.usersubflex}>
                    <div className={styles.userflex}>
                      <p className={`margin ${styles.user_name_name}`}>
                        <span className="tank-header">Name - </span>
                        <span className={styles.userdata}>{user?.name}</span>
                      </p>
                      <p className="margin">
                        <span className="tank-header">Mobile No - </span>
                        <span className={styles.userdata}>
                          {user?.mobile_no}
                        </span>
                      </p>
                    </div>
                    <div className={styles.userflex}>
                      <p className="margin">
                        <span className="tank-header">Usertype - </span>
                        <span className={styles.userdata}>
                          {user?.user_type == 2 ? "Admin" : "Production"}
                        </span>
                      </p>
                      <p className="margin">
                        <span className="tank-header">Created at - </span>
                        <span className={styles.userdata}>
                          {user?.created_at
                            ? dayjs(
                                user?.created_at,
                                "DD-MM-YYYY HH:mm:ss"
                              ).format("DD-MM-YYYY")
                            : null}
                        </span>
                      </p>
                      {/* <p className="margin">
                        <span className="tank-header">Admin Type - </span>
                        <span className={styles.userdata}>
                          {user?.admin_type == 1
                            ? "level 1 Admin"
                            : "level 2 Admin"}
                        </span>
                      </p> */}
                    </div>
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
      {/* {modal ? (
        <Assigncontroller
          show={modal}
          close={() => setmodal(false)}
          user={userid}
        />
      ) : null}

      {groupmodal ? (
        <Assigngroup
          show={groupmodal}
          close={() => setgroupmodal(false)}
          user={userid}

        />
      ) : null} */}

      <div className={styles.pagestyle}>
        <Items currentItems={items} />
        <br />

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
