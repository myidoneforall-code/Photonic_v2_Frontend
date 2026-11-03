import React, { useEffect, useState, useMemo } from "react";
import CommonSelect from "../../../CommonComponents/CommonSelect";
import { useFormik } from "formik";
import { useSelector } from "react-redux";
import { controllerdropdown } from "../../../../Service/ApiService";
import { getCatchMsg } from "../../../../Utilities/Methods";
import { Card, Col, Row, ProgressBar } from "react-bootstrap";
import { getCookie } from "../../../../Utilities/Cookie";

export default function WeatherChart({
  onPressData,
  weatherData,
  districtName
}) {
  const [controllerDropDown, setControllerDropDown] = useState([]);
  const [loader, setLoader] = useState(false);
  const { LoginUserData } = useSelector((state) => state);
  const token = JSON.parse(getCookie("cookiedata"))?.access_token;
  const { values, setFieldValue } = useFormik({
    initialValues: { device_id: null }
  });
  const data = controllerDropDown?.find(
    (ele) => ele?.controller_id === values?.device_id
  );
  const controllerData = data
    ? data
    : {
        controller_id: "",
        controller_code: "",
        controller_name: "Weather Reports"
      };
  // Fetch dropdown options
  useEffect(() => {
    if (token) handleControllerDropDown();
  }, [token]);

  const handleControllerDropDown = () => {
    setLoader(true);
    const formdata = new FormData();
    formdata.append("controller_type", 1);
    // formdata.append("report_for", 5);

    controllerdropdown(formdata)
      .then((res) => {
        if (res?.data) {
          const data = res.data || [];
          const sorted = data.sort((a, b) => {
            // a comes first if district is NOT null
            if (a.district && !b.district) return -1;

            // b comes first if district is NOT null
            if (!a.district && b.district) return 1;

            // Otherwise keep normal order
            return 0;
          });

          setControllerDropDown(sorted);
          console.log(sorted, "sorted");
          const dropdownData = {
            label: sorted[0]?.controller_name,
            value: sorted[0]?.controller_id
          };
          onPressData(res?.data?.[0]?.controller_id);
          setFieldValue("device_id", dropdownData);

          // setControllerDropDown(res.data || []);
        }
      })
      .catch((err) => getCatchMsg(err))
      .finally(() => setLoader(false));
  };

  // Group by date (only 3 upcoming days)
  const groupedByDate = useMemo(() => {
    if (!weatherData?.list) return [];
    const groups = {};
    weatherData.list.forEach((item) => {
      const date = item.dt_txt.split(" ")[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    });
    return Object.entries(groups).slice(0, 3);
  }, [weatherData]);

  console.log(weatherData, "weatherData");

  return (
    <div
      className="min-h-screen text-white"
      style={{
        background: `linear-gradient(135deg, rgb(220, 220, 220), rgb(245, 245, 245))`,

        padding: "20px",
        borderRadius: "5px",
        marginTop: "10px"
      }}
    >
      <div className="d-flex justify-content-between align-items-end mb-3">
        {!weatherData && (
          <h3
            style={{
              color: "black",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            Weather Report
          </h3>
        )}
        <CommonSelect
          styles={{
            height: "36px",
            width: "250px",
            backgroundColor: "#1e2b33",
            color: "white"
          }}
          onChange={(data) => {
            setFieldValue("device_id", data);
            onPressData(data);
          }}
          value={values.device_id}
          options={controllerDropDown?.map((ele) => ({
            ...ele,
            label: ele?.controller_name,
            value: ele?.controller_id
          }))}
          placeholder={"Select Device"}
        />
      </div>

      {/* Weather Cards */}
      {loader && (
        <p className="text-center text-gray-300 font-medium text-black">
          Loading weather data...
        </p>
      )}

      {!loader && weatherData && (
        <div className="max-w-6xl mx-auto flex flex-col gap-10">
          <h2
            style={{
              color: "black",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            3-Day Forecast for {controllerData?.controller_name}
            {districtName ? ` (${districtName})` : ""}
          </h2>

          <Row className="g-4 justify-content-center">
            {groupedByDate.map(([date, forecasts], index) => {
              const first = forecasts[0]; // first time point of the day
              return (
                <Col key={index} xs={12} sm={6} md={4}>
                  <Card
                    style={{
                      //   background: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "black",
                      padding: "15px",
                      borderRadius: "12px",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
                      backdropFilter: "blur(8px)",
                      textAlign: "center"
                    }}
                  >
                    <h5 className="mb-2 text-primary fw-bold">
                      {new Date(date).toLocaleDateString("en-US", {
                        weekday: "short"
                      })}
                    </h5>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between"
                      }}
                    >
                      <div>
                        <img
                          src={`https://openweathermap.org/img/wn/${first.weather[0].icon}@2x.png`}
                          alt="weather"
                          className="mx-auto mb-2"
                          style={{ width: "60px", height: "60px" }}
                        />
                      </div>
                      <div>
                        <h6 className="text-info">{first.weather[0].main}</h6>
                        <p className="text-muted small mb-3">
                          {first.weather[0].description}
                        </p>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="d-flex justify-content-between">
                        <span>{(first.main.temp_min || 20).toFixed(1)}°</span>
                        <span>{(first.main.temp_max || 35).toFixed(1)}°</span>
                      </div>
                      <ProgressBar
                        now={
                          ((first.main.temp - first.main.temp_min) /
                            (first.main.temp_max - first.main.temp_min)) *
                          100
                        }
                        style={{
                          height: "8px",
                          backgroundColor: "#1c2833"
                        }}
                        variant="info"
                        className="mt-1 mb-3"
                      />
                    </div>

                    <div className="d-flex justify-content-around small">
                      <div>
                        💧 <span>{first.main.humidity}%</span>
                      </div>
                      <div>
                        🌬 <span>{first.wind.speed} m/s</span>
                      </div>
                      <div>
                        ☁ <span>{first.clouds.all}%</span>
                      </div>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      )}
    </div>
  );
}
