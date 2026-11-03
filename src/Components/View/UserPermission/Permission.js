import React, { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import Loader from "../../Loader";
import classes from "../Report/reports.module.css";
import { useNavigate } from "react-router";
import {
  EditUserPermission,
  userdropdown,
  ViewUserPermission
} from "../../../Service/ApiService";
import { Button, Checkbox, Typography, Divider } from "@mui/material";
import CommonSelect from "../../CommonComponents/CommonSelect";
import CommonInput from "../../CommonComponents/CommonInput";
import toast from "react-hot-toast";

export default function Permission() {
  const [loader, setloader] = useState(false);
  const [userList, setUserList] = useState([]);
  const [viewPermission, setViewPermission] = useState([]); // master list
  const [userPermissions, setUserPermissions] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);

  const navigate = useNavigate();

  const Navigatetodashboard = () => navigate("/dashboard");

  const handleGetViewPermission = () => {
    setloader(true);
    let formdata = new FormData();
    formdata.append("user_type", 2);

    ViewUserPermission(formdata)
      .then((res) => {
        if (res?.data?.data?.length > 0) {
          setViewPermission(res?.data?.data);
        }
      })
      .finally(() => setloader(false));
  };

  const handleGetUserDropdown = () => {
    setloader(true);
    let formdata = new FormData();
    formdata.append("user_type", 2);

    userdropdown(formdata)
      .then((res) => {
        if (res?.data?.length > 0) {
          setUserList(res?.data);
        }
      })
      .finally(() => setloader(false));
  };

  const handleFetchUserPermissions = (userId) => {
    if (!userId) return;
    setloader(true);

    let formdata = new FormData();
    formdata.append("user_id", userId);

    ViewUserPermission(formdata)
      .then((res) => {
        if (res?.data?.data?.length > 0) {
          setUserPermissions((prev) => ({
            ...prev,
            [userId]: res.data.data
          }));
        } else {
          setUserPermissions((prev) => ({
            ...prev,
            [userId]: viewPermission.map((p) => ({
              permission_id: p.permission_id,
              title: p.title,
              status: 0
            }))
          }));
        }
      })
      .finally(() => setloader(false));
  };

  const handleCheckboxChange = (userId, permissionId) => {
    setUserPermissions((prev) => ({
      ...prev,
      [userId]: (prev[userId] || []).map((p) =>
        p.permission_id === permissionId
          ? { ...p, status: p.status === 1 ? 0 : 1 }
          : p
      )
    }));
  };

  const handleTitleChange = (userId, permissionId, newTitle) => {
    setUserPermissions((prev) => ({
      ...prev,
      [userId]: (prev[userId] || []).map((p) =>
        p.permission_id === permissionId ? { ...p, title: newTitle } : p
      )
    }));
  };

  // ✅ Update backend
  const handleUpdatePermission = () => {
    if (!selectedUser) return;
    setloader(true);

    const selectedPermissions = userPermissions[selectedUser] || [];

    const payload = {
      user_id: selectedUser,
      permission_list: selectedPermissions
    };

    EditUserPermission(payload)
      .then((res) => {
        toast.success(res?.data?.msg);
        console.log("Updated:", res);
      })
      .catch((error) => toast.error(error))
      .finally(() => setloader(false));
  };

  // On mount → load master lists
  useEffect(() => {
    handleGetViewPermission();
    handleGetUserDropdown();
  }, []);

  // When user changes → fetch their permissions
  useEffect(() => {
    if (selectedUser) {
      handleFetchUserPermissions(selectedUser);
    }
  }, [selectedUser]);

  return (
    <div>
      <Loader isLoader={loader} />

      <div className={classes.router_pages}>
        <div className={classes.headerBlock}>
          <div className="pre-page col-sm-5">
            <FaArrowLeft className="arrow" onClick={Navigatetodashboard} />
            <h3 className={classes.header}> User Permission</h3>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px", border: "1px solid rbg(0,0,0,0.2)" }}>
        <CommonSelect
          placeholder={"Select User"}
          value={selectedUser}
          styles={{ width: "250px", height: "44px", marginBottom: "20px" }}
          onChange={(value) => setSelectedUser(value)}
          options={userList.map((u) => ({
            label: u.username,
            value: u.user_id
          }))}
          allowClear={false}
        />

        {selectedUser && (
          <div style={{ marginTop: "20px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
                fontWeight: "bold",
                borderBottom: "2px solid #ccc"
              }}
            >
              <Typography style={{ flex: 1 }}>Permission</Typography>
              <Typography style={{ flex: 2 }}>Title</Typography>
              <Typography style={{ flex: 0.5 }}>Status</Typography>
            </div>

            {(userPermissions[selectedUser] || []).map((perm) => (
              <div
                key={perm.permission_id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "20px",
                  padding: "10px 0",
                  borderBottom: "1px solid #eee"
                }}
              >
                {/* Permission name */}
                <Typography style={{ flex: 1 }}>
                  {viewPermission.find(
                    (p) => p.permission_id === perm.permission_id
                  )?.title || ""}
                </Typography>

                {/* Editable Title */}
                <CommonInput
                  maxLength={100}
                  value={perm.title}
                  onChange={(val) =>
                    handleTitleChange(selectedUser, perm.permission_id, val)
                  }
                  placeholder="Enter custom title"
                  styles={{ flex: 2 }}
                />

                {/* Checkbox */}
                <div
                  style={{ flex: 0.5, display: "flex", alignItems: "center" }}
                >
                  <Checkbox
                    checked={perm.status === 1}
                    onChange={() =>
                      handleCheckboxChange(selectedUser, perm.permission_id)
                    }
                  />
                  {/* <Typography variant="body2">Active</Typography> */}
                </div>
              </div>
            ))}

            <Divider style={{ margin: "20px 0" }} />
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "flex-end"
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpdatePermission}
              >
                Update Permissions
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
