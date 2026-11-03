// import React, { useState } from "react";
// import {
//   GoogleMap,
//   Marker,
//   useJsApiLoader,
//   InfoWindow
// } from "@react-google-maps/api";
// import BlueMarker from "../../../Assets/image/BlueMarker.png";
// import RedMarker from "../../../Assets/image/RedMarker.png";
// import GreenMarker from "../../../Assets/image/GreenMarker.png";
// import OrangeMarker from "../../../Assets/image/OrangeMarker.png";
// import { GetLocalStorage, SetSessionStorage } from "../../../Utilities/Storage";
// import {
//   UpdatelightViewDatas,
//   UpdatemotorViewDatas
// } from "../../Store/Config/Configuration";
// import { useNavigate } from "react-router";
// import { useDispatch } from "react-redux";

// export default function Maplocationfinder({ mapdata }) {
//   let navigate = useNavigate();
//   let dispatch = useDispatch();
//   const [infoData, setInfoData] = useState([]);
//   let controllertype = parseInt(GetLocalStorage("contollertype"));
//   // const [markerData, setMarkerData] = useState(mapdata?.location || []);
//   const handleShowInfo = (id) => {
//     if (infoData.includes(id)) {
//       let ref = [...infoData];
//       ref = infoData.filter((ele) => ele !== id);
//       setInfoData(ref);
//     } else {
//       setInfoData((prev) => [...prev, id]);
//     }
//   };
//   console.log(mapdata, "mapdata");

//   const mapContainerStyle = {
//     height: "463px",
//     width: "100%"
//     // width: "49%",
//   };

//   const center = {
//     lat: 0,
//     lng: -180
//   };

//   // const position = {
//   //   lat: 37.772,
//   //   lng: -122.214,
//   // };

//   // let markers = [
//   //   {
//   //     id: 1,
//   //     latitude: 78.833984,
//   //     longitude: 10.399168,
//   //     shelter: "marker 1",
//   //   },
//   //   {
//   //     id: 2,
//   //     latitude: 11.0,
//   //     longitude: 77.0,
//   //     shelter: "marker 2",
//   //   },
//   //   {
//   //     id: 3,
//   //     latitude: 3,
//   //     longitude: 4,
//   //     shelter: "marker 3",
//   //   },
//   // ];

//   const onLoad = (marker) => {};

//   const { isLoaded } = useJsApiLoader({
//     id: "google-map-script",
//     // googleMapsApiKey: "AIzaSyClx385mEpQwwx9KhhxTjUNq-OD50vithU",
//     googleMapsApiKey: "AIzaSyDbxlnUju9jL8GjOg7_p2TWOefutIzHsKY"
//   });

//   const handleClickInfowWindow = (data) => {
//     if (controllertype === 1) {
//       navigate("/dashboard/details", {
//         state: {
//           id: data?.controller_id
//         }
//       });
//       dispatch(UpdatemotorViewDatas(null));
//       SetSessionStorage("MotorViewDatas", null, null);
//       SetSessionStorage("controllerdetailspage", "/dashboard");
//       SetSessionStorage("sorttype", 0);
//     }
//     if (controllertype === 2) {
//       navigate("/dashboard/lightdetails", {
//         state: {
//           id: data?.controller_id
//         }
//       });
//       dispatch(UpdatelightViewDatas(null));
//       SetSessionStorage("lightViewDatas", null, null);
//       SetSessionStorage("lightdetailspage", "/dashboard");
//       SetSessionStorage("sorttype", 0);
//     }
//   };

