import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaKey } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router";
import * as Yup from "yup";
import {
  editprofile,
  profile,
  UpdateProfileImage
} from "../../../Service/ApiService";
import styles from "../profile/profile.module.css";
import Setpassword from "../../../Modalcomponents/Setpassword";
import { Updatewebtest } from "../../Store/Config/Configuration";
import { GetCookieStorage } from "../../../Utilities/Storage";
import { getCatchMsg, RemoveNonNumeric } from "../../../Utilities/Methods";
import { REGEX } from "../../../Utilities/Constants";
import { ExportedImages } from "../../../Utilities/ImageExport";
import DeleteConfirmationModal from "../../../Modalcomponents/DeleteConfirmationModal";

const validate = Yup.object().shape({
  Name: Yup.string().required("Name is required"),
  username: Yup.string().required("User Name is required"),
  email: Yup.string().matches(REGEX.EMAIL, "Email Id is invalid"),
  contact: Yup.string()
    .matches(REGEX.MOBILE_REGEX, "Contact No is invalid")
    .nullable()
});

export default function Userprofile() {
  const formik = useFormik({
    initialValues: {
      Name: "",
      username: "",
      email: "",
      contact: "",
      usertype: "",
      admintype: "",
      webtext: ""
    },
    validationSchema: validate,
    onSubmit: (values) => {
      save();
    }
  });
  const [ShowLogoutModal, setShowLogoutModal] = useState(false);
  const [show, setshow] = useState(false);
  const [editstate, setstate] = useState(true);
  let location = useLocation();
  let navigate = useNavigate();
  const [profiledata, setprofiledate] = useState();
  const { webtest } = useSelector((state) => state);
  let dispatch = useDispatch();
  let webtextdata = sessionStorage.getItem("webtext");

  const todashboard = () => {
    navigate(location?.state?.pevpath, { state: location?.state });
  };

  const save = () => {
    let profiledata = {
      username: formik?.values?.username,
      name: formik?.values?.Name,
      email: formik?.values?.email,
      mobile_no: formik?.values?.contact?.toString(),
      user_type: formik?.values?.usertype,
      admin_type: formik?.values?.admintype,
      web_text: formik?.values?.webtext
    };
    editprofile(profiledata, type?.user_id)
      .then((res) => {
        toast(res?.data, { type: "success" });
        toprofilepage();
        navigate(-1);
        setstate(!editstate);
      })
      .catch((err) => {
        // toast(err?.response?.data?.detail, { type: "error" });
        if (err?.response?.data?.detail?.[0]?.msg) {
          toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
        } else if (err?.response?.data?.detail) {
          toast(err?.response?.data?.detail, { type: "error" });
        } else {
          toast("Something went wrong!!", { type: "error" });
        }
      });
  };
  let type = JSON.parse(GetCookieStorage("cookiedata"));

  useEffect(() => {
    toprofilepage();
  }, []);

  const toprofilepage = () => {
    profile(type?.user_id)
      .then(({ data }) => {
        setprofiledate(data);
        formik.setValues({
          ...formik.values,
          Name: data?.name,
          username: data?.username,
          admintype: data?.admin_type,
          email: data?.email,
          contact: data?.mobile_no,
          usertype: data?.user_type,
          webtext: data?.web_text,
          profileimg: data?.profile_img
        });
        dispatch(Updatewebtest(data?.web_text));
        sessionStorage.setItem("webtext", data?.web_text);
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
  };

  const toedit = () => {
    formik.setValues({
      ...formik.values,
      Name: profiledata?.name,
      username: profiledata?.username,
      admintype: profiledata?.admin_type,
      email: profiledata?.email,
      contact: profiledata?.mobile_no,
      usertype: profiledata?.user_type,
      webtext: profiledata?.web_text,
      profileimg: profiledata?.profile_img
    });
    setstate(!editstate);
  };
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file)); // For image preview
    }
  };

  const handleUpdateImage = () => {
    // if (!selectedImage) {
    //   toast.error("Please select an image before saving");
    //   return;
    // }

    const formdata = new FormData();
    formdata.append("user_id", type?.user_id);
    if (selectedImage) {
      formdata.append("profile_img", selectedImage);
    } else {
      formdata.append("is_remove", 1);
    }

    UpdateProfileImage(formdata)
      .then((res) => {
        if (res?.data) {
          toast.success(
            res?.data?.msg || "Profile image updated successfully!"
          );
        }
      })
      .catch((err) => getCatchMsg(err));
  };
  console.log(formik.values, "values1231");

  return (
    <>
      {ShowLogoutModal ? (
        <DeleteConfirmationModal
          Deletekey={10}
          close={() => setShowLogoutModal(false)}
          show={ShowLogoutModal}
          msg={
            "Your password has been changed successfully. You will be redirected to the login page."
          }
          autoLogoutModal={true}
        />
      ) : null}
      {show ? (
        <Setpassword
          show={show}
          close={(isSuccess) => {
            setshow(false);
            if (isSuccess) {
              setShowLogoutModal(true);
            }
          }}
        />
      ) : null}
      <div className="controller-bottom">
        <div className="router-pages">
          <div className="controller-head">
            <div className="pre-page">
              <FaArrowLeft className="arrow" onClick={() => todashboard()} />
              <p className="controller-name">profile</p>
            </div>
          </div>
          <div className={styles.prouser}>
            <img
              src={
                formik?.values?.profileimg
                  ? formik?.values?.profileimg
                  : ExportedImages.USER_PROFILE_IMAGE
              }
              className={styles.userimg}
            />
            <img
              src={ExportedImages.EDIT_IMAGE}
              className={styles.editprofile}
              onClick={() => {
                toedit();
              }}
            />
          </div>

          <form
            className="add-form row justify-content-center"
            onSubmit={formik.handleSubmit}
          >
            <div className="select-div col-md-5 col-sm-12">
              <label className="modal-label">
                Name<span className="star">*</span>
              </label>

              <input
                type="text"
                className={editstate ? `${styles.userinput}` : "input-field"}
                placeholder="Name"
                id="Name"
                name="Name"
                maxLength={50}
                value={formik.values?.Name}
                disabled={editstate}
                onChange={(e) =>
                  formik.setValues({ ...formik.values, Name: e.target.value })
                }
              ></input>
              {formik?.errors?.Name && formik?.touched?.Name ? (
                <p className="inputerror">{formik?.errors?.Name}</p>
              ) : null}
            </div>
            <div className="select-div col-md-5 col-sm-12">
              <label className="modal-label">User Type</label>
              <input
                type="text"
                className={editstate ? `${styles.userinput}` : "input-field"}
                placeholder="usertype"
                id="usertype"
                name="usertype"
                disabled
                onChange={(e) =>
                  formik.setValues({
                    ...formik.values,
                    usertype: e.target.value
                  })
                }
                value={
                  formik.values?.usertype === 1
                    ? "Super Admin"
                    : formik.values?.usertype === 2
                    ? "Admin"
                    : formik.values?.usertype === 3
                    ? "sub user"
                    : formik.values?.usertype === 4
                    ? "production unit"
                    : null
                }
              ></input>
            </div>
            <div className="select-div col-md-5 col-sm-12">
              <label className="modal-label">
                User Name <span className="star">*</span>
              </label>
              <input
                type="text"
                className={editstate ? `${styles.userinput}` : "input-field"}
                placeholder="User Name"
                id="username"
                name="username"
                disabled={editstate}
                maxLength={50}
                value={formik.values?.username}
                onChange={(e) =>
                  formik.setValues({
                    ...formik.values,
                    username: e.target.value
                  })
                }
              ></input>
              {formik?.errors?.username && formik?.touched?.username ? (
                <p className="inputerror">{formik?.errors?.username}</p>
              ) : null}
            </div>
            <div className="select-div col-md-5 col-sm-12">
              <label className="modal-label">
                Contact Number
                {/* <span className="star">*</span> */}
              </label>
              <input
                type="text"
                className={editstate ? `${styles.userinput}` : "input-field"}
                placeholder="Contact Number"
                id="contact"
                name="contact"
                maxLength={10}
                disabled={editstate}
                value={formik.values?.contact}
                onChange={(e) =>
                  formik.setValues({
                    ...formik.values,
                    contact: RemoveNonNumeric(e.target.value)
                  })
                }
              ></input>
              {formik?.errors?.contact && formik?.touched?.contact ? (
                <p className="inputerror">{formik?.errors?.contact}</p>
              ) : null}
            </div>
            <div className="select-div col-md-5 col-sm-12">
              <label className="modal-label">
                Password <span className="star">*</span>
              </label>
              <div className="w-100">
                <input
                  type="text"
                  className={editstate ? `${styles.userinput}` : "input-field"}
                  placeholder="Password"
                  id="Password"
                  name="Password"
                  value="*******"
                  disabled
                ></input>
                <FaKey
                  className={styles.editpwd}
                  onClick={() => {
                    setshow(!editstate ? true : false);
                  }}
                />
              </div>
            </div>
            <div className="select-div col-md-5 col-sm-12">
              <label className="modal-label">
                Email-ID
                {/* <span className="star">*</span> */}
              </label>
              <input
                type="text"
                className={editstate ? `${styles.userinput}` : "input-field"}
                placeholder="email"
                id="email"
                name="email"
                disabled={editstate}
                value={formik.values?.email}
                onChange={(e) =>
                  formik.setValues({ ...formik.values, email: e.target.value })
                }
              ></input>
              {formik?.errors?.email && formik?.touched?.email ? (
                <p className="inputerror">{formik?.errors?.email}</p>
              ) : null}
            </div>

            <div className="select-div col-md-5 col-sm-12">
              <label className="modal-label">Display name</label>
              <input
                type="text"
                className={editstate ? `${styles.userinput}` : "input-field"}
                placeholder="webtext"
                id="webtext"
                name="webtext"
                disabled={editstate}
                onChange={(e) => {
                  formik.setValues({
                    ...formik.values,
                    webtext: e.target.value
                  });
                }}
                defaultValue={formik.values?.webtext}
              ></input>
            </div>
            <div
              className="select-div col-md-5 col-sm-12"
              style={{
                backgroundColor: "#f9fafb",
                padding: "15px 22px",
                borderRadius: "12px",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <label
                className="modal-label"
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#333",
                  marginBottom: "12px"
                }}
              >
                Profile Image (512 ✖ 512)
              </label>

              {/* Image Preview */}
              <div
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "3px solid #e0e0e0",
                  marginBottom: "10px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                  position: "relative"
                }}
              >
                <img
                  src={
                    preview
                      ? preview
                      : formik?.values?.profileimg
                      ? formik?.values?.profileimg
                      : ExportedImages.HOMEPAGE_BANNER1
                  }
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                  }}
                />
              </div>

              {/* Delete Button */}

              {/* Upload & Save Row */}
              {!editstate && (
                <>
                  {preview || formik?.values?.profileimg ? (
                    <button
                      type="button"
                      onClick={() => {
                        formik.setFieldValue("profileimg", "");

                        setPreview(null);
                      }}
                      style={{
                        backgroundColor: "#dc3545",
                        color: "white",
                        padding: "6px 14px",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "500",
                        marginBottom: "15px",
                        transition: "all 0.3s ease"
                      }}
                      onMouseOver={(e) =>
                        (e.target.style.backgroundColor = "#b02a37")
                      }
                      onMouseOut={(e) =>
                        (e.target.style.backgroundColor = "#dc3545")
                      }
                    >
                      Delete Image
                    </button>
                  ) : null}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "10px",
                      width: "100%"
                    }}
                  >
                    <label
                      htmlFor="fileInput"
                      style={{
                        backgroundColor: "#007bff",
                        color: "white",
                        padding: "8px 15px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                        transition: "all 0.3s ease"
                      }}
                      onMouseOver={(e) =>
                        (e.target.style.backgroundColor = "#0056b3")
                      }
                      onMouseOut={(e) =>
                        (e.target.style.backgroundColor = "#007bff")
                      }
                    >
                      Choose Image
                    </label>

                    <input
                      id="fileInput"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />

                    <button
                      type="button"
                      onClick={handleUpdateImage}
                      style={{
                        backgroundColor: "#28a745",
                        color: "#fff",
                        padding: "8px 18px",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                        transition: "all 0.3s ease"
                      }}
                      onMouseOver={(e) =>
                        (e.target.style.backgroundColor = "#218838")
                      }
                      onMouseOut={(e) =>
                        (e.target.style.backgroundColor = "#28a745")
                      }
                    >
                      Save
                    </button>
                  </div>
                </>
              )}
            </div>
          </form>

          <div className="col-md-1 col-sm-12 m-auto">
            {!editstate ? (
              <button
                type="button"
                className={styles.usersave}
                onClick={() => {
                  formik.handleSubmit();
                }}
              >
                Save
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
