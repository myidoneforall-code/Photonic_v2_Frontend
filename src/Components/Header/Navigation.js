import { Navigate } from "react-router";
import { Outlet } from "react-router-dom/dist";
import { getCookie } from "../../Utilities/Cookie";

// export const Authprivaterouter = ({ children }) => {
//   let callcookie = getCookie("cookiedata");

//   if (callcookie) {
//     return <Navigate to="/dashboard/admindashboard" />;
//   }
//   return children;
// };

// export const Dashboardprivaterouter = ({ children }) => {
//   let callcookie = getCookie("cookiedata");

//   if (callcookie === "") {
//     return <Navigate to="/" />;
//   }
//   return children;
// };

export const DashboardPrivateRoute = () => {
  let callcookie = getCookie("cookiedata");
  return callcookie === "" ? <Navigate to="/" /> : <Outlet />;
};

export const AuthPrivateRoute = () => {
  let callcookie = getCookie("cookiedata");
  const userData =
    getCookie("cookiedata") !== "" ? JSON.parse(getCookie("cookiedata")) : null;
  return callcookie !== "" ? (
    <Navigate
      to={
        userData !== null && parseInt(userData.user_type) === 4
          ? "/production"
          : userData !== null && parseInt(userData.user_type) === 3
          ? "/dashboard/motorcontrollerview"
          : "/dashboard"
      }
    />
  ) : (
    <Outlet />
  );
};

export const ProductionPrivateRoute = () => {
  const userData =
    getCookie("cookiedata") !== "" ? JSON.parse(getCookie("cookiedata")) : null;
  return userData !== null && parseInt(userData.user_type) !== 4 ? (
    <Navigate to="/" />
  ) : (
    <Outlet />
  );
};

export const MotorControllerViewPrivateRoute = () => {
  const userData =
    getCookie("cookiedata") !== "" ? JSON.parse(getCookie("cookiedata")) : null;
  return userData !== null && parseInt(userData.user_type) !== 3 ? (
    <Navigate to="/" />
  ) : (
    <Outlet />
  );
};
