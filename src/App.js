import {
  createHashRouter,
  RouterProvider,
  useNavigate
} from "react-router-dom";
import "./App.css";
import Forgotpwd from "./Components/Auth/Forgotpwd";
import Login from "./Components/Auth/Login";
import Register from "./Components/Auth/Register";
import {
  AuthPrivateRoute,
  DashboardPrivateRoute,
  ProductionPrivateRoute
} from "./Components/Header/Navigation";
import Admindashboard from "./Components/View/Dashboard/Admindashboard";
import Controllerdetails from "./Components/View/ViewController/Controlardetails";
import Motorcontrolleron from "./Components/View/ViewController/Motorcontrolleron";
import Allcontroller from "./Components/View/ViewController/Allcontroller";
import AllLightContoller from "./Components/View/ViewLightController/LightAllContoller";
import Motorcontrollerview from "./Components/View/ViewController/Motorcontrollerview";
import Motorcontrolleroff from "./Components/View/ViewController/Motorcontrolleroff";
import Lightcontrolleron from "./Components/View/ViewLightController/LightControllerOn";
import Lightcontrollerview from "./Components/View/ViewLightController/Lightcontrollerview";
import Lightdetails from "./Components/View/ViewLightController/Lightdetails";
import Lightcontrolleroff from "./Components/View/ViewLightController/LightControllerOff";
import Motornotification from "./Components/View/ViewController/MotorNotification";
import Lightnotification from "./Components/View/ViewLightController/LightNotification";
import VerifyOtp from "./Components/Auth/VerifiyOtp";
import Addcontroller from "./Components/View/Addcontroller";
import Userprofile from "./Components/View/profile/Userprofile";
import Deletecontroller from "./Components/View/Deletecontroller";
import Adduser from "./Components/View/Users/Adduser";
import Viewuser from "./Components/View/Users/Viewuser";
import Adminuser from "./Components/View/Users/Adminuser";
import Productionuser from "./Components/View/Users/Productionuser";
import Profileuser from "./Components/View/Users/Profileuser";
import Deleteuser from "./Components/View/Users/Deleteuser";
import Deleteuseradmin from "./Components/View/Users/Deleteuseradmin";
import Deleteuserproduction from "./Components/View/Users/Deleteuserproduction";
import Groupview from "./Components/View/Group/Groupview";
import Usergroup from "./Components/View/Users/usergroup";
import Usercontroller from "./Components/View/Users/Usercontroller";
import Grouplayout from "./Components/View/Group/Grouplayout";
import Groupuser from "./Components/View/Group/Groupuser";
import Groupcontroller from "./Components/View/Group/Groupcontroller";
import Subuser from "./Components/View/Users/Subuser";
import Deletesubuser from "./Components/View/Users/Detetesubuser";
import ProductionController from "./Components/View/Productionunit/ProductionController";
import ProductionControllerDetails from "./Components/View/Productionunit/ProductionControllerDetails";
import Productionlayout from "./Layout/Productionlayout";
import Reportview from "./Components/View/Report/ReportView";
import Deletedevice from "./Components/View/DeleteDevice";
import Landingpage from "./Components/LandingPages/LandingPage";
import Addadmindevice from "./Components/View/Device/AddAdminDevice";
import Viewadmindevice from "./Components/View/Device/ViewAdminDevice";
import Deleteadmindevice from "./Components/View/Device/DeleteAdminDevice";
import Contactus from "./Components/LandingPages/ContactUs";
import Termsandconditions from "./Components/LandingPages/TermsAndConditions";
import Privacypolicy from "./Components/LandingPages/PrivacyPolicy";
import Homepage from "./Components/LandingPages/HomePage";
import Controllerdevice from "./Components/View/Device/ControllerDevice";

import Header from "./Layout/DasbboardLayout/Header";
import AMCReport from "./Components/View/Report/AMCReport";
import ProductionHistory from "./Components/View/Report/ProductionHistory";
import Mqtt from "./Components/View/Report/Mqtt";
import Sim from "./Components/View/Report/Sim";
import PaymentHistory from "./Components/View/Report/PaymentHistory";
import SmsSetting from "./Components/View/Report/SmsSetting";
import Monitoring from "./Components/View/Report/Monitoring";
import Dashboard from "./Components/View/Dashboard/dashboard";
import Permission from "./Components/View/UserPermission/Permission";
import ModifiedHeader from "./Layout/DasbboardLayout/ModifiedHeader";
import { elements } from "chart.js";
import ListControllers from "./Components/View/Report/ListControllers";
import { useEffect } from "react";
import { GetCookieStorage } from "./Utilities/Storage";
const ListControllersWrapper = () => {
  const navigate = useNavigate();
  let cookie = JSON.parse(GetCookieStorage("cookiedata"));
  let usertype = cookie?.user_type;

  useEffect(() => {
    if (usertype !== 1) {
      navigate("/dashboard");
    }
  }, [usertype, navigate]);
  return usertype === 1 ? <ListControllers /> : null;
};

