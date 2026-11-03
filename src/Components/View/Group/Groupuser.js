import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaEdit,
  FaTrashAlt,
} from "react-icons/fa";
import { useLocation } from "react-router";
import {
  changeusergroupapi,
  listusergroupapi,
} from "../../../Service/ApiService";
import styles from "../Users/user.module.css";
import { useDispatch, useSelector } from "react-redux";
import {
  UpdateGroupFilters,
  Updategroupuser,
} from "../../Store/Config/Configuration";
import DeleteConfirmationModal from "../../../Modalcomponents/DeleteConfirmationModal";
import ReactPaginate from "react-paginate";
import commonstyle from "../../../Assets/css/CommonStyle.module.css";
import groupstyle from "../../View/Group/group.module.css";
import { ExportedImages } from "../../../Utilities/ImageExport";

export default function Groupuser() {
  let location = useLocation();
  const [type, settype] = useState();
  const [edit, setedit] = useState(true);
  const [index, setindex] = useState();
  const { groupuser } = useSelector((state) => state);
  const [conformation, setconf] = useState(false);
  const [mpid, setid] = useState();
  const [groupid, setgrpid] = useState();
  const [pagestate, setpage] = useState(1);
  const [value, setvalue] = useState(false);
  let controllertype = JSON.parse(localStorage.getItem("contollertype"));
  const { groupnames } = useSelector((state) => state);
  let dispatch = useDispatch();
  const FilterRef = useRef(null);
  FilterRef.current = groupnames;
  const [totaldatacount, settotaldata] = useState();
  const currentItems = groupuser;
  const pageCount = Math.ceil(totaldatacount / 12);
  const handlePageClick = (event) => {
    setpage(JSON.parse(event.selected) + 1);
  };

  useEffect(() => {
    usergroupdata();
  }, [pagestate]);

  useEffect(() => {
    const interval = setInterval(() => {
      usergroupdata();
    }, 2 * 60000);
    return () => clearInterval(interval);
  }, [pagestate]);

  const usergroupdata = () => {
    setvalue(true);
    let formdata = new FormData();
    formdata.append("controller_type", controllertype);
    formdata.append("group_id", location?.state?.groupid);
    // formdata.append("page", pagestate);
    // formdata.append("size", 10);

    if (FilterRef?.current?.user) {
      formdata.append("username", FilterRef?.current?.user);
    }
    listusergroupapi(formdata, pagestate)
      .then(({ data }) => {
        settotaldata(data?.total);
        dispatch(Updategroupuser(data?.items));
      })
      .catch((err) => {})
      .finally(() => setvalue(false));
  };

  const Items = ({ currentItems }) => {
    return (
      <>
        {currentItems?.length > 0 ? (
          <div className={styles.user_group_grid}>
            <>
              {currentItems?.map((ele, ind) => {
                return (
                  <div
                    className={`${groupstyle.group_bg} ${commonstyle.cards_border_radius}`}
                    key={ind}
                  >
                    <div
                      className={`${styles.usercontainer}  ${commonstyle.cards_padding}`}
                    >
                      <div className={styles.userflex}>
                        <p className={styles.userflexp}>
                          <span className="tank-header">User Name - </span>
                          <span className={styles.userdata}>
                            {ele?.username}
                          </span>
                        </p>
                        {ele?.group_mapping_id ? (
                          <button
                            type="button"
                            className={`${styles.group_edit_btn} ${commonstyle.btn_border_radius}`}
                            disabled={edit || ind === index ? false : true}
                            onClick={() => {
                              setedit(!edit);
                              setindex(ind);
                              toedit(ele?.group_mapping_id, ele?.access_type);
                            }}
                          >
                            {!edit && ind === index ? (
                              <img src={ExportedImages.SAVE_ICON_BLUE} />
                            ) : (
                              <FaEdit />
                            )}{" "}
                            {!edit && ind === index ? "save" : "edit"}{" "}
                          </button>
                        ) : null}
                      </div>
                      <div className={styles.userflex}>
                        <p className={commonstyle.margin_zero}>
                          <span className="tank-header">Access Type - </span>
                          {!edit && ind === index ? (
                            <select
                              type="text"
                              className={styles.editselect}
                              value={type}
                              onChange={(e) => settype(e.target.value)}
                            >
                              <option
                                value={0}
                                selected={ele?.access_type === 0 ? true : false}
                              >
                                Admin
                              </option>
                              <option
                                value={1}
                                selected={ele?.access_type === 1 ? true : false}
                              >
                                Control
                              </option>
                              <option
                                value={2}
                                selected={ele?.access_type === 2 ? true : false}
                              >
                                Operator
                              </option>
                              <option
                                value={3}
                                selected={ele?.access_type === 3 ? true : false}
                              >
                                View only
                              </option>
                            </select>
                          ) : (
                            <span className={styles.userdata}>
                              {ele?.access_type === 0
                                ? "Admin"
                                : ele?.access_type === 1
                                ? "Control"
                                : ele?.access_type === 2
                                ? "Operator"
                                : ele?.access_type === 3
                                ? "View Only"
                                : null}
                            </span>
                          )}
                        </p>
                        <button
                          type="button"
                          className={`${groupstyle.group_delete_btn} ${commonstyle.btn_border_radius}`}
                          onClick={() => {
                            setconf(true);
                            setindex(ind);
                            setgrpid(ele?.group_id);
                            setid(ele?.group_mapping_id);
                          }}
                        >
                          <FaTrashAlt
                            className={commonstyle.Delete_icon_color}
                          />{" "}
                          delete
                        </button>
                      </div>
                      {/* <div className={styles.userflex}>
                        <p className={styles.userflexp}>
                          <span className="tank-header">Created at - </span>
                          <span className={styles.userdata}>
                            {ele?.created_at}
                          </span>
                        </p></div> */}
                    </div>
                  </div>
                );
              })}
            </>
          </div>
        ) : (
          <p className={commonstyle.no_data_found}>No Datas found</p>
        )}
      </>
    );
  };

  const toedit = (id, access) => {
    if (!edit) {
      let formdata = new FormData();
      formdata.append("mapping_id", id);
      formdata.append("access_type", type ? type : access);
      changeusergroupapi(formdata)
        .then((res) => {
          toast(res.data, { type: "success" });
          usergroupdata();
        })
        .catch((err) => {
          toast(err.response.detail, { type: "error" });
        });
    }
  };

  useEffect(() => {
    if (location?.state) {
      dispatch(UpdateGroupFilters(location?.state?.GroupDatas));
    }
  }, [location?.state]);
  return (
    <>
      {conformation ? (
        <DeleteConfirmationModal
          show={conformation}
          close={() => setconf(false)}
          id={mpid}
          Deletekey={5}
          index={index}
          groupid={groupid}
        />
      ) : null}

      <Items currentItems={currentItems} />
      {totaldatacount > 12 ? (
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
          />
        </div>
      ) : null}
    </>
  );
}
