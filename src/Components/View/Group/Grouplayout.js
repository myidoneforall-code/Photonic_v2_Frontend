import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { RiSearchLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router";
import {
  listcontrollergroupapi,
  listusergroupapi,
} from "../../../Service/ApiService";
import Loader from "../../Loader";
import {
  Updategroupcontroller,
  UpdateGroupFilters,
  Updategroupnames,
  Updategroupuser,
} from "../../Store/Config/Configuration";
import styles from "../Users/user.module.css";
import groupstyle from "./group.module.css";
import commonstyle from "../../../Assets/css/CommonStyle.module.css";

export default function Grouplayout() {
  let navigate = useNavigate();
  let location = useLocation();
  const { groupnames } = useSelector((state) => state);
  const [value, setvalue] = useState(false);
  const [name, setname] = useState();
  const [searchstate, setstate] = useState("");
  const [pagestate, setpage] = useState();
  let dispatch = useDispatch();

  useEffect(() => {
    if (searchstate !== "") {
      todispatchdata();
    }
  }, [searchstate]);

  let controllertype = JSON.parse(localStorage.getItem("contollertype"));

  const todispatchdata = () => {
    if (location?.pathname === "/dashboard/group/auth/groupuser") {
      setvalue(true);
      dispatch(Updategroupnames({ ...groupnames, user: name }));
      let formdata = new FormData();
      formdata.append("controller_type", controllertype);
      formdata.append("group_id", location?.state?.groupid);
      if (name) {
        formdata.append("username", name);
      }
      listusergroupapi(formdata, 1)
        .then(({ data }) => {
          dispatch(Updategroupuser(data?.items));
        })
        .catch((err) => {})
        .finally(() => setvalue(false));
    } else if (location?.pathname === "/dashboard/group/auth/groupcontroller") {
      dispatch(Updategroupnames({ ...groupnames, controller: name }));

      setvalue(true);
      let formdata = new FormData();
      formdata.append("controller_type", controllertype);
      formdata.append("group_id", location?.state?.groupid);
      if (name) {
        formdata.append("controller_name", name);
      }
      listcontrollergroupapi(formdata, 1)
        .then(({ data }) => {
          dispatch(Updategroupcontroller(data?.items));
        })
        .finally(() => setvalue(false));
    }
  };

  const todashboard = () => {
    navigate("/dashboard/group");
  };

  const tocontroller = () => {
    setname("");
    setpage(1);
    navigate("/dashboard/group/auth/groupcontroller", {
      state: location?.state,
    });
  };

  const touser = () => {
    setname("");
    setpage(2);
    navigate("/dashboard/group/auth/groupuser", { state: location?.state });
  };

  return (
    <>
      <Loader isLoader={value}></Loader>
      <div>
        <div className="router-pages">
          <div className={`${styles.user_head}`}>
            <div className="pre-page">
              <FaArrowLeft className="arrow" onClick={() => todashboard()} />
              <p
                className={`${styles.user_page_parent_head} 
              ${commonstyle.parent_heading_in_all_page}`}
              >
                {location?.state?.groupname}
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
                  onClick={() => setstate(!searchstate)}
                />
              </div>
            </div>
          </div>
          <div className={groupstyle.group_child_head}>
            <div className={styles.pagehead}>
              <h3
                className={`${styles.user_page_child_head} ${commonstyle.child_heading_in_all_page}`}
                onClick={() => {
                  setstate("");
                  tocontroller();
                  dispatch(
                    Updategroupnames({
                      ...groupnames,
                      controller: "",
                      user: "",
                    })
                  );
                }}
              >
                Controller
              </h3>
              <h3
                className={`${styles.user_page_child_head} ${commonstyle.child_heading_in_all_page}`}
                onClick={() => {
                  setstate("");
                  touser();
                  dispatch(
                    Updategroupnames({
                      ...groupnames,
                      controller: "",
                      user: "",
                    })
                  );
                }}
              >
                User
              </h3>
            </div>
            <p className={groupstyle.group_underline}></p>
            <p
              className={
                location?.pathname === "/dashboard/group/auth/groupcontroller"
                  ? groupstyle.group_groupconcol
                  : groupstyle.group_groupusercol
              }
            ></p>
          </div>
          <div className={commonstyle.pagination_bottom}>
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}