const routes = [
  // // {
  // //   element: <DashboardPrivateRoute />,
  // //   children: [
  // {
  //   path: "/",
  //   element: <Landingpage />,
  //   children: [
  //     {
  //       index: true,
  //       element: <Homepage />,
  //     },
  //     {
  //       path: "contact",
  //       element: <Contactus />,
  //     },
  //     {
  //       path: "privacypolicy",
  //       element: <Privacypolicy />,
  //     },
  //     {
  //       path: "termsandconditions",
  //       element: <Termsandconditions />,
  //     },
  //   ],
  // },
  // //   ],
  // // },

  {
    element: <AuthPrivateRoute />,
    children: [
      {
        path: "/",
        element: <Landingpage />,
        children: [
          {
            index: true,
            element: <Homepage />
          },
          {
            path: "contact",
            element: <Contactus />
          },
          {
            path: "privacypolicy",
            element: <Privacypolicy />
          },
          {
            path: "termsandconditions",
            element: <Termsandconditions />
          },
          { path: "login", element: <Login /> },

          { path: "register", element: <Register /> },
          { path: "forgotpwd", element: <Forgotpwd /> },
          { path: "verifyotp", element: <VerifyOtp /> }
        ]
      }
    ]
  },

  {
    element: <DashboardPrivateRoute />,
    children: [
      {
        path: "/dashboard",
        element: <ModifiedHeader />,
        children: [
          // {
          //   index: true,
          //   element: <Admindashboard />
          // },
          {
            index: true,
            element: <Dashboard />
          },
          // {
          //   path: "sub/motorcontrollerview",
          //   element: <MotorControllerViewPrivateRoute />,
          //   children: [
          //     {
          //       index: true,
          //       element: <Motorcontrollerview />,
          //     },
          //   ],
          // },
          { path: "motorcontrollerview", element: <Motorcontrollerview /> },
          { path: "motorcontrolleroff", element: <Motorcontrolleroff /> },
          { path: "motorcontrollerall", element: <Allcontroller /> },
          { path: "motorcontrolleron", element: <Motorcontrolleron /> },
          { path: "motornotification", element: <Motornotification /> },
          { path: "lightcontrolleron", element: <Lightcontrolleron /> },
          { path: "lightcontrolleroff", element: <Lightcontrolleroff /> },
          { path: "lightcontrollerview", element: <Lightcontrollerview /> },
          { path: "lightnotification", element: <Lightnotification /> },
          { path: "addcontroller", element: <Addcontroller /> },
          { path: "deletedevice", element: <Deletedevice /> },
          { path: "user/adduser", element: <Adduser /> },
          { path: "permission", element: <Permission /> },
          {
            path: "user/userdetails",
            element: <Profileuser />,
            children: [
              { path: "usergroup", element: <Usergroup /> },
              { path: "usercontroller", element: <Usercontroller /> }
            ]
          },
          {
            path: "user/viewuser",
            element: <Viewuser />,
            children: [
              { path: "admin", element: <Adminuser /> },
              { path: "subuser", element: <Subuser /> },
              { path: "production", element: <Productionuser /> }
            ]
          },
          { path: "deletecontroller", element: <Deletecontroller /> },

          { path: "profile", element: <Userprofile /> },
          {
            path: "details",
            element: <Controllerdetails />
          },
          {
            path: "lightdetails",
            element: <Lightdetails />
          },
          {
            path: "user/deleteuser",
            element: <Deleteuser />,
            children: [
              { path: "admin", element: <Deleteuseradmin /> },
              { path: "subuser", element: <Deletesubuser /> },
              { path: "production", element: <Deleteuserproduction /> }
            ]
          },
          { path: "group", element: <Groupview /> },
          {
            path: "group/auth",
            element: <Grouplayout />,
            children: [
              { path: "groupuser", element: <Groupuser /> },
              { path: "groupcontroller", element: <Groupcontroller /> }
            ]
          },

          { path: "report", element: <Reportview /> },
          { path: "production_history", element: <ProductionHistory /> },
          { path: "monitoring", element: <Monitoring /> },
          { path: "payment_history", element: <PaymentHistory /> },
          { path: "sms_setting", element: <SmsSetting /> },

          { path: "amcreport", element: <AMCReport /> },

          { path: "controllerdevice", element: <Controllerdevice /> },
          { path: "adddevice", element: <Addadmindevice /> },
          { path: "viewdevice", element: <Viewadmindevice /> },
          { path: "actions", element: <Deleteadmindevice /> },
          { path: "mqtt", element: <Mqtt /> },
          { path: "sim", element: <Sim /> },
          { path: "list_controllers", element: <ListControllersWrapper /> }
        ]
      }
    ]
  },

  {
    element: <ProductionPrivateRoute />,
    children: [
      {
        path: "/production",
        element: <Productionlayout />,
        children: [
          {
            index: true,
            element: <ProductionController />
          },
          { path: "view", element: <ProductionControllerDetails /> },
          { path: "profile", element: <Userprofile /> },
          { path: "mqtt", element: <Mqtt /> }
        ]
      }
    ]
  }
];

const route = createHashRouter(routes, {
  basename: ""
});

function App() {
  return <RouterProvider router={route} />;
}

export default App;
