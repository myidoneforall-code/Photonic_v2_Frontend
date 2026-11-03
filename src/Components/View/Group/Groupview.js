import { useEffect, useRef, useState } from "react";
import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaArrowLeft,
  FaTrashAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router";
import { listgroup } from "../../../Service/ApiService";
import Loader from "../../Loader";
import styles from "../Users/user.module.css";
import { FiUserPlus } from "react-icons/fi";
import Addgroup from "../../../Modalcomponents/Addgroup";
import Mergegroup from "../../../Modalcomponents/Mergegroup";
import Assignuser from "../../../Modalcomponents/Assignuser";
import DeleteConfirmationModal from "../../../Modalcomponents/DeleteConfirmationModal";
import { getCookie } from "../../../Utilities/Cookie";
import groupstyle from "../../View/Group/group.module.css";
import commonstyle from "../../../Assets/css/CommonStyle.module.css";
import ReactPaginate from "react-paginate";
import { RiSearchLine } from "react-icons/ri";
import { Checkbox } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { UpdateGroupFilters } from "../../Store/Config/Configuration";

export default function Groupview() {
  let navigate = useNavigate();
  const { GroupFilters } = useSelector((state) => state);
  let cookie = JSON.parse(getCookie("cookiedata"));
  let controllertype = JSON.parse(localStorage.getItem("contollertype"));
  let usertype = cookie?.user_type;
  const [grouplistdata, setgrouplist] = useState({
    page: 1,
    size: 12,
    total: 0,
    items: [],
  });
  const { page, total, items } = grouplistdata;
  const [loader, setloader] = useState(false);
  // modals state
  const [addModal, setAddModal] = useState(false);
  const [mergemodal, setmerge] = useState(false);

  const [AssignuserModal, setAssignuserModal] = useState(false);
  const [Deleteconfirmation, setDeleteconfirmation] = useState(false);

  const [name, setname] = useState("");
  const [groupid, setgroupid] = useState();
  const [index, setindex] = useState();
  const [empty_group, setempty_group] = useState(0);

  const NavigatetoDashboard = () => {
    if (usertype === 3) {
      navigate(
        controllertype === 1
          ? "/dashboard/motorcontrollerview"
          : "/dashboard/lightcontrollerview"
      );
    } else {
      navigate("/dashboard");
    }
  };

  const GetGroupListData = (page = 1, is_empty = null, Groupname = "") => {
    let formdata = new FormData();
    formdata.append("group_name", Groupname ? Groupname : name);
    if (is_empty === 1 || (is_empty === null && empty_group === 1)) {
      formdata.append(
        "empty_group",
        is_empty === 1
          ? is_empty
          : is_empty === null && empty_group === 1
          ? 1
          : 0
      );
    }
    setloader(true);
    listgroup(page, 12, formdata)
      .then(({ data }) => {
        setgrouplist(data);
      })
      .catch((err) => {})
      .finally(() => setloader(false));
  };

  const handleClickGroup = (groupname, id) => {
    if (usertype === 1) {
      navigate("/dashboard/group/auth/groupcontroller", {
        state: {
          groupname: groupname,
          groupid: id,
          GroupDatas: {
            page,
            values: {
              name,
              empty_group,
            },
          },
        },
      });
    } else if (usertype === 2 || usertype === 3) {
      if (controllertype === 1) {
        sessionStorage.setItem("groupid", id);
        sessionStorage.setItem("groupname", JSON.stringify(groupname));
      } else {
        sessionStorage.setItem("groupidlight", id);
        sessionStorage.setItem("grouplightname", JSON.stringify(groupname));
      }
      navigate("/dashboard");
    }
  };
  const handlePageClick = (event) => {
    GetGroupListData(JSON.parse(event.selected) + 1);
  };
  let dispatch = useDispatch();

  useEffect(() => {
    GetGroupListData(
      GroupFilters?.page || page,
      GroupFilters?.values?.empty_group,
      GroupFilters?.values?.name || name
    );
    setname((pre) => GroupFilters?.values.name || pre);
    setempty_group(GroupFilters?.values.empty_group);

    // end
    return () => {
      dispatch(UpdateGroupFilters(null));
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      GetGroupListData(page);
    }, 2 * 60000);
    return () => clearInterval(interval);
  }, [page, empty_group, name]);

  return (
    <>
      {/* add group modal */}
      {addModal ? (
        <Addgroup
          show={addModal}
          close={() => setAddModal(false)}
          grouplist={() => GetGroupListData(1)}
        />
      ) : null}
      {/* merge group modal */}
      {mergemodal ? (
        <Mergegroup show={mergemodal} close={() => setmerge(false)} />
      ) : null}

      {/* assign user for group modal */}
      {AssignuserModal ? (
        <Assignuser
          show={AssignuserModal}
          groupid={groupid}
          close={() => setAssignuserModal(false)}
        />
      ) : null}

      {/* delete group modal */}

      {Deleteconfirmation ? (
        <DeleteConfirmationModal
          show={Deleteconfirmation}
          close={() => setDeleteconfirmation(false)}
          id={groupid?.group_id}
          index={index}
          Deletekey={3}
          functioncall={() => GetGroupListData(1)}
        />
      ) : null}

      {/* component starts here */}
      <Loader isLoader={loader}></Loader>

      <div className="router-pages">
        <div className={groupstyle.group_head}>
          <div className="pre-page">
            <FaArrowLeft
              className="arrow"
              onClick={() => NavigatetoDashboard()}
            />
            <p
              className={`${groupstyle.user_page_parent_head} 
              ${commonstyle.parent_heading_in_all_page}`}
            >
              Groups({total})
            </p>
          </div>
          {usertype === 3 ? null : (
            <div className={styles.top_buttons}>
              <button
                type="button"
                className={`${groupstyle.group_merge_group_btn} ${commonstyle.btn_border_radius}`}
                onClick={() => setmerge(true)}
              >
                Merge Group
              </button>
              <button
                type="button"
                className={`${groupstyle.group_add_group_btn} ${commonstyle.btn_border_radius}`}
                onClick={() => {
                  setAddModal(true);
                }}
              >
                Add Group
              </button>
            </div>
          )}
        </div>

        <div className={`${styles.searchblok} mb-4`}>
          <div className={styles.emptyGroupContainer}>
            <Checkbox
              className="CheckBox_innerStyle"
              checked={empty_group}
              onClick={() => {
                let data = empty_group === 1 ? 0 : 1;
                setempty_group(data);
                GetGroupListData(1, data);
              }}
            />
            <p>Empty Group</p>
          </div>
          <div className={styles.searchbar}>
            <input
              type="text"
              name="name"
              id="name"
              value={name}
              className={styles.inputbar}
              placeholder="search here...."
              onChange={(e) => setname(e.target.value)}
            />
            <RiSearchLine
              className={styles.searchicon}
              onClick={() => GetGroupListData(1)}
            />
          </div>
        </div>

        <div className={`${styles.pagestyle} ${commonstyle.pagination_bottom}`}>
          {total > 0 ? (
            <div className={`${groupstyle.userviewflex} `}>
              {items?.map((ele, index) => {
                return (
                  <div
                    className={`${groupstyle.group_bg} ${commonstyle.cards_border_radius}`}
                    key={index}
                    onClick={() =>
                      handleClickGroup(ele?.group_name, ele?.group_id)
                    }
                  >
                    <div
                      className={`${styles.usercontainer}  ${commonstyle.cards_padding}`}
                    >
                      <div className={styles.userflex}>
                        <p className={groupstyle.userflexp}>
                          <span className="tank-header">Group Name - </span>
                          <span className={styles.userdata}>
                            {ele?.group_name}
                          </span>
                        </p>
                        {usertype === 3 ? null : ele.access_type == 3 ||
                          ele.access_type == 2 ? null : (
                          <button
                            type="button"
                            className={`${groupstyle.group_user_btn} ${commonstyle.btn_border_radius}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setgroupid(ele);
                              setAssignuserModal(true);
                            }}
                          >
                            <FiUserPlus
                              className={groupstyle.group_user_icon}
                            />
                            User
                          </button>
                        )}
                      </div>
                      <div className={styles.userflex}>
                        <p className="tank-usage">
                          <span className="tank-header">Access Type - </span>
                          <span className={styles.userdata}>
                            {ele?.access_type === 0
                              ? "Admin"
                              : ele.access_type === 1
                              ? "Control"
                              : ele.access_type === 2
                              ? "operator"
                              : ele.access_type === 3
                              ? "View only"
                              : null}
                          </span>
                        </p>
                        {usertype === 3 ? null : ele.access_type == 3 ||
                          ele.access_type == 2 ? null : (
                          <button
                            type="button"
                            className={`${groupstyle.group_delete_btn} ${commonstyle.btn_border_radius}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteconfirmation(true);
                              setgroupid(ele);
                              setindex(index);
                            }}
                            // todeletegroup(ele?.group_id, index)}
                          >
                            <FaTrashAlt
                              className={commonstyle.Delete_icon_color}
                            />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className={commonstyle.no_data_found}>No Datas found</p>
          )}
          {total > 12 ? (
            <div className="col-12 float-start d-flex justify-content-center">
              <ReactPaginate
                breakLabel="..."
                nextLabel={<FaAngleDoubleRight />}
                onPageChange={handlePageClick}
                pageRangeDisplayed={5}
                pageCount={Math.ceil(total / 12)}
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
      </div>
    </>
  );
}
