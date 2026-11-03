import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaKey } from "react-icons/fa";
import { Outlet, useLocation, useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import * as Yup from "yup";
import { editprofile, profile, viewuser } from "../../../Service/ApiService";
import { getCookie } from "../../../Utilities/Cookie";
import styles from "../profile/profile.module.css";
import classes from "../Users/user.module.css";
import commonstyle from "../../../Assets/css/CommonStyle.module.css";
import Changepassword from "../../../Modalcomponents/Changepassword";
import userstyle from "../../View/Users/user.module.css";
import { REGEX } from "../../../Utilities/Constants";
import { RemoveNonNumeric } from "../../../Utilities/Methods";
import { ExportedImages } from "../../../Utilities/ImageExport";
import { UpdateUserFilters } from "../../Store/Config/Configuration";
import { useDispatch, useSelector } from "react-redux";

const validate = Yup.object().shape({
  Name: Yup.string().required("Name is required"),
  username: Yup.string().required("User name is required"),
  email: Yup.string().matches(REGEX.EMAIL, "Email Id is invalid").nullable(),
  contact: Yup.string()
    .matches(REGEX.MOBILE_REGEX, "Contact No is invalid")
    .nullable(),
});

export default function Profileuser() {
  const {
    handleChange,
    handleSubmit,
    values,
    touched,
    errors,
    setFieldValue,
    setValues,
  } = useFormik({
    initialValues: {
      Name: "",
      username: "",
      email: "",
      contact: "",
      usertype: "",
      admintype: "",
    },
    validationSchema: validate,
    onSubmit: (values) => {
      toedit();
      save();
    },
  });
  const [editstate, setstate] = useState(true);
  let location = useLocation();
  const { state } = location;
  let navigate = useNavigate();
  const [iduser, setuserid] = useState();
  let dispatch = useDispatch();
  const { UserFilters } = useSelector((state) => state);
  // const controllermaplength = sessionStorage.getItem("controllermaplength");
  // const groupmaplength = sessionStorage.getItem("groupmaplength");
  const controllertype = localStorage.getItem("contollertype");
  let cookie = JSON.parse(getCookie("cookiedata"));
  let usertype = cookie?.user_type;
  const todashboard = () => {
    navigate(
      usertype == 1
        ? UserFilters?.values?.usertype === 2
          ? "/dashboard/user/viewuser/admin"
          : "/dashboard/user/viewuser/production"
        : "/dashboard/user/viewuser/subuser",
      { state: location?.state }
    );
  };

  const save = () => {
    if (!editstate) {
      setFieldValue("isLoader", true);
      let profiledata = {
        username: values?.username,
        name: values?.Name,
        email: values?.email,
        mobile_no: values?.contact,
        user_type: values?.usertype,
        admin_type: values?.admintype,
      };
      editprofile(profiledata, userid)
        .then((res) => {
          toast(res.data, { type: "success" });
          profileedit();
        })
        .catch((err) => {
          // if (err?.response?.data?.detail) {
          //   toast(err.response.data.detail, { type: "error" });
          // } else {
          //   toast("Something went wrong!!", { type: "error" });
          // }
          if (err?.response?.data?.detail?.[0]?.msg) {
            toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
          } else if (err?.response?.data?.detail) {
            toast(err?.response?.data?.detail, { type: "error" });
          } else {
            toast("Something went wrong!!", { type: "error" });
          }
          setstate(false);
        })
        .finally(() => setFieldValue("isLoader", false));
    }
  };
  let userid = location?.state?.userid;

  useEffect(() => {
    profileedit();
    // ForUserControllerandGroupListCount();
  }, []);

  useEffect(() => {
    if (state) {
      dispatch(UpdateUserFilters(state?.UserFilters));
    }
  }, [state]);

  const profileedit = () => {
    profile(userid).then(({ data }) => {
      setValues({
        ...values,
        Name: data?.name,
        username: data?.username,
        admintype: data?.admin_type,
        email: data?.email,
        contact: data?.mobile_no,
        usertype: data?.user_type,
      });
      setuserid(data?.user_id);
    });
  };
  const toedit = () => {
    setstate(!editstate);
  };

  const ForUserControllerandGroupListCount = () => {
    let formdata = new FormData();
    formdata.append("user_id", location?.state?.userid);
    formdata.append("controller_type", parseInt(controllertype));
    viewuser(formdata)
      .then(({ data }) => {
        sessionStorage.setItem("controllermaplength", data?.controller?.length);
        sessionStorage.setItem("groupmaplength", data?.group?.length);
      })
      .catch((err) => {});
  };

  const [show, setshow] = useState(false);

  const togroup = () => {
    navigate("/dashboard/user/userdetails/usergroup", {
      state: location?.state,
    });
  };
  const tocontroller = () => {
    navigate("/dashboard/user/userdetails/usercontroller", {
      state: location?.state,
    });
  };
  const [date, setdate] = useState(false);

  return (
    <>
      {show ? (
        <Changepassword show={show} close={() => setshow(false)} id={iduser} />
      ) : null}
      <div>
        <div className="router-pages">
          <div className="pre-page">
            <FaArrowLeft className="arrow" onClick={() => todashboard()} />
            <p
              className={`${styles.user_page_parent_head} 
              ${commonstyle.parent_heading_in_all_page}`}
            >
              User Details
            </p>
          </div>

          <div className={classes.useroutlet}>
            <div className={classes.profileuser}>
              <div className={classes.usercontainer}>
                <div className={classes.user_profile_edit_btn}>
                  {editstate ? (
                    <img
                      src={ExportedImages.EDIT_IMAGE}
                      className={styles.profileimg}
                      onClick={() => {
                        toedit();
                      }}
                    />
                  ) : (
                    <img
                      src={ExportedImages.SAVE_ICON_BLUE}
                      className={styles.profileimg}
                      onClick={handleSubmit}
                    />
                  )}
                </div>

                <div className={styles.profiledivflex}>
                  <div>
                    <div className={classes.profilenameflex}>
                      <p className={classes.useredit}>
                        <span className="tank-header">Name</span>
                      </p>
                      <div className={classes.profiledataflex}>
                        <p>-</p>
                        <p>
                          {editstate ? (
                            <span className={classes.userdata}>
                              {values?.Name}
                            </span>
                          ) : (
                            <span className={classes.usereditfield}>
                              <input
                                type="text"
                                className="notification"
                                value={values?.Name}
                                maxLength={50}
                                onChange={(e) =>
                                  setValues({ ...values, Name: e.target.value })
                                }
                              />
                              <span className="inputerror">{errors?.Name}</span>
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className={classes.profileusernameflex}>
                      <p className={classes.useredit}>
                        <span className="tank-header">User Name</span>
                      </p>
                      <div className={classes.profiledataflex}>
                        <p>-</p>
                        <p>
                          {editstate ? (
                            <span className={classes.userdata}>
                              {values?.username}
                            </span>
                          ) : (
                            <span className={classes.usereditfield}>
                              <input
                                type="text"
                                className="notification"
                                value={values?.username}
                                maxLength={50}
                                onChange={(e) =>
                                  setValues({
                                    ...values,
                                    username: e.target.value,
                                  })
                                }
                              />
                              <span className="inputerror">
                                {errors?.username}
                              </span>
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className={classes.profileusertypeflex}>
                      <p className={classes.useredit}>
                        <span className="tank-header">Password</span>
                      </p>
                      <div className={classes.profiledataflex}>
                        <p>-</p>
                        <p>
                          {editstate ? (
                            <span className={classes.userdata}>*******</span>
                          ) : (
                            <>
                              <input
                                type="text"
                                className="notification"
                                value="*******"
                                disabled
                              />
                              <FaKey
                                className={classes.editkey}
                                onClick={() => {
                                  setshow(true);
                                }}
                              />
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={classes.profileusertypeflex}>
                      <p>
                        <span className="tank-header">User Type</span>
                      </p>
                      <div className={classes.profiledataflex}>
                        <p>-</p>
                        <p>
                          <span className={classes.userdata}>
                            {values?.usertype === 1
                              ? "Super Admin"
                              : values?.usertype === 2
                              ? "Admin"
                              : values?.usertype === 3
                              ? "Sub User"
                              : values?.usertype === 4
                              ? "Production Unit"
                              : null}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className={classes.progilecontactflex}>
                      <p className={classes.useredit}>
                        <span className="tank-header">Contact No</span>
                      </p>
                      <div className={classes.profiledataflex}>
                        <p>-</p>
                        <p>
                          {editstate ? (
                            <span className={classes.userdata}>
                              {values?.contact}
                            </span>
                          ) : (
                            <span className={classes.usereditfield}>
                              <input
                                type="text"
                                className="notification"
                                value={values?.contact}
                                onChange={(e) =>
                                  setValues({
                                    ...values,
                                    contact: RemoveNonNumeric(e.target.value),
                                  })
                                }
                                maxLength={10}
                              />
                              <span className="inputerror">
                                {errors?.contact}
                              </span>
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className={classes.profileemailflex}>
                      <p className={classes.useredit}>
                        <span className="tank-header">Email Id</span>
                      </p>
                      <div className={classes.profiledataflex}>
                        <p>-</p>
                        <p>
                          {editstate ? (
                            <span className={classes.userdata}>
                              {values?.email}
                            </span>
                          ) : (
                            <span className={classes.usereditfield}>
                              <input
                                type="text"
                                className="notification"
                                value={values?.email}
                                onChange={(e) =>
                                  setValues({
                                    ...values,
                                    email: e.target.value,
                                  })
                                }
                              />
                              <span className="inputerror">
                                {errors?.email}
                              </span>
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {location?.state?.id === 1 ? null : (
              <>
                {" "}
                <div className={classes.delete_user_page_child_head}>
                  <div className={`${classes.pagehead} ${classes.newhead}`}>
                    <h3
                      className={styles.user_page_head}
                      onClick={() => togroup()}
                    >
                      Group
                      {/* ({groupmaplength}) */}
                    </h3>
                    <h3
                      className={styles.user_page_head}
                      onClick={() => tocontroller()}
                    >
                      Controller
                      {/* ({controllermaplength}) */}
                    </h3>
                  </div>
                  <p
                    className={`${userstyle.user_view_underline} ${commonstyle.margin_zero}`}
                  ></p>
                  <p
                    className={
                      location.pathname ===
                      "/dashboard/user/userdetails/usercontroller"
                        ? userstyle.user_con_linecol
                        : userstyle.user_group_linecol
                    }
                  ></p>
                </div>
                <Outlet />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
