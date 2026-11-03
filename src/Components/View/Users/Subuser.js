import { useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { listuser } from "../../../Service/ApiService";
import { Updateuserlist } from "../../Store/Config/Configuration";
import { BiUserCircle } from "react-icons/bi";
import { BsPlus } from "react-icons/bs";
import styles from "../Users/user.module.css";
import ReactPaginate from "react-paginate";
import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaArrowLeft
} from "react-icons/fa";
import {
  Link,
  useLocation,
  useNavigate,
  useOutletContext
} from "react-router-dom";
import Assigncontroller from "../../../Modalcomponents/Assigncontroller";
import Assigngroup from "../../../Modalcomponents/Assigngroup";
import commonstyle from "../../../Assets/css/CommonStyle.module.css";
import dayjs from "dayjs";

export default function Subuser() {
  let { userlist } = useSelector((state) => state);
  const [modal, setmodal] = useState(false);
  const [groupmodal, setgroupmodal] = useState(false);
  let location = useLocation();
  const [userid, setuserid] = useState();

  let navigate = useNavigate();
  const { page, items, total } = userlist;

  const pageCount = Math.ceil(total / 12);
  const { handleListUser, name, groupid, empty_user } = useOutletContext();

  const handlePageClick = (event) => {
    // handleListUser(JSON.parse(event.selected) + 1);
    const selectedPage = event.selected + 1;
    handleListUser(groupid, empty_user, selectedPage, false, name, 12);
  };

  const touser = (id) => {
    navigate("/dashboard/user/userdetails/usergroup", {
      state: {
        userid: id,
        pevpath: location?.pathname,

        UserFilters: {
          page,
          values: {
            is_empty: empty_user || "",
            usertype: 3,
            group_id: groupid || "",
            name: name || ""
          }
        }
      }
    });
  };

  const Items = ({ currentItems }) => {
    return (
      <>
        <div className={`total-motor ${styles.admin_user}`}>
          {currentItems?.length > 0 ? (
            <>
              {currentItems?.map((user, index) => {
                return (
                  <div
                    className={`${styles.user_bg} 
                  ${commonstyle.cards_border_radius}`}
                    key={index}
                  >
                    <div
                      className={`${styles.usercontainer} 
                      ${commonstyle.cards_padding}`}
                    >
                      <div className="viewtop-div">
                        <div className={styles.user_logo_txt_div}>
                          <BiUserCircle className={styles.usericon} />
                          <p className={styles.username}>{user?.username}</p>
                        </div>
                        <div className={styles.user_btn_div}>
                          <button
                            type="button"
                            className={`${styles.user_device_btn} 
                            ${commonstyle.btn_border_radius}`}
                            onClick={() => {
                              setuserid({
                                user: user?.user_id,
                                username: user?.username,
                                name: user?.name
                              });
                              setmodal(true);
                            }}
                          >
                            <BsPlus className={styles.addicon} /> Device
                          </button>
                          <button
                            type="button"
                            className={`${styles.user_group_btn} 
                            ${commonstyle.btn_border_radius}`}
                            onClick={() => {
                              setuserid({
                                user: user?.user_id,
                                username: user?.username,
                                name: user?.name
                              });
                              setgroupmodal(true);
                            }}
                          >
                            <BsPlus className={styles.addicon} /> Group
                          </button>
                        </div>
                      </div>
                      <div
                        onClick={() => touser(user.user_id)}
                        className={styles.usersubflex}
                      >
                        <div className={styles.userflex}>
                          <p className={`margin ${styles.user_name_name}`}>
                            <span className="tank-header">Name - </span>
                            <span className={styles.userdata}>
                              {user?.name}
                            </span>
                          </p>
                          <p className={commonstyle.margin_zero}>
                            <span className="tank-header">Mobile No - </span>
                            <span className={styles.userdata}>
                              {user?.mobile_no}
                            </span>
                          </p>
                        </div>
                        <div className={styles.userflex}>
                          <p className={commonstyle.margin_zero}>
                            <span className="tank-header">Usertype - </span>
                            <span className={styles.userdata}>
                              {user?.user_type == 3 ? "Sub user" : null}
                            </span>
                          </p>
                          <p className={commonstyle.margin_zero}>
                            <span className="tank-header">Admin Type - </span>
                            <span className={styles.userdata}>
                              {user?.admin_type == 1
                                ? "level 1 Admin"
                                : "level 2 Admin"}
                            </span>
                          </p>
                        </div>
                        <div className={styles.userflex}>
                          <p className={commonstyle.margin_zero}>
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
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <p className="view-msg">No datas Found</p>
          )}
        </div>
      </>
    );
  };

  console.log(pageCount, page, userlist, "sdfsdfdsfsdf");

  return (
    <>
      {modal ? (
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
      ) : null}

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
