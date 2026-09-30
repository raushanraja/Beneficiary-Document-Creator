import { createSignal, onMount } from "solid-js";
import { Check, RotateCcw, X } from "lucide-solid";
import { useApp, useAttest, useBeneficiaries, useBoard, useIdPrint } from "~/store/context";
import { loadImage } from "~/lib/images";

/** Redaction tool: drag white boxes over sensitive regions. Mouse + touch. */
export const RedactModal = () => {
  const app = useApp();
  const ben = useBeneficiaries();
  const attest = useAttest();
  const idp = useIdPrint();
  const board = useBoard();

  const job = () => app.redactJob();
  let canvasRef: HTMLCanvasElement | undefined;
  let base: HTMLImageElement | null = null;
  const [boxes, setBoxes] = createSignal<{ x: number; y: number; w: number; h: number }[]>([]);
  const [drawing, setDrawing] = createSignal(false);
  const [start, setStart] = createSignal({ x: 0, y: 0 });
  const [err, setErr] = createSignal<string | null>(null);

  const paint = (preview?: { x: number; y: number; w: number; h: number }) => {
    const c = canvasRef;
    if (!c || !base) return;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(base, 0, 0, c.width, c.height);
    ctx.fillStyle = "#ffffff";
    for (const b of boxes()) ctx.fillRect(b.x, b.y, b.w, b.h);
    if (preview) {
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillRect(preview.x, preview.y, preview.w, preview.h);
      ctx.strokeStyle = "#999";
      ctx.strokeRect(preview.x, preview.y, preview.w, preview.h);
    }
  };

  const toPx = (e: MouseEvent | TouchEvent) => {
    const r = canvasRef!.getBoundingClientRect();
    const t = "touches" in e ? e.touches[0]! : (e as MouseEvent);
    return {
      x: ((t.clientX - r.left) * canvasRef!.width) / r.width,
      y: ((t.clientY - r.top) * canvasRef!.height) / r.height,
    };
  };

  const down = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    setStart(toPx(e));
    setDrawing(true);
  };
  const move = (e: MouseEvent | TouchEvent) => {
    if (!drawing()) return;
    e.preventDefault();
    const p = toPx(e);
    const s = start();
    paint({ x: Math.min(s.x, p.x), y: Math.min(s.y, p.y), w: Math.abs(p.x - s.x), h: Math.abs(p.y - s.y) });
  };
  const up = (e: MouseEvent | TouchEvent) => {
    if (!drawing()) return;
    e.preventDefault();
    const p = toPx(e);
    const s = start();
    const b = { x: Math.min(s.x, p.x), y: Math.min(s.y, p.y), w: Math.abs(p.x - s.x), h: Math.abs(p.y - s.y) };
    if (b.w > 4 && b.h > 4) setBoxes((v) => [...v, b]);
    setDrawing(false);
    paint();
  };

  onMount(async () => {
    try {
      base = await loadImage(job()!.src);
      canvasRef!.width = base.naturalWidth;
      canvasRef!.height = base.naturalHeight;
      paint();
    } catch {
      setErr("Could not decode that image.");
    }
  });

  const save = () => {
    const j = job();
    if (!j || !canvasRef) return;
    const out = canvasRef.toDataURL("image/jpeg", 0.9);
    if (j.target === "beneficiary") ben.replaceStaged(j.index, out);
    else if (j.target === "attest" && j.imageId) attest.replace(j.imageId, out);
    else if (j.target === "idprint" && j.imageId) idp.replace(j.imageId, out);
    else if (j.target === "board" && j.imageId) board.replace(j.imageId, out);
    app.toast("Redaction saved", "success");
    app.closeModal();
  };

  return (
    <div>
      <h2 class="mb-1 font-mono text-xs uppercase tracking-[0.05em] text-fg">Redact image</h2>
      <p class="mb-3 font-mono text-[11px] text-fg-dim">
        Drag boxes over anything to hide · {boxes().length} box{boxes().length === 1 ? "" : "es"}
      </p>
      {err() ? (
        <p class="mb-3 rounded border border-error/40 bg-error-subtle px-2 py-1 text-sm text-error">{err()}</p>
      ) : null}
      <div class="flex max-h-[55vh] justify-center overflow-auto rounded border border-edge bg-deep p-1">
        <canvas
          ref={canvasRef}
          class="max-h-[52vh] max-w-full cursor-crosshair touch-none"
          onMouseDown={down}
          onMouseMove={move}
          onMouseUp={up}
          onMouseLeave={up}
          onTouchStart={down}
          onTouchMove={move}
          onTouchEnd={up}
        />
      </div>
      <div class="mt-3 flex justify-end gap-1.5">
        <button
          type="button"
          class="chip"
          onClick={() => { setBoxes([]); paint(); }}
        >
          <RotateCcw class="icon" /> Reset
        </button>
        <button type="button" class="chip" onClick={() => app.closeModal()}>
          <X class="icon" /> Cancel <kbd>esc</kbd>
        </button>
        <button type="button" class="chip border-accent/40 text-accent" onClick={save}>
          <Check class="icon icon--accent" /> Save changes
        </button>
      </div>
    </div>
  );
};
