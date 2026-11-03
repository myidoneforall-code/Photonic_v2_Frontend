import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router";
import DeleteConfirmationModal from "../../../Modalcomponents/DeleteConfirmationModal";
import { changeusercontrollerapi, viewuser } from "../../../Service/ApiService";
import Loader from "../../Loader";
import { Updatecontrollermap } from "../../Store/Config/Configuration";
import styles from "./user.module.css";
import { getCookie } from "../../../Utilities/Cookie";
import commonstyle from "../../../Assets/css/CommonStyle.module.css";
import { ExportedImages } from "../../../Utilities/ImageExport";

export default function Usercontroller() {
  const [load, setload] = useState(false);
  const [edit, setedit] = useState(true);
  const [grouplist, setlist] = useState();
  const [access, setaccess] = useState();
  const [index, setindex] = useState();
  const { controllermap } = useSelector((state) => state);
  let dispatch = useDispatch();
  let location = useLocation();
  const [mpid, setid] = useState();
  const [conformation, setconf] = useState();
  const controllertype = localStorage.getItem("contollertype");
  let usertype = JSON.parse(getCookie("cookiedata"));

  useEffect(() => {
    usergroouplist();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      usergroouplist();
    }, 2 * 60000);
    return () => clearInterval(interval);
  }, []);

  const usergroouplist = () => {
    setload(true);
    let formdata = new FormData();
    formdata.append("user_id", location?.state?.userid);
    formdata.append("controller_type", controllertype);
    viewuser(formdata)
      .then(({ data }) => {
        dispatch(Updatecontrollermap(data?.controller));

        // toast(res.data,{type:'success'})
      })
      .catch((err) => {
        // toast(err?.response?.detail, { type: "error" });
        if (err?.response?.data?.detail?.[0]?.msg) {
          toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
        } else if (err?.response?.data?.detail) {
          toast(err?.response?.data?.detail, { type: "error" });
        } else {
          toast("Something went wrong!!", { type: "error" });
        }
      })
      .finally(() => setload(false));
  };

  const toedit = (id, type) => {
    if (!edit) {
      setaccess("");
      let formdata = new FormData();
      formdata.append("mapping_id", id);
      formdata.append("access_type", access ? access : type);
      changeusercontrollerapi(formdata)
        .then((res) => {
          usergroouplist();
          toast(res.data, { type: "success" });
        })
        .catch((err) => {
          // toast(err?.response?.detail, { type: "error" });
          if (err?.response?.data?.detail?.[0]?.msg) {
            toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
          } else if (err?.response?.data?.detail) {
            toast(err?.response?.data?.detail, { type: "error" });
          } else {
            toast("Something went wrong!!", { type: "error" });
          }
        });
    }
  };

  return (
    <>
      {conformation ? (
        <DeleteConfirmationModal
          show={conformation}
          close={() => setconf(false)}
          id={mpid}
          index={index}
          motor-btn
          Deletekey={7}
        />
      ) : null}

      <Loader isLoader={load} />
      {controllermap?.length > 0 ? (
        <div
          className={`total-motor ${styles.user_group_grid}
        ${commonstyle.pagination_bottom}`}
        >
          <>
            {controllermap?.map((ele, ind) => {
              return (
                <div
                  className={`${styles.user_bg} ${commonstyle.cards_border_radius}`}
                  key={ind}
                >
                  <div
                    className={`${styles.user_controller_parent_div} ${commonstyle.cards_padding}`}
                  >
                    <div className={styles.user_controller_firstchild_div}>
                      <p className={`tank-usage ${commonstyle.margin_zero}`}>
                        <span className="tank-header">controller ID</span>
                        <span className={styles.userdata}>
                          -{ele?.controller_code}
                        </span>
                      </p>
                      <p className={`tank-usage ${commonstyle.margin_zero}`}>
                        <span className="tank-header">Access Type</span>
                        &nbsp;&nbsp;
                        {!edit && ind === index ? (
                          <select
                            type="text"
                            className={styles.editselect}
                            onChange={(e) => setaccess(e.target.value)}
                          >
                            {usertype?.user_type === 2 ? null : (
                              <option
                                value={0}
                                selected={ele?.access_type === 0 ? true : false}
                              >
                                Admin
                              </option>
                            )}
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
                            -
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
                      <p
                        className={`${commonstyle.margin_zero} ${styles.user_controller_name_name}`}
                      >
                        <span className="tank-header">controller Name</span>
                        <span className={styles.userdata}>
                          -{ele?.controller_name}
                        </span>
                      </p>
                    </div>
                    <div className={styles.user_controller_secondchild_div}>
                      <button
                        type="button"
                        className={`${styles.user_group_remove_btn} ${commonstyle.btn_border_radius}`}
                        onClick={
                          (e) => {
                            e.stopPropagation();
                            setconf(true);
                            setid(ele?.mapping_id);
                            setindex(ind);
                          }

                          // toremove(ele?.mapping_id, ind)}
                        }
                      >
                        <FaTrashAlt className={commonstyle.Delete_icon_color} />{" "}
                        Remove
                      </button>
                      <button
                        type="button"
                        className={`${styles.group_edit_btn} ${commonstyle.btn_border_radius}`}
                        disabled={edit || ind === index ? false : true}
                        onClick={(e) => {
                          e.stopPropagation();
                          toedit(ele?.mapping_id, ele?.access_type);
                          setindex(ind);
                          setedit(!edit);
                        }}
                      >
                        {!edit && ind === index ? (
                          <>
                            <img src={ExportedImages.SAVE_ICON_BLUE} />
                            &nbsp; save
                          </>
                        ) : (
                          <>
                            {" "}
                            <FaEdit /> Edit
                          </>
                        )}
                      </button>
                    </div>
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
}
