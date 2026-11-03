import { useEffect, useRef, useState } from "react";
import Loader from "../../Loader";
import classes from "./reports.module.css";
import { useFormik } from "formik";
import { ImportSimService, ListSimService } from "../../../Service/ApiService";
import {
  filterValidObject,
  getCatchMsg,
  JSONtoformdata,
} from "../../../Utilities/Methods";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { FaArrowLeft } from "react-icons/fa";
import CommonInput from "../../CommonComponents/CommonInput";
import SimTable from "../../Tables/SimTable";
import ModifySimModal from "../../../Modalcomponents/ModifySimModal";
import { ExportedImages } from "../../../Utilities/ImageExport";
import SampleFile from "../../../Assets/Files/sim_sample.xls";
export default function Sim() {
  const [loader, setloader] = useState(false);
  let navigate = useNavigate();

  const [SimList, setSimList] = useState({
    items: [],
    page: 1,
    size: 10,
    total: 0,
  });
  let fileRef = useRef();
  const [importSim, setimportSim] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const { page, size, total, items } = SimList;
  const [filters, setfilters] = useState({
    sim_number: "",
    mobile_no: "",
    imsi_number: "",
    network: "",
  });

  const { values, setFieldValue, handleSubmit, resetForm } = useFormik({
    initialValues: {
      sim_number: "",
      mobile_no: "",
      imsi_number: "",
      network: "",
    },
    onSubmit: (values) => {
      setfilters({ ...values });
      handleListSimData(1, 10, values);
    },
  });

  const Navigatetodashboard = () => {
    navigate("/dashboard");
  };

  const handleListSimData = (page = 1, size = 10, values) => {
    setloader(true);
    let finalObj = filterValidObject({
      ...values,
    });

    ListSimService(
      page,
      size,
      Object.keys(finalObj).length !== 0 ? JSONtoformdata(finalObj) : ""
    )
      .then(({ data }) => {
        // if (data.status === 1) {
        setSimList(data);
        // } else {
        //   toast.error(data.msg);
        // }
      })
      .catch((err) => {
        getCatchMsg(err);
      })
      .finally(() => {
        setloader(false);
      });
  };

  const handleImportFile = () => {
    setloader(true);
    let formData = new FormData();
    formData.append("file", importSim);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort(); // Abort the request after 60 seconds
      toast.error("Request timed out. Reloading...");
      window.location.reload();
    }, 60000);

    ImportSimService(formData, { signal: controller.signal })
      .then(({ data }) => {
        clearTimeout(timeoutId); // Clear timeout if request completes
        if (data.status === 1) {
          toast.success(data.msg);
          setimportSim("");
          fileRef.current.value = "";
          if (data.file_path) {
            window.open(data.file_path);
          }
        } else {
          setimportSim("");
          toast.error(data.msg);
        }
      })
      .catch((err) => {
        clearTimeout(timeoutId); // Clear timeout in case of an error
        if (err.name === "AbortError") {
        } else {
          getCatchMsg(err);
          window.location.reload();
        }
      })
      .finally(() => setloader(false));
  };

  useEffect(() => {
    handleListSimData(1, 10, values);
  }, []);

  const handleDownload = () => {
    // Trigger the file download programmatically
    const link = document.createElement("a");
    link.href = SampleFile; // Path to your file in the public directory
    link.download = "sample.xls"; // Suggested name for the file
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {showAddModal && (
        <ModifySimModal
          show={showAddModal}
          onClose={(type) => {
            setShowAddModal(false);
            if (type) {
              handleListSimData(1, 10, filters);
            }
          }}
          type="Add"
        />
      )}
      <Loader isLoader={loader} />
      <div className={classes.router_pages}>
        <div className={classes.headerBlock}>
          <div className="pre-page col-sm-5">
            <FaArrowLeft
              className="arrow"
              onClick={() => Navigatetodashboard()}
            />
            <h3 className={classes.header}>Sim</h3>
          </div>

          <button
            type="button"
            className={classes.addButton}
            onClick={() => {
              setShowAddModal(true);
            }}
          >
            Add Sim
          </button>
        </div>

        <form className={classes.filterBlock} onSubmit={handleSubmit}>
          <div className={classes.filterColums}>
            <label>Sim No</label>
            <CommonInput
              value={values.sim_number}
              onChange={(e) => {
                setFieldValue("sim_number", e);
              }}
              placeholder="Sim Number"
            />
          </div>
          <div className={classes.filterColums}>
            <label>Mobile No</label>
            <CommonInput
              value={values.mobile_no}
              onChange={(e) => {
                setFieldValue("mobile_no", e);
              }}
              placeholder="Mobile Number"
            />
          </div>
          <div className={classes.filterColums}>
            <label>IMSI No</label>
            <CommonInput
              value={values.imsi_number}
              onChange={(e) => {
                setFieldValue("imsi_number", e);
              }}
              placeholder="IMSI number"
            />
          </div>
          <div className={classes.filterColums}>
            <label>Network</label>
            <CommonInput
              value={values.network}
              onChange={(e) => {
                setFieldValue("network", e);
              }}
              placeholder="Network"
            />
          </div>
          <div className={`mt-0 ${classes.submitresetDiv}`}>
            <button
              type="submit"
              className={classes.searchBtn}
              // onClick={() => {
              // handleSubmit();
              // }}
            >
              Search
            </button>
            <button
              type="button"
              className={classes.resetBtn}
              onClick={() => {
                resetForm();
                handleSubmit();
              }}
            >
              Reset
            </button>
            {/* {total > 0 && (
              <button
                type="button"
                onClick={() => {
                  handleListSimData(page, size, filters, 1);
                }}
                className={classes.downloadHistorybutton}
              >
                Download
              </button>
            )} */}
          </div>
        </form>
        <div className={classes.importfileblock}>
          <div className={classes.fileBlock}>
            <h3>File Import</h3>
            <input
              type="file"
              id="fileInput"
              style={{ display: "none" }}
              onChange={(event) => {
                setimportSim(event.target.files[0]);
              }}
              accept=".xlsx, .xls"
              ref={fileRef}
            />
            <button
              type="button"
              onClick={() => {
                document.getElementById("fileInput").click();
              }}
              className={classes.fileInput}
            >
              Choose File
            </button>
            <span>{importSim ? importSim?.name : "No Files Choosen"}</span>
            {importSim && (
              <button
                type="button"
                className={classes.fileImportButton}
                onClick={() => {
                  if (importSim) {
                    handleImportFile();
                  }
                }}
              >
                <img
                  src={ExportedImages.UPLOAD_ICON}
                  style={{ width: "14px" }}
                />
                <span>Import</span>
              </button>
            )}
          </div>
          <div className={classes.fileBlock}>
            <p>Samplefile.xls</p>
            <img
              src={ExportedImages.DOWNLOAD_ICON}
              onClick={() => {
                // handleDownload();
                window.open(
                  "https://psdas.in/photonic_prod_uploads/sample_files/sim_sample.xlsx"
                );
              }}
              style={{
                width: "20px",
                cursor: "pointer",
              }}
            />
          </div>
        </div>
        <SimTable
          filters={filters}
          handleListSimData={handleListSimData}
          items={items}
          total={total}
          size={size}
          page={page}
        />
      </div>
    </>
  );
}
