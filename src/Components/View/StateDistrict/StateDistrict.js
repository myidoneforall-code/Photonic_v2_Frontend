import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import toast from "react-hot-toast";
import Loader from "../../Loader";
import reports from "../Report/reports.module.css";
import classes from "./stateDistrict.module.css";
import {
  AddDistrictService,
  AddStateService,
  DeleteLocationService,
  LocationUsageService,
  state as listStates,
} from "../../../Service/ApiService";
import { getCatchMsg } from "../../../Utilities/Methods";

// trims, collapses spaces and ignores upper/lower case, so "coimbatore " equals "Coimbatore"
const keyOf = (name) => name.split(/\s+/).filter(Boolean).join(" ").toLowerCase();
const cleanName = (name) => name.split(/\s+/).filter(Boolean).join(" ");

// Super Admin page: add or delete states and districts.
export default function StateDistrict() {
  const navigate = useNavigate();
  const [loader, setloader] = useState(false);
  const [mode, setMode] = useState("add"); // add | delete
  const [kind, setKind] = useState("district"); // state | district
  const [states, setStates] = useState([]);
  const [stateId, setStateId] = useState("");
  const [oldList, setOldList] = useState([]); // [{id, name, controllers, devices}]
  const [newNames, setNewNames] = useState([]); // add mode
  const [picked, setPicked] = useState([]); // delete mode: ids
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const stateName = states.find((s) => String(s.state_id) === String(stateId))?.name;
  const needState = kind === "district";

  const loadStates = () => {
    return listStates()
      .then(({ data }) => {
        setStates(data || []);
        return data || [];
      })
      .catch((err) => getCatchMsg(err));
  };

  const loadOldList = (type = kind, sid = stateId) => {
    if (type === "district" && !sid) {
      setOldList([]);
      return;
    }
    setloader(true);
    const formData = new FormData();
    formData.append("type", type);
    if (type === "district") formData.append("state_id", sid);
    LocationUsageService(formData)
      .then(({ data }) => {
        if (data?.status === 1) {
          setOldList(data.items || []);
        } else {
          setOldList([]);
          toast.error(data?.msg || "Something went wrong");
        }
      })
      .catch((err) => getCatchMsg(err))
      .finally(() => setloader(false));
  };

  const resetWork = () => {
    setNewNames([]);
    setPicked([]);
    setText("");
    setError("");
  };

  useEffect(() => {
    loadStates().then((list) => {
      if (list?.length) {
        const tn = list.find((s) => keyOf(s.name || "") === "tamil nadu");
        const first = String((tn || list[0]).state_id);
        setStateId(first);
        loadOldList("district", first);
      }
    });
  }, []);

  const changeMode = (value) => {
    setMode(value);
    resetWork();
  };

  const changeKind = (value) => {
    setKind(value);
    resetWork();
    loadOldList(value, stateId);
  };

  const changeState = (value) => {
    setStateId(value);
    resetWork();
    if (kind === "district") loadOldList("district", value);
  };

  const addToList = () => {
    const name = cleanName(text);
    if (!name) {
      setError("Enter a name");
      return;
    }
    if (oldList.some((o) => keyOf(o.name) === keyOf(name))) {
      setError(`${name} is already in the old list`);
      return;
    }
    if (newNames.some((n) => keyOf(n) === keyOf(name))) {
      setError(`${name} is already added`);
      return;
    }
    setNewNames((pre) => [...pre, name]);
    setText("");
    setError("");
  };

  const handleSave = () => {
    if (!newNames.length) {
      setError("Add at least one name");
      return;
    }
    setloader(true);
    const formData = new FormData();
    formData.append("names", JSON.stringify(newNames));
    let call;
    if (kind === "state") {
      call = AddStateService(formData);
    } else {
      formData.append("state_id", stateId);
      call = AddDistrictService(formData);
    }
    call
      .then(({ data }) => {
        if (data?.status === 1) {
          toast.success(data.msg);
          resetWork();
          if (kind === "state") loadStates();
          loadOldList();
        } else {
          toast.error(data?.msg || "Something went wrong");
        }
      })
      .catch((err) => getCatchMsg(err))
      .finally(() => setloader(false));
  };

  const togglePick = (id) => {
    setPicked((pre) => (pre.includes(id) ? pre.filter((p) => p !== id) : [...pre, id]));
  };

  const pickedItems = oldList.filter((o) => picked.includes(o.id));
  const usedItems = pickedItems.filter((o) => o.controllers + o.devices > 0);
  const totalControllers = usedItems.reduce((sum, o) => sum + o.controllers, 0);
  const totalDevices = usedItems.reduce((sum, o) => sum + o.devices, 0);

  const handleDelete = () => {
    setloader(true);
    const formData = new FormData();
    formData.append("type", kind);
    formData.append("ids", JSON.stringify(picked));
    DeleteLocationService(formData)
      .then(({ data }) => {
        if (data?.status === 1) {
          toast.success(data.msg);
          resetWork();
          if (kind === "state") {
            loadStates().then((list) => {
              if (!(list || []).some((s) => String(s.state_id) === String(stateId))) {
                setStateId(list?.[0] ? String(list[0].state_id) : "");
              }
            });
          }
          loadOldList();
        } else {
          toast.error(data?.msg || "Something went wrong");
        }
      })
      .catch((err) => getCatchMsg(err))
      .finally(() => setloader(false));
  };

  const noun = kind === "state" ? "state" : "district";
  const oldTitle =
    kind === "state" ? `Old list: states (${oldList.length})` : `Old list: ${stateName || "-"} (${oldList.length})`;

  return (
    <>
      <Loader isLoader={loader} />
      <div className={reports.router_pages}>
        <div className="row mt-2 mb-3">
          <div className="pre-page col-sm-8">
            <FaArrowLeft className="arrow" onClick={() => navigate("/dashboard")} />
            <h3 className={reports.header}>State and District</h3>
          </div>
        </div>

        <div className={classes.switches}>
          <div className={classes.seg}>
            <button type="button" className={mode === "add" ? classes.on : ""} onClick={() => changeMode("add")}>
              Add
            </button>
            <button type="button" className={mode === "delete" ? classes.on : ""} onClick={() => changeMode("delete")}>
              Delete
            </button>
          </div>
          <div className={classes.seg}>
            <button type="button" className={kind === "state" ? classes.on : ""} onClick={() => changeKind("state")}>
              State
            </button>
            <button type="button" className={kind === "district" ? classes.on : ""} onClick={() => changeKind("district")}>
              District
            </button>
          </div>
        </div>

        {needState && (
          <div className={classes.stateRow}>
            <label>State</label>
            <select value={stateId} onChange={(e) => changeState(e.target.value)}>
              {states.map((s) => (
                <option key={s.state_id} value={s.state_id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className={classes.split}>
          <div className={classes.box}>
            <div className={classes.boxHead}>{oldTitle}</div>
            <div className={classes.boxBody}>
              {oldList.length === 0 && <div className={classes.empty}>No {noun} yet</div>}
              {oldList.map((o) => {
                const used = o.controllers + o.devices;
                const isPicked = picked.includes(o.id);
                return (
                  <div
                    key={o.id}
                    className={`${classes.row} ${mode === "delete" ? classes.clickable : ""} ${
                      isPicked ? classes.picked : ""
                    }`}
                    onClick={() => mode === "delete" && togglePick(o.id)}
                  >
                    <span>{o.name}</span>
                    {mode === "delete" && (
                      <span className={used ? classes.used : classes.muted}>
                        {used ? `${o.devices} devices, ${o.controllers} controllers` : "not used"}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className={`${classes.arrow} ${mode === "delete" ? classes.arrowDelete : ""}`}>
            <FaArrowRight />
          </div>

          {mode === "add" ? (
            <div className={classes.box}>
              <div className={classes.boxHead}>New list to add</div>
              <div className={classes.boxBody}>
                <div className={classes.addRow}>
                  <input
                    type="text"
                    maxLength={100}
                    placeholder={kind === "state" ? "State name" : "District name"}
                    value={text}
                    onChange={(e) => {
                      setText(e.target.value);
                      setError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addToList();
                      }
                    }}
                  />
                  <button type="button" onClick={addToList}>
                    +
                  </button>
                </div>
                {error && <div className={classes.error}>{error}</div>}
                {newNames.map((n) => (
                  <div key={n} className={classes.row}>
                    <span>{n}</span>
                    <span className={classes.remove} onClick={() => setNewNames((pre) => pre.filter((p) => p !== n))}>
                      x
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={classes.box}>
              <div className={classes.boxHead}>Selected to delete</div>
              <div className={classes.boxBody}>
                {pickedItems.length === 0 && <div className={classes.empty}>Click a {noun} in the old list</div>}
                {pickedItems.map((o) => (
                  <div key={o.id} className={classes.row}>
                    <span>{o.name}</span>
                    <span className={classes.remove} onClick={() => togglePick(o.id)}>
                      x
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {mode === "delete" && usedItems.length > 0 && (
          <div className={classes.warning}>
            <b>{usedItems.map((o) => o.name).join(", ")} {usedItems.length > 1 ? "are" : "is"} in use</b>
            <div>
              {totalDevices} devices and {totalControllers} controllers use{" "}
              {usedItems.length > 1 ? "these" : "this"} {noun}. Deleting {usedItems.length > 1 ? "them" : "it"} leaves
              them without a {noun} in the list.
              {kind === "state" ? " The districts of the state are deleted too." : ""}
            </div>
          </div>
        )}
        {mode === "delete" && kind === "state" && usedItems.length === 0 && pickedItems.length > 0 && (
          <div className={classes.note}>The districts of the selected {pickedItems.length > 1 ? "states are" : "state is"} deleted too.</div>
        )}

        <div className={classes.footer}>
          {mode === "add" ? (
            <>
              <span className={classes.muted}>
                {newNames.length
                  ? `${newNames.length} new ${noun}${newNames.length > 1 ? "s" : ""} will be saved${
                      needState ? ` in ${stateName}` : ""
                    }`
                  : ""}
              </span>
              <button type="button" className={reports.searchBtn} onClick={handleSave}>
                Save
              </button>
            </>
          ) : (
            <>
              <button type="button" className={reports.searchBtn} onClick={resetWork}>
                Cancel
              </button>
              {pickedItems.length > 0 && (
                <button type="button" className={reports.resetBtn} onClick={handleDelete}>
                  {usedItems.length ? "Delete anyway" : "Delete"}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
