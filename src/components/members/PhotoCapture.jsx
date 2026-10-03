import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Upload, RotateCcw, Loader2, User } from "lucide-react";

// Square-crop any image source and export a small JPEG data URL.
const toSquareJpeg = (source, sourceW, sourceH, size, quality) => {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const side = Math.min(sourceW, sourceH);
  const sx = (sourceW - side) / 2;
  const sy = (sourceH - side) / 2;
  canvas.getContext("2d").drawImage(source, sx, sy, side, side, 0, 0, size, size);
  return canvas.toDataURL("image/jpeg", quality);
};

const makeBoth = (source, w, h) => ({
  photo: toSquareJpeg(source, w, h, 360, 0.8),
  thumb: toSquareJpeg(source, w, h, 96, 0.7),
});

// Take a photo with the device camera (front camera on phones) or upload one.
// value: { photo, thumb } or null. onChange gets the same shape.
// Camera access needs HTTPS (or localhost); upload works everywhere.
const PhotoCapture = ({ value, onChange }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  const openCamera = async () => {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera is not available here. Use Upload photo instead.");
      return;
    }
    setBusy(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOn(true);
      // wait for the <video> to mount, then attach the stream
      requestAnimationFrame(() => {
        const v = videoRef.current;
        if (v) {
          v.srcObject = stream;
          v.play().catch(() => {});
        }
      });
    } catch {
      setError("Could not open the camera. Allow camera access or upload a photo.");
    } finally {
      setBusy(false);
    }
  };

  const capture = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    onChange(makeBoth(v, v.videoWidth, v.videoHeight));
    stopCamera();
  };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => onChange(makeBoth(img, img.naturalWidth, img.naturalHeight));
      img.onerror = () => setError("That file is not a valid image.");
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold text-slate-500">Member photo</span>
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-slate-50">
          {cameraOn ? (
            <video ref={videoRef} playsInline muted autoPlay className="h-full w-full scale-x-[-1] object-cover" />
          ) : value?.photo ? (
            <img src={value.photo} alt="Member" className="h-full w-full object-cover" />
          ) : (
            <User size={40} className="text-slate-300" />
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {cameraOn ? (
            <>
              <button type="button" onClick={capture} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                <Camera size={15} /> Capture
              </button>
              <button type="button" onClick={stopCamera} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={openCamera} disabled={busy} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                {busy ? <Loader2 size={15} className="animate-spin" /> : value?.photo ? <RotateCcw size={15} /> : <Camera size={15} />}
                {value?.photo ? "Retake" : "Open camera"}
              </button>
              <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                <Upload size={15} /> Upload photo
              </button>
            </>
          )}
          <input ref={fileRef} type="file" accept="image/*" capture="user" onChange={onFile} className="hidden" />
        </div>
      </div>
      {error && <p role="alert" className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
};

export default PhotoCapture;
