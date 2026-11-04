import { useEffect, useRef, useState } from "react";
import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaTrashAlt,
} from "react-icons/fa";
import ReactPaginate from "react-paginate";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router";
import DeleteConfirmationModal from "../../../Modalcomponents/DeleteConfirmationModal";
import { listcontrollergroupapi } from "../../../Service/ApiService";
import {
  Updategroupcontroller,
  UpdateGroupFilters,
} from "../../Store/Config/Configuration";
import styles from "../Users/user.module.css";
import commonstyle from "../../../Assets/css/CommonStyle.module.css";
import groupstyle from "../../View/Group/group.module.css";

export default function Groupcontroller() {
  let location = useLocation();
  const { groupcontroller } = useSelector((state) => state);
  let dispatch = useDispatch();
  const [conformation, setconf] = useState(false);
  const [mpid, setid] = useState();
  let controllertype = JSON.parse(localStorage.getItem("contollertype"));
  const [index, setindex] = useState();
  const [pagestate, setpage] = useState(1);
  const [value, setvalue] = useState(false);
  const { groupnames } = useSelector((state) => state);
  const FilterRef = useRef(null);
  FilterRef.current = groupnames;

  const [totaldatacount, settotaldata] = useState();
  const currentItems = groupcontroller;
  const pageCount = Math.ceil(totaldatacount / 12);
  const handlePageClick = (event) => {
    setpage(JSON.parse(event.selected) + 1);
  };
  useEffect(() => {
    controllergroupdata();
  }, [pagestate]);

  useEffect(() => {
    const interval = setInterval(() => {
      controllergroupdata();
    }, 60000);
    return () => clearInterval(interval);
  }, [pagestate]);

  const controllergroupdata = () => {
    setvalue(true);
    let formdata = new FormData();
    formdata.append("controller_type", controllertype);
    formdata.append("group_id", location?.state?.groupid);
    if (FilterRef?.current?.controller) {
      formdata.append("controller_name", FilterRef?.current?.controller);
    }
    listcontrollergroupapi(formdata, pagestate)
      .then(({ data }) => {
        dispatch(Updategroupcontroller(data?.items));
        settotaldata(data?.total);
      })
      .finally(() => setvalue(false));
  };

  const Items = ({ currentItems }) => {
    return (
      <>
        {currentItems?.length > 0 ? (
          <div className={styles.user_group_grid}>
            <>
              {currentItems?.map((ele, ind) => {
                return (
                  <div
                    className={`${groupstyle.group_bg} ${commonstyle.cards_border_radius}`}
                    key={ind}
                  >
                    <div
                      className={`${styles.usercontainer}  ${commonstyle.cards_padding}`}
                    >
                      <div className={styles.userflex}>
                        <p className={styles.userflexp}>
                          <span className="tank-header">Controller ID - </span>
                          <span className={styles.userdata}>
                            {ele?.controller_code}
                          </span>
                        </p>
                        <div>
                          <button
                            type="button"
                            className={`${groupstyle.group_delete_btn} ${commonstyle.btn_border_radius}`}
                            onClick={() => {
                              setconf(true);
                              setindex(ind);
                              setid(ele?.controller_group_mapping_id);
                            }}
                          >
                            <FaTrashAlt
                              className={commonstyle.Delete_icon_color}
                            />{" "}
                            delete
                          </button>
                        </div>
                      </div>
                      <p className={commonstyle.margin_zero}>
                        <span className="tank-header">Name - </span>
                        <span className={styles.userdata}>
                          {ele?.controller_name}
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </>
          </div>
        ) : (
          <p className={commonstyle.no_data_found}>No Datas found</p>
        )}
      </>
    );
  };
  useEffect(() => {
    if (location?.state) {
      dispatch(UpdateGroupFilters(location?.state?.GroupDatas));
    }
  }, [location?.state]);
  return (
    <>
      {conformation ? (
        <DeleteConfirmationModal
          show={conformation}
          close={() => setconf(false)}
          id={mpid}
          Deletekey={4}
          index={index}
        />
      ) : null}

      <Items currentItems={currentItems} />
      {totaldatacount > 12 ? (
        <div className="col-12 float-start d-flex justify-content-center">
          <ReactPaginate
            breakLabel="..."
            nextLabel={<FaAngleDoubleRight />}
            onPageChange={handlePageClick}
            pageRangeDisplayed={5}
            pageCount={pageCount}
            previousLabel={<FaAngleDoubleLeft />}
            renderOnZeroPageCount={null}
            containerClassName={"container-class"}
            pageLinkClassName={"page-link"}
            pageClassName={"page-item"}
            previousClassName={"next-page-item"}
            previousLinkClassName={"pre-link-item"}
            nextClassName={"next-page-item"}
            nextLinkClassName={"pre-link-item"}
            activeClassName={"active-page"}
          />
        </div>
      ) : null}
    </>
  );
}
