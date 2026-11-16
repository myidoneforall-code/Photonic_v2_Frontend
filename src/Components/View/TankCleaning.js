import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { FaArrowLeft, FaCamera, FaChevronLeft, FaChevronRight, FaHistory, FaTimes } from "react-icons/fa";
import {
  TankCleaningDatesService,
  TankCleaningImageService,
  TankCleaningUploadService,
} from "../../Service/ApiService";
import { getCatchMsg } from "../../Utilities/Methods";

const ORANGE = "#F58A07";
const BLUE = "#1a6a9e";
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

const pad = (n) => String(n).padStart(2, "0");

const iconButton = {
  width: "30px",
  height: "30px",
  borderRadius: "50%",
  border: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  background: "#EAF6FB",
  color: BLUE,
  padding: 0,
};

const roundButton = (extra) => ({
  border: "none",
  borderRadius: "6px",
  padding: "8px 18px",
  fontSize: "14px",
  cursor: "pointer",
  ...extra,
});

// A window over the page (in the body, so a card never cuts it).
function Sheet({ title, onBack, onClose, children }) {
  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 3000,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "460px",
          maxHeight: "94vh",
          overflowY: "auto",
          padding: "12px 14px 16px",
          color: "#1d1d1f",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          {onBack ? (
            <button type="button" aria-label="Back" onClick={onBack} style={{ ...iconButton, background: "transparent" }}>
              <FaArrowLeft size={16} />
            </button>
          ) : (
            <span style={{ width: "30px" }} />
          )}
          <span style={{ fontSize: "15px", fontWeight: 600 }}>{title}</span>
          <button type="button" aria-label="Close" onClick={onClose} style={{ ...iconButton, background: "transparent" }}>
            <FaTimes size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

// The camera: only a live photo (no gallery). Take it, retake if needed, save it. The date,
// the time and the user ID are written on the photo by the server when it is saved, and the
// photo is kept in the database only.
function CameraSheet({ device, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState("");
  const [shot, setShot] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(null);

  const stop = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const start = useCallback(async () => {
    setError("");
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("no camera");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (e) {
      setError("The camera is not available. Allow the camera for this site (it needs https).");
    }
  }, []);

  // the camera runs only while no photo is taken
  useEffect(() => {
    if (!shot && !saved) {
      start();
    }
    return stop;
  }, [shot, saved, start]);

  useEffect(
    () => () => {
      if (shot?.url) URL.revokeObjectURL(shot.url);
    },
    [shot]
  );

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      toast.error("The camera is not ready");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (blob) setShot({ blob, url: URL.createObjectURL(blob) });
      },
      "image/jpeg",
      0.9
    );
  };

  const save = () => {
    setSaving(true);
    const formData = new FormData();
    formData.append("photo", shot.blob, "tank.jpg");
    TankCleaningUploadService(device?.device_id, formData)
      .then(({ data }) => {
        if (data?.status !== 1) {
          toast.error(data?.msg || "Something went wrong");
          return null;
        }
        toast.success(data.replaced ? "Today's photo replaced" : "Photo saved");
        return TankCleaningImageService(device?.device_id, data.photo_date);
      })
      .then((res) => {
        if (res?.data?.image) setSaved(res.data);
      })
      .catch((err) => getCatchMsg(err))
      .finally(() => setSaving(false));
  };

  return (
    <Sheet title={`${device?.device_name || "Tank"} - Camera`} onClose={onClose}>
      {error ? (
        <p style={{ color: "#c0392b", fontSize: "14px" }}>{error}</p>
      ) : saved ? (
        <>
          <img src={saved.image} alt="Saved" style={{ width: "100%", borderRadius: "8px" }} />
          <p style={{ fontSize: "12px", margin: "8px 0 0" }}>Saved {saved.taken_at}</p>
          <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
            <button type="button" onClick={onClose} style={roundButton({ background: BLUE, color: "#fff" })}>
              Done
            </button>
          </div>
        </>
      ) : shot ? (
        <>
          <img src={shot.url} alt="Taken" style={{ width: "100%", borderRadius: "8px" }} />
          <p style={{ fontSize: "11px", color: "#6b7785", margin: "6px 0 0" }}>
            The date, time and your user ID are written on the photo when it is saved.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "10px" }}>
            <button
              type="button"
              disabled={saving}
              onClick={() => setShot(null)}
              style={roundButton({ background: "#eceff3", color: "#1d1d1f" })}
            >
              Retake
            </button>
            <button type="button" disabled={saving} onClick={save} style={roundButton({ background: ORANGE, color: "#fff" })}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </>
      ) : (
        <>
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            style={{ width: "100%", borderRadius: "8px", background: "#000", minHeight: "200px" }}
          />
          <div style={{ display: "flex", justifyContent: "center", marginTop: "12px" }}>
            <button
              type="button"
              aria-label="Take photo"
              onClick={capture}
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                border: `4px solid ${ORANGE}`,
                background: "#ffffff",
                cursor: "pointer",
              }}
            />
          </div>
        </>
      )}
    </Sheet>
  );
}