//   return (
//     <>
//       {isLoaded && (
//         <GoogleMap
//           id="marker-example"
//           mapContainerStyle={mapContainerStyle}
//           zoom={2}
//           center={center}
//           // icon={"http://maps.google.com/mapfiles/ms/icons/blue-dot.png"}
//         >
//           {mapdata?.location?.map((ele, i) => (
//             <div key={i}>
//               <Marker
//                 onLoad={onLoad}
//                 icon={
//                   ele?.notification
//                     ? ele?.notification > 0
//                       ? BlueMarker
//                       : ele?.color === 1
//                       ? GreenMarker
//                       : RedMarker
//                     : OrangeMarker
//                 }
//                 position={{
//                   lat: parseFloat(ele.latitude),
//                   lng: parseFloat(ele.longitude)
//                 }}
//                 key={ele.controller_id || ele.device_id}
//                 onClick={() => {
//                   handleShowInfo(ele.device_id || ele.controller_id);
//                 }}
//                 // title={"testing"}
//                 // label="test label"
//               />
//               {infoData?.includes(ele.device_id || ele.controller_id) ? (
//                 <InfoWindow
//                   key={ele.controller_id || ele.device_id}
//                   position={{
//                     lat: parseFloat(ele.latitude),
//                     lng: parseFloat(ele.longitude)
//                   }}
//                   onCloseClick={() => {
//                     handleShowInfo(ele.device_id || ele.controller_id);
//                   }}
//                 >
//                   <div
//                     onClick={() => {
//                       if (ele?.controller_id) {
//                         handleClickInfowWindow(ele);
//                       }
//                     }}
//                   >
//                     {ele?.device_name || ele?.controller_name
//                       ? ele?.device_name
//                         ? `Name:${ele?.device_name}`
//                         : `Name:${ele?.controller_name}`
//                       : null}
//                     <br />
//                     {ele?.device_code || ele?.controller_code
//                       ? ele?.device_code
//                         ? `ID:${ele?.device_code}`
//                         : `ID:${ele?.controller_code}`
//                       : null}
//                     <br />
//                     {ele?.controller_type || ele?.device_type
//                       ? `Type:
//                    ${
//                      ele?.type === 1
//                        ? ele?.controller_type === 1
//                          ? "Motor controller"
//                          : "Light controller"
//                        : ele?.type === 2
//                        ? ele?.device_type === 1
//                          ? "Tank Level"
//                          : ele?.device_type === 2
//                          ? "Flow Meter"
//                          : ele?.device_type === 3
//                          ? "Valve Controller"
//                          : ele?.device_type === 4
//                          ? "Light"
//                          : ele?.device_type === 4
//                          ? "Multi"
//                          : null
//                        : null
//                    }`
//                       : null}{" "}
//                     <br />
//                     {ele?.notification_msg
//                       ? `Status:${ele.notification_msg}`
//                       : null}
//                     <br />
//                   </div>
//                 </InfoWindow>
//               ) : (
//                 <></>
//               )}
//             </div>
//           ))}
//         </GoogleMap>
//       )}
//     </>
//   );
// }

import React, { useState, useRef } from "react";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  InfoWindow
} from "@react-google-maps/api";
import BlueMarker from "../../../Assets/image/BlueMarker.png";
import RedMarker from "../../../Assets/image/RedMarker.png";
import GreenMarker from "../../../Assets/image/GreenMarker.png";
import OrangeMarker from "../../../Assets/image/OrangeMarker.png";
import { GetLocalStorage, SetSessionStorage } from "../../../Utilities/Storage";
import {
  UpdatelightViewDatas,
  UpdatemotorViewDatas
} from "../../Store/Config/Configuration";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";

