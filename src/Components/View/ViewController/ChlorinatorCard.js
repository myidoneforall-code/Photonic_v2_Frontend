import React, { useState } from "react";
import MotorControllerCard from "../MotorControllerCard";
import { devicerefreshapi } from "../../../Service/ApiService";

// The chlorinators on a controller, inside the controller page. Each one is the very same
// card as in the controller list (MotorControllerCard, the card of a chlorinator added on its
// own): the same size, refresh icon and animated panels. Only its place is different: it
// sits in the middle of the page.
export default function ChlorinatorCard({ controllerdata, onRefresh, usertype }) {
  const [loadingId, setLoadingId] = useState(null);
  const units = controllerdata?.chlorinator || [];
  if (units.length === 0) {
    return null;
  }

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
              />
            </div>
          </div>
        );
      })}
    </>
  );
}
