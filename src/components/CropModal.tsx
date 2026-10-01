import { createEffect, createSignal, onMount } from "solid-js";
import { Check, X } from "lucide-solid";
import { useApp, useAttest, useBeneficiaries, useBoard, useIdPrint, usePhoto } from "~/store/context";
import { cropDataUrl, loadImage } from "~/lib/images";
import { pumpCropQueue } from "~/lib/upload";

type Handle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";
type Mode = "none" | "draw" | "move" | Handle;

const HIT = 16; // grab tolerance around handles, px
const MIN = 24; // minimum selection size, px

const CURSOR: Record<Handle | "move", string> = {
  nw: "nwse-resize", se: "nwse-resize",
  ne: "nesw-resize", sw: "nesw-resize",
  n: "ns-resize", s: "ns-resize",
  e: "ew-resize", w: "ew-resize",
  move: "move",
};

/**
 * Canvas cropper: 8 visible handles, drag-inside to move, drag-outside to
 * draw fresh, pointer events (mouse + touch), arrow-key nudge,
 * double-click to confirm.
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
  // last fitted display size, for bounds clamping + px readout
  let dw = 0;
  let dh = 0;

  const [rect, setRect] = createSignal({ x: 40, y: 40, w: 240, h: 160 });
  const [busy, setBusy] = createSignal(false);
  const [loading, setLoading] = createSignal(true);
  const [loadedSrc, setLoadedSrc] = createSignal<string | null>(null);
  const [dims, setDims] = createSignal("");
  const [err, setErr] = createSignal<string | null>(null);

  let mode: Mode = "none";
  let grabDX = 0;
  let grabDY = 0;
  // fixed opposite corner while an aspect-locked resize runs
  let anchor = { x: 0, y: 0 };

  const fit = () => {
    const c = canvasRef;
    if (!c || !img) return;
    const maxW = Math.min(700, c.parentElement!.clientWidth - 4);
    const maxH = Math.round(window.innerHeight * 0.52);
    const scale = Math.min(1, maxW / img.naturalWidth, maxH / img.naturalHeight);
    dw = Math.max(1, Math.round(img.naturalWidth * scale));
    dh = Math.max(1, Math.round(img.naturalHeight * scale));
    dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = Math.round(dw * dpr);
    c.height = Math.round(dh * dpr);
    c.style.width = `${dw}px`;
    c.style.height = `${dh}px`;
  };

  const points = (r: { x: number; y: number; w: number; h: number }): Record<Handle, { x: number; y: number }> => ({
    nw: { x: r.x, y: r.y },
    n: { x: r.x + r.w / 2, y: r.y },
    ne: { x: r.x + r.w, y: r.y },
    e: { x: r.x + r.w, y: r.y + r.h / 2 },
    se: { x: r.x + r.w, y: r.y + r.h },
    s: { x: r.x + r.w / 2, y: r.y + r.h },
    sw: { x: r.x, y: r.y + r.h },
    w: { x: r.x, y: r.y + r.h / 2 },
  });

  const opposite = (r: { x: number; y: number; w: number; h: number }, h: Handle) => {
    const p = points(r);
    return { nw: p.se, se: p.nw, ne: p.sw, sw: p.ne, n: p.s, s: p.n, e: p.w, w: p.e }[h]!;
  };

  const draw = () => {
    const c = canvasRef;
    if (!c || !img || dw === 0) return;
    fit();
    const ctx = c.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.drawImage(img, 0, 0, dw, dh);
    const r = rect();
    // dim outside
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, dw, r.y);
    ctx.fillRect(0, r.y + r.h, dw, dh - r.y - r.h);
    ctx.fillRect(0, r.y, r.x, r.h);
    ctx.fillRect(r.x + r.w, r.y, dw - r.x - r.w, r.h);
    // outline
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    // handles — white squares, impossible to miss
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1.5;
    for (const pt of Object.values(points(r))) {
      ctx.fillRect(pt.x - 6, pt.y - 6, 12, 12);
      ctx.strokeRect(pt.x - 6, pt.y - 6, 12, 12);
    }
    // source-pixel readout
    const kx = img.naturalWidth / dw;
    const ky = img.naturalHeight / dh;
    setDims(`${Math.max(1, Math.round(r.w * kx))} × ${Math.max(1, Math.round(r.h * ky))} px`);
  };

  /** What did the pointer land on? Corners win over edges. */
  const hitTest = (p: { x: number; y: number }): Handle | "move" | null => {
    const r = rect();
    const pts = points(r);
    for (const k of ["nw", "ne", "se", "sw"] as const) {
      if (Math.abs(p.x - pts[k].x) <= HIT && Math.abs(p.y - pts[k].y) <= HIT) return k;
    }
    for (const k of ["n", "s", "e", "w"] as const) {
      if (Math.abs(p.x - pts[k].x) <= HIT && Math.abs(p.y - pts[k].y) <= HIT) return k;
    }
    if (p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h) return "move";
    return null;
  };

  const pos = (e: PointerEvent) => {
    const r = canvasRef!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const clampFree = (r: { x: number; y: number; w: number; h: number }) => {
    const w = Math.min(Math.max(MIN, r.w), dw);
    const h = Math.min(Math.max(MIN, r.h), dh);
    return {
      x: Math.min(Math.max(0, r.x), dw - w),
      y: Math.min(Math.max(0, r.y), dh - h),
      w, h,
    };
  };

  const onDown = (e: PointerEvent) => {
    if (loading() || busy()) return;
    e.preventDefault();
    canvasRef?.setPointerCapture(e.pointerId);
    const p = pos(e);
    const hit = hitTest(p);
    if (hit === null) {
      mode = "draw";
      setRect({ x: p.x, y: p.y, w: 0, h: 0 });
    } else if (hit === "move") {
      mode = "move";
      const r = rect();
      grabDX = p.x - r.x;
      grabDY = p.y - r.y;
    } else {
      mode = hit;
      anchor = opposite(rect(), hit);
    }
  };

  const resizeLocked = (h: Handle, p: { x: number; y: number }) => {
    const a = job()?.aspect ?? 1.5;
    if (h === "e" || h === "w" || h === "n" || h === "s") {
      // edges: grow from the selection centre so the box stays put
      const r = rect();
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h / 2;
      let w = r.w;
      let hh = r.h;
      if (h === "e") w = Math.max(MIN, p.x - r.x);
      if (h === "w") w = Math.max(MIN, r.x + r.w - p.x);
      if (h === "s") hh = Math.max(MIN, p.y - r.y);
      if (h === "n") hh = Math.max(MIN, r.y + r.h - p.y);
      if (h === "e" || h === "w") hh = w / a;
      else w = hh * a;
      return clampFree({ x: cx - w / 2, y: cy - hh / 2, w, h: hh });
    }
    // corners: width follows the pointer, height follows the ratio
    const w = Math.max(MIN, Math.abs(p.x - anchor.x));
    const hh = w / a;
    const x = p.x >= anchor.x ? anchor.x : anchor.x - w;
    const y = p.y >= anchor.y ? anchor.y : anchor.y - hh;
    return clampFree({ x, y, w, h: hh });
  };

  const resizeFree = (h: Handle, p: { x: number; y: number }) => {
    const r = rect();
    const x2 = r.x + r.w;
    const y2 = r.y + r.h;
    let { x, y } = r;
    let w = r.w;
    let hh = r.h;
    if (h.includes("e")) w = p.x - x;
    if (h.includes("w")) { w = x2 - p.x; x = p.x; }
    if (h.includes("s")) hh = p.y - y;
    if (h.includes("n")) { hh = y2 - p.y; y = p.y; }
    return clampFree({ x, y, w, h: hh });
  };

  const onMove = (e: PointerEvent) => {
    const p = pos(e);
    if (mode === "none") {
      if (e.buttons === 0 && canvasRef) {
        const hit = hitTest(p);
        canvasRef.style.cursor = hit ? CURSOR[hit] : "crosshair";
      }
      return;
    }
    const r = rect();
    if (mode === "draw") {
      const a = job()?.aspect;
      const w = Math.max(0, p.x - r.x);
      const hh = a ? w / a : Math.max(0, p.y - r.y);
      setRect({ ...r, w, h: hh });
    } else if (mode === "move") {
      const w = r.w;
      const h = r.h;
      setRect({
        ...r,
        x: Math.min(Math.max(0, p.x - grabDX), Math.max(0, dw - w)),
        y: Math.min(Math.max(0, p.y - grabDY), Math.max(0, dh - h)),
      });
    } else if (job()?.aspect) {
      setRect(resizeLocked(mode, p));
    } else {
      setRect(resizeFree(mode, p));
    }
    draw();
  };

  const onUp = () => {
    mode = "none";
  };

  const nudge = (e: KeyboardEvent) => {    const step = e.shiftKey ? 10 : 2;
    const r = rect();
    let dx = 0;
    let dy = 0;
    if (e.key === "ArrowLeft") dx = -step;
    else if (e.key === "ArrowRight") dx = step;
    else if (e.key === "ArrowUp") dy = -step;
    else if (e.key === "ArrowDown") dy = step;
    else return;
    e.preventDefault();
    setRect({
      ...r,
      x: Math.min(Math.max(0, r.x + dx), Math.max(0, dw - r.w)),
      y: Math.min(Math.max(0, r.y + dy), Math.max(0, dh - r.h)),
    });
    draw();
  };

  // Serial guard: a newer job supersedes an in-flight decode.
  let loadToken = 0;

  const loadJob = async (src: string) => {
    const t = ++loadToken;
    setLoading(true);
    setErr(null);
    try {
      const next = await loadImage(src);
      if (t !== loadToken) return; // superseded by a newer job
      img = next;
      fit();
      const a = job()?.aspect;
      let w = dw * 0.85;
      let h = a ? w / a : dh * 0.7;
      if (h > dh * 0.92) { h = dh * 0.92; w = a ? h * a : w; }
      if (w > dw * 0.96) { w = dw * 0.96; h = a ? w / a : h; }
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

  // The queue advances inside this same mounted modal — load each new file.
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
        Math.min(img.naturalWidth, Math.max(1, Math.round(s.w * kx))),
        Math.min(img.naturalHeight, Math.max(1, Math.round(s.h * ky))),
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
        Drag a handle to resize · drag inside to move · drag outside to redraw · double-click to
        confirm{job()?.aspect ? " · ratio locked 3:2" : " · free ratio"}
        {dims() ? ` · ${dims()}` : ""}
      </p>
      {err() ? (
        <p class="mb-3 rounded border border-error/40 bg-error-subtle px-2 py-1 text-sm text-error">{err()}</p>
      ) : null}
      <div class="flex max-h-[60dvh] justify-center overflow-auto rounded border border-edge bg-deep p-1">
        <canvas
          ref={canvasRef}
          tabindex={0}
          aria-label="Crop selection. Arrow keys nudge, double-click confirms."
          class="max-w-full touch-none outline-none focus-visible:outline-2 focus-visible:outline-accent"
          style={{ cursor: "crosshair" }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onDblClick={() => void confirm()}
          onKeyDown={nudge}
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
