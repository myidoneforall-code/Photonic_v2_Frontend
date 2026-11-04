import { useEffect, useState } from "react";
import { FaTrashAlt, FaArrowLeft } from "react-icons/fa";
import { Outlet, useLocation, useNavigate } from "react-router";
import styles from "../Users/user.module.css";
import { RiSearchLine } from "react-icons/ri";
import {
  UpdateUserFilters,
  Updateuserlist,
} from "../../Store/Config/Configuration";
import Loader from "../../Loader";
import { listuser } from "../../../Service/ApiService";
import { useDispatch, useSelector } from "react-redux";
import { getCookie } from "../../../Utilities/Cookie";
import commonstyle from "../../../Assets/css/CommonStyle.module.css";
import { NavigateToPreviousScreen } from "../../../Utilities/Methods";

export default function Deleteuser() {
  let { userlist } = useSelector((state) => state);
  let navigate = useNavigate();
  const { state } = useLocation();
  const [name, setname] = useState();
  const [value, setvalue] = useState(false);
  let location = useLocation();
  let cookie = JSON.parse(getCookie("cookiedata"));
  let usertype = cookie?.user_type;
  const { page } = userlist;
  const { UserFilters } = useSelector((state) => state);
  let dispatch = useDispatch();
  const todashboard = () => {
    navigate(NavigateToPreviousScreen(usertype, UserFilters?.values?.usertype));
  };

  const handleDeleteUserList = (page = 1, userType = null) => {
    setvalue(true);
    let formdata = new FormData();
    if (userType) {
      formdata.append("user_type", userType);
    } else if (usertype === 2) {
      formdata.append("user_type", 3);
    } else {
      formdata.append(
        "user_type",
        location.pathname === "/dashboard/user/deleteuser/production" ? 4 : 2
      );
    }
    if (name && !userType) {
      formdata.append("name", name);
    }
    listuser(formdata, page)
      .then(({ data }) => {
        dispatch(Updateuserlist(data));
      })
      .catch((err) => {})
      .finally(() => setvalue(false));
  };

  const toproduction = () => {
    handleDeleteUserList(1, 4);
    setname("");
    navigate("/dashboard/user/deleteuser/production", {
      state: { ...location.state },
    });
  };
  const toadmin = () => {
    setname("");
    handleDeleteUserList(1, 2);
    navigate("/dashboard/user/deleteuser/admin", {
      state: { ...location.state },
    });
  };

  useEffect(() => {
    handleDeleteUserList(1);
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      handleDeleteUserList(page);
    }, 60000);
    return () => clearInterval(interval);
  }, [page, name]);

  useEffect(() => {
    if (state?.UserFilters) {
      dispatch(UpdateUserFilters(state?.UserFilters));
    }
  }, [state]);
  return (
    <>
      <Loader isLoader={value}></Loader>
      <div>
        <div className="router-pages">
          <div
            className={
              usertype == 1
                ? `${styles.user_head}`
                : `${styles.user_head} ${styles.delete_subuser_page_parent_head}`
            }
          >
            <div className="pre-page">
              <FaArrowLeft className="arrow" onClick={() => todashboard()} />
              <p
                className={`${styles.user_page_parent_head} 
              ${commonstyle.parent_heading_in_all_page}`}
              >
                all user details
              </p>
            </div>
            <div className={styles.searchblok}>
              <div className={styles.searchbar}>
                <input
                  type="text"
                  name="name"
                  value={name}
                  className={styles.inputbar}
                  placeholder="search here...."
                  onChange={(e) => setname(e.target.value)}
                />

                <RiSearchLine
                  className={styles.searchicon}
                  onClick={() => handleDeleteUserList(1)}
                />
              </div>
            </div>
          </div>
          {usertype === 2 ? null : (
            <div className={styles.delete_user_page_child_head}>
              <div className={styles?.pagehead}>
                <h3
                  className={`${styles.user_page_child_head} 
                  ${commonstyle.child_heading_in_all_page}`}
                  onClick={() => {
                    toadmin();
                  }}
                >
                  Admin
                </h3>
                <h3
                  className={`${styles.user_page_child_head} 
                  ${commonstyle.child_heading_in_all_page}`}
                  onClick={() => {
                    toproduction();
                  }}
                >
                  Production unit
                </h3>
              </div>
              <p className={styles.delete_user_underline}></p>
              <p
                className={
                  location.pathname === "/dashboard/user/deleteuser/production"
                    ? styles.deleteuser_prounit_yell_line
                    : styles.deleteuser_admin_yell_line
                }
              ></p>
            </div>
          )}

          <div className={commonstyle.pagination_bottom}>
            <Outlet
              context={{
                handleDeleteUserList,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
