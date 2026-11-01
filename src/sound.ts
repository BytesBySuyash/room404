export const SOUND_NAMES = [
  "startup",
  "shutdown",
  "open",
  "close",
  "click",
  "minimize",
  "maximize",
  "error",
  "notify",
  "mail",
  "recycle",
  "done",
  "modem",
  "pinball",
] as const;
export type SoundName = (typeof SOUND_NAMES)[number];
/** User-gesture-unlocked audio; only original, same-origin WAV files are loaded. */
export class SoundEngine {
  private context: AudioContext | null = null;
  private gain: GainNode | null = null;
  private cache = new Map<SoundName, Promise<AudioBuffer>>();
  private sources = new Set<AudioBufferSourceNode>();
  private enabled = true;
  private volume = 0.5;
  private generation = 0;
  setPreferences(enabled: boolean, volume: number) {
    this.enabled = enabled;
    this.volume = volume;
    if (this.gain) this.gain.gain.value = volume;
    if (!enabled) this.stop();
  }
  unlock() {
    if (!this.enabled || typeof window.AudioContext !== "function") return;
    try {
      if (!this.context) {
        this.context = new window.AudioContext();
        this.gain = this.context.createGain();
        this.gain.gain.value = this.volume;
        this.gain.connect(this.context.destination);
      }
      void this.context.resume().catch(() => {});
    } catch {
      /* Silent fallback for unavailable audio hardware. */
    }
  }
  async play(name: SoundName) {
    if (!this.enabled) return;
    const generation = this.generation;
    this.unlock();
    const ctx = this.context;
    if (!ctx || !this.gain) return;
    try {
      let request = this.cache.get(name);
      if (!request) {
        request = fetch(
          new URL(`files/Windows/Media/${name}.wav`, document.baseURI),
        )
          .then((r) => {
            if (!r.ok) throw new Error("Missing sound");
            return r.arrayBuffer();
          })
          .then((b) => ctx.decodeAudioData(b));
        this.cache.set(name, request);
      }
      const buffer = await request;
      if (
        !this.enabled ||
        generation !== this.generation ||
        ctx.state === "closed"
      )
        return;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.gain);
      source.onended = () => this.sources.delete(source);
      this.sources.add(source);
      source.start();
    } catch {
      this.cache.delete(name);
    }
  }
  stop() {
    this.generation++;
    for (const s of this.sources) {
      try {
        s.stop();
      } catch {
        /* Already ended. */
      }
    }
    this.sources.clear();
  }
}
export const systemSounds = new SoundEngine();
