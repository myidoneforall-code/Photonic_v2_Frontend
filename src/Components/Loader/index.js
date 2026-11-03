import React from "react";
import classes from "./Loader.module.css";
export default function Loader({ isLoader }) {
  return (
    <>
      {isLoader ? (
        <div className={classes.loaderParent}>
          <div className={classes.loader}></div>
        </div>
      ) : null}
    </>
  );
}