export default function Maplocationfinder({ mapdata }) {
  let navigate = useNavigate();
  let dispatch = useDispatch();
  const [infoData, setInfoData] = useState([]);
  const [mapCenter, setMapCenter] = useState({
    lat: 20.5937, // Center latitude of India
    lng: 78.9629 // Center longitude of India
  });
  const [mapZoom, setMapZoom] = useState(4);
  const mapRef = useRef(null);

  let controllertype = parseInt(GetLocalStorage("contollertype"));

  const handleShowInfo = (id, markerData) => {
    // Set map center to the clicked marker and zoom in
    if (markerData) {
      setMapCenter({
        lat: parseFloat(markerData.latitude),
        lng: parseFloat(markerData.longitude)
      });
      setMapZoom(5);
    }

    if (infoData.includes(id)) {
      let ref = [...infoData];
      ref = infoData.filter((ele) => ele !== id);
      setInfoData(ref);
    } else {
      setInfoData((prev) => [...prev, id]);
    }
  };

  const mapContainerStyle = {
    height: "463px",
    width: "100%"
  };

  // This onLoad is for the GoogleMap component only
  const onMapLoad = (map) => {
    mapRef.current = map;

    // Auto-fit markers on initial load
    if (mapdata?.location?.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      mapdata.location.forEach((marker) => {
        bounds.extend({
          lat: parseFloat(marker.latitude),
          lng: parseFloat(marker.longitude)
        });
      });

      // Fit the map to the bounds with some padding
      map.fitBounds(bounds);

      // Set a minimum zoom level to prevent over-zooming
      const listener = window.google.maps.event.addListener(
        map,
        "idle",
        function () {
          if (map.getZoom() > 15) map.setZoom(15);
          window.google.maps.event.removeListener(listener);
        }
      );
    }
  };

  const onMarkerLoad = (marker) => {};

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyDbxlnUju9jL8GjOg7_p2TWOefutIzHsKY"
  });

  const handleClickInfowWindow = (data) => {
    if (controllertype === 1) {
      navigate("/dashboard/details", {
        state: {
          id: data?.controller_id
        }
      });
      dispatch(UpdatemotorViewDatas(null));
      SetSessionStorage("MotorViewDatas", null, null);
      SetSessionStorage("controllerdetailspage", "/dashboard");
      SetSessionStorage("sorttype", 0);
    }
    if (controllertype === 2) {
      navigate("/dashboard/lightdetails", {
        state: {
          id: data?.controller_id
        }
      });
      dispatch(UpdatelightViewDatas(null));
      SetSessionStorage("lightViewDatas", null, null);
      SetSessionStorage("lightdetailspage", "/dashboard");
      SetSessionStorage("sorttype", 0);
    }
  };

  console.log(mapdata, "mapdata");

  return (
    <>
      {isLoaded && (
        <GoogleMap
          id="marker-example"
          mapContainerStyle={mapContainerStyle}
          zoom={mapZoom}
          center={mapCenter}
          onLoad={onMapLoad} // This passes the map instance
        >
          {mapdata?.location?.map((ele, i) => (
            <div key={i}>
              <Marker
                onLoad={onMarkerLoad} // This passes the marker instance
                icon={
                  ele?.notification
                    ? ele?.notification > 0
                      ? BlueMarker
                      : ele?.color === 1
                      ? GreenMarker
                      : RedMarker
                    : OrangeMarker
                }
                position={{
                  lat: parseFloat(ele.latitude),
                  lng: parseFloat(ele.longitude)
                }}
                key={ele.controller_id || ele.device_id}
                onClick={() => {
                  handleShowInfo(ele.device_id || ele.controller_id, ele);
                }}
              />
              {infoData?.includes(ele.device_id || ele.controller_id) ? (
                <InfoWindow
                  key={ele.controller_id || ele.device_id}
                  position={{
                    lat: parseFloat(ele.latitude),
                    lng: parseFloat(ele.longitude)
                  }}
                  onCloseClick={() => {
                    handleShowInfo(ele.device_id || ele.controller_id);
                  }}
                >
                  <div
                    onClick={() => {
                      if (ele?.controller_id) {
                        handleClickInfowWindow(ele);
                      }
                    }}
                    style={{ cursor: "pointer", padding: "5px" }}
                  >
                    {ele?.device_name || ele?.controller_name
                      ? ele?.device_name
                        ? `Name:${ele?.device_name}`
                        : `Name:${ele?.controller_name}`
                      : null}
                    <br />
                    {ele?.device_code || ele?.controller_code
                      ? ele?.device_code
                        ? `ID:${ele?.device_code}`
                        : `ID:${ele?.controller_code}`
                      : null}
                    <br />
                    {ele?.controller_type || ele?.device_type
                      ? `Type:
                   ${
                     ele?.type === 1
                       ? ele?.controller_type === 1
                         ? "Motor controller"
                         : "Light controller"
                       : ele?.type === 2
                       ? ele?.device_type === 1
                         ? "Tank Level"
                         : ele?.device_type === 2
                         ? "Flow Meter"
                         : ele?.device_type === 3
                         ? "Valve Controller"
                         : ele?.device_type === 4
                         ? "Light"
                         : ele?.device_type === 4
                         ? "Multi"
                         : null
                       : null
                   }`
                      : null}{" "}
                    <br />
                    {/* {ele?.notification_msg
                      ? `Status:${ele.notification_msg}`
                      : null} */}
                    <br />
                  </div>
                </InfoWindow>
              ) : (
                <></>
              )}
            </div>
          ))}
        </GoogleMap>
      )}
    </>
  );
}
