import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router";
import { changeusergroupapi, viewuser } from "../../../Service/ApiService";
import Loader from "../../Loader";
import { Updategroupmap } from "../../Store/Config/Configuration";
import styles from "./user.module.css";
import DeleteConfirmationModal from "../../../Modalcomponents/DeleteConfirmationModal";
import { getCookie } from "../../../Utilities/Cookie";
import commonstyle from "../../../Assets/css/CommonStyle.module.css";
import { ExportedImages } from "../../../Utilities/ImageExport";

export default function Usergroup() {
  const [load, setload] = useState(false);
  const [grouplist, setlist] = useState();
  const [removestate, setremove] = useState(false);
  const [edit, setedit] = useState(true);
  const [type, settype] = useState();
  const [index, setindex] = useState();
  const { groupmap } = useSelector((state) => state);
  let dispatch = useDispatch();
  const [mpid, setid] = useState();
  const [grpid, setgrpid] = useState();
  let location = useLocation();
  const [conformation, setconf] = useState(false);
  const controllertype = localStorage.getItem("contollertype");
  let usertype = JSON.parse(getCookie("cookiedata"));

  useEffect(() => {
    usergroouplist();
  }, [removestate]);

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
    formdata.append("controller_type", parseInt(controllertype));

    viewuser(formdata)
      .then(({ data }) => {
        setlist(data);
        dispatch(Updategroupmap(data?.group));
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

  const toedit = (id, access) => {
    if (!edit) {
      let formdata = new FormData();
      formdata.append("mapping_id", id);
      formdata.append("access_type", type ? type : access);
      changeusergroupapi(formdata)
        .then((res) => {
          toast(res.data, { type: "success" });
          usergroouplist();
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
          groupid={grpid}
          Deletekey={6}
        />
      ) : null}

      <Loader isLoader={load} />
      {groupmap?.length > 0 ? (
        <div
          className={`total-motor ${styles.user_group_grid} 
        ${commonstyle.pagination_bottom}`}
        >
          {groupmap?.map((ele, ind) => {
            return (
              <div
                className={`${styles.user_bg} ${commonstyle.cards_border_radius}`}
                key={ind}
              >
                <div
                  className={`${styles.usercontainer} ${commonstyle.cards_padding}`}
                >
                  <div className={styles.userflex}>
                    <p className={commonstyle.margin_zero}>
                      <span className="tank-header">Group Name</span>
                      <span className={styles.userdata}>
                        -{ele?.group_name}
                      </span>
                    </p>
                    <button
                      type="button"
                      className={`${styles.user_group_remove_btn} ${commonstyle.btn_border_radius}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setindex(index);
                        setremove(!removestate);
                        setconf(true);
                        setid(ele?.group_mapping_id);
                        setgrpid(ele?.group_id);
                        // toremove(ele?.group_mapping_id,ele?.group_id,ind)}}>
                      }}
                    >
                      <FaTrashAlt className={commonstyle.Delete_icon_color} />{" "}
                      Remove
                    </button>
                    {/* <div className="motor-btn">
                   
                
                </div> */}
                  </div>
                  <div className={styles.userflex}>
                    <p className={commonstyle.margin_zero}>
                      <span className="tank-header">Access Type</span>
                      &nbsp;&nbsp;
                      {!edit && ind === index ? (
                        <select
                          type="text"
                          className={styles.editselect}
                          onChange={(e) => settype(e.target.value)}
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
                    {ele?.group_mapping_id ? (
                      <button
                        type="button"
                        className={`${styles.group_edit_btn} ${commonstyle.btn_border_radius}`}
                        disabled={edit || ind === index ? false : true}
                        onClick={(e) => {
                          e.stopPropagation();
                          toedit(ele?.group_mapping_id, ele?.access_type);
                          setindex(ind);
                          setedit(!edit);
                        }}
                      >
                        {!edit && ind === index ? (
                          <img src={ExportedImages.SAVE_ICON_BLUE} />
                        ) : (
                          <FaEdit />
                        )}{" "}
                        {!edit && ind === index ? "Save" : "Edit"}{" "}
                      </button>
                    ) : null}{" "}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className={commonstyle.no_data_found}>No Datas found</p>
      )}
    </>
  );
}
