import { FaArrowLeft } from "react-icons/fa";
import { RiSearchLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { groupdropdownapi, listuser } from "../../../Service/ApiService";
import styles from "../Users/user.module.css";
import {
  UpdateUserFilters,
  Updateuserlist
} from "../../Store/Config/Configuration";
import Loader from "../../Loader";
import { getCookie } from "../../../Utilities/Cookie";
import commonstyle from "../../../Assets/css/CommonStyle.module.css";
import CommonSelect from "../../CommonComponents/CommonSelect";
import { Checkbox } from "antd";

export default function Viewuser() {
  let navigate = useNavigate();
  let { state, pathname } = useLocation();
  let dispatch = useDispatch();
  const { UserFilters } = useSelector((state) => state);
  const [group, setgroup] = useState([]);
  const [groupid, setgroupid] = useState("");
  const [name, setname] = useState("");
  const [value, setvalue] = useState(false);
  const { userlist } = useSelector((state) => state);
  let cookie = JSON.parse(getCookie("cookiedata"));
  const [empty_user, setempty_user] = useState(0);
  let usertype = cookie?.user_type;

  const handleAddUser = () => {
    navigate("/dashboard/user/adduser", {
      state: {
        UserFilters: GetFilterDatas()
      }
    });
  };
  const getGroupList = () => {
    groupdropdownapi().then(({ data }) => {
      if (data) {
        let finalOptions = data?.map((ele) => ({
          ...ele,
          label: ele?.group_name,
          value: ele?.group_id
        }));
        setgroup([{ label: "All", value: 0 }, ...finalOptions]);
      } else {
        setgroup([]);
      }
    });
  };

  const handleListUser = (
    Current_group = "",
    is_empty = null,
    page = 1,
    newType = false,
    userName = ""
  ) => {
    setvalue(true);
    let formdata = new FormData();
    if (newType) {
      formdata.append("user_type", newType);
    } else if (usertype === 2) {
      formdata.append("user_type", 3);
    } else {
      formdata.append(
        "user_type",
        pathname === "/dashboard/user/viewuser/production" ? 4 : 2
      );
    }
    if (!newType) {
      if (Current_group === 0 || Current_group) {
        formdata.append("group_id", Current_group ? Current_group : "");
      } else if (groupid >= 0 || state?.groups) {
        formdata.append(
          "group_id",
          groupid >= 0 ? (groupid ? groupid : "") : state?.groups
        );
      }
      if (is_empty === 1 || (is_empty === null && empty_user === 1)) {
        formdata.append(
          "empty_user",
          is_empty === 1
            ? is_empty
            : is_empty === null && empty_user === 1
            ? 1
            : 0
        );
      }
      if (name || userName) {
        formdata.append("name", userName ? userName : name);
      }
    }
    listuser(formdata, page)
      .then(({ data }) => {
        dispatch(Updateuserlist(data));
      })
      .catch((err) => {})
      .finally(() => setvalue(false));
  };

  const toproduction = () => {
    handleListUser("", null, 1, 4);
    setname("");
    setempty_user(0);
    setgroupid("");
    navigate("/dashboard/user/viewuser/production", { state: state });
  };
  const toadmin = () => {
    handleListUser("", null, 1, 2);
    setname("");
    setempty_user(0);
    setgroupid("");

    navigate("/dashboard/user/viewuser/admin", { state: state });
  };
  const GetFilterDatas = () => {
    return {
      page: userlist?.page || 1,
      values: {
        is_empty: empty_user || "",
        usertype:
          pathname === "/dashboard/user/viewuser/admin"
            ? 2
            : pathname === "/dashboard/user/viewuser/production"
            ? 4
            : 3,
        group_id: groupid || "",
        name: name || ""
      }
    };
  };
  const todeleteuser = () => {
    if (usertype === 1) {
      navigate("/dashboard/user/deleteuser/admin", {
        state: {
          UserFilters: GetFilterDatas()
        }
      });
    } else if (usertype === 2) {
      navigate("/dashboard/user/deleteuser/subuser", {
        state: {
          UserFilters: GetFilterDatas()
        }
      });
    }
  };

  useEffect(() => {
    getGroupList();
    handleListUser(
      UserFilters?.values?.group_id || "",
      UserFilters?.values?.is_empty || "",
      UserFilters?.page || 1,
      false,
      UserFilters?.values?.name || ""
    );
    setname(UserFilters?.values?.name);
    setgroupid(UserFilters?.values?.group_id);
    setempty_user(UserFilters?.values?.is_empty);
    dispatch(
      UpdateUserFilters({
        page: 1,
        values: {
          is_empty: 0,
          usertype: "",
          group_id: "",
          name: ""
        }
      })
    );
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      handleListUser();
    }, 2 * 60000);
    return () => clearInterval(interval);
  }, [userlist?.page, groupid, empty_user, name]);

  return (
    <>
      <Loader isLoader={value}></Loader>
      <div className="router-pages">
        <div className={`${styles.user_head}`}>
          <div className="pre-page">
            <FaArrowLeft
              className="arrow"
              onClick={() => {
                navigate("/dashboard");
              }}
            />
            <p
              className={`${styles.user_page_parent_head} 
              ${commonstyle.parent_heading_in_all_page}`}
            >
              all user details({userlist?.total})
            </p>
          </div>
          <div className={styles.top_buttons}>
            <button
              type="button"
              className={`${styles.delete_user_btn} ${commonstyle.btn_border_radius}`}
              onClick={() => todeleteuser()}
            >
              {/* <FaTrashAlt className={commonstyle.Delete_icon_color} /> */}
              &nbsp;Delete User
            </button>
            <button
              type="button"
              className={`${styles.add_user_btn} ${commonstyle.btn_border_radius}`}
              onClick={() => handleAddUser()}
            >
              Add user
            </button>
          </div>
        </div>

        <div className={styles.headGrb}>
          {usertype === 2 ? null : (
            <div>
              <div className={styles.pagehead}>
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

              <p className={styles.user_underline}></p>
              <p
                className={
                  pathname === "/dashboard/user/viewuser/production"
                    ? styles.user_production_yelline
                    : styles.user_admin_yelline
                }
              ></p>
            </div>
          )}

          <div
            className={styles.searchblok}
            style={{ flexDirection: usertype === 2 ? "row-reverse" : "row" }}
          >
            <div className={styles.emptyGroupContainer}>
              <Checkbox
                className="CheckBox_innerStyle"
                checked={empty_user}
                onClick={() => {
                  let data = empty_user === 1 ? 0 : 1;
                  setempty_user(data);
                  handleListUser("", data);
                }}
              />
              <p>Empty User</p>
            </div>
            <div className={styles.searchbar}>
              <CommonSelect
                placeholder={"Group"}
                options={group}
                onChange={(e) => {
                  handleListUser(e);
                  // settest(e);
                  setgroupid(e);
                }}
                value={groupid ? groupid : "All"}
                OtherClassName={"searchInputClass"}
                allowClear={false}
              />
              {/* <select
                type="text"
                name="group"
                className={styles.selectbar}
                onClick={() => handleListUser()}
                onChange={(e) => {
                  settest(e.target.value);
                  setgroupid(e.target.value);
                }}
              >
                <option disabled hidden>
                  group
                </option>
                <option value={0}>All</option>
                {group?.map((ele, index) => {
                  return (
                    <option
                      key={index}
                      value={ele?.group_id}
                      selected={test == ele?.group_id ? true : false}
                    >
                      {ele?.group_name}
                    </option>
                  );
                })}
              </select> */}
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
                onClick={() => handleListUser()}
              />
            </div>
          </div>
        </div>
        <div className={commonstyle.pagination_bottom}>
          <Outlet
            context={{
              name: name,
              groupid: groupid,
              empty_user: empty_user,
              handleListUser
            }}
          />
        </div>
      </div>
    </>
  );
}