// The cleaning history: a calendar where the dates that have a photo are orange. Touching an
// orange date shows its photo; back (or close) there returns to the calendar.
function HistorySheet({ device, onClose }) {
  const now = new Date();
  const [month, setMonth] = useState({ y: now.getFullYear(), m: now.getMonth() + 1 });
  const [dates, setDates] = useState([]);
  const [today, setToday] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState(null);

  useEffect(() => {
    let live = true;
    setLoading(true);
    TankCleaningDatesService(device?.device_id, month.y, month.m)
      .then(({ data }) => {
        if (!live) return;
        setDates(data?.dates || []);
        setToday(data?.today || "");
      })
      .catch((err) => getCatchMsg(err))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [device?.device_id, month]);

  const move = (step) =>
    setMonth((pre) => {
      const index = pre.y * 12 + (pre.m - 1) + step;
      return { y: Math.floor(index / 12), m: (index % 12) + 1 };
    });

  const open = (date) => {
    TankCleaningImageService(device?.device_id, date)
      .then(({ data }) => {
        if (data?.image) setView(data);
      })
      .catch((err) => getCatchMsg(err));
  };

  const first = new Date(month.y, month.m - 1, 1).getDay();
  const count = new Date(month.y, month.m, 0).getDate();
  const cells = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= count; d++) cells.push(d);

  if (view) {
    const back = () => setView(null);
    return (
      <Sheet title={view.photo_date.split("-").reverse().join("-")} onBack={back} onClose={back}>
        <img src={view.image} alt="Tank" style={{ width: "100%", borderRadius: "8px" }} />
        <p style={{ fontSize: "12px", margin: "8px 0 0" }}>
          Taken {view.taken_at}
          {view.user_id ? ` - User ID ${view.user_id}` : ""}
          {view.user_name ? ` (${view.user_name})` : ""}
        </p>
      </Sheet>
    );
  }

  return (
    <Sheet title={`${device?.device_name || "Tank"} - Cleaning history`} onClose={onClose}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
        <button type="button" aria-label="Previous month" onClick={() => move(-1)} style={iconButton}>
          <FaChevronLeft size={13} />
        </button>
        <span style={{ fontSize: "15px", fontWeight: 600 }}>
          {MONTHS[month.m - 1]} {month.y}
        </span>
        <button type="button" aria-label="Next month" onClick={() => move(1)} style={iconButton}>
          <FaChevronRight size={13} />
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", textAlign: "center" }}>
        {DAYS.map((day, i) => (
          <span key={i} style={{ fontSize: "12px", color: "#6b7785", padding: "4px 0" }}>
            {day}
          </span>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <span key={`e${i}`} />;
          const key = `${month.y}-${pad(month.m)}-${pad(day)}`;
          const has = dates.includes(key);
          return (
            <button
              key={key}
              type="button"
              disabled={!has}
              onClick={() => open(key)}
              aria-label={has ? `${key}, photo` : key}
              style={{
                height: "38px",
                width: "38px",
                margin: "0 auto",
                borderRadius: "50%",
                border: key === today && !has ? `1px solid ${ORANGE}` : "none",
                background: has ? ORANGE : "transparent",
                color: has ? "#ffffff" : "#1d1d1f",
                fontSize: "14px",
                fontWeight: has ? 600 : 400,
                cursor: has ? "pointer" : "default",
                padding: 0,
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
      <p style={{ fontSize: "11px", color: "#6b7785", margin: "10px 0 0" }}>
        {loading ? "Loading..." : "Orange dates have a photo."}
      </p>
    </Sheet>
  );
}

// The two icons of a tank card: Camera and Cleaning history, each with its name under it.
export default function TankCleaning({ device, labels = true }) {
  const [open, setOpen] = useState(null);
  if (!device?.device_id) return null;
  const press = (name) => (e) => {
    e.stopPropagation();
    setOpen(name);
  };
  const item = (name, title, icon) => (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={press(name)}
      style={{
        border: "none",
        background: "transparent",
        padding: 0,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "3px",
        color: BLUE,
      }}
    >
      <span style={iconButton}>{icon}</span>
      {labels ? <span style={{ fontSize: "12px", lineHeight: "14px", color: "#1d1d1f" }}>{title}</span> : null}
    </button>
  );
  return (
    <>
      <div
        style={{ display: "flex", gap: labels ? "18px" : "8px", alignItems: "flex-start", justifyContent: "center", flexWrap: "wrap" }}
        onClick={(e) => e.stopPropagation()}
      >
        {item("camera", "Camera", <FaCamera size={14} />)}
        {item("history", "Cleaning history", <FaHistory size={14} />)}
      </div>
      {open === "camera" ? <CameraSheet device={device} onClose={() => setOpen(null)} /> : null}
      {open === "history" ? <HistorySheet device={device} onClose={() => setOpen(null)} /> : null}
    </>
  );
}
