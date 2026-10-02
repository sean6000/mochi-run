export class Input {
  left = false;
  right = false;
  jumpHeld = false;
  jumpPressed = false;
  jumpLatch = false;

  constructor() {
    window.addEventListener("keydown", (e) => this.onKey(e, true));
    window.addEventListener("keyup", (e) => this.onKey(e, false));
    this.bindButton("btn-left", "left");
    this.bindButton("btn-right", "right");
    this.bindJump("btn-jump");
  }

  onKey(e: KeyboardEvent, down: boolean) {
    const k = e.key.toLowerCase();
    if (["arrowleft", "a", "arrowright", "d", "arrowup", "w", " "].includes(k)) {
      e.preventDefault();
    }
    if (k === "arrowleft" || k === "a") this.left = down;
    if (k === "arrowright" || k === "d") this.right = down;
    if (k === "arrowup" || k === "w" || k === " ") {
      if (down && !this.jumpHeld) this.jumpLatch = true;
      this.jumpHeld = down;
    }
  }

  bindButton(id: string, dir: "left" | "right") {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Missing #${id}`);
    const set = (v: boolean) => {
      this[dir] = v;
      el.classList.toggle("held", v);
    };
    el.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      set(true);
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* Pointer capture is optional; the button still holds until pointerup. */
      }
    });
    el.addEventListener("pointerup", () => set(false));
    el.addEventListener("pointercancel", () => set(false));
    el.addEventListener("lostpointercapture", () => set(false));
  }

  bindJump(id: string) {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Missing #${id}`);
    const set = (v: boolean) => {
      if (v && !this.jumpHeld) this.jumpLatch = true;
      this.jumpHeld = v;
      el.classList.toggle("held", v);
    };
    el.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      set(true);
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* Pointer capture is optional; the button still holds until pointerup. */
      }
    });
    el.addEventListener("pointerup", () => set(false));
    el.addEventListener("pointercancel", () => set(false));
    el.addEventListener("lostpointercapture", () => set(false));
  }

  consumeJump() {
    const p = this.jumpLatch;
    this.jumpLatch = false;
    this.jumpPressed = p;
    return p;
  }
}
