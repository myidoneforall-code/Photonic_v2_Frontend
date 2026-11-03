import React from "react";
import classes from "./components.module.css";
export default function ItemsPerPage({ page = 1, size = 0, total = 0 }) {
  const startingIndex =
    total > (page - 1) * size + 1 ? (page - 1) * size + 1 : total;
  const endIndex = total > size * page ? size * page : total;
  return (
    <>
      <div className={classes.itemsPagetext}>
        Displaying&nbsp;&nbsp;
        <span>{startingIndex}</span>
        &nbsp;-&nbsp;
        <span>{endIndex}</span>&nbsp;of&nbsp;
        <span> {total}&nbsp; </span> results
      </div>
    </>
  );
}
