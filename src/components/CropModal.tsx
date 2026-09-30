import { createEffect, createSignal, onMount } from "solid-js";
import { Check, X } from "lucide-solid";
import { useApp, useAttest, useBeneficiaries, useBoard, useIdPrint, usePhoto } from "~/store/context";
import { cropDataUrl, loadImage } from "~/lib/images";
import { pumpCropQueue } from "~/lib/upload";

/**
 * Lightweight canvas cropper (no dependency): drag to draw, drag inside to
 * move, drag the corner handle to resize. Aspect lock for ID-shaped scans.
 */
export const CropModal = () => {
  const app = useApp();
  const ben = useBeneficiaries();
  const attest = useAttest();
  const idp = useIdPrint();
  const photo = usePhoto();
  const board = useBoard();

  const job = () => app.cropJob();
  let canvasRef: HTMLCanvasElement | undefined;
  let img: HTMLImageElement | null = null;
  let dpr = 1;

  // selection in display px
  const [rect, setRect] = createSignal({ x: 40, y: 40, w: 240, h: 160 });
  const [busy, setBusy] = createSignal(false);
  const [loading, setLoading] = createSignal(true);
  const [loadedSrc, setLoadedSrc] = createSignal<string | null>(null);
  const [err, setErr] = createSignal<string | null>(null);
  let loadToken = 0;
  let mode: "none" | "draw" | "move" | "resize" = "none";
  let grabDX = 0;
  let grabDY = 0;

  const HANDLE = 14;

  const fit = () => {
    const c = canvasRef;
    if (!c || !img) return { scale: 1, dw: 0, dh: 0 };
    const maxW = Math.min(720, c.parentElement!.clientWidth - 4);
    const scale = Math.min(1, maxW / img.naturalWidth, 520 / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = Math.round(dw * dpr);
    c.height = Math.round(dh * dpr);
    c.style.width = `${dw}px`;
    c.style.height = `${dh}px`;
    return { scale, dw, dh };
  };

  const draw = () => {
    const c = canvasRef;
    if (!c || !img) return;
    const { dw, dh } = fit();
    const ctx = c.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.drawImage(img, 0, 0, dw, dh);
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    const r = rect();
    ctx.fillRect(0, 0, dw, r.y);
    ctx.fillRect(0, r.y + r.h, dw, dh - r.y - r.h);
    ctx.fillRect(0, r.y, r.x, r.h);
    ctx.fillRect(r.x + r.w, r.y, dw - r.x - r.w, r.h);
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    // resize handle
    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(r.x + r.w - HANDLE, r.y + r.h - HANDLE, HANDLE, HANDLE);
  };

  const withAspect = (w: number, h: number) => {
    const a = job()?.aspect;
    if (!a) return { w, h };
    // keep width as driver
    return { w, h: w / a };
  };

  const pos = (e: MouseEvent) => {
    const r = canvasRef!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onDown = (e: MouseEvent) => {
    const p = pos(e);
    const r = rect();
    const inHandle =
      p.x >= r.x + r.w - HANDLE && p.x <= r.x + r.w && p.y >= r.y + r.h - HANDLE && p.y <= r.y + r.h;
    if (inHandle) mode = "resize";
    else if (p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h) {
      mode = "move";
      grabDX = p.x - r.x;
      grabDY = p.y - r.y;
    } else {
      mode = "draw";
      setRect({ x: p.x, y: p.y, w: 10, h: job()?.aspect ? 10 / job()!.aspect! : 10 });
    }
  };

  const onMove = (e: MouseEvent) => {
    if (mode === "none") return;
    const p = pos(e);
    const r = rect();
    if (mode === "draw") {
      const w = Math.max(10, p.x - r.x);
      const s = withAspect(w, Math.max(10, p.y - r.y));
      setRect({ ...r, w: s.w, h: s.h });
    } else if (mode === "move") {
      setRect({ ...r, x: p.x - grabDX, y: p.y - grabDY });
    } else {
      const w = Math.max(20, p.x - r.x);
      const s = withAspect(w, Math.max(20, p.y - r.y));
      setRect({ ...r, w: s.w, h: s.h });
    }
    draw();
  };

  const onUp = () => { mode = "none"; };

  const loadJob = async (src: string) => {
    const t = ++loadToken;
    setLoading(true);
    setErr(null);
    try {
      const next = await loadImage(src);
      if (t !== loadToken) return; // superseded by a newer job
      img = next;
      const { dw, dh } = fit();
      const a = job()?.aspect;
      let w = dw * 0.8;
      let h = a ? w / a : dh * 0.6;
      if (h > dh * 0.9) { h = dh * 0.9; w = a ? h * a : w; }
      setRect({ x: (dw - w) / 2, y: (dh - h) / 2, w, h });
      setLoadedSrc(src);
      draw();
    } catch {
      if (t !== loadToken) return;
      setErr("Could not decode that image.");
    } finally {
      if (t === loadToken) {
        setLoading(false);
        setBusy(false);
      }
    }
  };

  onMount(() => {
    const j = job();
    if (j) void loadJob(j.src);
  });

  // The queue advances inside this same mounted modal — a new job must load
  // its own image and release the Working state, not reuse the previous one.
  createEffect(() => {
    const j = job();
    if (j && canvasRef && j.src !== loadedSrc()) void loadJob(j.src);
  });

  const confirm = async () => {
    const j = job();
    if (!j || !img || busy() || loading()) return;
    setBusy(true);
    try {
      const c = canvasRef!;
      const r = c.getBoundingClientRect();
      const kx = img.naturalWidth / r.width;
      const ky = img.naturalHeight / r.height;
      const s = rect();
      const out = await cropDataUrl(
        j.src,
        Math.max(0, Math.round(s.x * kx)),
        Math.max(0, Math.round(s.y * ky)),
        Math.min(img.naturalWidth, Math.round(s.w * kx)),
        Math.min(img.naturalHeight, Math.round(s.h * ky)),
      );
      if (j.target === "beneficiary") ben.addStaged(out);
      else if (j.target === "attest") attest.add(out, j.name);
      else if (j.target === "idprint") idp.add(out, j.name);
      else if (j.target === "photogrid") photo.setSrc(out);
      else board.add(out, j.name);
      app.toast("Image added", "success");
      if (!pumpCropQueue(app)) app.closeModal();
    } catch {
      setErr("Crop failed — try a smaller selection.");
      setBusy(false);
    }
  };

  return (
    <div>
      <h2 class="mb-1 font-mono text-xs uppercase tracking-[0.05em] text-fg">
        {job()?.title ?? "Crop image"}
      </h2>
      <p class="mb-3 font-mono text-[11px] text-fg-dim">
        Drag to draw · drag inside to move · corner to resize
        {job()?.aspect ? " · ratio locked 3:2" : " · free ratio"}
      </p>
      {err() ? (
        <p class="mb-3 rounded border border-error/40 bg-error-subtle px-2 py-1 text-sm text-error">{err()}</p>
      ) : null}
      <div class="flex justify-center overflow-auto rounded border border-edge bg-deep p-1">
        <canvas
          ref={canvasRef}
          class="max-w-full cursor-crosshair touch-none"
          onMouseDown={onDown}
          onMouseMove={onMove}
          onMouseUp={onUp}
          onMouseLeave={onUp}
        />
      </div>
      <div class="mt-3 flex justify-end gap-1.5">
        <button type="button" class="chip" onClick={() => app.closeModal()}>
          <X class="icon" /> Cancel <kbd>esc</kbd>
        </button>
        <button
          type="button"
          class="chip border-accent/40 text-accent"
          disabled={busy() || loading()}
          onClick={confirm}
        >
          <Check class="icon icon--accent" /> {loading() ? "Loading…" : busy() ? "Working…" : "Confirm crop"}
        </button>
      </div>
    </div>
  );
};
