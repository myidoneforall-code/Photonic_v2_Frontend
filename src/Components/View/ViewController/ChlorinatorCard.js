import React, { useState } from "react";
import toast from "react-hot-toast";
import MotorControllerCard from "../MotorControllerCard";
import { devicerefreshapi, RenameDeviceService } from "../../../Service/ApiService";
import { getCatchMsg } from "../../../Utilities/Methods";

// The chlorinators on a controller, inside the controller page. Each one is the very same
// card as in the controller list (MotorControllerCard, the card of a chlorinator added on its
// own): the same size, refresh icon and animated panels. Only its place is different: it
// sits in the middle of the page. Its name can be edited here (pencil, then save).
export default function ChlorinatorCard({ controllerdata, onRefresh, usertype }) {
  const [loadingId, setLoadingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [nameValue, setNameValue] = useState("");
  const units = controllerdata?.chlorinator || [];
  if (units.length === 0) {
    return null;
  }
  // Same rule as the name of the controller: a user with only view / operate access cannot edit.
  const canEdit = ![2, 3].includes(Number(controllerdata?.access_type));

  // Same as the refresh icon of the list card: ask the unit for its data, then reload.
  const refresh = (deviceId, accessType) => {
    if (
      !(
        accessType === 0 ||
        accessType === 1 ||
        accessType === 2 ||
        accessType === null ||
        accessType === undefined
      )
    ) {
      return;
    }
    setLoadingId(deviceId);
    setTimeout(() => setLoadingId(null), 3000);
    setTimeout(() => onRefresh && onRefresh(), 5000);
    const formData = new FormData();
    formData.append("device_id", deviceId);
    formData.append("device_type", 6);
    formData.append("request_type", 1);
    devicerefreshapi(formData).catch(() => {});
  };

  // Only the name is changed, nothing else of the device is touched.
  const saveName = (unit) => {
    const name = nameValue.trim();
    if (!name) {
      toast.error("Enter a name");
      return;
    }
    if (name === unit?.device_name) {
      setEditingId(null);
      return;
    }
    const formData = new FormData();
    formData.append("device_name", name);
    RenameDeviceService(unit?.device_id, formData)
      .then((res) => {
        toast.success(typeof res?.data === "string" ? res.data : "Success");
        setEditingId(null);
        if (onRefresh) onRefresh();
      })
      .catch((err) => getCatchMsg(err));
  };

  return (
    <>
      {units.map((unit, index) => {
        // What the list card gets for a chlorinator added on its own: no controller code
        // and the chlorinator inside.
        const motoron = {
          controller_name: unit?.device_name,
          controller_code: null,
          chlorinator: [unit],
          access_type: controllerdata?.access_type,
          amc_status: unit?.amc_status,
          amc_start_date: unit?.amc_start_date,
          amc_end_date: unit?.amc_end_date,
          is_warning: unit?.is_warning,
          no_of_days: unit?.no_of_days,
        };
        const editing = editingId === unit?.device_id;
        return (
          <div
            key={unit?.device_id ?? index}
            style={{ display: "flex", justifyContent: "center", margin: "12px 0" }}
          >
            <div style={{ width: "48%", minWidth: "360px", maxWidth: "100%" }}>
              <MotorControllerCard
                motoron={motoron}
                index={index}
                motorindex={index}
                isloading={loadingId === unit?.device_id}
                setindex={() => {}}
                loadingspinner={refresh}
                Changebutton={() => {}}
                buttongreyid=""
                usertype={usertype}
                openNotification={() => {}}
                nameEdit={
                  canEdit
                    ? {
                        editing,
                        value: nameValue,
                        onChange: setNameValue,
                        onToggle: () => {
                          if (editing) {
                            saveName(unit);
                          } else {
                            setNameValue(unit?.device_name || "");
                            setEditingId(unit?.device_id);
                          }
                        },
                      }
                    : undefined
                }
              />
            </div>
          </div>
        );
      })}
    </>
  );
}
