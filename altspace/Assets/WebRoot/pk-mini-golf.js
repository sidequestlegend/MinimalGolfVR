/*!
 * pk-mini-golf.js - Mini Golf, a multiplayer port of MinimalGolfVR to Altspace.
 *
 * Copyright (c) 2026 Dilmer Valecillos (MinimalGolfVR, https://github.com/dilmerv/MinimalGolfVR)
 * Copyright (c) 2026 the Mini Golf port's contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
 * persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and
 * this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * (MIT License)
 *
 * Source of this script (TypeScript): https://github.com/sidequestlegend/MinimalGolfVR (branch altspace, folder
 * altspace/ts; build with npm run build). It bundles the portkit runtime (MIT License, Copyright (c) 2026 the portkit
 * authors). The kit it loads uses the Kenney Minigolf Kit and Kenney sounds (CC0), Liberation Sans and Space Mono (SIL Open Font
 * License 1.1); their notices and licence texts are inside the kit bundles.
 */
/*! The portkit runtime in this file:
 * MIT License
 *
 * Copyright (c) 2026 the portkit authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
/* pk-mini-golf.js: portkit runtime with the rules of 'mini-golf' (protocol pk1, bindings 89c115ae664cb468cacde5366397235cf84ea1fd). Built file: do not edit. */
(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // portkit/src/behaviour.ts
  var LINK = /* @__PURE__ */ Symbol("pk1.link");
  function linkBehaviour(behaviour, link) {
    Object.defineProperty(behaviour, LINK, { value: link, enumerable: false, configurable: true, writable: false });
  }
  function linkOf(behaviour) {
    const link = behaviour[LINK];
    if (!link) throw new Error("this behaviour is not part of a running instance yet (do not use the runtime in a constructor or a field initialiser)");
    return link;
  }
  var Behaviour = class {
    // ---- what the runtime provides ------------------------------------------------------------------------------
    /** The id this behaviour has in bindings.json. */
    get behaviourId() {
      return linkOf(this).id;
    }
    get gameObject() {
      return linkOf(this).gameObject;
    }
    get transform() {
      return linkOf(this).gameObject.transform;
    }
    get Networking() {
      return linkOf(this).networking;
    }
    get Time() {
      return linkOf(this).time;
    }
    get Random() {
      return linkOf(this).random;
    }
    get Debug() {
      return linkOf(this).debug;
    }
    /** Commit / reveal, fair draws and sealed delivery. */
    get Secrets() {
      return linkOf(this).secrets;
    }
    /** Per-device saved data for the local player (localStorage). */
    get Storage() {
      return linkOf(this).storage;
    }
    /** Text, animator parameters, particles and colours on kit objects. */
    get Host() {
      return linkOf(this).host;
    }
    /** The snippet element's attributes. */
    get Settings() {
      return linkOf(this).settings;
    }
    /** Per-player saved values everyone present can read (VRChat: PlayerData). */
    get PlayerData() {
      return linkOf(this).playerData;
    }
    /** Buttons, thumbsticks, triggers, keys, head and hand poses, haptics, teleport. */
    get Input() {
      return linkOf(this).input;
    }
    /** Values only the world's owner and moderators can write. */
    get Protected() {
      return linkOf(this).protectedValues;
    }
    /**
     * For a per-player behaviour: the player it belongs to. Null on an ordinary behaviour. An upstream field named
     * `Player` would hide it: such a port renames the field (the convention: `upstreamPlayer`) or reads `OwnerPlayer`.
     */
    get Player() {
      return linkOf(this).player;
    }
    /** The same as `Player`, under a name no upstream field is likely to use. */
    get OwnerPlayer() {
      return linkOf(this).player;
    }
    /**
     * One object shared by every instance of this game on the page (two tables of one game keep one chip balance
     * here). Page memory only: not synced, not saved, gone when the page reloads (use Storage for that).
     */
    get Shared() {
      return linkOf(this).shared;
    }
    /** This instance's key (the `room` / `instance` attribute, or the element's index): `pk1.<slug>.<key>`. */
    get InstanceKey() {
      return linkOf(this).instanceKey;
    }
    /**
     * This behaviour's own click reach in metres, overriding the bindings' `reach`, the class's `interactReach` and
     * the game's default (a snippet setting, for example). Undefined: those apply. 0: any distance.
     */
    get InteractReach() {
      return linkOf(this).reach.get(this);
    }
    set InteractReach(metres) {
      if (metres === void 0) linkOf(this).reach.delete(this);
      else linkOf(this).reach.set(this, metres);
    }
    // ---- calls --------------------------------------------------------------------------------------------------
    /** Sends the synced fields. Only the owner's request does anything; it goes out at the end of the tick. */
    RequestSerialization() {
      linkOf(this).requestSerialization();
    }
    SendCustomEvent(name) {
      const fn = this[name];
      if (typeof fn === "function") fn.call(this);
      else this.Debug.LogWarning(`SendCustomEvent: ${this.behaviourId} has no method '${name}'`);
    }
    /**
     * Runs `name` on every client (All: here at once, then everywhere else) or only on the owner's. Arguments
     * must be JSON data or the value types of values.ts. While the method runs, `Networking.CallingPlayer` is
     * the sender: check it before honouring a request not everybody may make. `name` must be listed in the
     * class's `static networkCallable`.
     */
    SendCustomNetworkEvent(target, name, ...args) {
      linkOf(this).sendNetworkEvent(target, name, args);
    }
    /**
     * Asks the referee to run `name` on its copy of this behaviour, with `Networking.CallingPlayer` set to the
     * sender. Unlike a network event the request is numbered and kept until the referee acknowledges it: it is
     * run in order, survives a change of referee, and is never replayed to a late joiner. Returns its number.
     */
    SendCommand(name, ...args) {
      return linkOf(this).sendCommand(name, args);
    }
    SendCustomEventDelayedSeconds(name, seconds) {
      linkOf(this).delaySeconds(name, seconds);
    }
    /** A frame is one 50 ms tick here. */
    SendCustomEventDelayedFrames(name, frames) {
      linkOf(this).delayFrames(name, frames);
    }
    /** Another behaviour of this instance, by its bindings id. */
    FindBehaviour(id) {
      return linkOf(this).find(id);
    }
    /** Every ordinary behaviour of this instance with the given bindings type, in bindings order. */
    FindBehavioursOfType(type) {
      return linkOf(this).findByType(type);
    }
    /** The per-player behaviour of the given type that belongs to `player`. */
    PlayerBehaviour(player, type) {
      return linkOf(this).playerBehaviour(player, type);
    }
    /** One per-player behaviour of the given type for every player present, in player-id order. */
    PlayerBehaviours(type) {
      return linkOf(this).playerBehaviours(type);
    }
    /** One of the few things that are truly asynchronous: await it. */
    Raycast(origin, direction, maxDistance = 1e3, layerMask = -1) {
      return linkOf(this).raycast(origin, direction, maxDistance, layerMask);
    }
    /**
     * Has `method` called when a graph of the kit reports `name` through
     * `window.__pk1.event("<slug>:<inst>", "<name>", "<arg>|<arg>...")`. The method receives the arguments as strings.
     */
    RegisterGraphEvent(name, method) {
      linkOf(this).onGraphEvent(name, method);
    }
    // ---- overridable, as in UdonSharp ---------------------------------------------------------------------------
    Start() {
    }
    /**
     * Called after Start and after any saved values were applied, once this client knows what it came to: a new
     * game ("fresh"), saved state nobody was playing ("resumed": carry on or reset, as the game prefers), a game
     * others are playing ("joined"), or no game yet ("idle"). In a game with declared referee candidates it is
     * called again when the first referee is elected. The same value is `this.Networking.StartKind`.
     */
    OnInstanceStart(_kind) {
    }
    /** Called 20 times a second, only on classes that override it. `this.Time.deltaTime` is the time it covers. */
    Update() {
    }
    /** Synced fields were just replaced by another player's values. Not called for the owner's own writes. */
    OnDeserialization(_result) {
    }
    OnPreSerialization() {
    }
    /** `success` is false when the room refused the write (see OnWriteRefused for why). */
    OnPostSerialization(_result) {
    }
    OnOwnershipTransferred(_player) {
    }
    OnPlayerJoined(_player) {
    }
    OnPlayerLeft(_player) {
    }
    /** A player's saved data and per-player behaviours are loaded and published (VRChat: OnPlayerRestored). */
    OnPlayerRestored(_player) {
    }
    /** Values in a player's PlayerData changed; `keys` names them. */
    OnPlayerDataUpdated(_player, _keys) {
    }
    /** The room refused something this behaviour wrote. Also reported through OnPostSerialization for fields. */
    OnWriteRefused(_refusal) {
    }
    /** The referee has run the command this behaviour sent with that number. */
    OnCommandAcknowledged(_number) {
    }
    /** A player's fair draw under `label` changed state (see Secrets.beginDraw). Called on every behaviour that overrides it. */
    OnDrawChanged(_player, _label, _state) {
    }
    /** A protected value changed. Called on every behaviour that overrides it. */
    OnProtectedChanged(_key) {
    }
    /**
     * The referee changed (VRChat: OnMasterTransferred). Null when there is none left (a game with declared
     * candidates and nobody offering). A game with hidden information may void its match here: the new referee
     * does not know what the old one dealt.
     */
    OnMasterTransferred(_newMaster) {
    }
    /** A controller button of the local player went down or came up. Called on every behaviour that overrides it. */
    OnButtonPressed(_button, _side) {
    }
    OnButtonReleased(_button, _side) {
    }
    /** A key went down or came up; `key` is the Unity KeyCode name. */
    OnKeyPressed(_key) {
    }
    OnKeyReleased(_key) {
    }
    /** The local player clicked this behaviour's object. */
    Interact() {
    }
    OnPickup() {
    }
    OnDrop() {
    }
    /** The instance is going away (its element left the page), or this per-player behaviour's player left. */
    OnDestroy() {
    }
  };
  /** Names of the fields that are synced. Values must be JSON data, arrays of it, or the value types of values.ts. */
  __publicField(Behaviour, "synced", []);
  /** "manual": sent by RequestSerialization(). "continuous": sent when changed, a few times a second. */
  __publicField(Behaviour, "syncMode", "manual");
  /**
   * UdonSharp's [FieldChangeCallback]: synced field name -> the property to assign instead. When a received
   * value differs from the field's current one, the property's setter is called with it (and must store it);
   * local code gets the same effect by assigning through the property.
   *
   *   static synced = ["_open"];
   *   static fieldChangeCallbacks = { _open: "Open" };
   *   _open = false;
   *   get Open() { return this._open; }
   *   set Open(value: boolean) { this._open = value; this.door.SetActive(!value); }
   */
  __publicField(Behaviour, "fieldChangeCallbacks", {});
  /**
   * True for a behaviour that exists once per player (VRChat: a PlayerObject). It is made when the player joins
   * and dropped when they leave, that player owns it for good, and its synced fields travel in their user state.
   */
  __publicField(Behaviour, "perPlayer", false);
  /** For a per-player behaviour: its synced fields are saved on the device and put back on the next visit. */
  __publicField(Behaviour, "persistent", false);
  /**
   * Metres from the nearest of the local head and hands within which a click counts as Interact() (or as a bound
   * click). 0 means any distance. A behaviour can change its own at run time with `InteractReach`.
   */
  __publicField(Behaviour, "interactReach", 0);
  /**
   * The methods another client may run on this behaviour: by SendCustomNetworkEvent, or by SendCommand on the
   * referee. Nothing else can be called from the network (a modified client names any method it likes), and a
   * name starting with `_` never can. A subclass's list adds to its parent's.
   *
   *   static networkCallable = ["StartGame", "PlaceBid"];
   */
  __publicField(Behaviour, "networkCallable", []);

  // portkit/src/names.ts
  var TAG = "pk1";
  function sanitizeInstanceKey(raw) {
    if (!raw) return "";
    return raw.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 24).replace(/-+$/g, "");
  }
  function isValidSlug(slug) {
    return /^[a-z0-9][a-z0-9-]{0,62}$/.test(slug);
  }
  function instanceKeyFor(attrs, indexAmongSameName) {
    return sanitizeInstanceKey(attrs.room) || sanitizeInstanceKey(attrs.instance) || String(indexAmongSameName);
  }
  function holderName(slug, inst) {
    return `${TAG}:${slug}:${inst}`;
  }
  function relayKey(slug, inst) {
    return `${slug}:${inst}`;
  }
  function networkId(slug, inst, objKey) {
    return `${TAG}/${slug}/${inst}/${objKey}`;
  }
  function attachId(slug, inst, objKey) {
    const ok = (s) => s.length <= 53 && /^[A-Za-z0-9_\-:@]+$/.test(s);
    const plain = `${TAG}:${slug}:${inst}:${objKey}`;
    if (ok(plain)) return plain;
    const short = `${TAG}:${slug}:${inst}:${fnv(objKey)}`;
    if (ok(short)) return short;
    return `${TAG}:${fnv(`${slug}:${inst}:${objKey}`)}${fnv(`${objKey}:${inst}:${slug}`)}`;
  }
  function fnv(text) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h.toString(16).padStart(8, "0");
  }
  function statePrefix(slug, inst) {
    return `${TAG}.${slug}.${inst}`;
  }
  function storagePrefix(slug, inst, uid) {
    return `${TAG}.${slug}.${inst}.${uid}.`;
  }
  function isPathSegment(segment) {
    return /^[A-Za-z0-9_\-@]{1,64}$/.test(segment);
  }
  function makeEnvelope(slug, inst, type, fields) {
    return { pk: 1, g: slug, i: inst, t: type, ...fields };
  }

  // portkit/src/util.ts
  function utf8Length(text) {
    let bytes = 0;
    for (let i = 0; i < text.length; i++) {
      const c = text.charCodeAt(i);
      if (c < 128) bytes += 1;
      else if (c < 2048) bytes += 2;
      else if (c >= 55296 && c <= 56319 && i + 1 < text.length && (text.charCodeAt(i + 1) & 64512) === 56320) {
        bytes += 4;
        i++;
      } else bytes += 3;
    }
    return bytes;
  }
  function utf8Encode(text) {
    const out = new Uint8Array(utf8Length(text));
    let o = 0;
    for (let i = 0; i < text.length; i++) {
      let c = text.charCodeAt(i);
      if (c >= 55296 && c <= 56319 && i + 1 < text.length && (text.charCodeAt(i + 1) & 64512) === 56320) {
        c = 65536 + (c - 55296 << 10) + (text.charCodeAt(++i) - 56320);
      } else if (c >= 55296 && c <= 57343) c = 65533;
      if (c < 128) out[o++] = c;
      else if (c < 2048) {
        out[o++] = 192 | c >> 6;
        out[o++] = 128 | c & 63;
      } else if (c < 65536) {
        out[o++] = 224 | c >> 12;
        out[o++] = 128 | c >> 6 & 63;
        out[o++] = 128 | c & 63;
      } else {
        out[o++] = 240 | c >> 18;
        out[o++] = 128 | c >> 12 & 63;
        out[o++] = 128 | c >> 6 & 63;
        out[o++] = 128 | c & 63;
      }
    }
    return out;
  }
  function utf8Decode(bytes) {
    let out = "";
    for (let i = 0; i < bytes.length; ) {
      const b = bytes[i++];
      let c;
      if (b < 128) c = b;
      else if (b < 224) c = (b & 31) << 6 | bytes[i++] & 63;
      else if (b < 240) {
        c = (b & 15) << 12 | (bytes[i] & 63) << 6 | bytes[i + 1] & 63;
        i += 2;
      } else {
        c = (b & 7) << 18 | (bytes[i] & 63) << 12 | (bytes[i + 1] & 63) << 6 | bytes[i + 2] & 63;
        i += 3;
      }
      out += String.fromCodePoint(c);
    }
    return out;
  }
  var B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  function toBase64(bytes) {
    let out = "";
    for (let i = 0; i < bytes.length; i += 3) {
      const a = bytes[i];
      const b = i + 1 < bytes.length ? bytes[i + 1] : 0;
      const c = i + 2 < bytes.length ? bytes[i + 2] : 0;
      out += B64[a >> 2] + B64[(a & 3) << 4 | b >> 4];
      if (i + 1 < bytes.length) out += B64[(b & 15) << 2 | c >> 6];
      if (i + 2 < bytes.length) out += B64[c & 63];
    }
    return out;
  }
  function fromBase64(text) {
    const clean = text.replace(/=+$/, "");
    const out = new Uint8Array(Math.floor(clean.length * 3 / 4));
    let o = 0;
    let buffer = 0;
    let bits = 0;
    for (let i = 0; i < clean.length; i++) {
      let v = B64.indexOf(clean[i]);
      if (v < 0) v = clean[i] === "+" ? 62 : clean[i] === "/" ? 63 : -1;
      if (v < 0) throw new Error("bad base64 character");
      buffer = buffer << 6 | v;
      bits += 6;
      if (bits >= 8) {
        bits -= 8;
        out[o++] = buffer >> bits & 255;
      }
    }
    return out.subarray(0, o);
  }
  function fnv1a(text) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(16).padStart(8, "0");
  }
  function canonicalJson(value) {
    return JSON.stringify(sortKeys(value));
  }
  function sortKeys(value) {
    if (Array.isArray(value)) return value.map(sortKeys);
    if (value && typeof value === "object") {
      const out = {};
      for (const key of Object.keys(value).sort()) out[key] = sortKeys(value[key]);
      return out;
    }
    return value;
  }
  function asciiJson(value) {
    const json = JSON.stringify(value);
    let out = "";
    let from = 0;
    for (let i = 0; i < json.length; i++) {
      const code = json.charCodeAt(i);
      if (code !== 124 && code < 127) continue;
      out += json.slice(from, i) + BACKSLASH + "u" + code.toString(16).padStart(4, "0");
      from = i + 1;
    }
    return from === 0 ? json : out + json.slice(from);
  }
  var BACKSLASH = String.fromCharCode(92);
  function jsonLeafBytes(text) {
    let bytes = 2;
    for (let i = 0; i < text.length; i++) bytes += leafCharBytes(text, i);
    return bytes;
  }
  function leafCharBytes(text, i) {
    const c = text.charCodeAt(i);
    if (c === 34 || c === 92) return 2;
    if (c < 32) return c === 8 || c === 9 || c === 10 || c === 12 || c === 13 ? 2 : 6;
    if (c < 128) return 1;
    if (c < 2048) return 2;
    if (c >= 56320 && c <= 57343) return i > 0 && (text.charCodeAt(i - 1) & 64512) === 55296 ? 0 : 3;
    if (c >= 55296 && c <= 56319) return i + 1 < text.length && (text.charCodeAt(i + 1) & 64512) === 56320 ? 4 : 3;
    return 3;
  }
  function safeParse(text) {
    if (typeof text !== "string" || text.length === 0) return void 0;
    try {
      return JSON.parse(text);
    } catch {
      return void 0;
    }
  }
  function isRecord(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
  }
  function deferred() {
    let resolveFn;
    const d = {
      promise: new Promise((resolve) => {
        resolveFn = resolve;
      }),
      resolve(value) {
        if (d.settled) return;
        d.settled = true;
        resolveFn(value);
      },
      settled: false
    };
    return d;
  }

  // portkit/src/values.ts
  var Vector2 = class _Vector2 {
    constructor(x = 0, y = 0) {
      __publicField(this, "x");
      __publicField(this, "y");
      this.x = x;
      this.y = y;
    }
    static get zero() {
      return new _Vector2(0, 0);
    }
    static get one() {
      return new _Vector2(1, 1);
    }
    static get up() {
      return new _Vector2(0, 1);
    }
    static get down() {
      return new _Vector2(0, -1);
    }
    static get left() {
      return new _Vector2(-1, 0);
    }
    static get right() {
      return new _Vector2(1, 0);
    }
    clone() {
      return new _Vector2(this.x, this.y);
    }
    add(o) {
      return new _Vector2(this.x + o.x, this.y + o.y);
    }
    sub(o) {
      return new _Vector2(this.x - o.x, this.y - o.y);
    }
    scale(k) {
      return new _Vector2(this.x * k, this.y * k);
    }
    /** C# `==` on Vector2 is an approximate comparison; this is the same test. */
    equals(o) {
      if (!o) return false;
      const dx = this.x - o.x;
      const dy = this.y - o.y;
      return dx * dx + dy * dy < 999999944e-19;
    }
    get magnitude() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    get sqrMagnitude() {
      return this.x * this.x + this.y * this.y;
    }
    get normalized() {
      const m = this.magnitude;
      return m > 1e-5 ? this.scale(1 / m) : _Vector2.zero;
    }
    static Distance(a, b) {
      return a.sub(b).magnitude;
    }
    static Dot(a, b) {
      return a.x * b.x + a.y * b.y;
    }
    static Lerp(a, b, t) {
      const k = Mathf.Clamp01(t);
      return new _Vector2(a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k);
    }
    toString() {
      return `(${this.x}, ${this.y})`;
    }
  };
  var Vector3 = class _Vector3 {
    constructor(x = 0, y = 0, z = 0) {
      __publicField(this, "x");
      __publicField(this, "y");
      __publicField(this, "z");
      this.x = x;
      this.y = y;
      this.z = z;
    }
    static get zero() {
      return new _Vector3(0, 0, 0);
    }
    static get one() {
      return new _Vector3(1, 1, 1);
    }
    static get up() {
      return new _Vector3(0, 1, 0);
    }
    static get down() {
      return new _Vector3(0, -1, 0);
    }
    static get left() {
      return new _Vector3(-1, 0, 0);
    }
    static get right() {
      return new _Vector3(1, 0, 0);
    }
    static get forward() {
      return new _Vector3(0, 0, 1);
    }
    static get back() {
      return new _Vector3(0, 0, -1);
    }
    clone() {
      return new _Vector3(this.x, this.y, this.z);
    }
    add(o) {
      return new _Vector3(this.x + o.x, this.y + o.y, this.z + o.z);
    }
    sub(o) {
      return new _Vector3(this.x - o.x, this.y - o.y, this.z - o.z);
    }
    scale(k) {
      return new _Vector3(this.x * k, this.y * k, this.z * k);
    }
    equals(o) {
      if (!o) return false;
      const dx = this.x - o.x;
      const dy = this.y - o.y;
      const dz = this.z - o.z;
      return dx * dx + dy * dy + dz * dz < 999999944e-19;
    }
    get magnitude() {
      return Math.sqrt(this.sqrMagnitude);
    }
    get sqrMagnitude() {
      return this.x * this.x + this.y * this.y + this.z * this.z;
    }
    get normalized() {
      const m = this.magnitude;
      return m > 1e-5 ? this.scale(1 / m) : _Vector3.zero;
    }
    static Distance(a, b) {
      return a.sub(b).magnitude;
    }
    /** Degrees between two directions, 0 to 180 (UnityEngine.Vector3.Angle; 0 when either is nearly zero). */
    static Angle(from, to) {
      const denominator = Math.sqrt(from.sqrMagnitude * to.sqrMagnitude);
      if (denominator < 1e-15) return 0;
      const dot = Mathf.Clamp(_Vector3.Dot(from, to) / denominator, -1, 1);
      return Math.acos(dot) * Mathf.Rad2Deg;
    }
    /** Reflects a direction off the plane with normal `inNormal` (UnityEngine.Vector3.Reflect). */
    static Reflect(inDirection, inNormal) {
      const factor = -2 * _Vector3.Dot(inNormal, inDirection);
      return new _Vector3(factor * inNormal.x + inDirection.x, factor * inNormal.y + inDirection.y, factor * inNormal.z + inDirection.z);
    }
    static Dot(a, b) {
      return a.x * b.x + a.y * b.y + a.z * b.z;
    }
    static Cross(a, b) {
      return new _Vector3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
    }
    static Lerp(a, b, t) {
      const k = Mathf.Clamp01(t);
      return new _Vector3(a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k, a.z + (b.z - a.z) * k);
    }
    static MoveTowards(current, target, maxDelta) {
      const d = target.sub(current);
      const m = d.magnitude;
      return m <= maxDelta || m === 0 ? target.clone() : current.add(d.scale(maxDelta / m));
    }
    toString() {
      return `(${this.x}, ${this.y}, ${this.z})`;
    }
  };
  var Quaternion = class _Quaternion {
    constructor(x = 0, y = 0, z = 0, w = 1) {
      __publicField(this, "x");
      __publicField(this, "y");
      __publicField(this, "z");
      __publicField(this, "w");
      this.x = x;
      this.y = y;
      this.z = z;
      this.w = w;
    }
    static get identity() {
      return new _Quaternion(0, 0, 0, 1);
    }
    clone() {
      return new _Quaternion(this.x, this.y, this.z, this.w);
    }
    /** Unity's Quaternion.Euler: degrees, applied in Z, X, Y order. */
    static Euler(x, y, z) {
      const hx = x * Mathf.Deg2Rad / 2;
      const hy = y * Mathf.Deg2Rad / 2;
      const hz = z * Mathf.Deg2Rad / 2;
      const sx = Math.sin(hx), cx = Math.cos(hx);
      const sy = Math.sin(hy), cy = Math.cos(hy);
      const sz = Math.sin(hz), cz = Math.cos(hz);
      return new _Quaternion(
        cy * sx * cz + sy * cx * sz,
        sy * cx * cz - cy * sx * sz,
        cy * cx * sz - sy * sx * cz,
        cy * cx * cz + sy * sx * sz
      );
    }
    static AngleAxis(degrees, axis) {
      const n2 = axis.normalized;
      const h = degrees * Mathf.Deg2Rad / 2;
      const s = Math.sin(h);
      return new _Quaternion(n2.x * s, n2.y * s, n2.z * s, Math.cos(h));
    }
    /** this * o: rotate by o first, then by this (Unity's operator order). */
    mul(o) {
      return new _Quaternion(
        this.w * o.x + this.x * o.w + this.y * o.z - this.z * o.y,
        this.w * o.y + this.y * o.w + this.z * o.x - this.x * o.z,
        this.w * o.z + this.z * o.w + this.x * o.y - this.y * o.x,
        this.w * o.w - this.x * o.x - this.y * o.y - this.z * o.z
      );
    }
    /** this * v: the vector rotated by this quaternion. */
    rotate(v) {
      const { x, y, z, w } = this;
      const tx = 2 * (y * v.z - z * v.y);
      const ty = 2 * (z * v.x - x * v.z);
      const tz = 2 * (x * v.y - y * v.x);
      return new Vector3(v.x + w * tx + (y * tz - z * ty), v.y + w * ty + (z * tx - x * tz), v.z + w * tz + (x * ty - y * tx));
    }
    get inverse() {
      const n2 = this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w || 1;
      return new _Quaternion(-this.x / n2, -this.y / n2, -this.z / n2, this.w / n2);
    }
    /** Degrees, each in [0, 360), in Unity's convention. */
    get eulerAngles() {
      const { x, y, z, w } = this;
      const sinX = 2 * (w * x - y * z);
      let ex, ey, ez;
      if (Math.abs(sinX) > 0.9999995) {
        ex = Math.sign(sinX) * Math.PI / 2;
        ey = 2 * Math.atan2(y, w);
        ez = 0;
      } else {
        ex = Math.asin(sinX);
        ey = Math.atan2(2 * (w * y + x * z), 1 - 2 * (x * x + y * y));
        ez = Math.atan2(2 * (w * z + x * y), 1 - 2 * (x * x + z * z));
      }
      const wrap = (r) => {
        const d = r * Mathf.Rad2Deg % 360;
        return d < 0 ? d + 360 : d;
      };
      return new Vector3(wrap(ex), wrap(ey), wrap(ez));
    }
    /** Degrees between two rotations (UnityEngine.Quaternion.Angle). */
    static Angle(a, b) {
      const dot = Math.min(Math.abs(a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w), 1);
      return dot > 0.999999 ? 0 : Math.acos(dot) * 2 * Mathf.Rad2Deg;
    }
    /**
     * The rotation whose forward (Z) is `forward` and whose up is as close to `upwards` as it can be
     * (UnityEngine.Quaternion.LookRotation). A zero forward gives the identity.
     */
    static LookRotation(forward, upwards = new Vector3(0, 1, 0)) {
      const f = forward.normalized;
      if (f.sqrMagnitude < 1e-12) return _Quaternion.identity;
      let r = Vector3.Cross(upwards, f);
      if (r.sqrMagnitude < 1e-12) {
        const axis = Vector3.Cross(new Vector3(0, 0, 1), f);
        if (axis.sqrMagnitude < 1e-12) return f.z >= 0 ? _Quaternion.identity : new _Quaternion(0, 1, 0, 0);
        return _Quaternion.AngleAxis(Math.acos(Mathf.Clamp(f.z, -1, 1)) * Mathf.Rad2Deg, axis);
      }
      r = r.normalized;
      const u = Vector3.Cross(f, r);
      const m00 = r.x, m01 = u.x, m02 = f.x;
      const m10 = r.y, m11 = u.y, m12 = f.y;
      const m20 = r.z, m21 = u.z, m22 = f.z;
      const trace = m00 + m11 + m22;
      let q;
      if (trace > 0) {
        const s = Math.sqrt(trace + 1) * 2;
        q = new _Quaternion((m21 - m12) / s, (m02 - m20) / s, (m10 - m01) / s, 0.25 * s);
      } else if (m00 > m11 && m00 > m22) {
        const s = Math.sqrt(1 + m00 - m11 - m22) * 2;
        q = new _Quaternion(0.25 * s, (m01 + m10) / s, (m02 + m20) / s, (m21 - m12) / s);
      } else if (m11 > m22) {
        const s = Math.sqrt(1 + m11 - m00 - m22) * 2;
        q = new _Quaternion((m01 + m10) / s, 0.25 * s, (m12 + m21) / s, (m02 - m20) / s);
      } else {
        const s = Math.sqrt(1 + m22 - m00 - m11) * 2;
        q = new _Quaternion((m02 + m20) / s, (m12 + m21) / s, 0.25 * s, (m10 - m01) / s);
      }
      return q;
    }
    static Slerp(a, b, t) {
      const k = Mathf.Clamp01(t);
      let dot = a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
      const s = dot < 0 ? -1 : 1;
      dot = Math.abs(dot);
      let wa, wb;
      if (dot > 0.9995) {
        wa = 1 - k;
        wb = k;
      } else {
        const theta = Math.acos(dot);
        const sin = Math.sin(theta);
        wa = Math.sin((1 - k) * theta) / sin;
        wb = Math.sin(k * theta) / sin;
      }
      wb *= s;
      const q = new _Quaternion(a.x * wa + b.x * wb, a.y * wa + b.y * wb, a.z * wa + b.z * wb, a.w * wa + b.w * wb);
      const n2 = Math.sqrt(q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w) || 1;
      return new _Quaternion(q.x / n2, q.y / n2, q.z / n2, q.w / n2);
    }
    equals(o) {
      if (!o) return false;
      return Math.abs(this.x * o.x + this.y * o.y + this.z * o.z + this.w * o.w) > 0.999999;
    }
    toString() {
      return `(${this.x}, ${this.y}, ${this.z}, ${this.w})`;
    }
  };
  var Vector4 = class _Vector4 {
    constructor(x = 0, y = 0, z = 0, w = 0) {
      __publicField(this, "x");
      __publicField(this, "y");
      __publicField(this, "z");
      __publicField(this, "w");
      this.x = x;
      this.y = y;
      this.z = z;
      this.w = w;
    }
    clone() {
      return new _Vector4(this.x, this.y, this.z, this.w);
    }
    equals(o) {
      return !!o && this.x === o.x && this.y === o.y && this.z === o.z && this.w === o.w;
    }
  };
  var Color = class _Color {
    constructor(r = 0, g = 0, b = 0, a = 1) {
      __publicField(this, "r");
      __publicField(this, "g");
      __publicField(this, "b");
      __publicField(this, "a");
      this.r = r;
      this.g = g;
      this.b = b;
      this.a = a;
    }
    static get white() {
      return new _Color(1, 1, 1, 1);
    }
    static get black() {
      return new _Color(0, 0, 0, 1);
    }
    static get red() {
      return new _Color(1, 0, 0, 1);
    }
    static get green() {
      return new _Color(0, 1, 0, 1);
    }
    static get blue() {
      return new _Color(0, 0, 1, 1);
    }
    static get yellow() {
      return new _Color(1, 0.92156863, 0.015686275, 1);
    }
    static get clear() {
      return new _Color(0, 0, 0, 0);
    }
    static get cyan() {
      return new _Color(0, 1, 1, 1);
    }
    static get magenta() {
      return new _Color(1, 0, 1, 1);
    }
    static get gray() {
      return new _Color(0.5, 0.5, 0.5, 1);
    }
    static get grey() {
      return new _Color(0.5, 0.5, 0.5, 1);
    }
    /**
     * UnityEngine.Color.HSVToRGB, line for line: H, S, V in [0, 1]; with `hdr` false each channel is clamped to
     * [0, 1]. Alpha is 1. (Unity computes in single precision; this in double: the last digits can differ.)
     */
    static HSVToRGB(H, S, V, hdr = true) {
      const c = new _Color(1, 1, 1, 1);
      if (S === 0) {
        c.r = V;
        c.g = V;
        c.b = V;
      } else if (V === 0) {
        c.r = 0;
        c.g = 0;
        c.b = 0;
      } else {
        c.r = 0;
        c.g = 0;
        c.b = 0;
        const h = H * 6;
        const temp = Math.floor(h);
        const t = h - temp;
        const var1 = V * (1 - S);
        const var2 = V * (1 - S * t);
        const var3 = V * (1 - S * (1 - t));
        switch (temp) {
          case 0:
            c.r = V;
            c.g = var3;
            c.b = var1;
            break;
          case 1:
            c.r = var2;
            c.g = V;
            c.b = var1;
            break;
          case 2:
            c.r = var1;
            c.g = V;
            c.b = var3;
            break;
          case 3:
            c.r = var1;
            c.g = var2;
            c.b = V;
            break;
          case 4:
            c.r = var3;
            c.g = var1;
            c.b = V;
            break;
          case 5:
            c.r = V;
            c.g = var1;
            c.b = var2;
            break;
          case 6:
            c.r = V;
            c.g = var3;
            c.b = var1;
            break;
          case -1:
            c.r = V;
            c.g = var1;
            c.b = var2;
            break;
        }
        if (!hdr) {
          c.r = Mathf.Clamp01(c.r);
          c.g = Mathf.Clamp01(c.g);
          c.b = Mathf.Clamp01(c.b);
        }
      }
      return c;
    }
    /** UnityEngine.Color.RGBToHSV: [H, S, V], each in [0, 1]. */
    static RGBToHSV(color) {
      const { r, g, b } = color;
      const rgbToHue = (offset, dominant, c1, c2) => {
        const V = dominant;
        if (V === 0) return [0, 0, 0];
        const min = c1 > c2 ? c2 : c1;
        const delta = V - min;
        if (delta === 0) return [0, 0, V];
        const S = delta / V;
        let H = offset + (c1 - c2) / delta;
        H /= 6;
        if (H < 0) H += 1;
        return [H, S, V];
      };
      if (b > g && b > r) return rgbToHue(4, b, r, g);
      if (g > r) return rgbToHue(2, g, b, r);
      return rgbToHue(0, r, g, b);
    }
    clone() {
      return new _Color(this.r, this.g, this.b, this.a);
    }
    static Lerp(a, b, t) {
      const k = Mathf.Clamp01(t);
      return new _Color(a.r + (b.r - a.r) * k, a.g + (b.g - a.g) * k, a.b + (b.b - a.b) * k, a.a + (b.a - a.a) * k);
    }
    equals(o) {
      return !!o && this.r === o.r && this.g === o.g && this.b === o.b && this.a === o.a;
    }
  };
  var Curve = class {
    constructor(keys) {
      __publicField(this, "keys");
      this.keys = keys;
    }
    Evaluate(t) {
      const k = this.keys;
      if (k.length === 0) return 0;
      if (t <= k[0][0]) return k[0][1];
      for (let i = 1; i < k.length; i++) {
        if (t <= k[i][0]) {
          const [t0, v0] = k[i - 1];
          const [t1, v1] = k[i];
          return t1 === t0 ? v1 : v0 + (v1 - v0) * (t - t0) / (t1 - t0);
        }
      }
      return k[k.length - 1][1];
    }
  };
  var Mathf = {
    PI: Math.PI,
    Deg2Rad: Math.PI / 180,
    Rad2Deg: 180 / Math.PI,
    Epsilon: 1401298e-51,
    Infinity: Number.POSITIVE_INFINITY,
    Abs: Math.abs,
    Min: Math.min,
    Max: Math.max,
    Sqrt: Math.sqrt,
    Pow: Math.pow,
    Sin: Math.sin,
    Cos: Math.cos,
    Atan2: Math.atan2,
    Floor: Math.floor,
    Ceil: Math.ceil,
    FloorToInt: (v) => Math.floor(v),
    CeilToInt: (v) => Math.ceil(v),
    /** C# rounds halves to the even neighbour; Math.round does not. */
    Round: (v) => {
      const f = Math.floor(v);
      const d = v - f;
      if (d < 0.5) return f;
      if (d > 0.5) return f + 1;
      return f % 2 === 0 ? f : f + 1;
    },
    RoundToInt: (v) => Mathf.Round(v),
    Sign: (v) => v >= 0 ? 1 : -1,
    Clamp: (v, lo, hi) => v < lo ? lo : v > hi ? hi : v,
    Clamp01: (v) => v < 0 ? 0 : v > 1 ? 1 : v,
    Lerp: (a, b, t) => a + (b - a) * Mathf.Clamp01(t),
    LerpUnclamped: (a, b, t) => a + (b - a) * t,
    InverseLerp: (a, b, v) => a === b ? 0 : Mathf.Clamp01((v - a) / (b - a)),
    MoveTowards: (current, target, maxDelta) => Math.abs(target - current) <= maxDelta ? target : current + Math.sign(target - current) * maxDelta,
    Repeat: (t, length) => Mathf.Clamp(t - Math.floor(t / length) * length, 0, length),
    Approximately: (a, b) => Math.abs(b - a) < Math.max(1e-6 * Math.max(Math.abs(a), Math.abs(b)), 1121039e-50)
  };
  function encodeValue(value) {
    if (value === void 0 || value === null) return null;
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    if (typeof value !== "object") return value;
    if (value instanceof Vector2) return { $v2: [value.x, value.y] };
    if (value instanceof Vector3) return { $v3: [value.x, value.y, value.z] };
    if (value instanceof Quaternion) return { $q: [value.x, value.y, value.z, value.w] };
    if (value instanceof Vector4) return { $v4: [value.x, value.y, value.z, value.w] };
    if (value instanceof Color) return { $color: [value.r, value.g, value.b, value.a] };
    if (value instanceof Curve) return { $curve: value.keys };
    if (Array.isArray(value)) return value.map(encodeValue);
    const out = {};
    for (const key of Object.keys(value)) out[key] = encodeValue(value[key]);
    return out;
  }
  function decodeValue(json) {
    if (json === null || typeof json !== "object") return json;
    if (Array.isArray(json)) return json.map(decodeValue);
    const o = json;
    const n2 = (key, len) => {
      const a2 = o[key];
      return Array.isArray(a2) && a2.length === len && a2.every((v) => typeof v === "number") ? a2 : null;
    };
    let a;
    if (a = n2("$v2", 2)) return new Vector2(a[0], a[1]);
    if (a = n2("$v3", 3)) return new Vector3(a[0], a[1], a[2]);
    if (a = n2("$q", 4)) return new Quaternion(a[0], a[1], a[2], a[3]);
    if (a = n2("$v4", 4)) return new Vector4(a[0], a[1], a[2], a[3]);
    if (a = n2("$color", 4)) return new Color(a[0], a[1], a[2], a[3]);
    if (Array.isArray(o.$curve)) return new Curve(o.$curve);
    const out = {};
    for (const key of Object.keys(o)) out[key] = decodeValue(o[key]);
    return out;
  }

  // portkit/src/fields.ts
  function readFields(target, fields) {
    const bag = target;
    const out = {};
    for (const field of fields) out[field] = encodeValue(bag[field]);
    return out;
  }
  function assignFields(target, fields, data, callbacks) {
    if (!isRecord(data)) return;
    const bag = target;
    for (const field of fields) {
      if (!(field in data)) continue;
      const property = callbacks ? callbacks[field] : void 0;
      if (property === void 0) {
        bag[field] = decodeValue(data[field]);
        continue;
      }
      if (canonicalJson(encodeValue(bag[field])) === canonicalJson(data[field] ?? null)) continue;
      bag[property] = decodeValue(data[field]);
    }
  }

  // portkit/src/peruser.ts
  var MAX_PLAYER_LEAVES = 4;
  var PER_LEAF = 24;
  var PerUser = class {
    constructor(core, storage, hooks) {
      __publicField(this, "core");
      __publicField(this, "storage");
      __publicField(this, "hooks");
      __publicField(this, "remote", /* @__PURE__ */ new Map());
      __publicField(this, "delivered", /* @__PURE__ */ new Map());
      __publicField(this, "local", {});
      __publicField(this, "localLoaded", false);
      __publicField(this, "localDirty", false);
      __publicField(this, "changedKeys", /* @__PURE__ */ new Set());
      /** sid -> behaviour id -> the per-player behaviour */
      __publicField(this, "owned", /* @__PURE__ */ new Map());
      __publicField(this, "dirtyBuckets", /* @__PURE__ */ new Set());
      __publicField(this, "lastWrite", /* @__PURE__ */ new Map());
      __publicField(this, "typeIds", []);
      /** PlayerData is published only when the game uses it. */
      __publicField(this, "dataEnabled", false);
      __publicField(this, "started", false);
      this.core = core;
      this.storage = storage;
      this.hooks = hooks;
    }
    path(leaf) {
      return `${this.core.prefix}.${leaf}`;
    }
    /** Declares the per-player behaviour ids of this game, in bindings order (it fixes which leaf each uses). */
    declareTypes(ids) {
      this.typeIds = ids.slice();
    }
    bucketOf(id) {
      const index = Math.max(0, this.typeIds.indexOf(id));
      const leaves = Math.min(MAX_PLAYER_LEAVES, Math.max(1, Math.ceil(this.typeIds.length / PER_LEAF)));
      return Math.floor(index * leaves / Math.max(1, this.typeIds.length));
    }
    listen() {
      const dot = this.core.prefix + ".";
      this.core.own(
        this.core.platform.onUser(dot, (sid, path) => {
          if (this.core.disposed || sid === this.core.me.sid) return;
          const leaf = path.slice(dot.length);
          if (leaf === "d") this.readRemoteData(sid);
          else if (/^p[0-3]$/.test(leaf)) this.readRemoteBucket(sid, Number(leaf.slice(1)));
        })
      );
    }
    // ---- PlayerData ---------------------------------------------------------------------------------------------
    /** Loads the local player's saved values and publishes them. Called once behaviours have started. */
    restoreLocal() {
      if (this.localLoaded) return;
      this.localLoaded = true;
      const saved = this.storage.get("playerdata", null);
      this.local = isRecord(saved) ? encodeValue(saved) : {};
      if (this.dataEnabled) this.localDirty = true;
    }
    enableData() {
      if (this.dataEnabled) return;
      this.dataEnabled = true;
      if (this.localLoaded) this.localDirty = true;
    }
    Set(key, value) {
      const encoded = encodeValue(value);
      if (canonicalJson(this.local[key] ?? null) === canonicalJson(encoded) && key in this.local) return;
      this.local[key] = encoded;
      this.changedKeys.add(key);
      this.localDirty = true;
      this.enableData();
    }
    Delete(key) {
      if (!(key in this.local)) return;
      delete this.local[key];
      this.changedKeys.add(key);
      this.localDirty = true;
    }
    bag(player) {
      if (player.isLocal) return this.local;
      return this.remote.get(player.sid)?.data ?? null;
    }
    Get(player, key, fallback) {
      const bag = this.bag(player);
      return bag && key in bag ? decodeValue(bag[key]) : fallback;
    }
    Has(player, key) {
      const bag = this.bag(player);
      return !!bag && key in bag;
    }
    Keys(player) {
      const bag = this.bag(player);
      return bag ? Object.keys(bag) : [];
    }
    IsRestored(player) {
      return player.isLocal ? this.localLoaded : !!this.remote.get(player.sid)?.restored;
    }
    SetString(key, value) {
      this.Set(key, String(value));
    }
    SetInt(key, value) {
      this.Set(key, Math.trunc(value));
    }
    SetFloat(key, value) {
      this.Set(key, value);
    }
    SetBool(key, value) {
      this.Set(key, !!value);
    }
    GetString(player, key) {
      return String(this.Get(player, key, ""));
    }
    GetInt(player, key) {
      return Math.trunc(Number(this.Get(player, key, 0)) || 0);
    }
    GetFloat(player, key) {
      return Number(this.Get(player, key, 0)) || 0;
    }
    GetBool(player, key) {
      return this.Get(player, key, false) === true;
    }
    readRemoteData(sid) {
      const raw = safeParse(this.core.platform.userGet(sid, this.path("d")));
      let entry = this.remote.get(sid);
      if (!entry) this.remote.set(sid, entry = { data: {}, restored: false, announced: false });
      const before = entry.data;
      const now = isRecord(raw) && isRecord(raw.d) ? raw.d : {};
      entry.data = now;
      entry.restored = isRecord(raw) && raw.r === 1;
      const player = this.delivered.get(sid);
      if (!player || !this.started) return;
      if (entry.restored && !entry.announced) {
        entry.announced = true;
        this.hooks.restored(player);
        const all = Object.keys(now).sort();
        if (all.length) this.hooks.dataUpdated(player, all);
        return;
      }
      const keys = [];
      for (const key of /* @__PURE__ */ new Set([...Object.keys(before), ...Object.keys(now)])) {
        if (canonicalJson(before[key] ?? null) !== canonicalJson(now[key] ?? null) || key in before !== key in now) keys.push(key);
      }
      if (keys.length) this.hooks.dataUpdated(player, keys.sort());
    }
    // ---- per-player behaviours ----------------------------------------------------------------------------------
    /** Registers a per-player behaviour that has just been made for `player`. Returns true if it already has data. */
    adopt(player, id, behaviour, fields, persistent, callbacks) {
      let mine = this.owned.get(player.sid);
      if (!mine) this.owned.set(player.sid, mine = /* @__PURE__ */ new Map());
      const entry = { id, behaviour, fields, callbacks, persistent, bucket: this.bucketOf(id), n: 0 };
      mine.set(id, entry);
      if (player.isLocal) {
        if (!persistent) return false;
        const saved = this.storage.get(`po.${id}`, null);
        if (!isRecord(saved)) return false;
        this.core.guard(`${id} field change callback`, () => assignFields(behaviour, fields, encodeValue(saved), callbacks));
        entry.n = 1;
        this.dirtyBuckets.add(entry.bucket);
        return true;
      }
      const stored = this.remoteBucket(player.sid, entry.bucket)[id];
      if (!stored) return false;
      this.core.guard(`${id} field change callback`, () => assignFields(behaviour, fields, stored[1], callbacks));
      entry.n = stored[0];
      return true;
    }
    /**
     * Every per-player copy that holds a value (it was serialised or received at least once), in session and id order,
     * with its sequence number and fields: what `digest()` and `version()` add for per-player behaviours.
     */
    snapshot() {
      const out = [];
      for (const sid of [...this.owned.keys()].sort()) {
        const mine = this.owned.get(sid);
        for (const id of [...mine.keys()].sort()) {
          const entry = mine.get(id);
          if (entry.n > 0 && entry.fields.length) out.push({ sid, id, n: entry.n, fields: readFields(entry.behaviour, entry.fields) });
        }
      }
      return out;
    }
    behaviour(sid, id) {
      return this.owned.get(sid)?.get(id)?.behaviour ?? null;
    }
    behavioursOf(sid) {
      return [...this.owned.get(sid)?.values() ?? []].map((o) => o.behaviour);
    }
    /** The local player asked to send one of their per-player behaviours. */
    requestSerialization(behaviour) {
      const mine = this.owned.get(this.core.me.sid);
      if (!mine) return;
      for (const entry of mine.values()) {
        if (entry.behaviour !== behaviour) continue;
        entry.n++;
        this.dirtyBuckets.add(entry.bucket);
        return;
      }
    }
    remoteBucket(sid, bucket) {
      const raw = safeParse(this.core.platform.userGet(sid, this.path(`p${bucket}`)));
      const out = {};
      if (!isRecord(raw) || !isRecord(raw.b)) return out;
      for (const id of Object.keys(raw.b)) {
        const entry = raw.b[id];
        if (Array.isArray(entry) && typeof entry[0] === "number") out[id] = [entry[0], entry[1]];
      }
      return out;
    }
    readRemoteBucket(sid, bucket) {
      const theirs = this.owned.get(sid);
      if (!theirs) return;
      const stored = this.remoteBucket(sid, bucket);
      for (const entry of theirs.values()) {
        const value = stored[entry.id];
        if (!value || value[0] === entry.n) continue;
        entry.n = value[0];
        this.core.guard(`${entry.id} field change callback`, () => assignFields(entry.behaviour, entry.fields, value[1], entry.callbacks));
        if (this.started) this.hooks.deserialized(entry.behaviour);
      }
    }
    // ---- players coming and going -------------------------------------------------------------------------------
    /** Called after OnPlayerJoined has been delivered for `player`. */
    playerDelivered(player) {
      this.delivered.set(player.sid, player);
      if (player.isLocal) {
        if (this.dataEnabled || this.hasPersistentLocal()) {
          this.hooks.restored(player);
          const all = Object.keys(this.local).sort();
          if (this.dataEnabled && all.length) this.hooks.dataUpdated(player, all);
        }
        return;
      }
      this.readRemoteData(player.sid);
    }
    hasPersistentLocal() {
      for (const entry of this.owned.get(this.core.me.sid)?.values() ?? []) if (entry.persistent) return true;
      return false;
    }
    /** Drops everything kept for a player who left. Returns their per-player behaviours, for OnDestroy. */
    playerGone(sid) {
      const gone = this.behavioursOf(sid);
      this.owned.delete(sid);
      this.remote.delete(sid);
      this.delivered.delete(sid);
      return gone;
    }
    // ---- writing ------------------------------------------------------------------------------------------------
    /** Writes what changed, at most a few times a second per leaf. Called once per tick. */
    flush() {
      if (this.core.disposed || !this.started) return;
      const now = this.core.platform.clock.now();
      const due = (leaf) => now - (this.lastWrite.get(leaf) ?? -Infinity) >= this.core.options.continuousIntervalMs;
      const limit = this.core.platform.limits.maxLeafBytes - 64;
      for (const bucket of [...this.dirtyBuckets]) {
        const leaf = `p${bucket}`;
        if (!due(leaf)) continue;
        this.dirtyBuckets.delete(bucket);
        const b = {};
        const mine = [...this.owned.get(this.core.me.sid)?.values() ?? []].filter((o) => o.bucket === bucket && o.n > 0);
        for (const entry of mine) b[entry.id] = [entry.n, readFields(entry.behaviour, entry.fields)];
        const text = asciiJson({ b });
        if (jsonLeafBytes(text) > limit) {
          this.hooks.refused("playerObject", "value_too_large", this.path(leaf), mine[0]?.behaviour ?? null);
          continue;
        }
        this.lastWrite.set(leaf, now);
        this.core.platform.userSet(this.path(leaf), text);
        for (const entry of mine) if (entry.persistent) this.storage.set(`po.${entry.id}`, decodeValue(b[entry.id][1]));
      }
      if (this.localDirty && this.localLoaded && this.dataEnabled && due("d")) {
        this.localDirty = false;
        const keys = [...this.changedKeys].sort();
        this.changedKeys.clear();
        const text = asciiJson({ r: 1, d: this.local });
        if (jsonLeafBytes(text) > limit) {
          this.hooks.refused("playerData", "value_too_large", this.path("d"), null);
        } else {
          this.lastWrite.set("d", now);
          this.core.platform.userSet(this.path("d"), text);
          this.storage.set("playerdata", decodeValue(this.local));
        }
        const me = this.delivered.get(this.core.me.sid);
        if (me && keys.length) this.hooks.dataUpdated(me, keys);
      }
    }
    /** Removes the local player's leaves, when the instance stops while they stay in the room. */
    retire() {
      const { platform } = this.core;
      if (this.dataEnabled) platform.userSet(this.path("d"), null);
      const leaves = /* @__PURE__ */ new Set();
      for (const entry of this.owned.get(this.core.me.sid)?.values() ?? []) if (entry.n > 0) leaves.add(entry.bucket);
      for (const bucket of leaves) platform.userSet(this.path(`p${bucket}`), null);
    }
  };

  // portkit/src/bindings.ts
  var EVENT_KINDS = ["click", "grab", "drop", "triggerEnter", "triggerExit", "collisionEnter", "collisionExit", "uiButton", "uiSlider", "uiToggle", "heldTrigger", "heldPrimary", "heldSecondary", "field", "graph"];
  var GRAPH_KINDS = ["uiButton", "uiSlider", "uiToggle", "heldTrigger", "heldPrimary", "heldSecondary", "field"];
  function validateBindings(json) {
    const problems = [];
    const fail = (text) => problems.push(text);
    if (!isRecord(json)) throw new Error("bindings: not an object");
    if (json.schema !== 1) fail(`schema is ${JSON.stringify(json.schema)}, expected 1`);
    if (typeof json.slug !== "string" || !isValidSlug(json.slug)) fail(`slug ${JSON.stringify(json.slug)} is not lower-case letters, digits and hyphens`);
    const bundles = isRecord(json.bundles) ? json.bundles : {};
    const objects = isRecord(json.objects) ? json.objects : {};
    const refs = Array.isArray(json.refs) ? json.refs : [];
    const behaviours = Array.isArray(json.behaviours) ? json.behaviours : [];
    const events = Array.isArray(json.events) ? json.events : [];
    const paths = /* @__PURE__ */ new Map();
    for (const key of Object.keys(objects)) {
      const o = objects[key];
      if (!isPathSegment(key)) fail(`object key '${key}' must be 1-64 of A-Z a-z 0-9 _ - @ (it becomes part of a network id)`);
      if (!isRecord(o) || typeof o.path !== "string") {
        fail(`object '${key}' has no path`);
        continue;
      }
      if (o.sync !== void 0 && o.sync !== "none" && o.sync !== "transform") fail(`object '${key}': sync must be "none" or "transform"`);
      const other = paths.get(o.path);
      if (other !== void 0) fail(`objects '${other}' and '${key}' have the same path '${o.path}'`);
      paths.set(o.path, key);
    }
    refs.forEach((ref, i) => {
      if (typeof ref !== "string" || !(ref in objects)) fail(`refs[${i}] '${String(ref)}' is not an object key`);
    });
    if (new Set(refs).size !== refs.length) fail("refs lists an object twice");
    const ids = /* @__PURE__ */ new Set();
    for (const b of behaviours) {
      if (!isRecord(b) || typeof b.id !== "string" || typeof b.type !== "string") {
        fail(`a behaviour entry has no id or type: ${JSON.stringify(b)}`);
        continue;
      }
      if (!isPathSegment(b.id)) fail(`behaviour id '${b.id}' must be 1-64 of A-Z a-z 0-9 _ - @ (it is a state key)`);
      if (ids.has(b.id)) fail(`behaviour id '${b.id}' is used twice`);
      ids.add(b.id);
      if (b.object !== void 0 && b.object !== null && !(String(b.object) in objects)) fail(`behaviour '${b.id}': object '${String(b.object)}' is not an object key`);
      if (b.fields !== void 0 && !isRecord(b.fields)) fail(`behaviour '${b.id}': fields is not an object`);
      if (b.group !== void 0 && (typeof b.group !== "string" || !/^[A-Za-z0-9_-]{1,48}$/.test(b.group))) fail(`behaviour '${b.id}': group must be 1-48 of A-Z a-z 0-9 _ -`);
      if (b.group !== void 0 && b.perPlayer === true) fail(`behaviour '${b.id}': a per-player behaviour cannot be in a sync group`);
    }
    const checkRefs = (where, value) => {
      if (Array.isArray(value)) value.forEach((v, i) => checkRefs(`${where}[${i}]`, v));
      else if (isRecord(value)) {
        if (typeof value.$obj === "string" && !(value.$obj in objects)) fail(`${where}: $obj '${value.$obj}' is not an object key`);
        else if (typeof value.$beh === "string" && !ids.has(value.$beh)) fail(`${where}: $beh '${value.$beh}' is not a behaviour id`);
        else if (typeof value.$comp === "string" && !(value.$comp in objects)) fail(`${where}: $comp '${value.$comp}' is not an object key`);
        else if (value.$clip !== void 0 && value.on !== void 0 && !(String(value.on) in objects)) fail(`${where}: $clip on '${String(value.on)}' is not an object key`);
        else if (!Object.keys(value).some((k) => k.startsWith("$"))) for (const k of Object.keys(value)) checkRefs(`${where}.${k}`, value[k]);
      }
    };
    for (const b of behaviours) if (isRecord(b) && isRecord(b.fields)) for (const f of Object.keys(b.fields)) checkRefs(`behaviour '${String(b.id)}' field '${f}'`, b.fields[f]);
    events.forEach((e, i) => {
      if (!isRecord(e)) return fail(`events[${i}] is not an object`);
      if (typeof e.kind !== "string" || EVENT_KINDS.indexOf(e.kind) < 0) fail(`events[${i}]: kind '${String(e.kind)}' is not one of ${EVENT_KINDS.join(", ")}`);
      if (e.kind === "graph") {
        if (typeof e.name !== "string" || !e.name) fail(`events[${i}]: a graph event needs a name`);
      } else if (typeof e.object !== "string" || !(e.object in objects)) fail(`events[${i}]: object '${String(e.object)}' is not an object key`);
      const unbound = GRAPH_KINDS.indexOf(String(e.kind)) >= 0 && !e.behaviour && !e.method;
      if (unbound) return;
      if (typeof e.behaviour !== "string" || !ids.has(e.behaviour)) fail(`events[${i}]: behaviour '${String(e.behaviour)}' is not a behaviour id`);
      if (typeof e.method !== "string" || !e.method) fail(`events[${i}]: no method`);
    });
    if (problems.length) throw new Error("bindings.json is not valid:\n  - " + problems.join("\n  - "));
    const normalObjects = {};
    for (const key of Object.keys(objects)) {
      const o = objects[key];
      normalObjects[key] = { path: o.path, sync: o.sync === "transform" ? "transform" : "none", grab: o.grab === true, click: o.click === true, seat: o.seat === true };
      if (o.active === false) normalObjects[key].active = false;
      if (o.attach === true) normalObjects[key].attach = true;
    }
    return {
      schema: 1,
      slug: json.slug,
      hash: typeof json.hash === "string" ? json.hash : void 0,
      root: typeof json.root === "string" && json.root ? json.root : void 0,
      bundles: { windows: typeof bundles.windows === "string" ? bundles.windows : "", android: typeof bundles.android === "string" ? bundles.android : "" },
      objects: normalObjects,
      refs,
      behaviours,
      events
    };
  }

  // portkit/src/events.ts
  var NetEvents = class {
    constructor(core, sync, routes) {
      __publicField(this, "core");
      __publicField(this, "sync");
      __publicField(this, "routes");
      __publicField(this, "held", /* @__PURE__ */ new Map());
      /** The session whose event or command is being run right now, for Networking.CallingPlayer. */
      __publicField(this, "callingSid", null);
      __publicField(this, "sent", 0);
      __publicField(this, "received", 0);
      /** Requests naming a method that may not be called from the network, for tests and diagnostics. */
      __publicField(this, "refusedCount", 0);
      /** Events asked for in this turn, sent after it (with the state the whole turn wrote). */
      __publicField(this, "outbox", []);
      __publicField(this, "draining", false);
      __publicField(this, "refusedNames", /* @__PURE__ */ new Set());
      this.core = core;
      this.sync = sync;
      this.routes = routes;
    }
    listen() {
      this.core.own(this.core.platform.onOneShot((fromSid, data) => this.receive(fromSid, data)));
    }
    send(behaviour, target, name, args) {
      if (this.core.disposed) return;
      const address = this.routes.address(behaviour);
      if (!address) return;
      if (!callable(behaviour, name)) {
        this.core.log("warn", `SendCustomNetworkEvent: ${address.id} has no network-callable method '${name}' (list it in its class's static networkCallable; names starting with '_' can never be sent)`);
        return;
      }
      const fields = { b: address.id, e: name };
      if (args.length) fields.a = args.map(encodeValue);
      const me = this.core.me.sid;
      let ownerSid;
      let outSlot = null;
      if (address.playerSid !== null) {
        fields.ps = address.playerSid;
        ownerSid = address.playerSid;
      } else {
        const slot = this.sync.slotOf(behaviour);
        ownerSid = slot ? this.sync.ownerSid(slot) : null;
        if (slot && ownerSid === me) outSlot = slot;
      }
      if (target === "Owner") {
        if (ownerSid === me) {
          this.invoke(behaviour, name, args, me);
          return;
        }
        if (ownerSid === null) {
          this.core.log("warn", `${address.id}.${name}: no owner to send to`);
          return;
        }
        fields.o = ownerSid;
      } else this.invoke(behaviour, name, args, me);
      this.outbox.push({ behaviour, name, fields, slot: outSlot });
      if (!this.draining) {
        this.draining = true;
        Promise.resolve().then(() => this.drain());
      }
    }
    /**
     * After the turn that asked for them: the state every handler of the turn changed is written (one write per slot),
     * then the events go, in the order they were asked for.
     */
    drain() {
      this.draining = false;
      if (this.core.disposed) {
        this.outbox = [];
        return;
      }
      const out = this.outbox;
      this.outbox = [];
      if (!out.length) return;
      this.sync.flushDirty();
      const me = this.core.me.sid;
      for (const item of out) {
        if (item.slot) {
          const mark = this.sync.flushOne(item.slot);
          if (mark && mark.w === me) item.fields.s = [mark.g, mark.n];
        }
        this.post(item.behaviour, item.name, item.fields);
      }
    }
    post(behaviour, name, fields) {
      const text = asciiJson(makeEnvelope(this.core.slug, this.core.inst, "ev", fields));
      if (utf8Length(text) > this.core.platform.limits.oneShotMaxBytes || !this.core.platform.oneShot(text)) {
        this.core.log("error", `network event '${name}' is too large to send (${utf8Length(text)} bytes)`);
        this.routes.refused(behaviour, "oneshot_too_large", name);
        return;
      }
      this.sent++;
    }
    receive(fromSid, data) {
      if (this.core.disposed || !this.sync.started) return;
      const env2 = parseOurs(data, this.core.slug, this.core.inst);
      if (!env2 || env2.t !== "ev" || typeof env2.b !== "string" || typeof env2.e !== "string") return;
      const me = this.core.me.sid;
      const name = env2.e;
      const args = Array.isArray(env2.a) ? env2.a.map(decodeValue) : [];
      this.received++;
      if (typeof env2.ps === "string") {
        if (typeof env2.o === "string" && env2.o !== me) return;
        const behaviour2 = this.routes.playerBehaviour(env2.ps, env2.b);
        if (behaviour2) this.invoke(behaviour2, name, args, fromSid);
        return;
      }
      const behaviour = this.routes.behaviour(env2.b);
      const slot = behaviour ? this.sync.slotOf(behaviour) : null;
      if (!behaviour || !slot) return;
      if (typeof env2.o === "string") {
        if (env2.o !== me) return;
        if (!this.sync.isOwner(slot)) {
          const owner = this.sync.ownerSid(slot);
          const hops = typeof env2.h === "number" ? env2.h : 0;
          if (owner !== null && owner !== fromSid && hops < 2) {
            const fields = { b: env2.b, e: name, o: owner, h: hops + 1 };
            if (args.length) fields.a = env2.a;
            this.post(behaviour, name, fields);
          }
          return;
        }
      }
      const run = () => this.invoke(behaviour, name, args, fromSid);
      const mark = Array.isArray(env2.s) && typeof env2.s[0] === "number" && typeof env2.s[1] === "number" ? { g: env2.s[0], n: env2.s[1] } : null;
      if (mark && !this.has(slot, mark.g, mark.n)) this.hold(slot, mark.g, mark.n, run);
      else run();
    }
    /** Has the write the event was sent after reached this client's mirror? (Sequence numbers only rise.) */
    has(slot, _g, n2) {
      return slot.seenN >= n2;
    }
    hold(slot, g, n2, run) {
      let list = this.held.get(slot.id);
      if (!list) this.held.set(slot.id, list = []);
      const entry = { g, n: n2, run, timer: 0 };
      entry.timer = this.core.scheduler.after(this.core.options.eventHoldMs, () => {
        const current = this.held.get(slot.id) ?? [];
        const at = current.indexOf(entry);
        if (at < 0) return;
        current.splice(at, 1);
        run();
      });
      list.push(entry);
      slot.onApplied = () => this.release(slot);
    }
    release(slot) {
      const list = this.held.get(slot.id);
      if (!list || !list.length) return;
      const ready = list.filter((h) => this.has(slot, h.g, h.n));
      if (!ready.length) return;
      this.held.set(
        slot.id,
        list.filter((h) => !ready.includes(h))
      );
      for (const h of ready) {
        this.core.scheduler.cancel(h.timer);
        h.run();
      }
    }
    /** Runs a method of game code on behalf of `fromSid` (a network event or a command). */
    invoke(behaviour, name, args, fromSid) {
      if (!callable(behaviour, name)) {
        const key = `${behaviour.constructor.name}.${name}`;
        if (!this.refusedNames.has(key) && this.refusedNames.size < 64) {
          this.refusedNames.add(key);
          this.core.log("warn", `refused a request from session ${fromSid} to run '${String(name).slice(0, 64)}' on ${behaviour.constructor.name}: not in its networkCallable list`);
        }
        this.refusedCount++;
        return;
      }
      const before = this.callingSid;
      this.callingSid = fromSid;
      try {
        this.core.guard(name, () => behaviour[name](...args));
      } finally {
        this.callingSid = before;
      }
    }
  };
  var LISTS = /* @__PURE__ */ new WeakMap();
  function networkCallableOf(cls) {
    let set = LISTS.get(cls);
    if (set) return set;
    const names = /* @__PURE__ */ new Set();
    for (let c = cls; typeof c === "function" && c !== Behaviour && c !== Function.prototype; c = Object.getPrototypeOf(c)) {
      if (Object.prototype.hasOwnProperty.call(c, "networkCallable")) {
        const list = c.networkCallable;
        if (Array.isArray(list)) {
          for (const name of list) if (typeof name === "string") names.add(name);
        }
      }
    }
    set = names;
    LISTS.set(cls, set);
    return set;
  }
  function callable(behaviour, name) {
    if (typeof name !== "string" || name.length === 0 || name.charCodeAt(0) === 95 || name === "constructor") return false;
    if (!networkCallableOf(behaviour.constructor).has(name)) return false;
    for (let proto = Object.getPrototypeOf(behaviour); proto && proto !== Behaviour.prototype && proto !== Object.prototype; proto = Object.getPrototypeOf(proto)) {
      if (Object.prototype.hasOwnProperty.call(proto, name)) return typeof behaviour[name] === "function";
    }
    return false;
  }
  function parseOurs(data, slug, inst) {
    if (typeof data !== "string" || data.indexOf('"pk":1') < 0) return null;
    let parsed;
    try {
      parsed = JSON.parse(data);
    } catch {
      return null;
    }
    if (!parsed || typeof parsed !== "object") return null;
    const e = parsed;
    if (e.pk !== 1 || e.g !== slug || e.i !== inst || typeof e.t !== "string") return null;
    return e;
  }

  // portkit/src/refrecord.ts
  var RefereeTable = class {
    constructor(presence, referee, name, parseEntry) {
      __publicField(this, "presence");
      __publicField(this, "referee");
      __publicField(this, "name");
      __publicField(this, "parseEntry");
      __publicField(this, "last", null);
      __publicField(this, "lastText", "");
      this.presence = presence;
      this.referee = referee;
      this.name = name;
      this.parseEntry = parseEntry;
    }
    /** The table as the referee published it: read from the referee's own user state, else the last one read. */
    read() {
      const ref = this.referee.current();
      const epoch = this.referee.epoch;
      if (ref) {
        const raw = this.presence.extra(ref.sid, this.name);
        const parsed = this.parse(raw, epoch);
        if (parsed) {
          this.last = { e: epoch, m: parsed };
          return parsed;
        }
      }
      return this.last && this.last.e === epoch ? this.last.m : {};
    }
    /** A copy the referee may change and `write`: its own published table, else its predecessor's last one. */
    working() {
      const epoch = this.referee.epoch;
      const own = this.parse(this.presence.extra(this.presence.localSid, this.name), epoch);
      const base = own ?? (this.last && this.last.e === epoch ? this.last.m : {});
      return JSON.parse(JSON.stringify(base));
    }
    /** True when the current referee's user state holds a table of this epoch (an empty one counts). */
    published() {
      const ref = this.referee.current();
      return !!ref && this.parse(this.presence.extra(ref.sid, this.name), this.referee.epoch) !== null;
    }
    /**
     * The referee publishes the table it carries (its predecessor's last one, or an empty one in a new epoch) as soon as
     * its term starts, before any entry changes: a page that starts in between would otherwise read no table at all, its
     * saved draw could not come back, and it would take everything numbered before it came as new. True when it wrote.
     */
    ensurePublished() {
      if (!this.referee.isMe()) return false;
      if (this.parse(this.presence.extra(this.presence.localSid, this.name), this.referee.epoch) !== null) return false;
      this.lastText = "";
      this.write(this.working());
      return true;
    }
    /** Publishes the table in the local player's user state (only the referee calls this). */
    write(table) {
      const value = { e: this.referee.epoch, m: table };
      const text = asciiJson(value);
      if (text === this.lastText && this.presence.extra(this.presence.localSid, this.name) !== void 0) return;
      this.lastText = text;
      this.presence.setExtra(this.name, value);
      this.last = { e: value.e, m: JSON.parse(JSON.stringify(table)) };
    }
    parse(raw, epoch) {
      if (!isRecord(raw) || raw.e !== epoch || !isRecord(raw.m)) return null;
      const out = {};
      for (const key of Object.keys(raw.m)) {
        const entry = this.parseEntry(raw.m[key]);
        if (entry !== null) out[key] = entry;
      }
      return out;
    }
  };

  // portkit/src/commands.ts
  var MAX_COMMAND_BYTES = 2048;
  var MAX_BATCH = 8;
  var MAX_BATCH_BYTES = 4096;
  var Commands = class {
    constructor(core, presence, referee, routes) {
      __publicField(this, "core");
      __publicField(this, "presence");
      __publicField(this, "referee");
      __publicField(this, "routes");
      __publicField(this, "queue", []);
      __publicField(this, "nextNumber", 0);
      __publicField(this, "acks");
      __publicField(this, "reviewing", false);
      __publicField(this, "reviewAgain", false);
      __publicField(this, "sealing", false);
      /** Referee: since when a sender's first due request (`<sid>` newline `<n>`) has waited for its write mark. */
      __publicField(this, "heldSince", /* @__PURE__ */ new Map());
      __publicField(this, "holding", false);
      /** False until behaviours have started: the referee runs nothing before then. */
      __publicField(this, "started", false);
      __publicField(this, "run", 0);
      this.core = core;
      this.presence = presence;
      this.referee = referee;
      this.routes = routes;
      this.acks = new RefereeTable(presence, referee, "ak", (v) => typeof v === "number" ? v : null);
    }
    listen() {
      this.presence.onExtra(() => this.review());
      this.presence.on(() => this.review());
      this.referee.on(() => this.review());
      this.core.onState(() => {
        if (this.holding) Promise.resolve().then(() => this.review());
      });
    }
    send(behaviour, name, args) {
      const address = this.routes.address(behaviour);
      if (!address) return 0;
      if (!callable(behaviour, name)) {
        this.core.log("warn", `SendCommand: ${address.id} has no network-callable method '${name}' (list it in its class's static networkCallable)`);
        return 0;
      }
      if (this.nextNumber === 0) this.nextNumber = (this.table()[this.core.me.sid] ?? 0) + 1;
      const n2 = this.nextNumber++;
      const record2 = [n2, address.id, address.playerSid ?? "", name, args.map(encodeValue)];
      if (utf8Length(asciiJson(record2)) > MAX_COMMAND_BYTES) {
        this.routes.refused(behaviour, "value_too_large", name);
        return 0;
      }
      this.queue.push({ n: n2, behaviour, record: record2, sealed: false });
      if (!this.sealing) {
        this.sealing = true;
        Promise.resolve().then(() => this.seal());
      }
      return n2;
    }
    /** After the turn that sent them: the turn's writes go out first, then the requests, marked with what they follow. */
    seal() {
      this.sealing = false;
      if (this.core.disposed) return;
      this.core.guard("command write mark", () => this.routes.flush?.());
      const marks = this.routes.marks?.() ?? [];
      for (const pending of this.queue) {
        if (pending.sealed) continue;
        pending.sealed = true;
        if (marks.length) {
          const [n2, id, sid, name, args] = pending.record;
          pending.record = [n2, id, sid, name, args, marks];
        }
      }
      this.review();
    }
    /**
     * Publishes, runs and acknowledges whatever is due. Also called about once a second. Not re-entrant: a command
     * handler that publishes a user-state record (Secrets.beginDeal, presence.setExtra) tells every record listener at
     * once, which calls this again; that call is held and run after the current pass, so no command runs inside another.
     */
    review() {
      if (this.core.disposed || !this.started) return;
      if (this.reviewing) {
        this.reviewAgain = true;
        return;
      }
      this.reviewing = true;
      try {
        let passes = 0;
        do {
          this.reviewAgain = false;
          this.reviewOnce();
        } while (this.reviewAgain && !this.core.disposed && ++passes < 16);
      } finally {
        this.reviewing = false;
        this.reviewAgain = false;
      }
    }
    reviewOnce() {
      const me = this.core.me.sid;
      const acked = this.table()[me] ?? 0;
      while (this.queue.length && this.queue[0].n <= acked) {
        const done = this.queue.shift();
        this.core.guard("OnCommandAcknowledged", () => this.routes.acknowledged(done.behaviour, done.n));
      }
      const published = this.presence.extra(me, "q");
      if (this.queue.length) {
        const batch = [];
        let bytes = 2;
        for (const pending of this.queue) {
          if (!pending.sealed) break;
          const size = utf8Length(asciiJson(pending.record)) + 1;
          if (batch.length >= MAX_BATCH || batch.length && bytes + size > MAX_BATCH_BYTES) break;
          batch.push(pending.record);
          bytes += size;
        }
        const first = Array.isArray(published) && Array.isArray(published[0]) ? published[0][0] : null;
        const last = Array.isArray(published) && Array.isArray(published[published.length - 1]) ? published[published.length - 1][0] : null;
        if (batch.length && (first !== batch[0][0] || last !== batch[batch.length - 1][0])) this.presence.setExtra("q", batch);
      } else if (published !== void 0) this.presence.setExtra("q", void 0);
      if (this.referee.isMe()) this.officiate();
    }
    officiate() {
      const table = this.acks.working();
      let changed = false;
      const now = this.core.platform.clock.now();
      let holding = false;
      for (const sid of Object.keys(table)) {
        if (!this.presence.has(sid)) {
          delete table[sid];
          changed = true;
        }
      }
      for (const who of this.presence.list()) {
        const batch = this.presence.extra(who.sid, "q");
        if (!Array.isArray(batch)) continue;
        for (const q of batch.slice(0, MAX_BATCH)) {
          if (!Array.isArray(q) || typeof q[0] !== "number" || typeof q[1] !== "string" || typeof q[3] !== "string") break;
          const acked = table[who.sid] ?? 0;
          if (q[0] <= acked) continue;
          if (acked > 0 && q[0] !== acked + 1) break;
          const key = who.sid + "\n" + q[0];
          if (who.sid !== this.core.me.sid && !this.marked(q[5])) {
            const since = this.heldSince.get(key) ?? now;
            this.heldSince.set(key, since);
            if (now - since < this.core.options.eventHoldMs) {
              holding = true;
              if (since === now) this.core.scheduler.after(this.core.options.eventHoldMs + 1, () => this.review());
              break;
            }
            this.core.log("info", `a command from session ${who.sid} ran without the state it was sent after (it had not arrived in ${this.core.options.eventHoldMs} ms)`);
          }
          this.heldSince.delete(key);
          table[who.sid] = q[0];
          this.acks.write(table);
          changed = false;
          const behaviour = this.routes.resolve(q[1], typeof q[2] === "string" && q[2] ? q[2] : null);
          const args = Array.isArray(q[4]) ? q[4].map(decodeValue) : [];
          this.run++;
          if (behaviour) this.routes.invoke(behaviour, q[3], args, who.sid);
        }
      }
      if (changed) this.acks.write(table);
      this.holding = holding;
      if (!holding) this.heldSince.clear();
    }
    /** Has the referee seen every claim and write in a request's mark? (No mark, or a malformed one: nothing to wait for.) */
    marked(mark) {
      if (!Array.isArray(mark) || !this.routes.seen) return true;
      for (const m of mark.slice(0, 8)) {
        if (!Array.isArray(m) || typeof m[0] !== "string" || typeof m[1] !== "number" || typeof m[2] !== "number") continue;
        if (!this.routes.seen(m[0], m[1], m[2])) return false;
      }
      return true;
    }
    table() {
      return this.acks.read();
    }
  };

  // portkit/src/core.ts
  var DEFAULT_OPTIONS = {
    settleMs: 1e3,
    claimStepMs: 400,
    claimRetryMs: 3e3,
    snapshotTimeoutMs: 8e3,
    clockTimeoutMs: 2e3,
    clockResyncMs: 6e4,
    admitWarnMs: 15e3,
    ownerClaimTimeoutMs: 5e3,
    continuousIntervalMs: 200,
    eventHoldMs: 2e3,
    whenEmpty: "reset"
  };
  var Core = class {
    constructor(platform, slug, inst, options, scheduler) {
      __publicField(this, "platform");
      __publicField(this, "slug");
      __publicField(this, "inst");
      /** `pk1.<slug>.<inst>` */
      __publicField(this, "prefix");
      __publicField(this, "options");
      __publicField(this, "scheduler");
      /** The local player as the platform reported them when the instance started. */
      __publicField(this, "me");
      __publicField(this, "disposed", false);
      __publicField(this, "unsubs", []);
      __publicField(this, "stateHandlers", []);
      this.platform = platform;
      this.slug = slug;
      this.inst = inst;
      this.prefix = statePrefix(slug, inst);
      this.options = options;
      this.scheduler = scheduler;
      this.me = platform.local();
    }
    /** Starts listening to the room's state under this instance's prefix. */
    listen() {
      const dot = this.prefix + ".";
      this.own(
        this.platform.onState(dot, (path, value) => {
          if (this.disposed) return;
          const key = path.slice(dot.length);
          for (const handler of this.stateHandlers.slice()) {
            try {
              handler(key, value);
            } catch (error) {
              this.error("state handler", error);
            }
          }
        })
      );
    }
    /** Reads a leaf of this instance from the mirror. `key` is relative to the prefix. */
    get(key) {
      return this.platform.stateGet(this.prefix + "." + key);
    }
    set(key, value) {
      if (this.disposed) return;
      this.platform.stateSet(this.prefix + "." + key, value);
    }
    entries() {
      const dot = this.prefix + ".";
      return this.platform.stateEntries(dot).map(([path, value]) => [path.slice(dot.length), value]);
    }
    onState(handler) {
      this.stateHandlers.push(handler);
    }
    /** Keeps an unsubscribe to run when the instance is disposed. */
    own(unsub) {
      if (this.disposed) unsub();
      else this.unsubs.push(unsub);
    }
    log(level, message) {
      this.platform.log(level, `[${this.slug}:${this.inst}] ${message}`);
    }
    error(where, error) {
      const text = error instanceof Error ? error.stack ?? error.message : String(error);
      this.log("error", `${where}: ${text}`);
    }
    /** Runs game code so that one behaviour's exception cannot stop the others. */
    guard(where, fn) {
      try {
        fn();
      } catch (error) {
        this.error(where, error);
      }
    }
    dispose() {
      if (this.disposed) return;
      this.disposed = true;
      this.scheduler.stop();
      for (const unsub of this.unsubs.splice(0)) {
        try {
          unsub();
        } catch {
        }
      }
      this.stateHandlers.length = 0;
    }
  };

  // portkit/src/host.ts
  function encodeRelayArg(text) {
    let out = "";
    for (let i = 0; i < text.length; i++) {
      const c = text.charCodeAt(i);
      if (c === 37 || c === 124 || c === 94 || c === 34 || c === 92 || c < 32) {
        out += "%" + c.toString(16).toUpperCase().padStart(2, "0");
      } else if (c >= 55296 && c <= 57343) {
        const pairStart = c <= 56319 && i + 1 < text.length && (text.charCodeAt(i + 1) & 64512) === 56320;
        if (pairStart) {
          out += text[i] + text[i + 1];
          i++;
        } else out += "\uFFFD";
      } else out += text[i];
    }
    return out;
  }
  function decodeRelayArg(text) {
    return text.replace(/%([0-9A-F]{2})/g, (_match, hex) => String.fromCharCode(parseInt(hex, 16)));
  }
  function relayNumber(value) {
    if (!Number.isFinite(value)) return "0";
    if (Number.isInteger(value)) return String(value);
    return value.toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
  }
  function relayRecord(op, target, args) {
    let record2 = op + "|" + (typeof target === "number" ? String(target) : encodeRelayArg(target));
    for (const arg of args) record2 += "|" + encodeRelayArg(arg);
    return record2;
  }
  function relayPayload(slug, inst, records) {
    return relayKey(slug, inst) + "|" + records.join("^");
  }
  function parseEventArgs(text) {
    return text === "" ? [] : text.split("|").map(decodeRelayArg);
  }
  function materialProperty(property, slot = 0) {
    return slot > 0 ? `#${Math.floor(slot)}:${property}` : property;
  }
  var MAX_PAYLOAD = 12e3;
  var RelayHost = class {
    constructor(platform, slug, inst, refs) {
      __publicField(this, "platform");
      __publicField(this, "slug");
      __publicField(this, "inst");
      __publicField(this, "refs");
      __publicField(this, "warned", /* @__PURE__ */ new Set());
      __publicField(this, "waiting", /* @__PURE__ */ new Map());
      /** What was last sent (or queued) per target and property: an unchanged value is not sent again. */
      __publicField(this, "last", /* @__PURE__ */ new Map());
      __publicField(this, "queue", []);
      __publicField(this, "nextRequest", 1);
      /** Payloads and records handed to the bridge, for tests and diagnostics. */
      __publicField(this, "payloadsSent", 0);
      __publicField(this, "recordsSent", 0);
      /**
       * The path under the kit root of a bound object (bindings.objects), or undefined. `setActive` on a bound object
       * outside refs goes by the relay as `@<path>`: one road for the object's whole life, in order with every other
       * relay op, and one that can switch an object the page cannot see (an inactive one) back on.
       */
      __publicField(this, "pathOf", () => void 0);
      /** Plays a clip of the object's own list through the page when the page can reach the object. */
      __publicField(this, "fallbackClip", () => false);
      this.platform = platform;
      this.slug = slug;
      this.inst = inst;
      this.refs = refs;
    }
    /** Called with the graph's reply to a clock op. */
    onClockReply(requestId, seconds) {
      const resolve = this.waiting.get(requestId);
      if (!resolve) return;
      this.waiting.delete(requestId);
      resolve(seconds);
    }
    setText(target, text) {
      this.value("text", target, "text", [text]);
    }
    animBool(target, name, value) {
      this.value("animBool", target, "anim." + name, [name, value ? "1" : "0"]);
    }
    animFloat(target, name, value) {
      this.value("animFloat", target, "anim." + name, [name, relayNumber(value)]);
    }
    animInt(target, name, value) {
      this.value("animInt", target, "anim." + name, [name, String(Math.trunc(value))]);
    }
    animResetTrigger(target, name) {
      this.event("animResetTrigger", target, [name]);
    }
    animPlay(target, state, crossFadeSeconds = 0) {
      this.event("animPlay", target, [state, relayNumber(crossFadeSeconds)]);
    }
    animTrigger(target, name) {
      this.event("animTrigger", target, [name, "1"]);
    }
    particles(target, play) {
      this.event("particles", target, [play ? "play" : "stop"]);
    }
    setColor(target, property, color, slot = 0) {
      const name = materialProperty(property, slot);
      this.value("color", target, "color." + name, [name, relayNumber(color.r), relayNumber(color.g), relayNumber(color.b), relayNumber(color.a)]);
    }
    matFloat(target, property, value, slot = 0) {
      const name = materialProperty(property, slot);
      this.value("matFloat", target, "mat." + name, [name, relayNumber(value)]);
    }
    uiColor(target, color) {
      this.value("uiColor", target, "uiColor", [relayNumber(color.r), relayNumber(color.g), relayNumber(color.b), relayNumber(color.a)]);
    }
    setActive(target, active) {
      if (!target.startsWith("@") && this.refs.indexOf(target) < 0) {
        const path = this.pathOf(target);
        if (path !== void 0) target = "@" + path;
      }
      this.value("active", target, "active", [active ? "1" : "0"]);
    }
    playClip(target, clipIndex, clipsOn, volumeScale) {
      const own = clipsOn === void 0 || clipsOn === target;
      const scaled = volumeScale !== void 0 && volumeScale !== 1;
      if (own && !scaled && !target.startsWith("@") && this.refs.indexOf(target) < 0 && this.fallbackClip(target, clipIndex)) return;
      const holder = this.resolve("audio", own ? target : clipsOn);
      if (holder === null) return;
      if (typeof holder !== "number") {
        this.warnOnce(`audio:${holder}`, `the clips of ${holder} cannot be played: the audio op needs the holder in bindings.refs`);
        return;
      }
      if (scaled) this.event("audioScaled", target, [String(Math.trunc(clipIndex)), String(holder), relayNumber(volumeScale)]);
      else this.event("audio", target, [String(Math.trunc(clipIndex)), String(holder)]);
    }
    audioPitch(target, pitch) {
      this.value("audioPitch", target, "audioPitch", [relayNumber(pitch)]);
    }
    audioVolume(target, volume) {
      this.value("audioVolume", target, "audioVolume", [relayNumber(volume)]);
    }
    animEnabled(target, enabled) {
      this.value("animEnabled", target, "animEnabled", [enabled ? "1" : "0"]);
    }
    uiSetToggle(target, on) {
      this.value("uiSetToggle", target, "uiSetToggle", [on ? "1" : "0"]);
    }
    uiSetSlider(target, value) {
      this.value("uiSetSlider", target, "uiSetSlider", [relayNumber(value)]);
    }
    scale(target, localScale) {
      this.value("scale", target, "scale", [relayNumber(localScale.x), relayNumber(localScale.y), relayNumber(localScale.z)]);
    }
    rbVelocity(target, velocity) {
      this.event("rbVelocity", target, [relayNumber(velocity.x), relayNumber(velocity.y), relayNumber(velocity.z)]);
    }
    rbLaunch(target, velocity) {
      this.event("rbLaunch", target, [relayNumber(velocity.x), relayNumber(velocity.y), relayNumber(velocity.z)]);
      const wire = this.resolve("rbLaunch", target);
      if (wire !== null) this.last.delete(`${wire}/rbKinematic`);
    }
    rbKinematic(target, kinematic) {
      this.value("rbKinematic", target, "rbKinematic", [kinematic ? "1" : "0"]);
    }
    spawn(target, name) {
      this.event("spawn", target, [name]);
    }
    despawn(target) {
      this.event("despawn", target, []);
      if (target.startsWith("@")) {
        for (const key of [...this.last.keys()]) if (key.startsWith(target + "/")) this.last.delete(key);
      }
    }
    op(name, target, args, property) {
      if (!/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(name) || name === "clock") throw new Error(`'${name}' is not a relay op name (letters, digits, _; not clock)`);
      const text = args.map((a) => typeof a === "number" ? relayNumber(a) : typeof a === "boolean" ? a ? "1" : "0" : String(a));
      if (property !== void 0) this.value(name, target, `op.${name}.${property}`, text);
      else this.event(name, target, text);
    }
    /**
     * A request the graph answers with a graph event (pkHead), sent at once and with no target (as the clock): `args`
     * are sent as they are (ids and session ids, which need no encoding).
     */
    request(op, args) {
      this.platform.relaySend(relayPayload(this.slug, this.inst, [relayRecord(op, 0, args.map(encodeRelayArg))]));
    }
    /** The clock is not batched: its answer is timed from the moment it is sent. */
    requestClock() {
      const id = String(this.nextRequest++);
      return new Promise((resolve) => {
        this.waiting.set(id, resolve);
        this.platform.relaySend(relayPayload(this.slug, this.inst, [relayRecord("clock", 0, [id])]));
      });
    }
    /** Forgets clock requests nobody answered. */
    abandonClock() {
      this.waiting.clear();
    }
    /** Forgets what was sent, so that every value goes out again (after the kit was loaded anew). */
    forget() {
      this.last.clear();
    }
    flush() {
      if (!this.queue.length) return;
      const queue = this.queue;
      this.queue = [];
      const prefix = relayKey(this.slug, this.inst).length + 1;
      let batch = [];
      let size = prefix;
      const send = () => {
        if (!batch.length) return;
        this.payloadsSent++;
        this.recordsSent += batch.length;
        this.platform.relaySend(relayPayload(this.slug, this.inst, batch));
        batch = [];
        size = prefix;
      };
      for (const item of queue) {
        if (batch.length && size + item.record.length + 1 > MAX_PAYLOAD) send();
        batch.push(item.record);
        size += item.record.length + 1;
      }
      send();
    }
    warnOnce(key, message) {
      if (this.warned.has(key)) return;
      this.warned.add(key);
      this.platform.log("warn", `[${this.slug}:${this.inst}] ${message}`);
    }
    /** The wire form of a target: a Refs index, "@<path>", or null when the relay cannot reach the object. */
    resolve(op, target) {
      if (target.startsWith("@")) return target;
      const index = this.refs.indexOf(target);
      if (index >= 0) return index;
      if (!this.warned.has(target)) {
        this.warned.add(target);
        this.platform.log("warn", `[${this.slug}:${this.inst}] '${target}' is not in bindings.refs, so the relay graph cannot reach it (${op} ignored)`);
      }
      return null;
    }
    /** Queues a value. Sending the same value again does nothing; a newer one in the same tick replaces it. */
    value(op, target, property, args) {
      const wire = this.resolve(op, target);
      if (wire === null) return;
      const record2 = relayRecord(op, wire, args);
      const slot = `${wire}/${property}`;
      if (this.last.get(slot) === record2) return;
      this.last.set(slot, record2);
      const pending = this.queue.find((q) => q.slot === slot);
      if (pending) pending.record = record2;
      else this.queue.push({ slot, record: record2 });
    }
    event(op, target, args) {
      const wire = this.resolve(op, target);
      if (wire === null) return;
      this.queue.push({ slot: null, record: relayRecord(op, wire, args) });
    }
  };
  var ClockSync = class {
    constructor(clock) {
      __publicField(this, "clock");
      __publicField(this, "offsetSeconds");
      __publicField(this, "synced", false);
      this.clock = clock;
      this.offsetSeconds = clock.wallSeconds() - clock.now() / 1e3;
    }
    /** `sentAt` and the present bracket the host's reading; it is placed halfway between them. */
    accept(hostSeconds, sentAtMs) {
      if (!Number.isFinite(hostSeconds)) return;
      const mid = (sentAtMs + this.clock.now()) / 2;
      this.offsetSeconds = hostSeconds - mid / 1e3;
      this.synced = true;
    }
    seconds() {
      return this.clock.now() / 1e3 + this.offsetSeconds;
    }
  };

  // portkit/src/scene.ts
  var Transform = class {
    constructor(gameObject) {
      __publicField(this, "gameObject");
      __publicField(this, "pos", Vector3.zero);
      __publicField(this, "rot", Quaternion.identity);
      __publicField(this, "lpos", Vector3.zero);
      __publicField(this, "lrot", Quaternion.identity);
      __publicField(this, "lscale", Vector3.one);
      /** False until the world pose has been read from the host or set by the script. */
      __publicField(this, "known", false);
      this.gameObject = gameObject;
    }
    /** World position as last set or reported. Returns a copy, as a C# struct would be. */
    get position() {
      return this.pos.clone();
    }
    set position(v) {
      this.pos = v.clone();
      this.known = true;
      this.gameObject.host?.setTransform({ position: v.clone() });
    }
    get rotation() {
      return this.rot.clone();
    }
    set rotation(q) {
      this.rot = q.clone();
      this.known = true;
      this.gameObject.host?.setTransform({ rotation: q.clone() });
    }
    get eulerAngles() {
      return this.rot.eulerAngles;
    }
    set eulerAngles(v) {
      this.rotation = Quaternion.Euler(v.x, v.y, v.z);
    }
    /** Local values are only what the script itself set: the host is not asked for them. */
    get localPosition() {
      return this.lpos.clone();
    }
    set localPosition(v) {
      this.lpos = v.clone();
      this.gameObject.host?.setTransform({ localPosition: v.clone() });
    }
    get localRotation() {
      return this.lrot.clone();
    }
    set localRotation(q) {
      this.lrot = q.clone();
      this.gameObject.host?.setTransform({ localRotation: q.clone() });
    }
    get localScale() {
      return this.lscale.clone();
    }
    set localScale(v) {
      this.lscale = v.clone();
      this.gameObject.host?.setTransform({ localScale: v.clone() });
    }
    get forward() {
      return this.rot.rotate(Vector3.forward);
    }
    get up() {
      return this.rot.rotate(Vector3.up);
    }
    get right() {
      return this.rot.rotate(Vector3.right);
    }
    SetPositionAndRotation(position, rotation) {
      this.pos = position.clone();
      this.rot = rotation.clone();
      this.known = true;
      this.gameObject.host?.setTransform({ position: position.clone(), rotation: rotation.clone() });
    }
    /** Asks the host where the object is now (after a drop, or physics). Await it before reading `position`. */
    async Refresh() {
      const pose2 = await this.gameObject.host?.readTransform();
      if (pose2) this._report(pose2.position, pose2.rotation);
    }
    /** @internal The host reported the object's pose. */
    _report(position, rotation) {
      this.pos = position.clone();
      this.rot = rotation.clone();
      this.known = true;
    }
  };
  var GameObject = class {
    constructor(key, name, host, actions, subscribe2 = null) {
      /** The key in bindings.objects, or "" for an object that only exists in the script. */
      __publicField(this, "key");
      __publicField(this, "name");
      __publicField(this, "transform");
      /** @internal */
      __publicField(this, "host");
      __publicField(this, "actions");
      __publicField(this, "subscribe");
      __publicField(this, "active", true);
      __publicField(this, "layerValue", -1);
      this.key = key;
      this.name = name;
      this.host = host;
      this.actions = actions;
      this.subscribe = subscribe2;
      this.transform = new Transform(this);
    }
    /** As last set by the script (objects start active unless the script says otherwise). */
    get activeSelf() {
      return this.active;
    }
    SetActive(active) {
      this.active = !!active;
      if (this.actions && this.key) this.actions.setActive(this.key, this.active);
      else this.host?.setActive(this.active);
    }
    /**
     * The object's layer as last set by the script (-1 before that: the kit's own). Setting it moves the object's
     * collider: 20 (Grabbable) for a pickup that may be picked up, 5 (UI) for one that may not, which is then
     * clickable and lets hands pass through. Only what changes is sent.
     */
    get layer() {
      return this.layerValue;
    }
    set layer(value) {
      const layer = Math.trunc(value);
      if (layer === this.layerValue) return;
      this.layerValue = layer;
      this.host?.setLayer(layer);
    }
    /**
     * Listens to this object's events: the page's own (click, grab, drop, ...) and those a graph reports for it
     * (uiButton, uiSlider, heldTrigger, ...). Prefer `events` in bindings.json; this is for wiring made in code.
     * The listener lives as long as the instance.
     */
    On(kind, handler) {
      if (this.subscribe) this.subscribe(kind, handler);
      else this.host?.on(kind, handler);
    }
    /**
     * Attaches this object to the local player's hand (0 left, 1 right), at an offset from it (BS.AttachedObject;
     * UNVERIFIED in Play mode). Only the local player can be attached to; other players see it only through a synced
     * transform.
     */
    AttachToHand(side, position = new Vector3(), rotation = new Quaternion()) {
      this.host?.attachToHand(side, position, rotation);
    }
    /**
     * Attaches this object to the local player's head, at an offset from it (BS.AttachedObject, attachment point Head;
     * UNVERIFIED in Play mode): a label over the player's avatar. With `autoSync` the app shows the attachment to the
     * other players too (the object gets its per-instance network id if it has none), so each player attaches their
     * own object (one per player: a per-player behaviour's object, or a pool) and everyone sees every label.
     */
    AttachToHead(position = new Vector3(), rotation = new Quaternion(), autoSync = false) {
      this.host?.attachToHead?.(position, rotation, autoSync);
    }
    /** Lets go of what AttachToHand or AttachToHead attached. */
    Detach() {
      this.host?.detach();
    }
    /** Makes the local player let go of this object if they hold it (VRChat: VRCPickup.Drop()); `drop` follows. */
    ReleaseGrab() {
      this.host?.releaseGrab();
    }
    /** Asks to own the object's synced transform (VRChat: Networking.SetOwner on a VRCObjectSync). */
    TakeOwnership() {
      this.host?.takeOwnership();
    }
    toString() {
      return this.name || this.key;
    }
  };
  var ComponentRef = class {
    constructor(kind, gameObject, actions) {
      __publicField(this, "kind");
      __publicField(this, "gameObject");
      __publicField(this, "actions");
      this.kind = kind;
      this.gameObject = gameObject;
      this.actions = actions;
    }
    get transform() {
      return this.gameObject.transform;
    }
  };
  var TextRef = class extends ComponentRef {
    constructor() {
      super(...arguments);
      /** Null until the script first sets it: the kit's own text (a prefab placeholder) is unknown, so the first value is always sent, "" included. */
      __publicField(this, "value", null);
    }
    get text() {
      return this.value ?? "";
    }
    set text(value) {
      const next = value === null || value === void 0 ? "" : String(value);
      if (next === this.value) return;
      this.value = next;
      this.actions.setText(this.gameObject.key, next);
    }
    /** The colour of the text (a uGUI graphic). */
    set color(value) {
      this.actions.uiColor(this.gameObject.key, value);
    }
  };
  var AnimatorRef = class extends ComponentRef {
    constructor() {
      super(...arguments);
      __publicField(this, "on", true);
    }
    /** Animator.enabled: a disabled animator holds its pose. Reading gives what the script last set. */
    get enabled() {
      return this.on;
    }
    set enabled(value) {
      this.on = !!value;
      this.actions.animEnabled(this.gameObject.key, this.on);
    }
    SetBool(name, value) {
      this.actions.animBool(this.gameObject.key, name, value);
    }
    SetFloat(name, value) {
      this.actions.animFloat(this.gameObject.key, name, value);
    }
    SetInteger(name, value) {
      this.actions.animInt(this.gameObject.key, name, value);
    }
    SetTrigger(name) {
      this.actions.animTrigger(this.gameObject.key, name);
    }
    ResetTrigger(name) {
      this.actions.animResetTrigger(this.gameObject.key, name);
    }
    Play(state) {
      this.actions.animPlay(this.gameObject.key, state, 0);
    }
    CrossFade(state, seconds) {
      this.actions.animPlay(this.gameObject.key, state, seconds);
    }
  };
  var ParticleSystemRef = class extends ComponentRef {
    Play() {
      this.actions.particles(this.gameObject.key, true);
    }
    Stop() {
      this.actions.particles(this.gameObject.key, false);
    }
  };
  var RendererRef = class extends ComponentRef {
    /** Sets a colour property of one of the renderer's materials, "_BaseColor" of slot 0 by default (URP). */
    SetColor(color, property = "_BaseColor", slot = 0) {
      this.actions.setColor(this.gameObject.key, property, color, slot);
    }
    /** Sets a float property of one of the renderer's materials. */
    SetFloat(property, value, slot = 0) {
      this.actions.matFloat(this.gameObject.key, property, value, slot);
    }
  };
  var AudioSourceRef = class extends ComponentRef {
    constructor() {
      super(...arguments);
      __publicField(this, "pitchValue", 1);
      __publicField(this, "volumeValue", 1);
      /** The clip `Play()` plays (UnityEngine.AudioSource.clip). */
      __publicField(this, "clip", null);
    }
    /** Plays a clip (a `$clip` field value, or an index into this object's own clip list) through this audio source. */
    PlayOneShot(clip, volumeScale) {
      if (typeof clip === "number") this.actions.playClip(this.gameObject.key, clip, void 0, volumeScale);
      else this.actions.playClip(this.gameObject.key, clip.index, clip.on ?? void 0, volumeScale);
    }
    /** Plays `clip` as a one-shot (it overlaps a sound still playing instead of cutting it off). */
    Play() {
      if (this.clip) this.PlayOneShot(this.clip);
    }
    /** AudioSource.pitch (relay op `audioPitch`). Reading gives what the script last set. */
    get pitch() {
      return this.pitchValue;
    }
    set pitch(value) {
      this.pitchValue = value;
      this.actions.audioPitch(this.gameObject.key, value);
    }
    /** AudioSource.volume (relay op `audioVolume`). */
    get volume() {
      return this.volumeValue;
    }
    set volume(value) {
      this.volumeValue = value;
      this.actions.audioVolume(this.gameObject.key, value);
    }
  };
  var AudioClipRef = class {
    constructor(index, on = null) {
      __publicField(this, "index");
      __publicField(this, "on");
      this.index = index;
      this.on = on;
    }
  };
  function makeComponent(kind, gameObject, actions) {
    switch (kind) {
      case "Text":
      case "TMP":
        return new TextRef(kind, gameObject, actions);
      case "Animator":
        return new AnimatorRef(kind, gameObject, actions);
      case "ParticleSystem":
        return new ParticleSystemRef(kind, gameObject, actions);
      case "Renderer":
        return new RendererRef(kind, gameObject, actions);
      case "AudioSource":
        return new AudioSourceRef(kind, gameObject, actions);
      case "Transform":
        return gameObject.transform;
      default:
        return new ComponentRef(kind, gameObject, actions);
    }
  }

  // portkit/src/networking.ts
  var Networking = class {
    /** @internal */
    constructor(host) {
      __publicField(this, "host");
      this.host = host;
    }
    get LocalPlayer() {
      return this.host.localPlayer();
    }
    /** True on the one client that is this instance's referee (VRChat: the master). */
    get IsReferee() {
      return this.host.isReferee();
    }
    /** The same as IsReferee, under the name upstream code uses. */
    get IsMaster() {
      return this.host.isReferee();
    }
    /**
     * Where the app places `player`'s head: the SDK's Get User State through the relay op `pkHead`. Null when the app does
     * not know (yet), on a kit without the op, or after `seconds`. A referee can check another player's claim with it.
     */
    HeadOf(player, seconds = 2) {
      return this.host.headOf ? this.host.headOf(player, seconds) : Promise.resolve(null);
    }
    /** The referee, or null while there is none. */
    get Master() {
      return this.host.refereePlayer();
    }
    /**
     * IsOwner(target): does the local player own it?  IsOwner(player, target): does that player?
     * A GameObject stands for the behaviours on it, as in Udon, where ownership belongs to the object.
     */
    IsOwner(a, b) {
      const player = b === void 0 ? this.host.localPlayer() : a;
      const target = b === void 0 ? a : b;
      const behaviour = this.first(target);
      return behaviour ? this.host.isOwner(behaviour, player) : false;
    }
    GetOwner(target) {
      const behaviour = this.first(target);
      return behaviour ? this.host.owner(behaviour) : null;
    }
    /**
     * Makes `player` the owner. It takes effect here at once; if someone else claimed at the same moment and the
     * room kept their claim, OnOwnershipTransferred reports the real owner a moment later.
     */
    SetOwner(player, target) {
      for (const behaviour of this.all(target)) this.host.setOwner(behaviour, player);
    }
    /** Synced time in seconds: the same on every client, to within the accuracy of the first clock exchange. */
    GetServerTimeInSeconds() {
      return this.host.serverSeconds();
    }
    GetServerTimeInMilliseconds() {
      return Math.floor(this.host.serverSeconds() * 1e3);
    }
    /** Everyone taking part in this instance, in player-id order (VRChat: VRCPlayerApi.GetPlayers). */
    GetPlayers() {
      return this.host.playerList();
    }
    GetPlayerCount() {
      return this.host.playerList().length;
    }
    GetPlayerById(id) {
      return this.host.playerById(id);
    }
    /**
     * While a network event or a command runs: the player who sent it (the local player for one sent here).
     * Null outside one, and null for a sender who is not taking part in this instance.
     */
    get CallingPlayer() {
      return this.host.callingPlayer();
    }
    /** The sender's session and user id, as the room stamped them, even when they are not a participant. */
    get CallingSession() {
      return this.host.callingSession();
    }
    /**
     * In a game whose referee candidates are "declared": offers the local player as referee, or withdraws them.
     * A referee who withdraws stops being referee and the remaining candidates elect another.
     */
    SetRefereeCandidate(on) {
      this.host.setCandidate(on);
    }
    IsRefereeCandidate(player) {
      return this.host.isCandidate(player);
    }
    /** Whether this client started a new game, resumed a saved one, or joined one in progress. */
    get StartKind() {
      return this.host.startKind();
    }
    /** Always false: the app queues and retries writes itself. Kept so that upstream checks translate. */
    get IsClogged() {
      return false;
    }
    all(target) {
      return target instanceof GameObject ? this.host.behavioursOn(target) : [target];
    }
    first(target) {
      return this.all(target)[0] ?? null;
    }
  };

  // portkit/src/persistence.ts
  var Persistence = class {
    constructor(store, slug, inst, uid) {
      __publicField(this, "store");
      __publicField(this, "prefix");
      this.store = store;
      this.prefix = storagePrefix(slug, inst, uid);
    }
    /** The saved value, or `fallback` when there is none or it cannot be read. */
    get(key, fallback) {
      let text = null;
      try {
        text = this.store.get(this.prefix + key);
      } catch {
        return fallback;
      }
      if (text === null) return fallback;
      try {
        return decodeValue(JSON.parse(text));
      } catch {
        return fallback;
      }
    }
    /** False when the device refused to store it (storage full or switched off). */
    set(key, value) {
      try {
        this.store.set(this.prefix + key, JSON.stringify(encodeValue(value)));
        return true;
      } catch {
        return false;
      }
    }
    has(key) {
      try {
        return this.store.get(this.prefix + key) !== null;
      } catch {
        return false;
      }
    }
    remove(key) {
      try {
        this.store.remove(this.prefix + key);
      } catch {
      }
    }
    keys() {
      try {
        return this.store.keys(this.prefix).map((k) => k.slice(this.prefix.length));
      } catch {
        return [];
      }
    }
  };

  // portkit/src/players.ts
  var ID_SETTLE_MS = 600;
  var Player = class {
    constructor(sid, uid, name, isLocal, playerId) {
      __publicField(this, "sid");
      __publicField(this, "uid");
      __publicField(this, "isLocal");
      __publicField(this, "displayName");
      __publicField(this, "playerId");
      /** The space's owner or a moderator, as the platform reports it. Not proof: check what the room accepted. */
      __publicField(this, "isSpaceAdmin", false);
      /** @internal */
      __publicField(this, "_valid", true);
      /** @internal */
      __publicField(this, "_isMaster", () => false);
      this.sid = sid;
      this.uid = uid;
      this.displayName = name;
      this.isLocal = isLocal;
      this.playerId = playerId;
    }
    /** False once the player has left: keep no references across OnPlayerLeft. */
    IsValid() {
      return this._valid;
    }
    get isMaster() {
      return this._valid && this._isMaster();
    }
    toString() {
      return `${this.displayName}#${this.playerId}`;
    }
  };
  var Players = class {
    constructor(core, presence, referee) {
      __publicField(this, "core");
      __publicField(this, "presence");
      __publicField(this, "referee");
      __publicField(this, "bySidMap", /* @__PURE__ */ new Map());
      __publicField(this, "claims", /* @__PURE__ */ new Map());
      __publicField(this, "handlers", []);
      __publicField(this, "localAssigned", deferred());
      __publicField(this, "highWater", 0);
      __publicField(this, "myId", 0);
      __publicField(this, "recheck", 0);
      this.core = core;
      this.presence = presence;
      this.referee = referee;
    }
    /** Starts following ids and claims one for the local player (who must have announced already). */
    start() {
      this.presence.on(() => this.refresh());
      this.presence.onExtra(() => this.refresh());
      this.refresh();
      this.claim();
    }
    /** Resolves once the local player's id has stood for the settle time. */
    whenLocalAssigned() {
      return this.localAssigned.promise;
    }
    get local() {
      return this.bySidMap.get(this.core.me.sid) ?? null;
    }
    bySid(sid) {
      return this.bySidMap.get(sid) ?? null;
    }
    byId(id) {
      for (const player of this.bySidMap.values()) if (player.playerId === id) return player;
      return null;
    }
    /** Everyone taking part, in player-id order. */
    list() {
      return [...this.bySidMap.values()].sort((a, b) => a.playerId - b.playerId);
    }
    on(handler) {
      this.handlers.push(handler);
    }
    /** Upkeep no event triggers. Called about once a second. */
    tend() {
      this.refresh();
    }
    idOf(sid) {
      const id = this.presence.extra(sid, "id");
      return typeof id === "number" && Number.isInteger(id) && id > 0 ? id : null;
    }
    claim() {
      let top = this.highWater;
      for (const who of this.presence.list()) {
        const id = this.idOf(who.sid);
        const hw = this.presence.extra(who.sid, "hw");
        if (id !== null && id > top) top = id;
        if (typeof hw === "number" && hw > top) top = hw;
      }
      this.myId = top + 1;
      this.highWater = this.myId;
      this.presence.setExtra("id", this.myId);
      this.presence.setExtra("hw", this.highWater);
      this.presence.flush();
    }
    refresh() {
      if (this.core.disposed) return;
      const clock = this.core.platform.clock;
      const now = clock.now();
      const me = this.core.me.sid;
      const present = this.presence.list();
      const holders = /* @__PURE__ */ new Map();
      let top = this.highWater;
      for (const who of present) {
        const id = this.idOf(who.sid);
        const hw = this.presence.extra(who.sid, "hw");
        if (typeof hw === "number" && hw > top) top = hw;
        if (id === null) {
          this.claims.delete(who.sid);
          continue;
        }
        if (id > top) top = id;
        const claim = this.claims.get(who.sid);
        if (!claim || claim.id !== id) this.claims.set(who.sid, { id, since: now });
        if (!holders.has(id)) holders.set(id, who.sid);
      }
      for (const sid of [...this.claims.keys()]) if (!this.presence.has(sid)) this.claims.delete(sid);
      if (this.myId > 0 && holders.get(this.myId) !== void 0 && holders.get(this.myId) !== me) {
        this.highWater = top;
        this.claim();
        return;
      }
      if (top > this.highWater) {
        this.highWater = top;
        if (this.myId > 0) this.presence.setExtra("hw", top);
      }
      const leaving = [];
      const joining = [];
      let nextCheck = Infinity;
      for (const player of this.bySidMap.values()) if (!this.presence.has(player.sid)) leaving.push(player);
      for (const who of present) {
        const claim = this.claims.get(who.sid);
        if (!claim || holders.get(claim.id) !== who.sid) continue;
        const existing = this.bySidMap.get(who.sid);
        if (existing) {
          existing.displayName = who.name;
          if (existing.playerId !== claim.id) {
            this.core.log("warn", `player ${existing.displayName} changed id ${existing.playerId} -> ${claim.id} after joining (two ids were claimed at once)`);
            existing.playerId = claim.id;
          }
          continue;
        }
        const ready = claim.since + ID_SETTLE_MS;
        const echoed = who.sid !== me || this.localEchoed();
        if (now >= ready && echoed) joining.push(this.make(who, claim.id));
        else nextCheck = Math.min(nextCheck, Math.max(ready, now + 50));
      }
      for (const player of leaving) {
        this.bySidMap.delete(player.sid);
        player._valid = false;
      }
      for (const player of joining) this.bySidMap.set(player.sid, player);
      for (const player of leaving) this.emit("leave", player);
      for (const player of joining.sort((a, b) => a.playerId - b.playerId)) this.emit("join", player);
      if (this.bySidMap.has(me)) this.localAssigned.resolve();
      if (this.recheck) this.core.scheduler.cancel(this.recheck);
      this.recheck = 0;
      if (nextCheck !== Infinity) {
        this.recheck = this.core.scheduler.after(nextCheck - now, () => {
          this.recheck = 0;
          this.refresh();
        });
      }
    }
    localEchoed() {
      const marker = safeParse(this.core.platform.userGet(this.core.me.sid, this.core.prefix + ".k"));
      return isRecord(marker) && isRecord(marker.x) && marker.x.id === this.myId;
    }
    make(who, id) {
      const player = new Player(who.sid, who.uid, who.name, who.isLocal, id);
      player._isMaster = () => this.referee.current()?.sid === player.sid;
      player.isSpaceAdmin = this.core.platform.players().find((p) => p.sid === who.sid)?.isAdmin === true;
      return player;
    }
    emit(kind, player) {
      for (const handler of this.handlers.slice()) this.core.guard("player handler", () => handler(kind, player));
    }
  };

  // portkit/src/presence.ts
  var Presence = class {
    constructor(core) {
      __publicField(this, "core");
      __publicField(this, "known", /* @__PURE__ */ new Map());
      __publicField(this, "extras", /* @__PURE__ */ new Map());
      __publicField(this, "texts", /* @__PURE__ */ new Map());
      /** Every public key each session has announced, kept after it leaves (a sealed box can outlive its sender's visit). */
      __publicField(this, "keysSeen", /* @__PURE__ */ new Map());
      __publicField(this, "handlers", []);
      __publicField(this, "extraHandlers", []);
      __publicField(this, "announced", null);
      __publicField(this, "localExtras", {});
      __publicField(this, "dirty", false);
      __publicField(this, "started", false);
      this.core = core;
    }
    get markerPath() {
      return this.core.prefix + ".k";
    }
    start() {
      if (this.started) return;
      this.started = true;
      const { platform } = this.core;
      this.core.own(platform.onPlayers(() => this.recompute()));
      this.core.own(
        platform.onUser(this.core.prefix + ".", (_sid, path) => {
          if (path === this.markerPath) this.recompute();
        })
      );
      this.recompute();
    }
    /** Publishes the local marker. From here on the local player is a participant. */
    announce(publicKey) {
      this.announced = publicKey;
      this.write();
      this.recompute();
    }
    /** Withdraws the marker, when the instance stops while its player stays in the room. */
    retire() {
      if (this.announced === null) return;
      this.announced = null;
      this.core.platform.userSet(this.markerPath, null);
    }
    /** Sets or (with undefined) removes one of the local player's published records. Sent at the end of the tick. */
    setExtra(name, value) {
      if (value === void 0) {
        if (!(name in this.localExtras)) return;
        delete this.localExtras[name];
      } else this.localExtras[name] = value;
      this.dirty = true;
      this.emitExtra(this.core.me.sid);
    }
    /** The local player's session id. */
    get localSid() {
      return this.core.me.sid;
    }
    /** A published record of any participant, from the mirror (the local player's own is read back at once). */
    extra(sid, name) {
      if (sid === this.core.me.sid) return this.localExtras[name];
      return this.extras.get(sid)?.[name];
    }
    /** Called when a participant's published records may have changed. */
    onExtra(handler) {
      this.extraHandlers.push(handler);
    }
    /** Looks again at who is here: a session id can change without an event. Called about once a second. */
    tend() {
      if (this.started) this.recompute();
    }
    /** Sends the marker if a record changed. Called once per tick. */
    flush() {
      if (!this.dirty || this.announced === null || this.core.disposed) return;
      this.write();
    }
    write() {
      this.dirty = false;
      const marker = { k: this.announced, v: 1 };
      if (Object.keys(this.localExtras).length) marker.x = this.localExtras;
      this.core.platform.userSet(this.markerPath, asciiJson(marker));
    }
    /** Participants ordered by user id, then session id: the order referee ranks and player ids follow. */
    list() {
      return [...this.known.values()].sort(compare);
    }
    has(sid) {
      return this.known.has(sid);
    }
    get(sid) {
      return this.known.get(sid);
    }
    /** The public key a session announced, now or before it left; undefined for a session never seen. */
    keyOf(sid) {
      return this.known.get(sid)?.publicKey ?? this.keysSeen.get(sid);
    }
    /** Position of `sid` in `list()`, or -1. */
    rank(sid) {
      return this.list().findIndex((p) => p.sid === sid);
    }
    on(handler) {
      this.handlers.push(handler);
    }
    recompute() {
      if (this.core.disposed) return;
      const { platform } = this.core;
      const now = /* @__PURE__ */ new Map();
      const changed = [];
      for (const player of platform.players()) {
        let key = null;
        if (player.isLocal) key = this.announced;
        else {
          const text = platform.userGet(player.sid, this.markerPath) ?? "";
          if (text !== this.texts.get(player.sid)) {
            this.texts.set(player.sid, text);
            const marker2 = safeParse(text);
            this.extras.set(player.sid, isRecord(marker2) && isRecord(marker2.x) ? marker2.x : {});
            changed.push(player.sid);
          }
          const marker = safeParse(text);
          if (isRecord(marker) && typeof marker.k === "string" && marker.k.length > 0) key = marker.k;
        }
        if (key === null) continue;
        now.set(player.sid, { sid: player.sid, uid: player.uid, name: player.name, isLocal: player.isLocal, publicKey: key });
      }
      const left = [];
      const joined = [];
      for (const [sid, who] of this.known) if (!now.has(sid)) left.push(who);
      for (const [sid, who] of now) {
        const before = this.known.get(sid);
        if (!before) joined.push(who);
        else {
          before.name = who.name;
          before.publicKey = who.publicKey;
        }
      }
      for (const who of now.values()) this.keysSeen.set(who.sid, who.publicKey);
      for (const who of left) {
        this.known.delete(who.sid);
        this.extras.delete(who.sid);
        this.texts.delete(who.sid);
      }
      for (const who of joined) this.known.set(who.sid, who);
      for (const who of left.sort(compare)) this.emit("leave", who);
      for (const who of joined.sort(compare)) this.emit("join", who);
      for (const sid of changed) if (this.known.has(sid)) this.emitExtra(sid);
    }
    emit(kind, who) {
      for (const handler of this.handlers.slice()) this.core.guard("presence handler", () => handler(kind, who));
    }
    emitExtra(sid) {
      for (const handler of this.extraHandlers.slice()) this.core.guard("presence record handler", () => handler(sid));
    }
  };
  function compare(a, b) {
    return a.uid < b.uid ? -1 : a.uid > b.uid ? 1 : a.sid < b.sid ? -1 : a.sid > b.sid ? 1 : 0;
  }

  // portkit/src/protect.ts
  var ProtectedValues = class {
    constructor(core) {
      __publicField(this, "core");
      /** Told when a protected value changed. */
      __publicField(this, "onChanged", () => {
      });
      this.core = core;
    }
    listen() {
      this.core.onState((key) => {
        if (key.startsWith("x.")) this.core.guard("OnProtectedChanged", () => this.onChanged(key.slice(2)));
      });
    }
    get CanWrite() {
      return this.core.platform.local().isAdmin;
    }
    Set(key, value) {
      if (!isPathSegment(key)) throw new Error(`a protected key must be 1-64 of A-Z a-z 0-9 _ - @, not '${key}'`);
      if (this.core.disposed) return;
      this.core.platform.stateSetProtected(`${this.core.prefix}.x.${key}`, asciiJson({ v: encodeValue(value) }));
    }
    Get(key, fallback) {
      const raw = safeParse(this.core.get(`x.${key}`));
      return raw && typeof raw === "object" && "v" in raw ? decodeValue(raw.v) : fallback;
    }
    Has(key) {
      const raw = safeParse(this.core.get(`x.${key}`));
      return !!raw && typeof raw === "object" && "v" in raw;
    }
  };

  // portkit/src/referee.ts
  var CROSSING_MS = 1500;
  var Referee = class {
    constructor(core, presence, rule) {
      __publicField(this, "core");
      __publicField(this, "presence");
      __publicField(this, "rule");
      __publicField(this, "handlers", []);
      __publicField(this, "judging", false);
      __publicField(this, "timer", 0);
      __publicField(this, "timerDue", -1);
      __publicField(this, "invalidSince", 0);
      __publicField(this, "claimAt", -Infinity);
      __publicField(this, "seen", null);
      __publicField(this, "lastEpoch", 0);
      __publicField(this, "declared", false);
      /** Counters for tests and diagnostics. */
      __publicField(this, "claims", 0);
      /** What this client found when it last claimed: a new epoch, or a game other participants were still running. */
      __publicField(this, "lastClaim", null);
      this.core = core;
      this.presence = presence;
      this.rule = rule;
    }
    start() {
      this.core.onState((key) => {
        if (key === "ref") this.check();
      });
      this.presence.on(() => this.check());
      this.presence.onExtra(() => this.check());
      this.invalidSince = this.core.platform.clock.now();
      this.check();
      this.core.scheduler.after(this.core.options.settleMs, () => {
        this.judging = true;
        this.invalidSince = this.core.platform.clock.now();
        this.check();
      });
    }
    /** The mirrored record, whether or not its session is still a candidate. */
    mirrored() {
      const raw = safeParse(this.core.get("ref"));
      if (!isRecord(raw) || typeof raw.sid !== "string" || typeof raw.uid !== "string") return null;
      if (typeof raw.term !== "number" || typeof raw.e !== "number") return null;
      return { sid: raw.sid, uid: raw.uid, term: raw.term, e: raw.e };
    }
    /** The referee, or null while there is none. */
    current() {
      const m = this.mirrored();
      return m && this.isCandidate(m.sid) ? m : null;
    }
    isMe() {
      return this.current()?.sid === this.core.me.sid;
    }
    /** The epoch of the last valid referee seen: records of any other epoch are ignored. 0 before the first. */
    get epoch() {
      return this.lastEpoch;
    }
    /** May this session be elected? */
    isCandidate(sid) {
      if (!this.presence.has(sid)) return false;
      return this.rule === "anyone" || this.presence.extra(sid, "rc") === 1;
    }
    /** Candidates in rank order. */
    candidates() {
      return this.presence.list().filter((p) => this.isCandidate(p.sid)).map((p) => p.sid);
    }
    /** Under the "declared" rule: offers the local player as referee, or withdraws the offer. */
    setCandidate(on) {
      if (this.declared === on) return;
      this.declared = on;
      this.presence.setExtra("rc", on ? 1 : void 0);
      this.presence.flush();
    }
    /** Tells the others which epoch this client is running in, so a claimant knows the game is still alive. */
    publishEpoch() {
      if (this.presence.extra(this.core.me.sid, "ep") === this.lastEpoch) return;
      this.presence.setExtra("ep", this.lastEpoch);
      this.presence.flush();
    }
    on(handler) {
      this.handlers.push(handler);
    }
    check() {
      if (this.core.disposed) return;
      const now = this.current();
      const before = this.seen;
      if (now) {
        this.cancelTimer();
        if (!before || before.sid !== now.sid || before.term !== now.term || before.e !== now.e) {
          const me2 = this.core.me.sid;
          if (before && before.sid === me2 && now.sid !== me2 && this.isCandidate(me2) && this.core.platform.clock.now() - this.claimAt > CROSSING_MS) {
            this.core.log("warn", `the referee seat was taken by session ${now.sid} (term ${now.term}) while this client was referee`);
          }
          this.lastEpoch = now.e;
          this.seen = now;
          this.publishEpoch();
          this.emit(now, before);
        }
        return;
      }
      if (before) {
        this.seen = null;
        this.invalidSince = this.core.platform.clock.now();
        this.claimAt = -Infinity;
        this.emit(null, before);
      }
      if (!this.judging) return;
      const me = this.core.me.sid;
      const rank = this.candidates().indexOf(me);
      if (rank < 0) {
        this.cancelTimer();
        return;
      }
      const earliest = Math.max(this.invalidSince + rank * this.core.options.claimStepMs, this.claimAt + this.core.options.claimRetryMs);
      if (this.timer && this.timerDue === earliest) return;
      this.cancelTimer();
      this.timerDue = earliest;
      this.timer = this.core.scheduler.after(Math.max(0, earliest - this.core.platform.clock.now()), () => {
        this.timer = 0;
        this.claim();
      });
    }
    claim() {
      if (this.core.disposed || this.current()) return;
      const me = this.core.me;
      if (!this.isCandidate(me.sid)) return;
      const old = this.mirrored();
      const alive = old !== null && this.presence.list().some((p) => this.presence.extra(p.sid, "ep") === old.e);
      const fresh = old === null || this.core.options.whenEmpty === "reset" && !alive;
      const record2 = { sid: me.sid, uid: me.uid, term: (old?.term ?? 0) + 1, e: (old?.e ?? 0) + (fresh ? 1 : 0) };
      this.claims++;
      this.lastClaim = { term: record2.term, fresh, alive };
      this.claimAt = this.core.platform.clock.now();
      this.core.log("info", `claiming referee, term ${record2.term}, epoch ${record2.e}${fresh && old ? " (fresh start)" : ""}`);
      this.core.set("ref", asciiJson(record2));
      this.check();
    }
    cancelTimer() {
      if (this.timer) this.core.scheduler.cancel(this.timer);
      this.timer = 0;
      this.timerDue = -1;
    }
    emit(now, before) {
      for (const handler of this.handlers.slice()) this.core.guard("referee handler", () => handler(now, before));
    }
  };

  // portkit/src/scheduler.ts
  var TICK_MS = 50;
  var TICK_SECONDS = TICK_MS / 1e3;
  var Scheduler = class {
    constructor(clock, onError) {
      __publicField(this, "clock");
      __publicField(this, "onError");
      __publicField(this, "delayed", /* @__PURE__ */ new Map());
      __publicField(this, "framed", []);
      __publicField(this, "nextHandle", 1);
      __publicField(this, "tickTimer", 0);
      __publicField(this, "running", false);
      __publicField(this, "stopped", false);
      __publicField(this, "startedAt", 0);
      __publicField(this, "lastTickAt", 0);
      __publicField(this, "tickCount", 0);
      /** Seconds the last tick covered (0 outside a tick's first run). */
      __publicField(this, "deltaTime", 0);
      this.clock = clock;
      this.onError = onError;
      this.startedAt = clock.now();
      this.lastTickAt = this.startedAt;
    }
    /** Seconds since the scheduler was made. */
    get time() {
      return (this.clock.now() - this.startedAt) / 1e3;
    }
    get ticks() {
      return this.tickCount;
    }
    /** Starts the tick. `onTick` runs every 50 ms; a page that stalled is not paid back with a burst of ticks. */
    start(onTick) {
      if (this.running || this.stopped) return;
      this.running = true;
      this.lastTickAt = this.clock.now();
      const step = () => {
        if (!this.running) return;
        const now = this.clock.now();
        const elapsed = now - this.lastTickAt;
        this.lastTickAt = now;
        this.tickCount++;
        this.deltaTime = Math.min(0.25, Math.max(1e-3, elapsed / 1e3));
        const due = this.framed.filter((f) => --f.ticks <= 0);
        if (due.length) this.framed = this.framed.filter((f) => f.ticks > 0);
        for (const f of due) this.guard("delayed frames", f.fn);
        this.guard("tick", () => onTick(this.deltaTime));
        if (this.running) this.tickTimer = this.clock.setTimeout(step, TICK_MS);
      };
      this.tickTimer = this.clock.setTimeout(step, TICK_MS);
    }
    /** Runs `fn` once after `ms`. Returns a handle for `cancel`. */
    after(ms, fn) {
      const id = this.nextHandle++;
      if (this.stopped) return id;
      const timer = this.clock.setTimeout(
        () => {
          if (!this.delayed.delete(id)) return;
          this.guard("delayed event", fn);
        },
        Math.max(0, ms)
      );
      this.delayed.set(id, { timer });
      return id;
    }
    /** Runs `fn` at the start of the tick `ticks` ticks from now (at least the next one). */
    afterTicks(ticks, fn) {
      const id = this.nextHandle++;
      if (!this.stopped) this.framed.push({ id, ticks: Math.max(1, Math.floor(ticks)), fn });
      return id;
    }
    cancel(handle) {
      const d = this.delayed.get(handle);
      if (d) {
        this.clock.clearTimeout(d.timer);
        this.delayed.delete(handle);
        return;
      }
      this.framed = this.framed.filter((f) => f.id !== handle);
    }
    /** Cancels the tick and every pending delayed event. The scheduler cannot be started again. */
    stop() {
      this.running = false;
      this.stopped = true;
      this.clock.clearTimeout(this.tickTimer);
      for (const d of this.delayed.values()) this.clock.clearTimeout(d.timer);
      this.delayed.clear();
      this.framed = [];
    }
    get pending() {
      return this.delayed.size + this.framed.length;
    }
    guard(where, fn) {
      try {
        fn();
      } catch (error) {
        this.onError(where, error);
      }
    }
  };

  // portkit/src/sha256.ts
  var K = new Uint32Array([
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
  ]);
  function sha256(message) {
    const h = new Uint32Array([1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225]);
    const length = message.length;
    const padded = new Uint8Array((length + 8 >> 6) + 1 << 6);
    padded.set(message);
    padded[length] = 128;
    const bits = length * 8;
    const view = new DataView(padded.buffer);
    view.setUint32(padded.length - 8, Math.floor(bits / 4294967296));
    view.setUint32(padded.length - 4, bits >>> 0);
    const w = new Uint32Array(64);
    for (let offset = 0; offset < padded.length; offset += 64) {
      for (let i = 0; i < 16; i++) w[i] = view.getUint32(offset + i * 4);
      for (let i = 16; i < 64; i++) {
        const a2 = w[i - 15];
        const b2 = w[i - 2];
        const s0 = (a2 >>> 7 | a2 << 25) ^ (a2 >>> 18 | a2 << 14) ^ a2 >>> 3;
        const s1 = (b2 >>> 17 | b2 << 15) ^ (b2 >>> 19 | b2 << 13) ^ b2 >>> 10;
        w[i] = w[i - 16] + s0 + w[i - 7] + s1 | 0;
      }
      let a = h[0], b = h[1], c = h[2], d = h[3], e = h[4], f = h[5], g = h[6], hh = h[7];
      for (let i = 0; i < 64; i++) {
        const s1 = (e >>> 6 | e << 26) ^ (e >>> 11 | e << 21) ^ (e >>> 25 | e << 7);
        const ch = e & f ^ ~e & g;
        const t1 = hh + s1 + ch + K[i] + w[i] | 0;
        const s0 = (a >>> 2 | a << 30) ^ (a >>> 13 | a << 19) ^ (a >>> 22 | a << 10);
        const maj = a & b ^ a & c ^ b & c;
        const t2 = s0 + maj | 0;
        hh = g;
        g = f;
        f = e;
        e = d + t1 | 0;
        d = c;
        c = b;
        b = a;
        a = t1 + t2 | 0;
      }
      h[0] = h[0] + a | 0;
      h[1] = h[1] + b | 0;
      h[2] = h[2] + c | 0;
      h[3] = h[3] + d | 0;
      h[4] = h[4] + e | 0;
      h[5] = h[5] + f | 0;
      h[6] = h[6] + g | 0;
      h[7] = h[7] + hh | 0;
    }
    const out = new Uint8Array(32);
    const outView = new DataView(out.buffer);
    for (let i = 0; i < 8; i++) outView.setUint32(i * 4, h[i]);
    return out;
  }
  function sha256Text(text) {
    return toBase64(sha256(utf8Encode(text)));
  }
  function toHex(bytes) {
    let out = "";
    for (let i = 0; i < bytes.length; i++) out += bytes[i].toString(16).padStart(2, "0");
    return out;
  }

  // portkit/src/secrets.ts
  var Draw = class {
    constructor(seed) {
      __publicField(this, "seed");
      this.seed = seed;
    }
    /** An integer in [0, maxExclusive). `index` picks which of the draw's numbers: die 0, die 1, ... */
    Int(maxExclusive, index = 0) {
      const h = sha256(utf8Encode(`${this.seed}
${index}`));
      const n2 = h[0] * 2 ** 40 + h[1] * 2 ** 32 + h[2] * 2 ** 24 + h[3] * 2 ** 16 + h[4] * 2 ** 8 + h[5];
      return n2 % Math.max(1, Math.floor(maxExclusive));
    }
    Ints(count, maxExclusive) {
      const out = [];
      for (let i = 0; i < count; i++) out.push(this.Int(maxExclusive, i));
      return out;
    }
    /** In [0, 1). */
    Float(index = 0) {
      return this.Int(2 ** 32, index) / 2 ** 32;
    }
    toString() {
      return this.seed;
    }
  };
  var DRAW_KEEP_MS = 12e4;
  var CARRY_HOLD_MS = 500;
  var ANSWERED_MAX = 1024;
  function parseDrawEntry(e) {
    if (!Array.isArray(e) || typeof e[0] !== "string" || typeof e[1] !== "string" || typeof e[2] !== "string") return null;
    return [e[0], e[1], e[2], typeof e[3] === "number" ? e[3] : 0, e[4] === 1 ? 1 : 0, typeof e[5] === "string" ? e[5] : "", typeof e[6] === "string" ? e[6] : "", typeof e[7] === "string" ? e[7] : ""];
  }
  var CURVE = { name: "ECDH", namedCurve: "P-256" };
  function parseDeal(raw) {
    if (!isRecord(raw) || typeof raw.l !== "string" || typeof raw.h !== "string" || !Array.isArray(raw.s)) return null;
    return { l: raw.l, h: raw.h, s: raw.s.filter((x) => typeof x === "string"), p: raw.p === 1 ? 1 : 0, r: typeof raw.r === "string" ? raw.r : void 0 };
  }
  function parseContribution(raw) {
    if (!isRecord(raw) || typeof raw.l !== "string" || typeof raw.h !== "string") return null;
    return { l: raw.l, h: raw.h, c: typeof raw.c === "string" ? raw.c : void 0 };
  }
  var Secrets = class {
    constructor(core, presence, referee, nowSeconds) {
      __publicField(this, "core");
      __publicField(this, "presence");
      __publicField(this, "referee");
      __publicField(this, "crypto");
      __publicField(this, "nowSeconds");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      __publicField(this, "privateKey", null);
      __publicField(this, "publicKeyText", "");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      __publicField(this, "derived", /* @__PURE__ */ new Map());
      __publicField(this, "mySecret", null);
      __publicField(this, "lastStates", /* @__PURE__ */ new Map());
      /** The referee's numbers and judgements, read from the referee's own user state. */
      __publicField(this, "numbers");
      /** Per `<uid>\n<label>`: the hash and number first seen, and whether the entry checked out when it appeared. */
      __publicField(this, "pins", /* @__PURE__ */ new Map());
      /** Witness answers seen this epoch: `<witness sid>\n<drawer uid>\n<label>\n<hash>` -> number (the first one stays). */
      __publicField(this, "answers", /* @__PURE__ */ new Map());
      /** The first commitment seen per `<uid>\n<label>` this epoch (a referee may not re-commit after its witness answered). */
      __publicField(this, "firstCommit", /* @__PURE__ */ new Map());
      /** Entries already in the first table this client read this epoch: numbered before it was here, so taken as found. */
      __publicField(this, "baseline", null);
      __publicField(this, "pinsEpoch", -1);
      __publicField(this, "warnedPins", /* @__PURE__ */ new Set());
      __publicField(this, "goneSince", /* @__PURE__ */ new Map());
      /** Witness only: the commitment answered per `<epoch>\n<referee uid>\n<label>`. */
      __publicField(this, "witnessed", /* @__PURE__ */ new Map());
      /** Referee only: the first entry answered per `<uid>\n<label>` in `answeredEpoch` (see officiate). */
      __publicField(this, "answered", /* @__PURE__ */ new Map());
      __publicField(this, "answeredEpoch", -1);
      __publicField(this, "drawStore", null);
      __publicField(this, "drawKey", "");
      __publicField(this, "restoring", null);
      /** The draw the restore brought back, until the game's first beginDraw (which keeps it under the same label). */
      __publicField(this, "restored", null);
      /** The referee's own seed for its current deal. */
      __publicField(this, "dealSeed", null);
      /** This player's contribution to a deal. */
      __publicField(this, "myContribution", null);
      /** Commitments and contributions as first seen, per deal label and session (they outlive a player's visit). */
      __publicField(this, "dealSeen", /* @__PURE__ */ new Map());
      /** Told when a player's draw changes state. */
      __publicField(this, "onDrawChanged", () => {
      });
      __publicField(this, "carryHoldUntil", -Infinity);
      __publicField(this, "warnedDeals", /* @__PURE__ */ new Set());
      this.core = core;
      this.presence = presence;
      this.referee = referee;
      this.crypto = core.platform.crypto;
      this.nowSeconds = nowSeconds;
      this.numbers = new RefereeTable(presence, referee, "fn", parseDrawEntry);
    }
    /** Starts following commitments, the referee's numbers and reveals. */
    listen() {
      this.presence.onExtra(() => this.review());
      this.presence.on(() => this.review());
      this.referee.on(() => this.review());
    }
    /** `n` bytes from the strong generator (WebCrypto; seeded in the fake room). */
    RandomBytes(n2) {
      return this.crypto.getRandomValues(new Uint8Array(Math.max(0, Math.floor(n2))));
    }
    // ---- commit / reveal ----------------------------------------------------------------------------------------
    commit(value) {
      const nonce = toBase64(this.crypto.getRandomValues(new Uint8Array(16)));
      const opening = { v: encodeValue(value), s: nonce };
      const hash = hashOpening(opening);
      return { hash, reveal: () => ({ v: opening.v, s: opening.s }) };
    }
    /** True when `opening` is what `hash` committed to. */
    verify(hash, opening) {
      if (!opening || typeof opening.s !== "string" || typeof hash !== "string") return false;
      return hashOpening(opening) === hash;
    }
    /** The value inside an opening, with value types rebuilt. Check it with `verify` first. */
    valueOf(opening) {
      return decodeValue(opening.v);
    }
    /** Publishes one of the local player's commitments under `label`, in their own user state. */
    publish(label, hash) {
      const all = { ...this.own("c") };
      all[label] = hash;
      this.presence.setExtra("c", all);
    }
    /** Takes a published commitment back (when its round is over). */
    retract(label) {
      const all = { ...this.own("c") };
      delete all[label];
      this.presence.setExtra("c", Object.keys(all).length ? all : void 0);
    }
    /** The commitment a participant published under `label`, or null. Only that player can have written it. */
    published(sid, label) {
      const all = this.presence.extra(sid, "c");
      return isRecord(all) && typeof all[label] === "string" ? all[label] : null;
    }
    own(name) {
      const value = this.presence.extra(this.core.me.sid, name);
      return isRecord(value) ? value : {};
    }
    // ---- fair draws ---------------------------------------------------------------------------------------------
    //
    // Where each part lives, so that nobody can change another player's part:
    //   x.fd  [label, hash]          the player's commitment, in the player's own user state
    //   x.fr  [label, secret]        the player's reveal, in the player's own user state
    //   x.fn  {e, m: {sid: entry}}   the referee's numbers and judgements, in the referee's own user state
    //                                (refrecord.ts); entry = [label, hash, number, deadline, forfeit, uid]
    //   x.fw  [drawer uid, label, hash, number]   a witness's answer to the referee's own commitment, in the witness's
    //                                user state: the referee never supplies the number of its own draw (it knows its secret,
    //                                and could search secrets or numbers until it liked the outcome)
    // Each client also keeps the first hash and number it saw for a player's label in this epoch (`pins`): a later
    // table that changes them (a referee seat taken over by a modified client) is not believed. An entry that appears
    // while this client is here is checked when it appears: numbered by the referee publishing it ("r", for another
    // player), or by that player's witness ("w": the number is the witness's published answer to the first commitment
    // seen), or "s" (solo: believed only while nobody else takes part). Entries already there when this client first read
    // the table were numbered before it came, and are taken as found.
    /** Starts a draw for the local player under `label` (a round name). It replaces their previous draw. */
    beginDraw(label) {
      const pending = this.restoring && this.restoring.l === label ? this.restoring : null;
      const restored = !pending && this.restored && this.restored.l === label && this.mySecret?.label === label ? this.restored : null;
      const saved = pending ?? restored;
      this.restored = null;
      const secret = saved ? saved.s : toBase64(this.crypto.getRandomValues(new Uint8Array(16)));
      this.mySecret = { label, secret };
      this.restoring = null;
      this.saveDraw(!!saved && saved.r === 1);
      this.presence.setExtra("fr", saved && saved.r === 1 ? [label, secret] : void 0);
      this.presence.setExtra("fd", [label, sha256Text(secret)]);
      if (pending) this.core.log("info", `the draw '${label}' came back after a reload`);
    }
    /**
     * True while a draw this device saved before a page reload may still come back (under `label`, or any label
     * when none is given): the restore waits for the referee's table. `beginDraw` with the same label takes it over.
     */
    hasSavedDraw(label) {
      return !!this.restoring && (label === void 0 || this.restoring.l === label);
    }
    /** Publishes the local player's secret for `label`, so everyone can compute and check the draw. */
    revealDraw(label) {
      if (!this.mySecret || this.mySecret.label !== label) return;
      this.saveDraw(true);
      this.presence.setExtra("fr", [label, this.mySecret.secret]);
    }
    /** The referee starts the clock: draws under `label` not revealed within `seconds` are forfeit. */
    demandReveal(label, seconds) {
      if (!this.referee.isMe()) return;
      const table = this.numbers.working();
      const deadline = this.nowSeconds() + seconds;
      let changed = false;
      for (const sid of Object.keys(table)) {
        const entry = table[sid];
        if (entry[0] === label && entry[3] === 0 && entry[4] === 0) {
          entry[3] = deadline;
          changed = true;
        }
      }
      if (changed) this.numbers.write(table);
    }
    /** Where a participant's draw under `label` stands, and the draw itself once this client may know it. */
    drawOf(sid, label) {
      const checked = this.entryOf(sid);
      const committed = this.presence.extra(sid, "fd");
      const hasCommit = Array.isArray(committed) && committed[0] === label && typeof committed[1] === "string";
      if (!checked || checked.entry[0] !== label) return { state: hasCommit ? "committed" : "none", draw: null };
      if (checked.verdict === "bad") return { state: "rejected", draw: null };
      if (checked.verdict === "pending") return { state: "committed", draw: null };
      const entry = checked.entry;
      const [, hash, number, , forfeit] = entry;
      if (hasCommit && committed[1] !== hash) return { state: "rejected", draw: null };
      const revealed = this.presence.extra(sid, "fr");
      if (Array.isArray(revealed) && revealed[0] === label && typeof revealed[1] === "string") {
        if (sha256Text(revealed[1]) !== hash) return { state: "rejected", draw: null };
        if (forfeit) return { state: "forfeit", draw: null };
        return { state: "revealed", draw: new Draw(drawSeed(revealed[1], number, label)) };
      }
      if (forfeit) return { state: "forfeit", draw: null };
      if (sid === this.core.me.sid && this.mySecret && this.mySecret.label === label && sha256Text(this.mySecret.secret) === hash) {
        return { state: "numbered", draw: new Draw(drawSeed(this.mySecret.secret, number, label)) };
      }
      return { state: "numbered", draw: null };
    }
    /** The local player's own draw under `label`, as soon as the referee's number is in. */
    myDraw(label) {
      return this.drawOf(this.core.me.sid, label).draw;
    }
    /** A participant's entry in the referee's table, with the hash and number this client saw first, and whether it checks out. */
    entryOf(sid) {
      const table = this.numbers.read();
      this.newEpoch(table);
      this.collect();
      const entry = table[sid];
      if (!entry) return null;
      if (this.baseline === null) return { entry, verdict: "pending" };
      const key = `${entry[5]}
${entry[0]}`;
      let pin = this.pins.get(key);
      if (!pin) {
        const publisher = this.referee.current()?.sid ?? "";
        pin = { h: entry[1], n: entry[2], verdict: "pending", live: !(this.baseline?.has(key) ?? false), publisher };
        this.pins.set(key, pin);
      }
      if (pin.h !== entry[1] || pin.n !== entry[2]) {
        if (!this.warnedPins.has(key)) {
          this.warnedPins.add(key);
          this.core.log("warn", `the referee's table changed the pinned commitment or number of a draw (${entry[0]}); keeping the first one seen`);
        }
      }
      const kept = [entry[0], pin.h, pin.n, entry[3], entry[4], entry[5], entry[6], entry[7]];
      if (pin.verdict !== "ok" && pin.verdict !== "bad") {
        pin.verdict = this.judge(sid, kept, pin.live, pin.publisher);
        if (pin.verdict === "bad") this.core.log("warn", `a draw (${entry[0]}) whose number its own player could have chosen is not believed (${kept[7] || "?"} by ${kept[6] || "?"})`);
      }
      const verdict = kept[7] === "s" && pin.verdict === "ok" && this.presence.list().length > 1 ? "bad" : pin.verdict;
      if (verdict === "bad" && pin.verdict === "ok" && !this.warnedPins.has("solo:" + key)) {
        this.warnedPins.add("solo:" + key);
        this.core.log("warn", `a draw (${entry[0]}) whose number its own player could have chosen is not believed (solo, while others take part)`);
      }
      return { entry: kept, verdict };
    }
    /** Clears what this client keeps per epoch, and takes the first table it reads as the baseline. */
    newEpoch(table) {
      const epoch = this.referee.epoch;
      if (this.pinsEpoch !== epoch) {
        this.pins.clear();
        this.answers.clear();
        this.firstCommit.clear();
        this.baseline = null;
        this.pinsEpoch = epoch;
      }
      if (this.baseline === null && epoch !== 0) {
        const ref = this.referee.current();
        if (!ref) return;
        if (!this.numbers.published()) return;
        this.baseline = new Set(Object.keys(table).map((sid) => `${table[sid][5]}
${table[sid][0]}`));
      }
    }
    /** Records every witness answer and first commitment in view (they outlive their writer's visit in this memory). */
    collect() {
      for (const who of this.presence.list()) {
        const fw = this.presence.extra(who.sid, "fw");
        if (Array.isArray(fw) && fw.length >= 4 && fw.slice(0, 4).every((x) => typeof x === "string")) {
          const key = `${who.sid}
${fw[0]}
${fw[1]}
${fw[2]}`;
          if (!this.answers.has(key)) this.answers.set(key, fw[3]);
        }
        const fd = this.presence.extra(who.sid, "fd");
        if (Array.isArray(fd) && typeof fd[0] === "string" && typeof fd[1] === "string") {
          const key = `${who.uid}
${fd[0]}`;
          if (!this.firstCommit.has(key)) this.firstCommit.set(key, fd[1]);
        }
      }
    }
    /** Whether an entry that appeared while this client was here was numbered by somebody other than its own player. */
    judge(sid, entry, live, publisher) {
      if (!live) return "ok";
      const [label, hash, number, , , uid, by, how] = entry;
      if (how === "r") return by !== "" && by === publisher && by !== sid ? "ok" : "bad";
      if (how === "s") return "ok";
      if (how === "w") {
        if (by === "" || by === sid || by === publisher) return "bad";
        const first = this.firstCommit.get(`${uid}
${label}`);
        if (first !== void 0 && first !== hash) return "bad";
        const answer = this.answers.get(`${by}
${uid}
${label}
${hash}`);
        if (answer !== void 0) return answer === number ? "ok" : "bad";
        return this.presence.has(by) ? "pending" : "bad";
      }
      return "bad";
    }
    /**
     * The witness's part: the lowest-ranked participant other than the referee answers the referee's commitment with a
     * number of its own, once per label (a referee that re-commits after seeing the answer gets no second one).
     */
    witness() {
      const ref = this.referee.current();
      const me = this.core.me;
      if (!ref || ref.sid === me.sid) return;
      const others = this.presence.list().filter((p) => p.sid !== ref.sid);
      if (!others.length || others[0].sid !== me.sid) return;
      const fd = this.presence.extra(ref.sid, "fd");
      if (!Array.isArray(fd) || typeof fd[0] !== "string" || typeof fd[1] !== "string") return;
      const key = `${this.referee.epoch}
${ref.uid}
${fd[0]}`;
      const first = this.witnessed.get(key);
      if (first !== void 0) return;
      const entry = this.numbers.read()[ref.sid];
      if (entry && entry[0] === fd[0] && entry[5] === ref.uid) return;
      this.witnessed.set(key, fd[1]);
      while (this.witnessed.size > ANSWERED_MAX) this.witnessed.delete(this.witnessed.keys().next().value);
      this.presence.setExtra("fw", [ref.uid, fd[0], fd[1], toBase64(this.crypto.getRandomValues(new Uint8Array(16)))]);
    }
    /** Looks at every participant's draw: the referee answers and judges, and everyone reports changes. */
    review() {
      if (this.core.disposed) return;
      this.reviewDeal();
      this.restoreDraw();
      this.witness();
      if (this.referee.isMe()) this.officiate();
      for (const who of this.presence.list()) {
        const committed = this.presence.extra(who.sid, "fd");
        const checked = this.entryOf(who.sid);
        const label = checked ? checked.entry[0] : Array.isArray(committed) && typeof committed[0] === "string" ? committed[0] : null;
        if (label === null) continue;
        const status = this.drawOf(who.sid, label);
        const mark = `${label}
${status.state}`;
        if (this.lastStates.get(who.sid) === mark) continue;
        this.lastStates.set(who.sid, mark);
        this.core.guard("draw handler", () => this.onDrawChanged(who.sid, label, status));
      }
    }
    /**
     * The referee publishes the number table it carries, if it has not this term. The runtime does this by itself as
     * soon as a referee's term starts (a game need not call it; it is harmless to): a page that starts in between reads
     * the whole table, so its saved draw comes back and what was numbered before it came is taken as found.
     */
    publishDrawTable() {
      if (this.core.disposed || !this.referee.isMe()) return;
      if (!this.numbers.ensurePublished()) return;
      this.carryHoldUntil = this.core.platform.clock.now() + CARRY_HOLD_MS;
      this.core.scheduler.after(CARRY_HOLD_MS + 1, () => this.review());
    }
    officiate() {
      this.publishDrawTable();
      if (this.core.platform.clock.now() < this.carryHoldUntil) return;
      const table = this.numbers.working();
      let changed = false;
      const now = this.nowSeconds();
      const clock = this.core.platform.clock.now();
      for (const sid of Object.keys(table)) {
        if (this.presence.has(sid)) {
          this.goneSince.delete(sid);
          continue;
        }
        const since = this.goneSince.get(sid) ?? clock;
        this.goneSince.set(sid, since);
        if (clock - since >= DRAW_KEEP_MS) {
          delete table[sid];
          this.goneSince.delete(sid);
          changed = true;
        }
      }
      if (this.answeredEpoch !== this.referee.epoch) {
        this.answered.clear();
        this.answeredEpoch = this.referee.epoch;
      }
      for (const sid of Object.keys(table)) this.remember(table[sid]);
      for (const who of this.presence.list()) {
        const committed = this.presence.extra(who.sid, "fd");
        const entry = table[who.sid];
        if (Array.isArray(committed) && typeof committed[0] === "string" && typeof committed[1] === "string") {
          if (!entry || entry[0] !== committed[0]) {
            const label = committed[0];
            const holders = Object.keys(table).filter((sid) => sid !== who.sid && table[sid][5] === who.uid && table[sid][0] === label);
            const departed = holders.find((sid) => !this.presence.has(sid) && table[sid][1] === committed[1]) ?? holders.find((sid) => !this.presence.has(sid));
            const holder = departed ?? holders[0];
            const first = holder !== void 0 ? table[holder] : this.answered.get(`${who.uid}
${label}`);
            if (first) {
              table[who.sid] = [label, first[1], first[2], first[3], first[4], who.uid, first[6], first[7]];
              if (departed !== void 0) {
                delete table[departed];
                this.goneSince.delete(departed);
              }
              if (first[1] !== committed[1]) {
                this.core.log("warn", `a new session of a player committed a different secret for the draw '${label}' they already hold (a re-roll by reloading?): refused, the first commitment stands`);
              }
            } else if (who.sid !== this.core.me.sid) {
              table[who.sid] = [label, committed[1], toBase64(this.crypto.getRandomValues(new Uint8Array(16))), 0, 0, who.uid, this.core.me.sid, "r"];
              this.remember(table[who.sid]);
            } else {
              const others = this.presence.list().filter((p) => p.sid !== who.sid);
              const answer = others.map((p) => ({ sid: p.sid, fw: this.presence.extra(p.sid, "fw") })).find((a) => Array.isArray(a.fw) && a.fw[0] === who.uid && a.fw[1] === label && a.fw[2] === committed[1] && typeof a.fw[3] === "string");
              if (answer) table[who.sid] = [label, committed[1], answer.fw[3], 0, 0, who.uid, answer.sid, "w"];
              else if (!others.length) table[who.sid] = [label, committed[1], toBase64(this.crypto.getRandomValues(new Uint8Array(16))), 0, 0, who.uid, who.sid, "s"];
              else continue;
              this.remember(table[who.sid]);
            }
            changed = true;
            continue;
          }
        }
        if (entry && entry[3] > 0 && entry[4] === 0 && now >= entry[3]) {
          const revealed = this.presence.extra(who.sid, "fr");
          const ok = Array.isArray(revealed) && revealed[0] === entry[0] && typeof revealed[1] === "string" && sha256Text(revealed[1]) === entry[1];
          if (!ok) {
            entry[4] = 1;
            changed = true;
          }
        }
      }
      if (changed) this.numbers.write(table);
    }
    /** The referee keeps the first entry it answered per user and label for the epoch (bounded). */
    remember(entry) {
      const key = `${entry[5]}
${entry[0]}`;
      if (this.answered.has(key)) return;
      this.answered.set(key, [entry[0], entry[1], entry[2], 0, 0, entry[5], entry[6], entry[7]]);
      while (this.answered.size > ANSWERED_MAX) this.answered.delete(this.answered.keys().next().value);
    }
    saveDraw(revealed) {
      if (!this.drawStore || !this.mySecret) return;
      try {
        this.drawStore.set(this.drawKey, JSON.stringify({ e: this.referee.epoch, l: this.mySecret.label, s: this.mySecret.secret, r: revealed ? 1 : 0 }));
      } catch {
      }
    }
    /**
     * After a page reload: the secret this device saved comes back once the referee's table (as last mirrored)
     * still holds this user's entry for it; the commitment (and the reveal, if it was made) is published again and
     * the referee moves the entry to the new session.
     */
    restoreDraw() {
      const saved = this.restoring;
      if (!saved || this.mySecret) return;
      const epoch = this.referee.epoch;
      if (epoch === 0) return;
      if (saved.e !== 0 && saved.e !== epoch) {
        this.restoring = null;
        return;
      }
      const hash = sha256Text(saved.s);
      const table = this.numbers.read();
      const mine = Object.keys(table).map((sid) => table[sid]).filter((e) => e[5] === this.core.me.uid);
      if (mine.some((e) => e[0] === saved.l && e[1] === hash)) {
        this.restoring = null;
        this.restored = saved;
        this.mySecret = { label: saved.l, secret: saved.s };
        this.presence.setExtra("fd", [saved.l, hash]);
        if (saved.r) this.presence.setExtra("fr", [saved.l, saved.s]);
        this.core.log("info", `the draw '${saved.l}' came back after a reload`);
      } else if (mine.length) {
        this.restoring = null;
      }
    }
    // ---- dealt draws ---------------------------------------------------------------------------------------------
    //
    //   referee x.dl  {l: label, h: SHA-256(seed), s: [listed session ids], p: 0 committing | 1 revealing, r?: seed}
    //   player  x.dc  {l: label, h: SHA-256(contribution), c?: contribution}
    // The runtime answers for every listed player by itself (review), so game code only calls beginDeal, dealDraw,
    // revealDeal on the referee and verifyDeal anywhere.
    /** The referee starts a deal under `label` for the players with these session ids. Replaces its previous deal. */
    beginDeal(label, sids) {
      if (!this.referee.isMe()) return;
      if (!sids.some((sid) => sid !== this.core.me.sid)) {
        this.core.log("warn", `beginDeal('${label}') lists no player but the referee: the deal is the referee's own choice, not a fair one`);
      }
      const seed = toBase64(this.crypto.getRandomValues(new Uint8Array(16)));
      this.dealSeed = { label, seed };
      this.presence.setExtra("dl", { l: label, h: sha256Text(seed), s: sids.slice(), p: 0 });
      this.review();
    }
    /** Where the current referee's deal under `label` stands. */
    dealState(label) {
      const deal = this.currentDeal();
      if (!deal || deal.l !== label) return "none";
      const seen = this.dealSeen.get(label);
      if (deal.r !== void 0) return seen && sha256Text(deal.r) === seen.h ? "revealed" : "invalid";
      if (deal.p === 0) return "committing";
      return Array.isArray(this.contributions(deal)) ? "ready" : "revealing";
    }
    /**
     * The referee's deal, once every listed player still present has revealed a contribution (a listed player who
     * left counts as absent: say so in the game if it matters). Null before that, and on any other client.
     */
    dealDraw(label) {
      const deal = this.currentDeal();
      if (!this.referee.isMe() || !deal || deal.l !== label || !this.dealSeed || this.dealSeed.label !== label) return null;
      const parts = this.contributions(deal);
      return Array.isArray(parts) ? new Draw(dealSeedOf(this.dealSeed.seed, label, parts)) : null;
    }
    /** The referee publishes its seed (after the hand), so that everyone can check the deal. */
    revealDeal(label) {
      const deal = this.currentDeal();
      if (!this.referee.isMe() || !deal || deal.l !== label || !this.dealSeed || this.dealSeed.label !== label) return;
      this.presence.setExtra("dl", { ...deal, r: this.dealSeed.seed });
    }
    /** The session ids the current referee listed as contributors to the deal under `label`, or null (no such deal). */
    dealContributors(label) {
      const deal = this.currentDeal();
      return deal && deal.l === label ? deal.s.slice() : null;
    }
    /**
     * After revealDeal: the deal, recomputed here from the referee's seed and the contributions this client saw; null if it
     * does not check out, or cannot be checked here (`checkDeal` says which). A deal with no contributor but the referee is
     * never fair (the referee could have searched seeds before committing): null, and a warning. With `expected` (the
     * session ids the game says must contribute: the seated players), the referee's list must be exactly those, or the deal
     * is null too (a referee that leaves players out of the list, or lists only accomplices). A page that did not see the
     * contribution of a listed player who has since left gets null ("unknown"), never a deal computed without that part.
     */
    verifyDeal(label, expected) {
      return this.checkDeal(label, expected).draw;
    }
    /** As verifyDeal, saying why: "ok" (with the draw), "pending", "solo", "unknown" or "failed" (see DealCheck). */
    checkDeal(label, expected) {
      const deal = this.currentDeal();
      if (!deal || deal.l !== label || deal.r === void 0) return { state: "pending", draw: null, why: "no revealed deal under that label" };
      const ref = this.referee.current();
      if (!deal.s.some((sid) => sid !== ref?.sid)) {
        this.warnDeal(label, "lists no contributor but the referee: its outcome was the referee's own choice");
        return { state: "solo", draw: null, why: "no contributor but the referee: it cannot be checked" };
      }
      if (expected) {
        const want = [...new Set(expected)].sort();
        const listed = [...new Set(deal.s)].sort();
        if (want.length !== listed.length || want.some((sid, i) => sid !== listed[i])) {
          this.warnDeal(label, `lists ${listed.length} contributors, not the ${want.length} the game expects`);
          return { state: "failed", draw: null, why: "the contributors are not the ones expected" };
        }
      }
      const seen = this.dealSeen.get(label);
      if (!seen || seen.withSeed) return { state: "unknown", draw: null, why: "this page first saw the deal with its seed already revealed" };
      if (sha256Text(deal.r) !== seen.h) return { state: "failed", draw: null, why: "the revealed seed is not the committed one" };
      const parts = this.contributions(deal);
      if (parts === "unknown") return { state: "unknown", draw: null, why: "a contributor left before this page saw its part" };
      if (parts === "wait") return { state: "pending", draw: null, why: "a contribution is still missing" };
      return { state: "ok", draw: new Draw(dealSeedOf(deal.r, label, parts)), why: "" };
    }
    warnDeal(label, why) {
      if (this.warnedDeals.has(label)) return;
      this.warnedDeals.add(label);
      this.core.log("warn", `the deal '${label}' ${why}`);
    }
    currentDeal() {
      const ref = this.referee.current();
      return ref ? parseDeal(this.presence.extra(ref.sid, "dl")) : null;
    }
    /**
     * Every listed contribution, revealed and matching its commitment ("-" for a listed player who left without revealing
     * one); "wait" while one may still come; "unknown" when a listed player has left and this page cannot tell whether
     * they revealed (it never saw them while following the deal, and did not follow it from its start).
     */
    contributions(deal) {
      const seen = this.dealSeen.get(deal.l);
      if (!seen) return "wait";
      const out = [];
      for (const sid of deal.s) {
        const part = seen.parts.get(sid);
        if (part && part.c !== void 0) out.push(part.c);
        else if (this.presence.has(sid)) return "wait";
        else if (!seen.watched.has(sid) && !seen.fromStart) return "unknown";
        else if (!part || deal.p === 1) out.push("-");
        else return "wait";
      }
      return out;
    }
    /** Follows the deal: records what is first seen, answers for the local player, and moves the referee's phase on. */
    reviewDeal() {
      const ref = this.referee.current();
      const deal = this.currentDeal();
      if (!ref || !deal) return;
      let seen = this.dealSeen.get(deal.l);
      if (!seen || seen.refSid !== ref.sid) {
        seen = { h: deal.h, refSid: ref.sid, parts: /* @__PURE__ */ new Map(), fromStart: deal.p === 0 && deal.r === void 0, withSeed: deal.r !== void 0, watched: /* @__PURE__ */ new Set() };
        this.dealSeen.set(deal.l, seen);
        while (this.dealSeen.size > 8) this.dealSeen.delete(this.dealSeen.keys().next().value);
      }
      for (const sid of deal.s) {
        if (this.presence.has(sid)) seen.watched.add(sid);
        const part = parseContribution(this.presence.extra(sid, "dc"));
        if (!part || part.l !== deal.l) continue;
        const known = seen.parts.get(sid);
        if (!known) seen.parts.set(sid, { h: part.h });
        const entry = seen.parts.get(sid);
        if (part.c !== void 0 && entry.c === void 0 && entry.h === part.h && sha256Text(part.c) === entry.h) entry.c = part.c;
      }
      const me = this.core.me.sid;
      if (deal.s.includes(me)) {
        if (!this.myContribution || this.myContribution.label !== deal.l) {
          this.myContribution = { label: deal.l, c: toBase64(this.crypto.getRandomValues(new Uint8Array(16))) };
          this.presence.setExtra("dc", { l: deal.l, h: sha256Text(this.myContribution.c) });
        } else if (deal.p === 1) {
          const mine = parseContribution(this.presence.extra(me, "dc"));
          if (mine && mine.c === void 0) this.presence.setExtra("dc", { ...mine, c: this.myContribution.c });
        }
      }
      if (this.referee.isMe() && deal.p === 0 && this.dealSeed && this.dealSeed.label === deal.l) {
        const all = deal.s.every((sid) => seen.parts.has(sid) || !this.presence.has(sid));
        if (all) this.presence.setExtra("dl", { ...deal, p: 1 });
      }
    }
    // ---- seal / open --------------------------------------------------------------------------------------------
    /** The local public key (raw point, base64url). Empty before `init`. */
    get publicKey() {
      return this.publicKeyText;
    }
    /**
     * Makes the local key pair, or loads the one this device saved for this player and instance, so that a page
     * reload can still open what was sealed before it.
     */
    async init(store, storeKey, drawKey = "") {
      const subtle = this.crypto.subtle;
      if (store && drawKey) {
        this.drawStore = store;
        this.drawKey = drawKey;
        try {
          const saved = safeParse(store.get(drawKey));
          if (isRecord(saved) && typeof saved.l === "string" && typeof saved.s === "string") {
            this.restoring = { e: typeof saved.e === "number" ? saved.e : 0, l: saved.l, s: saved.s, r: saved.r === 1 ? 1 : 0 };
          }
        } catch {
        }
      }
      if (store) {
        try {
          const saved = safeParse(store.get(storeKey));
          if (isRecord(saved) && isRecord(saved.d) && typeof saved.p === "string") {
            this.privateKey = await subtle.importKey("jwk", saved.d, CURVE, false, ["deriveKey"]);
            this.publicKeyText = saved.p;
            return this.publicKeyText;
          }
        } catch {
        }
      }
      const pair = await subtle.generateKey(CURVE, true, ["deriveKey"]);
      this.privateKey = pair.privateKey;
      this.publicKeyText = toBase64(new Uint8Array(await subtle.exportKey("raw", pair.publicKey)));
      if (store) {
        try {
          store.set(storeKey, JSON.stringify({ p: this.publicKeyText, d: await subtle.exportKey("jwk", pair.privateKey) }));
        } catch {
        }
      }
      return this.publicKeyText;
    }
    /** True once the player's public key is known, so `seal` for them can work. */
    canSealFor(sid) {
      return !!this.presence.get(sid)?.publicKey;
    }
    /**
     * Encrypts `value` for one participant. The result is text that can go anywhere (a synced field, a network
     * event): only that player's key opens it.
     */
    async seal(forSid, value) {
      if (!this.privateKey) throw new Error("secrets are not ready");
      const target = this.presence.get(forSid);
      if (!target || !target.publicKey) throw new Error(`no public key known for player session ${forSid}`);
      const key = await this.sharedKey(target.publicKey);
      const iv = this.crypto.getRandomValues(new Uint8Array(12));
      const me = this.core.me;
      const aad = utf8Encode(`${this.core.prefix}
${me.sid}
${forSid}`);
      const plain = utf8Encode(canonicalJson(encodeValue(value)));
      const cipher = new Uint8Array(await this.crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: aad }, key, plain));
      return JSON.stringify({ f: me.sid, t: forSid, u: target.uid, p: this.publicKeyText, i: toBase64(iv), c: toBase64(cipher) });
    }
    /**
     * Opens a box sealed for the local player. Throws when it is for someone else, was changed on the way, or
     * claims a sender whose announced key is not the one it was sealed with.
     */
    async open(box) {
      if (!this.privateKey) throw new Error("secrets are not ready");
      const b = safeParse(box);
      if (!isRecord(b) || typeof b.f !== "string" || typeof b.t !== "string" || typeof b.p !== "string" || typeof b.i !== "string" || typeof b.c !== "string") {
        throw new Error("not a sealed box");
      }
      const me = this.core.me;
      if (b.t !== me.sid && b.u !== me.uid) throw new Error("this box is sealed for another player");
      const senderKey = this.presence.keyOf(b.f);
      if (senderKey !== b.p) throw new Error("the box does not come from the player it names");
      const key = await this.sharedKey(b.p);
      const aad = utf8Encode(`${this.core.prefix}
${b.f}
${b.t}`);
      let plain;
      try {
        plain = await this.crypto.subtle.decrypt({ name: "AES-GCM", iv: fromBase64(b.i), additionalData: aad }, key, fromBase64(b.c));
      } catch {
        throw new Error("the box could not be opened (wrong key or changed contents)");
      }
      return decodeValue(JSON.parse(utf8Decode(new Uint8Array(plain))));
    }
    /**
     * Seals one value per participant into a single text, for one synced field that is rewritten as a whole.
     *
     * A box written for one player at a telling moment names its reader even though nobody else can open it. Here
     * every participant gets an entry every time, each padded to `slotBytes` before encryption, in session-id
     * order: the text has the same size and shape whoever it really concerns. `valueFor` returns undefined for a
     * participant who gets nothing; their entry is filled with padding.
     */
    async sealAll(valueFor, slotBytes = 256) {
      if (!this.privateKey) throw new Error("secrets are not ready");
      const me = this.core.me;
      const entries = {};
      const everyone = this.presence.list().map((p) => p.sid).sort();
      for (const sid of everyone) {
        const target = this.presence.get(sid);
        if (!target || !target.publicKey) continue;
        const value = valueFor(sid);
        const text = value === void 0 ? "{}" : canonicalJson({ v: encodeValue(value) });
        const bytes = utf8Encode(text);
        if (bytes.length > slotBytes) throw new Error(`sealAll: the value for one player needs ${bytes.length} bytes, more than the slot of ${slotBytes}`);
        const padded = new Uint8Array(slotBytes).fill(32);
        padded.set(bytes);
        const key = await this.sharedKey(target.publicKey);
        const iv = this.crypto.getRandomValues(new Uint8Array(12));
        const aad = utf8Encode(`${this.core.prefix}
${me.sid}
${sid}
all`);
        const cipher = new Uint8Array(await this.crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: aad }, key, padded));
        entries[sid] = [toBase64(iv), toBase64(cipher)];
      }
      return asciiJson({ f: me.sid, p: this.publicKeyText, n: slotBytes, m: entries });
    }
    /**
     * Opens the local player's entry of a `sealAll` text. Resolves null when the entry holds nothing for them,
     * or there is none (they arrived after it was written).
     */
    async openMine(bundle) {
      if (!this.privateKey) throw new Error("secrets are not ready");
      const b = safeParse(bundle);
      if (!isRecord(b) || typeof b.f !== "string" || typeof b.p !== "string" || !isRecord(b.m)) throw new Error("not a sealed bundle");
      const me = this.core.me;
      const entry = b.m[me.sid];
      if (!Array.isArray(entry) || typeof entry[0] !== "string" || typeof entry[1] !== "string") return null;
      if (this.presence.keyOf(b.f) !== b.p) throw new Error("the bundle does not come from the player it names");
      const key = await this.sharedKey(b.p);
      const aad = utf8Encode(`${this.core.prefix}
${b.f}
${me.sid}
all`);
      let plain;
      try {
        plain = await this.crypto.subtle.decrypt({ name: "AES-GCM", iv: fromBase64(entry[0]), additionalData: aad }, key, fromBase64(entry[1]));
      } catch {
        throw new Error("the entry could not be opened (wrong key or changed contents)");
      }
      const parsed = safeParse(utf8Decode(new Uint8Array(plain)).trimEnd());
      return isRecord(parsed) && "v" in parsed ? decodeValue(parsed.v) : null;
    }
    /**
     * Opens a box sealed for the local player and says who sealed it (a session id whose announced key the box was
     * sealed with). A game that takes a dealt value as authority checks that the sender is the referee.
     */
    async openWithSender(box) {
      const value = await this.open(box);
      return { value, from: String(safeParse(box).f) };
    }
    /** True when `box` names the local player as its reader. */
    isForMe(box) {
      const b = safeParse(box);
      return isRecord(b) && (b.t === this.core.me.sid || b.u === this.core.me.uid);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sharedKey(theirPublic) {
      let key = this.derived.get(theirPublic);
      if (!key) {
        const subtle = this.crypto.subtle;
        key = (async () => {
          const pub = await subtle.importKey("raw", fromBase64(theirPublic), CURVE, false, []);
          return subtle.deriveKey({ name: "ECDH", public: pub }, this.privateKey, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
        })();
        this.derived.set(theirPublic, key);
        key.catch(() => this.derived.delete(theirPublic));
      }
      return key;
    }
  };
  function hashOpening(opening) {
    return sha256Text(opening.s + "\n" + canonicalJson(opening.v));
  }
  function dealSeedOf(seed, label, parts) {
    return toHex(sha256(utf8Encode(`${seed}
${label}
${parts.join("\n")}`)));
  }
  function drawSeed(secret, number, label) {
    return toHex(sha256(utf8Encode(`${secret}
${number}
${label}`)));
  }

  // portkit/src/leaf.ts
  var LEAF_MARGIN = 96;
  var TOMBSTONE = "";
  function headKey(id) {
    return `v.${id}`;
  }
  function chunkKey(id, index) {
    return `c.${id}.${index}`;
  }
  function encodeLeaf(id, record2, maxLeafBytes, previousChunks) {
    const budget = Math.max(256, maxLeafBytes - LEAF_MARGIN);
    const whole = asciiJson({ e: record2.e, g: record2.g, n: record2.n, w: record2.w, d: record2.d });
    const bytes = jsonLeafBytes(whole);
    const writes = [];
    let chunks = 0;
    if (bytes <= budget) {
      writes.push([headKey(id), whole]);
    } else {
      const pieces = splitByLeafBytes(whole, budget - 32);
      chunks = pieces.length;
      for (let i = 0; i < pieces.length; i++) writes.push([chunkKey(id, i), `${record2.n}.${i}~${pieces[i]}`]);
      writes.push([headKey(id), asciiJson({ e: record2.e, g: record2.g, n: record2.n, w: record2.w, c: chunks })]);
    }
    for (let i = chunks; i < previousChunks; i++) writes.push([chunkKey(id, i), TOMBSTONE]);
    return { writes, chunks, bytes };
  }
  function splitByLeafBytes(text, budget) {
    const pieces = [];
    let start = 0;
    let size = 0;
    for (let i = 0; i < text.length; i++) {
      const add = leafCharBytes(text, i);
      const lowHalf = (text.charCodeAt(i) & 64512) === 56320;
      if (size + add > budget && i > start && !lowHalf) {
        pieces.push(text.slice(start, i));
        start = i;
        size = 0;
      }
      size += add;
    }
    if (start < text.length) pieces.push(text.slice(start));
    return pieces;
  }
  function decodeLeaf(id, get) {
    const head = get(headKey(id));
    if (head === void 0 || head === TOMBSTONE) return { kind: "none" };
    const parsed = safeParse(head);
    if (!isRecord(parsed) || !isCount(parsed.e) || !isCount(parsed.g) || !isCount(parsed.n) || typeof parsed.w !== "string") return { kind: "bad" };
    const e = parsed.e;
    const g = parsed.g;
    const n2 = parsed.n;
    const w = parsed.w;
    if (parsed.c === void 0) return { kind: "value", record: { e, g, n: n2, w, d: parsed.d }, chunks: 0 };
    if (!isCount(parsed.c) || parsed.c < 1 || parsed.c > 512) return { kind: "bad" };
    const chunks = parsed.c;
    let whole = "";
    for (let i = 0; i < chunks; i++) {
      const piece = get(chunkKey(id, i));
      const tag = `${n2}.${i}~`;
      if (piece === void 0 || !piece.startsWith(tag)) return { kind: "pending", e, g, n: n2, w, chunks };
      whole += piece.slice(tag.length);
    }
    const full = safeParse(whole);
    if (!isRecord(full) || full.e !== e || full.g !== g || full.n !== n2 || full.w !== w) return { kind: "bad" };
    return { kind: "value", record: { e, g, n: n2, w, d: full.d }, chunks };
  }
  function isCount(value) {
    return typeof value === "number" && Number.isInteger(value) && value >= 0;
  }
  function leafOwnerOf(key) {
    if (key.startsWith("v.")) return key.indexOf(".", 2) < 0 ? key.slice(2) : null;
    if (key.startsWith("c.")) {
      const end = key.indexOf(".", 2);
      return end > 2 ? key.slice(2, end) : null;
    }
    return null;
  }

  // portkit/src/sync.ts
  var Sync = class {
    constructor(core, presence, referee, players) {
      __publicField(this, "core");
      __publicField(this, "presence");
      __publicField(this, "referee");
      __publicField(this, "players");
      __publicField(this, "slots", /* @__PURE__ */ new Map());
      __publicField(this, "byBehaviour", /* @__PURE__ */ new Map());
      __publicField(this, "stats", { writes: 0, applied: 0, repairs: 0, claims: 0, lostRaces: 0, rejected: 0, reverted: 0 });
      /** False until behaviours have started: data applied before then is reported once, afterwards. */
      __publicField(this, "started", false);
      __publicField(this, "epochSeen", 0);
      __publicField(this, "warnedIdle", false);
      /** Told when the local player becomes or stops being the owner of a slot (to move its synced objects). */
      __publicField(this, "onLocalOwnership", () => {
      });
      this.core = core;
      this.presence = presence;
      this.referee = referee;
      this.players = players;
    }
    get me() {
      return this.core.me.sid;
    }
    /** Registers a behaviour. With `group`, it shares the leaf and the owner of every other behaviour of that group. */
    add(behaviour, id, fields, mode, callbacks, group) {
      const slotId = group ? `@${group}` : id;
      let slot = this.slots.get(slotId);
      if (!slot) {
        slot = {
          id: slotId,
          grouped: !!group,
          members: [],
          mode,
          snapshotOwed: false,
          mo: null,
          topG: 0,
          pending: null,
          applied: null,
          seenN: 0,
          lastValid: null,
          unconfirmed: null,
          dirty: false,
          chunks: 0,
          lastSent: null,
          lastContinuousAt: -Infinity,
          ownerView: null,
          warnedNotOwner: false,
          onApplied: null,
          ownN: 0,
          ownAt: 0,
          echoN: 0,
          claimAt: 0
        };
        this.slots.set(slotId, slot);
      } else if (mode === "continuous" || slot.mode === "none" && mode !== "none") slot.mode = mode;
      slot.members.push({ id, behaviour, fields, callbacks: callbacks && Object.keys(callbacks).length ? callbacks : void 0, lastPart: null, owed: false });
      this.byBehaviour.set(behaviour, slot);
      return slot;
    }
    slotOf(behaviour) {
      return this.byBehaviour.get(behaviour) ?? null;
    }
    /** Subscribes to the mirror and reads the owner records. Data is applied by `applySnapshot`, after Start. */
    attach() {
      this.core.onState((key) => this.onLeaf(key));
      this.presence.on(() => this.onPeopleChanged());
      this.presence.onExtra(() => this.onPeopleChanged());
      this.referee.on(() => this.onPeopleChanged());
      this.epochSeen = this.referee.epoch;
      for (const slot of this.slots.values()) {
        this.readOwner(slot);
        slot.ownerView = this.ownerSid(slot);
      }
    }
    /** Applies whatever counts in the mirror to every behaviour. Runs after Start, so stored data wins over it. */
    applySnapshot() {
      for (const slot of this.slots.values()) {
        this.markParts(slot);
        slot.snapshotOwed = decodeLeaf(slot.id, (key) => this.core.get(key)).kind === "pending";
        this.evaluate(slot, true);
      }
    }
    /** True when the mirror held a value for any behaviour when this client started. */
    hasData() {
      for (const slot of this.slots.values()) if (slot.applied !== null) return true;
      return false;
    }
    /** Marks the behaviours as started and calls OnDeserialization once on each that already has data. */
    begin() {
      this.started = true;
      for (const slot of this.slots.values()) {
        for (const member of slot.members) {
          if (!member.owed) continue;
          member.owed = false;
          this.core.guard(`${member.id}.OnDeserialization`, () => member.behaviour.OnDeserialization({ isSnapshot: true, isRollback: false }));
        }
      }
    }
    /** The slot a leaf key belongs to (`o.<slot>`, `v.<slot>`, `c.<slot>.<i>`), for reporting a refused write. */
    slotForKey(key) {
      const id = key.startsWith("o.") ? key.slice(2) : leafOwnerOf(key);
      return id === null ? null : this.slots.get(id) ?? null;
    }
    // ---- ownership ----------------------------------------------------------------------------------------------
    ownerSid(slot) {
      if (slot.pending) return slot.pending.sid;
      if (slot.mo && this.presence.has(slot.mo.s)) return slot.mo.s;
      return this.referee.current()?.sid ?? null;
    }
    owner(slot) {
      const sid = this.ownerSid(slot);
      return sid === null ? null : this.players.bySid(sid);
    }
    isOwner(slot, sid = this.me) {
      return this.ownerSid(slot) === sid;
    }
    setOwner(slot, sid, uid) {
      if (this.core.disposed) return;
      if (this.referee.epoch === 0) {
        if (!this.warnedIdle) {
          this.warnedIdle = true;
          this.core.log("warn", `${slot.id}: SetOwner ignored, the instance has no referee yet`);
        }
        return;
      }
      const recorded = slot.pending ? slot.pending.sid : slot.mo ? slot.mo.s : null;
      if (recorded === sid) return;
      const g = Math.max(slot.topG, slot.pending ? slot.pending.g : 0) + 1;
      const record2 = { e: this.referee.epoch, g, s: sid, u: uid };
      if (slot.pending) this.core.scheduler.cancel(slot.pending.timer);
      const timer = this.core.scheduler.after(this.core.options.ownerClaimTimeoutMs, () => {
        if (slot.pending && slot.pending.g === g) {
          this.core.log("warn", `ownership claim for ${slot.id} never came back; giving it up`);
          slot.pending = null;
          this.settleLostClaim(slot);
        }
      });
      slot.pending = { g, sid, timer };
      slot.claimAt = this.core.platform.clock.now();
      this.stats.claims++;
      this.core.set(`o.${slot.id}`, asciiJson(record2));
      this.noteOwner(slot);
    }
    readOwner(slot) {
      const raw = safeParse(this.core.get(`o.${slot.id}`));
      let record2 = null;
      if (isRecord(raw) && typeof raw.e === "number" && typeof raw.g === "number" && typeof raw.s === "string") {
        record2 = { e: raw.e, g: raw.g, s: raw.s, u: typeof raw.u === "string" ? raw.u : "" };
        if (record2.g > slot.topG) slot.topG = record2.g;
      }
      slot.mo = record2 && record2.e === this.referee.epoch ? record2 : null;
    }
    onOwnerLeaf(slot) {
      this.readOwner(slot);
      const mo = slot.mo;
      if (slot.pending && mo && mo.s === slot.pending.sid && mo.g === slot.pending.g) {
        this.core.scheduler.cancel(slot.pending.timer);
        slot.pending = null;
        if (slot.unconfirmed) slot.lastValid = slot.unconfirmed;
        slot.unconfirmed = null;
      }
      this.noteOwner(slot);
      this.evaluate(slot, false);
    }
    /** The claim never reached the room: whatever was changed for it is put back. */
    settleLostClaim(slot) {
      this.stats.lostRaces++;
      const touched = slot.unconfirmed !== null || slot.dirty;
      slot.unconfirmed = null;
      slot.dirty = false;
      if (touched) {
        if (slot.lastValid) {
          slot.applied = slot.lastValid.marker;
          this.markParts(slot);
          this.deserialized(slot, this.assign(slot, slot.lastValid.d), true);
        } else slot.applied = null;
      }
      this.noteOwner(slot);
      this.evaluate(slot, false);
    }
    /** Records what each member of a group holds now, so that the next value only reports real changes. */
    markParts(slot) {
      if (!slot.grouped) return;
      for (const member of slot.members) {
        const bag = member.behaviour;
        member.lastPart = canonicalJson(member.fields.map((field) => encodeValue(bag[field])));
      }
    }
    noteOwner(slot) {
      const now = this.ownerSid(slot);
      if (now === slot.ownerView) return;
      const before = slot.ownerView;
      slot.ownerView = now;
      if (now === this.me || before === this.me) this.core.guard("ownership hook", () => this.onLocalOwnership(slot, now === this.me));
      if (!this.started || now === null) return;
      const player = this.players.bySid(now);
      if (!player) return;
      for (const member of slot.members) this.core.guard(`${member.id}.OnOwnershipTransferred`, () => member.behaviour.OnOwnershipTransferred(player));
    }
    onPeopleChanged() {
      if (this.core.disposed) return;
      if (this.referee.epoch !== this.epochSeen) this.adoptEpoch();
      for (const slot of this.slots.values()) this.noteOwner(slot);
      this.takeOver();
    }
    /**
     * A referee of another epoch appeared: a client that started while there was none joins the game in progress,
     * or the game was started afresh. Everything known about owners and values is read again from the mirror, and
     * values found there are reported as a snapshot.
     */
    adoptEpoch() {
      this.epochSeen = this.referee.epoch;
      for (const slot of this.slots.values()) {
        if (slot.pending) this.core.scheduler.cancel(slot.pending.timer);
        slot.pending = null;
        slot.unconfirmed = null;
        slot.lastValid = null;
        slot.applied = null;
        slot.dirty = false;
        this.readOwner(slot);
        slot.snapshotOwed = true;
        this.evaluate(slot, true);
        slot.snapshotOwed = decodeLeaf(slot.id, (key) => this.core.get(key)).kind === "pending";
      }
    }
    /** The referee records itself as owner of whatever an absent player owned. */
    takeOver() {
      if (!this.started || !this.referee.isMe()) return;
      for (const slot of this.slots.values()) {
        if (slot.pending || !slot.mo || this.presence.has(slot.mo.s)) continue;
        this.setOwner(slot, this.me, this.core.me.uid);
      }
    }
    // ---- data ---------------------------------------------------------------------------------------------------
    requestSerialization(slot) {
      if (slot.mode === "none") return;
      if (!this.isOwner(slot)) {
        if (!slot.warnedNotOwner) {
          slot.warnedNotOwner = true;
          this.core.log("warn", `${slot.id}: RequestSerialization by a player who is not the owner is ignored`);
        }
        return;
      }
      slot.dirty = true;
    }
    /** Writes every dirty slot the local player owns. Called once per tick. */
    flush() {
      if (this.core.disposed || !this.started) return;
      const now = this.core.platform.clock.now();
      for (const slot of this.slots.values()) {
        if (slot.mode === "none") continue;
        if (slot.mode === "continuous" && now - slot.lastContinuousAt >= this.core.options.continuousIntervalMs && this.isOwner(slot)) {
          slot.lastContinuousAt = now;
          if (canonicalJson(this.read(slot)) !== slot.lastSent) slot.dirty = true;
        }
        if (!slot.dirty) continue;
        slot.dirty = false;
        if (this.isOwner(slot)) this.write(slot);
        else this.revert(slot);
      }
    }
    /**
     * The fields were changed by the owner, and ownership went to someone else before the change could be sent.
     * Nobody else will ever see it, so it is taken back.
     */
    revert(slot) {
      if (!slot.lastValid) return;
      slot.applied = slot.lastValid.marker;
      this.markParts(slot);
      const changed = this.assign(slot, slot.lastValid.d);
      this.stats.reverted++;
      this.deserialized(slot, changed, true);
    }
    /** Writes every slot the local player owns and has changed (RequestSerialization), now: the end of one action. */
    flushDirty() {
      if (this.core.disposed || !this.started) return;
      for (const slot of this.slots.values()) {
        if (slot.mode === "none" || !slot.dirty) continue;
        slot.dirty = false;
        if (this.isOwner(slot)) this.write(slot);
        else this.revert(slot);
      }
    }
    /**
     * The local player's ownership claims and writes the room has not echoed yet (made in the last `withinMs`): what a
     * command sent now must not overtake (commands.ts). Each is [slot id, claim generation or 0, write sequence or 0].
     */
    unechoedMarks(withinMs, max = 8) {
      const now = this.core.platform.clock.now();
      const out = [];
      for (const slot of this.slots.values()) {
        const g = slot.pending && slot.pending.sid === this.me && now - slot.claimAt <= withinMs ? slot.pending.g : 0;
        const n2 = slot.ownN > slot.echoN && now - slot.ownAt <= withinMs ? slot.ownN : 0;
        if (g || n2) out.push([slot.id, g, n2]);
      }
      return out.slice(-max);
    }
    /** Has this client seen a claim of generation `g` (or a later one) and a write numbered `n` (or later) of a slot? */
    hasSeen(id, g, n2) {
      const slot = this.slots.get(id);
      if (!slot) return true;
      return slot.topG >= g && slot.seenN >= n2;
    }
    /** Serialises one slot now (used when an event must follow its state). Returns the marker of what it holds. */
    flushOne(slot) {
      if (slot.dirty && this.started && this.isOwner(slot)) {
        slot.dirty = false;
        this.write(slot);
      }
      return slot.applied;
    }
    write(slot) {
      const named = slot.pending ? slot.pending.sid === this.me : slot.mo !== null && slot.mo.s === this.me;
      if (!named) this.setOwner(slot, this.me, this.core.me.uid);
      if (!slot.pending && !slot.mo) return;
      const g = slot.pending ? slot.pending.g : slot.mo.g;
      for (const member of slot.members) this.core.guard(`${member.id}.OnPreSerialization`, () => member.behaviour.OnPreSerialization());
      const d = this.read(slot);
      const n2 = ++slot.seenN;
      const encoded = encodeLeaf(slot.id, { e: this.referee.epoch, g, n: n2, w: this.me, d }, this.core.platform.limits.maxLeafBytes, slot.chunks);
      for (const [key, value] of encoded.writes) this.core.set(key, value);
      slot.chunks = encoded.chunks;
      slot.applied = { g, n: n2, w: this.me };
      slot.ownN = n2;
      slot.ownAt = this.core.platform.clock.now();
      slot.lastSent = canonicalJson(d);
      if (slot.grouped) for (const member of slot.members) member.lastPart = canonicalJson(d[member.id] ?? null);
      const kept = { d, marker: slot.applied };
      if (slot.pending) slot.unconfirmed = kept;
      else slot.lastValid = kept;
      this.stats.writes++;
      const result = { success: true, byteCount: encoded.bytes };
      for (const member of slot.members) this.core.guard(`${member.id}.OnPostSerialization`, () => member.behaviour.OnPostSerialization(result));
    }
    read(slot) {
      if (!slot.grouped) return readFields(slot.members[0].behaviour, slot.members[0].fields);
      const out = {};
      for (const member of slot.members) {
        const bag = member.behaviour;
        out[member.id] = member.fields.map((field) => encodeValue(bag[field]));
      }
      return out;
    }
    /** Puts data into the behaviours. Returns the members whose part was new to them. */
    assign(slot, d) {
      if (!slot.grouped) {
        const member = slot.members[0];
        this.core.guard(`${member.id} field change callback`, () => assignFields(member.behaviour, member.fields, d, member.callbacks));
        return [member];
      }
      const changed = [];
      if (!isRecord(d)) return changed;
      for (const member of slot.members) {
        const part = d[member.id];
        if (!Array.isArray(part)) continue;
        const text = canonicalJson(part);
        if (text === member.lastPart) continue;
        member.lastPart = text;
        const asFields = {};
        member.fields.forEach((field, i) => {
          if (i < part.length) asFields[field] = part[i];
        });
        this.core.guard(`${member.id} field change callback`, () => assignFields(member.behaviour, member.fields, asFields, member.callbacks));
        changed.push(member);
      }
      return changed;
    }
    onLeaf(key) {
      if (this.core.disposed) return;
      if (key.startsWith("o.")) {
        const slot2 = this.slots.get(key.slice(2));
        if (slot2) this.onOwnerLeaf(slot2);
        return;
      }
      const id = leafOwnerOf(key);
      if (id === null) return;
      const slot = this.slots.get(id);
      if (slot) this.evaluate(slot, slot.snapshotOwed);
    }
    /**
     * Looks at the mirrored value of one slot and applies it, ignores it, or repairs it. `asSnapshot`: the value
     * was already stored when this client came to the game, so it is taken whoever wrote it.
     */
    evaluate(slot, asSnapshot) {
      this.consider(slot, asSnapshot);
      if (slot.onApplied && this.started) this.core.guard("held events", slot.onApplied);
    }
    consider(slot, asSnapshot) {
      const decoded = decodeLeaf(slot.id, (key) => this.core.get(key));
      if (decoded.kind === "pending") {
        if (decoded.n > slot.seenN) slot.seenN = decoded.n;
        return;
      }
      if (decoded.kind !== "value") return;
      const x = decoded.record;
      if (x.n > slot.seenN) slot.seenN = x.n;
      if (x.w === this.me && x.n > slot.echoN) slot.echoN = x.n;
      slot.chunks = decoded.chunks;
      if (x.e !== this.referee.epoch) return;
      const a = slot.applied;
      if (a && x.n === a.n && x.w === a.w && x.g === a.g) return;
      if (x.w === this.me && a && a.w === this.me && x.n <= a.n) return;
      const mo = slot.mo;
      if (asSnapshot || mo !== null && x.w === mo.s) {
        slot.applied = { g: x.g, n: x.n, w: x.w };
        slot.lastValid = { d: x.d, marker: slot.applied };
        slot.lastSent = null;
        this.stats.applied++;
        this.deserialized(slot, this.assign(slot, x.d), false);
        return;
      }
      this.stats.rejected++;
      if (mo !== null && mo.s === this.me && !slot.pending) {
        this.stats.repairs++;
        slot.dirty = true;
      }
    }
    deserialized(slot, changed, isRollback) {
      if (!this.started) {
        for (const member of changed) member.owed = true;
        return;
      }
      const isSnapshot = slot.snapshotOwed && !isRollback;
      slot.snapshotOwed = false;
      for (const member of changed) {
        this.core.guard(`${member.id}.OnDeserialization`, () => member.behaviour.OnDeserialization({ isSnapshot, isRollback }));
      }
    }
    /** Canonical text of every synced field of every behaviour: equal on two clients that agree. */
    snapshotText() {
      const all = {};
      for (const slot of this.slots.values()) {
        if (slot.mode === "none") continue;
        for (const member of slot.members) if (member.fields.length) all[member.id] = readFields(member.behaviour, member.fields);
      }
      return canonicalJson(all);
    }
  };

  // portkit/src/instance.ts
  var HEAD_OP = "pkHead";
  var HEAD_EVENT = "pkHead";
  var OBJECT_EVENTS = [
    "click",
    "grab",
    "drop",
    "triggerEnter",
    "triggerExit",
    "collisionEnter",
    "collisionExit",
    "uiButton",
    "uiSlider",
    "uiToggle",
    "heldTrigger",
    "heldPrimary",
    "heldSecondary",
    "field"
  ];
  var MAX_EARLY_EVENTS = 256;
  var GameInstance = class {
    constructor(platform, game2, bindings, element, inst, shared = {}) {
      __publicField(this, "platform");
      __publicField(this, "game");
      __publicField(this, "bindings");
      __publicField(this, "element");
      __publicField(this, "inst");
      __publicField(this, "core");
      __publicField(this, "scheduler");
      __publicField(this, "presence");
      __publicField(this, "referee");
      __publicField(this, "players");
      __publicField(this, "sync");
      __publicField(this, "events");
      __publicField(this, "commands");
      __publicField(this, "perUser");
      __publicField(this, "secrets");
      __publicField(this, "protectedValues");
      __publicField(this, "host");
      __publicField(this, "clockSync");
      __publicField(this, "storage");
      __publicField(this, "networking");
      __publicField(this, "settings", /* @__PURE__ */ new Map());
      __publicField(this, "objects", /* @__PURE__ */ new Map());
      /** Set when the instance has started its behaviours. */
      __publicField(this, "started", false);
      /** Resolves when behaviours have started (or the instance was disposed first). */
      __publicField(this, "ready", deferred());
      __publicField(this, "rule");
      __publicField(this, "kit", null);
      __publicField(this, "ordinary", []);
      __publicField(this, "byId", /* @__PURE__ */ new Map());
      __publicField(this, "addresses", /* @__PURE__ */ new Map());
      __publicField(this, "templates", []);
      __publicField(this, "playerBehaviourMap", /* @__PURE__ */ new Map());
      __publicField(this, "objectHandlers", /* @__PURE__ */ new Map());
      __publicField(this, "hostWired", /* @__PURE__ */ new Set());
      __publicField(this, "graphHandlers", /* @__PURE__ */ new Map());
      __publicField(this, "pendingLeaves", []);
      __publicField(this, "earlyGraphEvents", []);
      __publicField(this, "buttons", /* @__PURE__ */ new Set());
      __publicField(this, "keys", /* @__PURE__ */ new Set());
      __publicField(this, "sticks", [new Vector2(), new Vector2()]);
      __publicField(this, "triggers", [0, 0]);
      __publicField(this, "abilitiesOff", /* @__PURE__ */ new Set());
      __publicField(this, "blocksOn", /* @__PURE__ */ new Set());
      __publicField(this, "poses", null);
      __publicField(this, "triggerAt", [-Infinity, -Infinity]);
      __publicField(this, "lastClickSide", null);
      __publicField(this, "vr", null);
      __publicField(this, "reachOverride", /* @__PURE__ */ new Map());
      __publicField(this, "position", null);
      __publicField(this, "startKindValue", "idle");
      __publicField(this, "lastClockAsk", -Infinity);
      __publicField(this, "timeView");
      __publicField(this, "randomView");
      __publicField(this, "debugView");
      __publicField(this, "inputView");
      /** The page-wide object every instance of this game shares (GameRuntime.shared). */
      __publicField(this, "shared");
      __publicField(this, "headRequests", /* @__PURE__ */ new Map());
      __publicField(this, "nextHeadRequest", 1);
      this.shared = shared;
      this.platform = platform;
      this.game = game2;
      this.bindings = bindings;
      this.element = element;
      this.inst = inst;
      this.rule = game2.referee ?? "anyone";
      const options = { ...DEFAULT_OPTIONS, ...game2.options ?? {} };
      this.scheduler = new Scheduler(platform.clock, (where, error) => this.core.error(where, error));
      this.core = new Core(platform, game2.slug, inst, options, this.scheduler);
      for (const name of element.attributeNames()) this.settings.set(name, element.getAttribute(name) ?? "");
      this.presence = new Presence(this.core);
      this.referee = new Referee(this.core, this.presence, this.rule);
      this.players = new Players(this.core, this.presence, this.referee);
      this.sync = new Sync(this.core, this.presence, this.referee, this.players);
      this.clockSync = new ClockSync(platform.clock);
      this.host = new RelayHost(platform, game2.slug, inst, bindings.refs);
      this.host.pathOf = (key) => bindings.objects[key]?.path;
      this.storage = new Persistence(platform.storage, game2.slug, inst, platform.local().uid);
      this.secrets = new Secrets(this.core, this.presence, this.referee, () => this.clockSync.seconds());
      this.protectedValues = new ProtectedValues(this.core);
      this.events = new NetEvents(this.core, this.sync, {
        behaviour: (id) => this.byId.get(id) ?? null,
        playerBehaviour: (sid, id) => this.playerBehaviourMap.get(sid)?.get(id) ?? null,
        address: (behaviour) => this.addresses.get(behaviour) ?? null,
        refused: (behaviour, code, name) => this.refuse(behaviour, { kind: "event", code, key: name, final: true })
      });
      this.commands = new Commands(this.core, this.presence, this.referee, {
        resolve: (id, playerSid) => playerSid ? this.playerBehaviourMap.get(playerSid)?.get(id) ?? null : this.byId.get(id) ?? null,
        address: (behaviour) => this.addresses.get(behaviour) ?? null,
        invoke: (behaviour, name, args, fromSid) => this.events.invoke(behaviour, name, args, fromSid),
        acknowledged: (behaviour, number) => behaviour.OnCommandAcknowledged(number),
        refused: (behaviour, code, name) => this.refuse(behaviour, { kind: "event", code, key: name, final: true }),
        flush: () => this.sync.flushDirty(),
        marks: () => this.sync.unechoedMarks(this.core.options.eventHoldMs * 2),
        seen: (id, g, n2) => this.sync.hasSeen(id, g, n2)
      });
      this.perUser = new PerUser(this.core, this.storage, {
        restored: (player) => this.each("OnPlayerRestored", (b) => b.OnPlayerRestored(player)),
        dataUpdated: (player, keys) => this.each("OnPlayerDataUpdated", (b) => b.OnPlayerDataUpdated(player, keys)),
        deserialized: (behaviour) => this.core.guard("OnDeserialization", () => behaviour.OnDeserialization({ isSnapshot: false, isRollback: false })),
        refused: (kind, code, key, behaviour) => this.refuse(behaviour, { kind, code, key, final: true })
      });
      this.networking = new Networking(this);
      const scheduler = this.scheduler;
      this.timeView = {
        get time() {
          return scheduler.time;
        },
        get deltaTime() {
          return scheduler.deltaTime;
        },
        get frameCount() {
          return scheduler.ticks;
        }
      };
      this.randomView = {
        get value() {
          return platform.random();
        },
        Range: (min, max) => min + (max - min) * platform.random(),
        RangeInt: (min, max) => Math.floor(min) + Math.floor((Math.floor(max) - Math.floor(min)) * platform.random()),
        Bytes: (n2) => platform.crypto.getRandomValues(new Uint8Array(Math.max(0, Math.floor(n2))))
      };
      const say = (level) => (message) => this.core.log(level, typeof message === "string" ? message : String(message));
      this.debugView = { Log: say("info"), LogWarning: say("warn"), LogError: say("error") };
      const owner = this;
      this.inputView = {
        GetButton: (button, side) => this.buttons.has(`${side}/${button}`),
        GetThumbstick: (side) => this.sticks[side].clone(),
        GetTrigger: (side) => this.triggers[side],
        GetKey: (key) => this.keys.has(key),
        get Poses() {
          return owner.poses;
        },
        get Position() {
          return owner.position ? owner.position.clone() : null;
        },
        Haptic: (side, strength, seconds) => platform.haptic(side, strength, seconds),
        get LastClickSide() {
          return owner.lastClickSide;
        },
        get IsVR() {
          return owner.vr;
        },
        InReach: (point, metres, whenUnknown = true) => {
          if (!(metres > 0)) return true;
          const distance = this.nearestDistance(point);
          return distance === null ? whenUnknown : distance <= metres;
        },
        TeleportTo: (position, yDegrees, stopMovement = true) => {
          this.moved(position);
          platform.teleport(position, yDegrees, stopMovement);
        },
        SetAbility: (ability, allowed) => {
          if (allowed) this.abilitiesOff.delete(ability);
          else this.abilitiesOff.add(ability);
          platform.setAbility(ability, allowed);
        },
        SetBlock: (control, blocked) => {
          if (blocked) this.blocksOn.add(control);
          else this.blocksOn.delete(control);
          platform.setBlock(control, blocked);
        }
      };
    }
    // ---- starting -----------------------------------------------------------------------------------------------
    /** Runs the start gate: platform, kit, snapshot, clock, keys, an id, a referee; then starts the behaviours. */
    async start() {
      const { platform, core } = this;
      try {
        await platform.whenReady();
        if (core.disposed) return;
        core.me = platform.local();
        core.listen();
        core.own(
          platform.onRelay(relayKey(core.slug, core.inst), {
            clock: (requestId, seconds) => this.host.onClockReply(requestId, seconds),
            event: (name, args) => this.onGraphEvent(name, args)
          })
        );
        core.own(platform.onPose((poses) => this.onPose(poses)));
        core.own(platform.onTeleported((position) => this.moved(position)));
        void platform.localPosition().then((position) => {
          if (position && !this.poses && !this.position && !core.disposed) this.position = position;
        }, () => void 0);
        void platform.isVR().then((vr) => this.vr = vr, () => this.vr = false);
        core.own(platform.onInput((event) => this.onInput(event)));
        core.own(platform.onStateError(core.prefix + ".", (path, code, final) => this.onRefusedPath(path.slice(core.prefix.length + 1), code, final)));
        await this.loadKit();
        if (core.disposed) return;
        const snapshot = await platform.whenSnapshot(core.options.snapshotTimeoutMs);
        if (core.disposed) return;
        if (!snapshot) core.log("warn", "no full state snapshot arrived in time; starting from what is mirrored");
        await this.askClock(true);
        if (core.disposed) return;
        const saved = storagePrefix(core.slug, core.inst, core.me.uid);
        const publicKey = await this.secrets.init(platform.storage, saved + "ecdh", saved + "draw");
        if (core.disposed) return;
        this.players.on((kind, player) => this.onPlayer(kind, player));
        this.referee.on((now, before) => this.onReferee(now?.sid ?? null, before?.sid ?? null));
        this.presence.start();
        this.presence.announce(publicKey);
        this.referee.start();
        this.players.start();
        this.secrets.listen();
        this.commands.listen();
        this.perUser.listen();
        this.protectedValues.listen();
        this.events.listen();
        this.secrets.onDrawChanged = (sid, label, status) => {
          const player = this.players.bySid(sid);
          if (player && this.started) this.each("OnDrawChanged", (b) => b.OnDrawChanged(player, label, status.state));
        };
        this.protectedValues.onChanged = (key) => {
          if (this.started) this.each("OnProtectedChanged", (b) => b.OnProtectedChanged(key));
        };
        const warn = this.scheduler.after(core.options.admitWarnMs, () => {
          core.log("warn", `still waiting to start: ${this.players.local ? "no referee has been elected" : "the local player's id has not settled"}`);
        });
        await this.players.whenLocalAssigned();
        if (this.rule === "anyone") await this.whenReferee();
        this.scheduler.cancel(warn);
        if (core.disposed) return;
        this.begin();
      } catch (error) {
        core.error("start", error);
      } finally {
        this.ready.resolve(this.started);
      }
    }
    whenReferee() {
      if (this.referee.current()) return Promise.resolve();
      const gate = deferred();
      this.referee.on((now) => {
        if (now) gate.resolve();
      });
      return gate.promise;
    }
    async loadKit() {
      const { core, bindings, element } = this;
      const address = (attr, fallback) => {
        const value = (element.getAttribute(attr) ?? "").trim();
        return /^https?:\/\//i.test(value) ? value : fallback;
      };
      const released = this.platform.bundles(core.slug);
      const windows = address("windows", released?.windows || bindings.bundles.windows);
      const android = address("android", released?.android || bindings.bundles.android);
      const keys = Object.keys(bindings.objects);
      if (windows || android) {
        const spec = {
          holderName: holderName(core.slug, core.inst),
          rootName: (bindings.root ?? bindings.slug) + "(Clone)",
          windows,
          android,
          position: triple(element.getAttribute("position"), false),
          rotation: triple(element.getAttribute("rotation"), false),
          scale: triple(element.getAttribute("scale"), true),
          objects: keys.map((key) => {
            const o = bindings.objects[key];
            const synced = o.sync === "transform" || o.seat;
            if (synced && o.attach) core.log("warn", `kit object '${key}' is both synced and attachable: it keeps its synced id, and other players may not see it attached`);
            const attach = attachId(core.slug, core.inst, key);
            return { key, path: o.path, networkId: synced ? networkId(core.slug, core.inst, key) : o.attach ? attach : "", attachNetworkId: attach, attach: o.attach === true, sync: o.sync, grab: o.grab, click: o.click, seat: o.seat };
          })
        };
        try {
          this.kit = await this.platform.loadKit(spec);
          if (this.kit.missing.length) core.log("error", `kit objects not found: ${this.kit.missing.join(", ")}`);
        } catch (error) {
          core.error("the kit did not load", error);
        }
      } else if (keys.length) core.log("warn", "no bundle address for this kit (bindings.bundles is empty and the element names none): running without objects");
      if (core.disposed) {
        this.kit?.destroy();
        this.kit = null;
        return;
      }
      for (const key of keys) {
        const path = bindings.objects[key].path;
        const subscribe2 = (kind, handler) => this.addObjectHandler(key, kind, handler);
        this.objects.set(key, new GameObject(key, path.slice(path.lastIndexOf("/") + 1), this.kit?.objects.get(key) ?? null, this.host, subscribe2));
      }
      let hidden = 0;
      for (const key of keys) {
        if (bindings.objects[key].active !== false) continue;
        this.objects.get(key).SetActive(false);
        hidden++;
      }
      if (hidden) this.host.flush();
      this.host.fallbackClip = (key, index) => {
        const object = this.kit?.objects.get(key);
        if (!object) return false;
        object.playClip(index);
        return true;
      };
      if (!this.kit) return;
      const reads = keys.map((key) => this.objects.get(key).transform.Refresh().catch(() => void 0));
      const waited = deferred();
      const limit = this.scheduler.after(3e3, () => waited.resolve());
      await Promise.race([Promise.all(reads), waited.promise]);
      this.scheduler.cancel(limit);
      for (const key of keys) {
        const o = bindings.objects[key];
        const hostObject = this.kit.objects.get(key);
        if (!hostObject || !(o.grab || o.sync === "transform")) continue;
        const transform = this.objects.get(key).transform;
        core.own(hostObject.watchTransform((pose2) => transform._report(pose2.position, pose2.rotation)));
      }
    }
    async askClock(first) {
      const sentAt = this.platform.clock.now();
      this.lastClockAsk = sentAt;
      const answer = this.host.requestClock().then((seconds) => {
        if (!this.core.disposed) this.clockSync.accept(seconds, sentAt);
        return true;
      });
      if (!first) return;
      const gate = deferred();
      const timer = this.scheduler.after(this.core.options.clockTimeoutMs, () => gate.resolve(false));
      const ok = await Promise.race([answer, gate.promise]);
      this.scheduler.cancel(timer);
      if (!ok) this.core.log("warn", "the synced clock did not answer; using this device's clock until it does");
    }
    begin() {
      const { core } = this;
      this.createBehaviours();
      this.wireEvents();
      this.sync.onLocalOwnership = (slot, mine) => {
        if (!mine) return;
        for (const member of slot.members) {
          const key = this.addresses.get(member.behaviour) ? member.behaviour.gameObject.key : "";
          if (key && this.bindings.objects[key]?.sync === "transform") member.behaviour.gameObject.TakeOwnership();
        }
      };
      this.sync.attach();
      for (const behaviour of this.ordinary) core.guard(`${this.idOf(behaviour)}.Start`, () => behaviour.Start());
      this.sync.applySnapshot();
      this.startKindValue = this.computeStartKind();
      this.sync.begin();
      this.commands.started = true;
      this.perUser.started = true;
      this.started = true;
      this.perUser.dataEnabled = this.perUser.dataEnabled || this.anyOverrides("OnPlayerRestored") || this.anyOverrides("OnPlayerDataUpdated");
      this.perUser.restoreLocal();
      for (const behaviour of this.ordinary) core.guard(`${this.idOf(behaviour)}.OnInstanceStart`, () => behaviour.OnInstanceStart(this.startKindValue));
      for (const player of this.players.list()) this.deliverJoin(player);
      this.sync.takeOver();
      this.secrets.review();
      this.commands.review();
      for (const early of this.earlyGraphEvents.splice(0)) this.onGraphEvent(early.name, early.args);
      this.scheduler.start(() => this.tick());
      this.tick();
      let extra = {};
      if (this.game.debug && this.platform.isTestPage?.() === true) core.guard("debug hooks", () => extra = this.game.debug(this));
      this.platform.expose(relayKey(core.slug, core.inst), {
        ...extra,
        digest: () => this.digest(),
        version: () => this.version(),
        stamp: () => ({ version: this.version(), digest: this.digest() }),
        state: () => JSON.parse(this.sync.snapshotText()),
        referee: () => this.referee.current(),
        players: () => this.players.list().map((p) => ({ id: p.playerId, name: p.displayName, sid: p.sid }))
      });
      core.log("info", `started (${this.startKindValue}) as ${this.players.local}, ${this.ordinary.length} behaviours`);
    }
    computeStartKind() {
      const ref = this.referee.current();
      if (!ref) return "idle";
      const claim = this.referee.lastClaim;
      if (ref.sid !== this.core.me.sid || !claim || claim.term !== ref.term) return "joined";
      if (claim.fresh) return "fresh";
      return claim.alive ? "joined" : "resumed";
    }
    // ---- behaviours ---------------------------------------------------------------------------------------------
    createBehaviours() {
      const { core, bindings } = this;
      const made = [];
      for (const binding of bindings.behaviours) {
        const cls = this.game.behaviours[binding.type];
        if (!cls) {
          core.log("error", `bindings name behaviour type '${binding.type}' (${binding.id}), which the game does not define`);
          continue;
        }
        if (binding.perPlayer === true || cls.perPlayer === true) {
          this.templates.push({ binding, cls });
          continue;
        }
        const behaviour = new cls();
        linkBehaviour(behaviour, this.makeLink(behaviour, binding, null));
        this.addresses.set(behaviour, { id: binding.id, type: binding.type, playerSid: null });
        this.byId.set(binding.id, behaviour);
        this.ordinary.push(behaviour);
        made.push({ behaviour, binding, cls });
      }
      this.perUser.declareTypes(this.templates.map((t) => t.binding.id));
      for (const { behaviour, binding, cls } of made) {
        this.assignBindingFields(behaviour, binding, null);
        const fields = cls.synced ?? [];
        for (const field of fields) if (!(field in behaviour)) core.log("warn", `${binding.id}: synced field '${field}' is not a field of ${binding.type}`);
        this.sync.add(behaviour, binding.id, fields, fields.length ? cls.syncMode ?? "manual" : "none", cls.fieldChangeCallbacks, binding.group);
      }
    }
    makePlayerBehaviours(player) {
      if (!this.templates.length || this.playerBehaviourMap.has(player.sid)) return;
      const mine = /* @__PURE__ */ new Map();
      this.playerBehaviourMap.set(player.sid, mine);
      const made = [];
      for (const template of this.templates) {
        const behaviour = new template.cls();
        linkBehaviour(behaviour, this.makeLink(behaviour, template.binding, player));
        this.addresses.set(behaviour, { id: template.binding.id, type: template.binding.type, playerSid: player.sid });
        mine.set(template.binding.id, behaviour);
        made.push({ behaviour, template });
      }
      for (const { behaviour, template } of made) this.assignBindingFields(behaviour, template.binding, mine);
      for (const { behaviour, template } of made) {
        const id = template.binding.id;
        this.core.guard(`${id}.Start`, () => behaviour.Start());
        const hasData = this.perUser.adopt(player, id, behaviour, template.cls.synced ?? [], template.cls.persistent === true, template.cls.fieldChangeCallbacks);
        if (hasData) this.core.guard(`${id}.OnDeserialization`, () => behaviour.OnDeserialization({ isSnapshot: true, isRollback: false }));
      }
    }
    makeLink(behaviour, binding, player) {
      const gameObject = (binding.object ? this.objects.get(binding.object) : void 0) ?? new GameObject("", binding.id, null, null);
      const instance = this;
      return {
        id: binding.id,
        gameObject,
        networking: this.networking,
        time: this.timeView,
        random: this.randomView,
        debug: this.debugView,
        secrets: this.secrets,
        storage: this.storage,
        host: this.host,
        settings: this.settings,
        playerData: this.perUser,
        input: this.inputView,
        protectedValues: this.protectedValues,
        player,
        instanceKey: this.inst,
        shared: this.shared,
        reach: this.reachOverride,
        requestSerialization() {
          if (player) {
            if (player.isLocal) instance.perUser.requestSerialization(behaviour);
            return;
          }
          const slot = instance.sync.slotOf(behaviour);
          if (slot) instance.sync.requestSerialization(slot);
        },
        sendNetworkEvent(target, name, args) {
          instance.events.send(behaviour, target, name, args);
        },
        sendCommand(name, args) {
          return instance.commands.send(behaviour, name, args);
        },
        delaySeconds(name, seconds) {
          instance.scheduler.after(seconds * 1e3, () => instance.callByName(behaviour, name));
        },
        delayFrames(name, frames) {
          instance.scheduler.afterTicks(frames, () => instance.callByName(behaviour, name));
        },
        find: (id) => {
          const sibling = player ? this.playerBehaviourMap.get(player.sid)?.get(id) : void 0;
          return sibling ?? this.byId.get(id) ?? null;
        },
        findByType: (type) => this.ordinary.filter((b) => this.addresses.get(b)?.type === type),
        playerBehaviour: (who, type) => this.playerBehaviourOf(who, type),
        playerBehaviours: (type) => this.players.list().map((p) => this.playerBehaviourOf(p, type)).filter((b) => b !== null),
        raycast: (origin, direction, maxDistance, layerMask) => this.platform.raycast(origin, direction, maxDistance, layerMask),
        onGraphEvent: (name, method) => this.addGraphHandler(name, behaviour, method)
      };
    }
    playerBehaviourOf(player, type) {
      const mine = this.playerBehaviourMap.get(player.sid);
      if (!mine) return null;
      for (const behaviour of mine.values()) if (this.addresses.get(behaviour)?.type === type) return behaviour;
      return mine.get(type) ?? null;
    }
    callByName(behaviour, name) {
      if (this.core.disposed) return;
      const fn = behaviour[name];
      if (typeof fn === "function") this.core.guard(name, () => fn.call(behaviour));
      else this.core.log("warn", `${this.idOf(behaviour)} has no method '${name}' for a delayed event`);
    }
    assignBindingFields(behaviour, binding, siblings) {
      if (!binding.fields) return;
      const bag = behaviour;
      for (const name of Object.keys(binding.fields)) bag[name] = this.resolveField(binding.fields[name], siblings, `${binding.id}.${name}`, binding.object ?? null);
    }
    /** Turns a bindings field value into what the behaviour holds: objects, behaviours, component proxies, values. */
    resolveField(value, siblings, where, ownObject) {
      if (Array.isArray(value)) return value.map((v, i) => this.resolveField(v, siblings, `${where}[${i}]`, ownObject));
      if (!isRecord(value)) return value;
      if (typeof value.$obj === "string") return this.objects.get(value.$obj) ?? null;
      if (typeof value.$beh === "string") {
        const found = siblings?.get(value.$beh) ?? this.byId.get(value.$beh) ?? null;
        if (!found) this.core.log("warn", `${where}: behaviour '${value.$beh}' is per-player or missing, so the field is null`);
        return found;
      }
      if (typeof value.$comp === "string") {
        const object = this.objects.get(value.$comp);
        return object ? makeComponent(String(value.kind ?? "Transform"), object, this.host) : null;
      }
      if (typeof value.$clip === "number") return new AudioClipRef(value.$clip, typeof value.on === "string" ? value.on : null);
      if (Object.keys(value).some((key) => key.startsWith("$"))) return decodeValue(value);
      const out = {};
      for (const key of Object.keys(value)) out[key] = this.resolveField(value[key], siblings, `${where}.${key}`, ownObject);
      return out;
    }
    idOf(behaviour) {
      return this.addresses.get(behaviour)?.id ?? "?";
    }
    all() {
      const out = this.ordinary.slice();
      for (const mine of this.playerBehaviourMap.values()) for (const behaviour of mine.values()) out.push(behaviour);
      return out;
    }
    overrides(behaviour, method) {
      return behaviour[method] !== Behaviour.prototype[method];
    }
    anyOverrides(method) {
      if (this.ordinary.some((b) => this.overrides(b, method))) return true;
      return this.templates.some((t) => t.cls.prototype[method] !== Behaviour.prototype[method]);
    }
    /** Calls a callback on every behaviour that overrides it. */
    each(method, call) {
      if (!this.started || this.core.disposed) return;
      for (const behaviour of this.all()) {
        if (this.overrides(behaviour, method)) this.core.guard(`${this.idOf(behaviour)}.${String(method)}`, () => call(behaviour));
      }
    }
    // ---- players and referee ------------------------------------------------------------------------------------
    onPlayer(kind, player) {
      if (!this.started || this.core.disposed) return;
      if (kind === "join") {
        this.deliverJoin(player);
        return;
      }
      if (!this.referee.current()) {
        this.pendingLeaves.push(player);
        if (this.rule === "anyone") this.scheduler.after(5e3, () => this.flushLeaves());
        return;
      }
      this.deliverLeave(player);
    }
    flushLeaves() {
      for (const player of this.pendingLeaves.splice(0)) this.deliverLeave(player);
    }
    deliverJoin(player) {
      this.makePlayerBehaviours(player);
      this.each("OnPlayerJoined", (b) => b.OnPlayerJoined(player));
      this.perUser.playerDelivered(player);
    }
    deliverLeave(player) {
      this.each("OnPlayerLeft", (b) => b.OnPlayerLeft(player));
      const gone = this.perUser.playerGone(player.sid);
      const mine = this.playerBehaviourMap.get(player.sid);
      this.playerBehaviourMap.delete(player.sid);
      for (const behaviour of mine ? mine.values() : gone) {
        this.core.guard("OnDestroy", () => behaviour.OnDestroy());
        this.addresses.delete(behaviour);
      }
    }
    onReferee(now, before) {
      if (!this.started || this.core.disposed) return;
      if (now !== before) {
        const wasIdle = this.startKindValue === "idle";
        if (wasIdle && now !== null) {
          this.startKindValue = this.computeStartKind();
          this.each("OnInstanceStart", (b) => b.OnInstanceStart(this.startKindValue));
        }
        const player = now === null ? null : this.players.bySid(now);
        if (player || now === null && this.referee.candidates().length === 0) this.each("OnMasterTransferred", (b) => b.OnMasterTransferred(player));
      }
      if (now !== null) this.flushLeaves();
    }
    // NetHost
    localPlayer() {
      const local = this.players.local;
      if (!local) throw new Error("the local player is not known before the instance has started");
      return local;
    }
    isReferee() {
      return this.referee.isMe();
    }
    owner(target) {
      const address = this.addresses.get(target);
      if (address?.playerSid) return this.players.bySid(address.playerSid);
      const slot = this.sync.slotOf(target);
      return slot ? this.sync.owner(slot) : null;
    }
    isOwner(target, player) {
      const address = this.addresses.get(target);
      if (address?.playerSid) return address.playerSid === player.sid;
      const slot = this.sync.slotOf(target);
      return slot ? this.sync.isOwner(slot, player.sid) : false;
    }
    setOwner(target, player) {
      if (this.addresses.get(target)?.playerSid) {
        this.core.log("warn", `${this.idOf(target)} is a per-player behaviour: its owner cannot change`);
        return;
      }
      const slot = this.sync.slotOf(target);
      if (slot) this.sync.setOwner(slot, player.sid, player.uid);
    }
    behavioursOn(object) {
      return this.ordinary.filter((b) => b.gameObject === object);
    }
    serverSeconds() {
      return this.clockSync.seconds();
    }
    playerList() {
      return this.players.list();
    }
    playerById(id) {
      return this.players.byId(id);
    }
    callingPlayer() {
      return this.events.callingSid === null ? null : this.players.bySid(this.events.callingSid);
    }
    callingSession() {
      const sid = this.events.callingSid;
      if (sid === null) return null;
      const who = this.platform.players().find((p) => p.sid === sid);
      return { sid, uid: who ? who.uid : "" };
    }
    setCandidate(on) {
      if (this.rule !== "declared") {
        this.core.log("warn", 'SetRefereeCandidate only matters in a game whose definition says referee: "declared"');
        return;
      }
      this.referee.setCandidate(on);
    }
    isCandidate(player) {
      return this.referee.isCandidate(player.sid);
    }
    startKind() {
      return this.startKindValue;
    }
    refereePlayer() {
      const ref = this.referee.current();
      return ref ? this.players.bySid(ref.sid) : null;
    }
    // ---- events from objects, graphs and input ------------------------------------------------------------------
    wireEvents() {
      const explicit = /* @__PURE__ */ new Set();
      const mine = (id) => () => this.playerBehaviourMap.get(this.core.me.sid)?.get(id) ?? null;
      for (const event of this.bindings.events) {
        if (!event.behaviour || !event.method) continue;
        const ordinary = this.byId.get(event.behaviour);
        const perPlayer = !ordinary && this.templates.some((t) => t.binding.id === event.behaviour);
        if (!ordinary && !perPlayer) continue;
        const target = ordinary ?? mine(event.behaviour);
        if (event.kind === "graph") {
          this.addGraphHandler(event.name ?? "", target, event.method);
          continue;
        }
        explicit.add(`${event.object}/${event.kind}/${event.behaviour}`);
        this.addObjectHandler(event.object, event.kind, (detail) => {
          const behaviour = typeof target === "function" ? target() : target;
          if (behaviour) this.callBound(behaviour, event, detail);
        });
      }
      for (const template of this.templates) {
        const key = template.binding.object;
        const object = key ? this.bindings.objects[key] : void 0;
        if (!key || !object) continue;
        const id = template.binding.id;
        const proto = template.cls.prototype;
        const base = Behaviour.prototype;
        if (object.click && proto.Interact !== base.Interact && !explicit.has(`${key}/click/${id}`)) {
          this.addObjectHandler(key, "click", (detail) => {
            const behaviour = mine(id)();
            if (behaviour && this.withinReach(behaviour, void 0, template.cls.interactReach ?? 0, detail)) this.core.guard(`${id}.Interact`, () => behaviour.Interact());
          });
        }
        if (object.grab && proto.OnPickup !== base.OnPickup && !explicit.has(`${key}/grab/${id}`)) {
          this.addObjectHandler(key, "grab", () => mine(id)()?.OnPickup());
        }
        if (object.grab && proto.OnDrop !== base.OnDrop && !explicit.has(`${key}/drop/${id}`)) {
          this.addObjectHandler(key, "drop", () => mine(id)()?.OnDrop());
        }
      }
      for (const behaviour of this.ordinary) {
        const key = behaviour.gameObject.key;
        const object = key ? this.bindings.objects[key] : void 0;
        if (!object) continue;
        const id = this.idOf(behaviour);
        const cls = behaviour.constructor;
        if (object.click && this.overrides(behaviour, "Interact") && !explicit.has(`${key}/click/${id}`)) {
          this.addObjectHandler(key, "click", (detail) => {
            if (this.withinReach(behaviour, void 0, cls.interactReach ?? 0, detail)) this.core.guard(`${id}.Interact`, () => behaviour.Interact());
          });
        }
        if (object.grab && this.overrides(behaviour, "OnPickup") && !explicit.has(`${key}/grab/${id}`)) {
          this.addObjectHandler(key, "grab", () => this.core.guard(`${id}.OnPickup`, () => behaviour.OnPickup()));
        }
        if (object.grab && this.overrides(behaviour, "OnDrop") && !explicit.has(`${key}/drop/${id}`)) {
          this.addObjectHandler(key, "drop", () => this.core.guard(`${id}.OnDrop`, () => behaviour.OnDrop()));
        }
      }
    }
    callBound(behaviour, event, detail) {
      const cls = behaviour.constructor;
      if (event.kind === "click" && !this.withinReach(behaviour, event.reach, cls.interactReach ?? 0, detail)) return;
      const fn = behaviour[event.method];
      if (typeof fn !== "function") {
        this.core.log("warn", `${event.behaviour} has no method '${event.method}' (bound to ${event.kind} of ${event.object})`);
        return;
      }
      let argument = detail;
      if (event.kind === "uiSlider") argument = Number(detail.arg ?? "0");
      else if (event.kind === "uiToggle") argument = detail.arg === "1" || detail.arg === "true" || detail.arg === "True";
      else if (event.kind === "field") argument = detail.arg ?? "";
      this.core.guard(`${event.behaviour}.${event.method}`, () => fn.call(behaviour, argument));
    }
    /**
     * True when a click is close enough to count: measured from the nearest of the local head and hands. The reach is
     * the behaviour's own (InteractReach), else the binding's, else the class's, else the game's. With no pose
     * reported yet, every click counts.
     */
    withinReach(behaviour, eventReach, classReach, detail) {
      const own = this.reachOverride.get(behaviour);
      const reach = own !== void 0 ? own : eventReach !== void 0 ? eventReach : classReach > 0 ? classReach : this.game.interactReach ?? 0;
      if (!(reach > 0)) return true;
      const unknown = this.game.reachWhenUnknown !== false;
      const transform = behaviour.gameObject.transform;
      const point = detail.point ?? (transform.known ? transform.position : null);
      if (!point) return unknown;
      const distance = this.nearestDistance(point);
      return distance === null ? unknown : distance <= reach;
    }
    /** Metres from `point` to the nearest of the local head and hands; null when no pose or position is known. */
    nearestDistance(point) {
      const poses = this.poses;
      const from = poses ? [poses.head.position, poses.leftHand.position, poses.rightHand.position] : this.position ? [this.position] : [];
      if (!from.length) return null;
      let nearest = Infinity;
      for (const p of from) nearest = Math.min(nearest, Vector3.Distance(p, point));
      return nearest;
    }
    /** The hand that clicked: the one whose trigger went down in the last second, else the one nearest the point. */
    clickSide(point) {
      const now = this.platform.clock.now();
      const [left, right] = this.triggerAt;
      const recent = Math.max(left, right);
      if (now - recent <= 1e3) return right >= left ? 1 : 0;
      if (!this.poses || !point) return null;
      return Vector3.Distance(this.poses.rightHand.position, point) <= Vector3.Distance(this.poses.leftHand.position, point) ? 1 : 0;
    }
    addObjectHandler(objKey, kind, handler) {
      let kinds = this.objectHandlers.get(objKey);
      if (!kinds) this.objectHandlers.set(objKey, kinds = /* @__PURE__ */ new Map());
      let list = kinds.get(kind);
      if (!list) kinds.set(kind, list = []);
      list.push(handler);
      const wire = `${objKey}/${kind}`;
      const hostObject = this.kit?.objects.get(objKey);
      if (hostObject && !this.hostWired.has(wire)) {
        this.hostWired.add(wire);
        this.core.own(hostObject.on(kind, (detail) => this.dispatchObject(objKey, kind, detail)));
      }
    }
    /** Delivers an object's event to what is bound to it. Also the entry point for events a graph raised. */
    dispatchObject(objKey, kind, detail) {
      if (!this.started || this.core.disposed) return;
      if (kind === "click") {
        if (detail.side === void 0) {
          const side = this.clickSide(detail.point);
          if (side !== null) detail.side = side;
        }
        this.lastClickSide = detail.side === 0 || detail.side === 1 ? detail.side : null;
      }
      const handlers = this.objectHandlers.get(objKey)?.get(kind);
      if (!handlers || !handlers.length) return;
      const run = () => {
        if (this.core.disposed) return;
        for (const handler of handlers.slice()) this.core.guard(`${objKey} ${kind}`, () => handler(detail));
      };
      const object = this.objects.get(objKey);
      if (kind === "drop" && object && object.host) {
        object.transform.Refresh().then(run, run);
        return;
      }
      run();
    }
    addGraphHandler(name, behaviour, method) {
      if (!name) return;
      let list = this.graphHandlers.get(name);
      if (!list) this.graphHandlers.set(name, list = []);
      list.push({ behaviour, method });
    }
    /**
     * Where the app places a player's head (relay op `pkHead`: the SDK's Get User State, which reads the user's Head
     * transform). Resolves null when the app does not know the player or has no body for them yet (it answers 0 0 0), when
     * the kit's relay graph has no `pkHead` op (a kit built before it), or after `seconds`. Unlike a position a page
     * publishes about itself, the app's placing of another player's avatar is not that player's word (found by treasure
     * hunt, whose referee checks a find's reach with it). The continuation runs after the reply's turn, like any promise.
     */
    headOf(player, seconds = 2) {
      if (!player || this.core.disposed) return Promise.resolve(null);
      const id = String(this.nextHeadRequest++);
      return new Promise((resolve) => {
        const timer = this.scheduler.after(Math.max(0, seconds) * 1e3, () => {
          this.headRequests.delete(id);
          resolve(null);
        });
        this.headRequests.set(id, { resolve, timer });
        this.host.request(HEAD_OP, [id, player.sid]);
      });
    }
    onHeadReply(args) {
      const request = this.headRequests.get(args[0] ?? "");
      if (!request) return;
      this.headRequests.delete(args[0]);
      this.scheduler.cancel(request.timer);
      const n2 = args.slice(1, 4).map((v) => typeof v === "string" && v.trim() !== "" ? Number(v) : NaN);
      const known = n2.length === 3 && n2.every((v) => Number.isFinite(v)) && !(n2[0] === 0 && n2[1] === 0 && n2[2] === 0);
      request.resolve(known ? new Vector3(n2[0], n2[1], n2[2]) : null);
    }
    onGraphEvent(name, args) {
      if (this.core.disposed) return;
      if (name === HEAD_EVENT) {
        this.onHeadReply(args);
        return;
      }
      if (!this.started) {
        if (this.earlyGraphEvents.length < MAX_EARLY_EVENTS) this.earlyGraphEvents.push({ name, args });
        return;
      }
      if (OBJECT_EVENTS.indexOf(name) >= 0) {
        const key = this.keyOfTarget(args[0] ?? "");
        if (!key) return;
        const detail = { arg: args[1], args: args.slice(1) };
        if (name.startsWith("collision") || name.startsWith("trigger")) {
          const n2 = args.slice(2, 8).map(Number);
          if (args[1] !== void 0) detail.otherName = args[1];
          if (n2.length >= 3 && n2.slice(0, 3).every(Number.isFinite)) detail.point = new Vector3(n2[0], n2[1], n2[2]);
          if (n2.length >= 6 && n2.slice(3, 6).every(Number.isFinite)) detail.normal = new Vector3(n2[3], n2[4], n2[5]);
        }
        if (name.startsWith("held") && args[1] === "left") detail.side = 0;
        else if (name.startsWith("held") && args[1] === "right") detail.side = 1;
        this.dispatchObject(key, name, detail);
        return;
      }
      const handlers = this.graphHandlers.get(name);
      if (!handlers) return;
      for (const handler of handlers.slice()) {
        const behaviour = typeof handler.behaviour === "function" ? handler.behaviour() : handler.behaviour;
        const method = handler.method;
        if (!behaviour) continue;
        const fn = behaviour[method];
        if (typeof fn === "function") this.core.guard(`${this.idOf(behaviour)}.${method}`, () => fn.apply(behaviour, args));
      }
    }
    /** A relay target ("3", "@Board/Cup") or a binding key, as a binding key. */
    keyOfTarget(target) {
      if (target.startsWith("@")) {
        const path = target.slice(1);
        for (const key of Object.keys(this.bindings.objects)) if (this.bindings.objects[key].path === path) return key;
        return null;
      }
      if (/^\d+$/.test(target)) return this.bindings.refs[Number(target)] ?? null;
      return target in this.bindings.objects ? target : null;
    }
    /** The local player was moved (teleported): the last poses no longer say where they are, until the next one. */
    moved(position) {
      this.position = position.clone();
      this.poses = null;
    }
    onPose(poses) {
      this.poses = poses;
      this.position = poses.head.position;
    }
    onInput(event) {
      if (this.core.disposed) return;
      if (event.type === "button") {
        const id = `${event.side}/${event.button}`;
        if (event.pressed && event.button === 0) this.triggerAt[event.side] = this.platform.clock.now();
        if (event.pressed) this.buttons.add(id);
        else this.buttons.delete(id);
        const { button, side } = event;
        if (event.pressed) this.each("OnButtonPressed", (b) => b.OnButtonPressed(button, side));
        else this.each("OnButtonReleased", (b) => b.OnButtonReleased(button, side));
      } else if (event.type === "thumbstick") {
        this.sticks[event.side] = new Vector2(event.x, event.y);
      } else if (event.type === "trigger") {
        this.triggers[event.side] = event.value;
      } else {
        const key = event.key;
        if (event.pressed) this.keys.add(key);
        else this.keys.delete(key);
        if (event.pressed) this.each("OnKeyPressed", (b) => b.OnKeyPressed(key));
        else this.each("OnKeyReleased", (b) => b.OnKeyReleased(key));
      }
    }
    // ---- the tick -----------------------------------------------------------------------------------------------
    tick() {
      const { core } = this;
      if (core.disposed) return;
      for (const behaviour of this.all()) {
        if (this.overrides(behaviour, "Update")) core.guard(`${this.idOf(behaviour)}.Update`, () => behaviour.Update());
      }
      this.sync.flush();
      this.perUser.flush();
      this.presence.flush();
      this.host.flush();
      if (this.scheduler.ticks % 20 === 0) {
        this.presence.tend();
        this.players.tend();
        this.secrets.review();
        this.commands.review();
        this.sync.takeOver();
        if (this.platform.clock.now() - this.lastClockAsk >= core.options.clockResyncMs) void this.askClock(false);
      }
    }
    // ---- refused writes -----------------------------------------------------------------------------------------
    onRefusedPath(key, code, final) {
      if (this.core.disposed) return;
      this.core.log(final ? "error" : "warn", `the room ${final ? "refused" : "is holding back"} a write to ${key}: ${code}`);
      if (key === "d" || /^p[0-3]$/.test(key)) {
        this.refuse(null, { kind: key === "d" ? "playerData" : "playerObject", code, key, final });
        return;
      }
      if (key.startsWith("x.")) {
        this.refuse(null, { kind: "protected", code, key: key.slice(2), final });
        return;
      }
      const slot = this.sync.slotForKey(key);
      if (!slot) {
        this.refuse(null, { kind: "state", code, key, final });
        return;
      }
      for (const member of slot.members) {
        if (final && !key.startsWith("o.")) this.core.guard("OnPostSerialization", () => member.behaviour.OnPostSerialization({ success: false, byteCount: 0 }));
        this.core.guard("OnWriteRefused", () => member.behaviour.OnWriteRefused({ kind: "state", code, key, final }));
      }
    }
    /** Reports a refusal to the behaviour it belongs to, or to every behaviour that listens and to the game. */
    refuse(behaviour, refusal) {
      if (behaviour) {
        this.core.guard("OnWriteRefused", () => behaviour.OnWriteRefused(refusal));
        return;
      }
      this.each("OnWriteRefused", (b) => b.OnWriteRefused(refusal));
      if (this.game.onWriteRefused) this.core.guard("onWriteRefused", () => this.game.onWriteRefused(refusal));
    }
    // ---- inspection and teardown --------------------------------------------------------------------------------
    /** An ordinary behaviour by its bindings id (for tests and for the page registry). */
    behaviour(id) {
      const found = this.byId.get(id);
      if (!found) throw new Error(`no behaviour '${id}' in ${this.core.slug}:${this.inst}`);
      return found;
    }
    /** A per-player behaviour: the copy of `id` that belongs to the player with session `sid`. */
    playerBehaviour(sid, id) {
      return this.playerBehaviourMap.get(sid)?.get(id) ?? null;
    }
    /** A short hash of every synced field: equal on clients that agree. */
    digest() {
      var _a;
      const perPlayer = this.perUser.snapshot();
      const text = this.sync.snapshotText();
      if (!perPlayer.length) return fnv1a(text);
      const players = {};
      for (const copy of perPlayer) (players[_a = copy.sid] ?? (players[_a] = {}))[copy.id] = copy.fields;
      return fnv1a(text + "\n" + canonicalJson(players));
    }
    /**
     * Which writes this client's synced state is made of: "<writes>:<hash>", where writes is the sum of the sequence
     * numbers applied per leaf and the hash covers each leaf's (generation, sequence, writer). Two pages with the same
     * version hold the same writes, so their digests can be compared; a field that ticks on its own (a referee's timer)
     * moves the version, and a test waits until both pages report the same one. `stamp()` reads both at once.
     */
    version() {
      const parts = [];
      let writes = 0;
      for (const id of [...this.sync.slots.keys()].sort()) {
        const marker = this.sync.slots.get(id).applied;
        if (!marker) continue;
        writes += marker.n;
        parts.push(`${id}:${marker.g}.${marker.n}.${marker.w}`);
      }
      for (const copy of this.perUser.snapshot()) {
        writes += copy.n;
        parts.push(`${copy.sid}/${copy.id}:${copy.n}`);
      }
      return `${writes}:${fnv1a(parts.join("|"))}`;
    }
    dispose() {
      const { core } = this;
      if (core.disposed) return;
      if (this.started) for (const behaviour of this.all()) core.guard("OnDestroy", () => behaviour.OnDestroy());
      for (const ability of this.abilitiesOff) this.platform.setAbility(ability, true);
      for (const control of this.blocksOn) this.platform.setBlock(control, false);
      this.presence.retire();
      this.perUser.retire();
      this.host.abandonClock();
      this.platform.expose(relayKey(core.slug, core.inst), null);
      core.dispose();
      this.kit?.destroy();
      this.kit = null;
      this.ready.resolve(false);
    }
  };
  function triple(text, uniform) {
    if (!text) return null;
    const parts = text.trim().split(/\s+/).map(Number);
    if (parts.some((n2) => !Number.isFinite(n2))) return null;
    if (parts.length === 3) return new Vector3(parts[0], parts[1], parts[2]);
    if (uniform && parts.length === 1) return new Vector3(parts[0], parts[0], parts[0]);
    return null;
  }

  // portkit/src/boot.ts
  var RUNTIME_VERSION = "0.1.0";
  var GameRuntime = class {
    constructor(platform, game2, bindings) {
      __publicField(this, "platform");
      __publicField(this, "game");
      __publicField(this, "bindings");
      /** Running instances by instance key. */
      __publicField(this, "instances", /* @__PURE__ */ new Map());
      /** One object for every instance of this game on the page (Behaviour.Shared): page memory, not synced or saved. */
      __publicField(this, "shared", {});
      __publicField(this, "stopped", false);
      __publicField(this, "unsubs", []);
      this.platform = platform;
      this.game = game2;
      this.bindings = bindings;
    }
    /** Waits for the page, then serves every element of this game, now and later. */
    async start() {
      await this.platform.whenReady();
      if (this.stopped) return;
      this.unsubs.push(this.platform.onSnippetsChanged(() => this.scan()));
      this.unsubs.push(
        this.platform.onSessionChanged(() => {
          this.platform.log("warn", `[${this.game.slug}] the session changed; restarting every instance`);
          for (const instance of this.instances.values()) instance.dispose();
          this.instances.clear();
          this.scan();
        })
      );
      this.scan();
    }
    /** Brings the running instances in line with the elements on the page. */
    scan() {
      if (this.stopped) return;
      const wanted = /* @__PURE__ */ new Map();
      for (const element of this.platform.snippets(this.game.slug)) {
        if (!element.connected || !element.active) continue;
        const key = instanceKeyFor({ room: element.getAttribute("room"), instance: element.getAttribute("instance") }, element.index);
        if (wanted.has(key)) {
          this.platform.log("warn", `[${this.game.slug}] two elements resolve to instance '${key}' (same room or instance attribute); the second is ignored`);
          continue;
        }
        wanted.set(key, element);
      }
      for (const [key, instance] of [...this.instances]) {
        if (wanted.get(key) === instance.element) continue;
        instance.dispose();
        this.instances.delete(key);
      }
      for (const [key, element] of wanted) {
        if (this.instances.has(key)) continue;
        const instance = new GameInstance(this.platform, this.game, this.bindings, element, key, this.shared);
        this.instances.set(key, instance);
        void instance.start();
      }
    }
    instance(key) {
      return this.instances.get(key);
    }
    stop() {
      this.stopped = true;
      for (const unsub of this.unsubs.splice(0)) unsub();
      for (const instance of this.instances.values()) instance.dispose();
      this.instances.clear();
    }
  };
  function boot(platform, game2, rawBindings) {
    if (!isValidSlug(game2.slug)) throw new Error(`'${game2.slug}' is not a valid slug`);
    const bindings = validateBindings(rawBindings);
    if (bindings.slug !== game2.slug) throw new Error(`bindings.json is for '${bindings.slug}', the game is '${game2.slug}'`);
    if (!platform.claimGame(game2.slug, { runtime: RUNTIME_VERSION, bindings: bindings.hash ?? "" })) return null;
    const runtime = new GameRuntime(platform, game2, bindings);
    runtime.start().catch((error) => platform.log("error", `[${game2.slug}] could not start: ${error instanceof Error ? error.message : String(error)}`));
    return runtime;
  }

  // portkit/src/types.ts
  var DEFAULT_LIMITS = {
    maxLeafBytes: 16384,
    maxRoomKeys: 2048,
    oneShotMaxBytes: 4089,
    maxUserKeys: 64
  };
  var Hand = { Left: 0, Right: 1 };
  var Button = { Trigger: 0, Grip: 1, Primary: 2, Secondary: 3, ThumbstickClick: 4 };

  // src/GolfBallImpact.ts
  var SILENT_SURFACE = "Green Playing Surface";
  function ImpactPlaysSound(otherName) {
    return otherName !== SILENT_SURFACE;
  }

  // src/AudioManager.ts
  function ChooseIndex(count, previousIndex, rangeInt) {
    if (count === 1) return 0;
    if (previousIndex < 0) return rangeInt(0, count);
    let index = rangeInt(0, count - 1);
    if (index >= previousIndex) index++;
    return index;
  }
  var AudioManager = class {
    constructor(shotClips, holeClips, collisionClip, rangeInt) {
      __publicField(this, "shotClips");
      __publicField(this, "holeClips");
      __publicField(this, "collisionClip");
      __publicField(this, "rangeInt");
      __publicField(this, "previousShotIndex", -1);
      __publicField(this, "previousHoleIndex", -1);
      /** For tests: the clip each play chose. */
      __publicField(this, "LastPlayedSfx", null);
      this.shotClips = shotClips ?? [];
      this.holeClips = holeClips ?? [];
      this.collisionClip = collisionClip ?? null;
      this.rangeInt = rangeInt;
    }
    PlayShotSfx(source) {
      if (!this.shotClips.length) return;
      this.previousShotIndex = ChooseIndex(this.shotClips.length, this.previousShotIndex, this.rangeInt);
      this.PlayOneShot(source, this.shotClips[this.previousShotIndex]);
    }
    PlayHoleSfx(source) {
      if (!this.holeClips.length) return;
      this.previousHoleIndex = ChooseIndex(this.holeClips.length, this.previousHoleIndex, this.rangeInt);
      this.PlayOneShot(source, this.holeClips[this.previousHoleIndex]);
    }
    /** Upstream assigns no collision clip (H4), so this plays nothing unless the kit adds one. */
    PlayCollisionSfx(source) {
      if (this.collisionClip) this.PlayOneShot(source, this.collisionClip);
    }
    PlayOneShot(source, clip) {
      this.LastPlayedSfx = clip;
      source?.PlayOneShot(clip);
    }
  };

  // src/CameraImpactShake.ts
  var IMPACT = { cooldown: 0.18, minimumImpact: 0.35, fullImpact: 7.5 };
  var CameraImpactShake = class {
    constructor() {
      __publicField(this, "nextAllowedImpact", 0);
    }
    /**
     * RegisterImpact (:28-40): the haptic strength for an impact at `collisionVelocity`, or null when it is too weak or
     * inside the cooldown. `now` is unscaled seconds.
     */
    RegisterImpact(collisionVelocity, now) {
      if (Math.fround(collisionVelocity) < Math.fround(IMPACT.minimumImpact) || now < this.nextAllowedImpact) return null;
      const strength = Mathf.InverseLerp(IMPACT.minimumImpact, IMPACT.fullImpact, collisionVelocity);
      const haptic = Mathf.Lerp(0.2, 0.9, strength);
      this.nextAllowedImpact = now + IMPACT.cooldown;
      return haptic;
    }
  };

  // src/GolfRelay.ts
  var n = relayNumber;
  var v3 = (v) => [n(v.x), n(v.y), n(v.z)];
  var GolfRelay = class {
    constructor(host) {
      __publicField(this, "host");
      this.host = host;
    }
    /** An op whose latest value is all that matters: an unchanged value is not sent again. */
    value(op, target, property, args) {
      this.host.op(op, target, args, property);
    }
    /** An op that must run every time it is asked for. */
    event(op, target, args) {
      this.host.op(op, target, args);
    }
    /** `Rigidbody.AddForce(impulse, ForceMode.Impulse)` on the ball (MinimalGolfGame.cs:542); the graph then watches
     * for the ball to come to rest after shot `shot` and reports `golfRest`. */
    impulse(ball, impulse, shot) {
      this.event("impulse", ball, [...v3(impulse), String(shot)]);
    }
    /** Puts the ball at a world position at rest: velocities zero, scale 1, dynamic, interpolated (InstantiateBallAtSpawn). */
    place(ball, position, shot) {
      this.event("place", ball, [...v3(position), String(shot)]);
    }
    /** Arms or disarms the ball's fixed-step cup assist and capture test (MinimalGolfGame.cs:351-388). */
    assist(ball, armed, hole, t) {
      const args = armed ? ["1", ...v3(hole), n(t.assistRadius), n(t.captureRadius), n(t.maximumAssistedSpeed), n(t.maximumCaptureSpeed), n(t.minimumPullAcceleration), n(t.maximumPullAcceleration), n(t.playableSpeed)] : ["0"];
      this.value("assist", ball, "assist", args);
    }
    /** The capture move (MinimalGolfGame.cs:659-692): centre over the hole while dropping `centerDrop` and scaling to 0.88
     * over 0.10 s, then sink to `sinkDepth` below the hole centre while scaling to 0.08 over 0.52 s. */
    sink(ball, hole, centerDrop, sinkDepth) {
      this.event("sink", ball, [...v3(hole), n(centerDrop), n(sinkDepth)]);
    }
    /** The aiming line (LineRenderer, two world points, MinimalGolfGame.cs:492-526). */
    line(target, enabled, from, to, width, color) {
      const q = (x) => n(Math.round(x * 1e4) / 1e4);
      const args = enabled ? ["1", q(from.x), q(from.y), q(from.z), q(to.x), q(to.y), q(to.z), n(width), q(color.r), q(color.g), q(color.b), q(color.a)] : ["0"];
      this.value("line", target, "line", args);
    }
    /** Starts the level's baked reveal clip `secondsIn` seconds in (late joiners join part-way). */
    reveal(level, secondsIn) {
      this.event("reveal", level, [n(Math.max(0, secondsIn))]);
    }
    /** The reveal-volume shader globals (RevealVolumeManager.PushGlobals): up to two spheres. */
    xray(target, volumes) {
      const q = (x) => n(Math.round(x * 1e3) / 1e3);
      const args = [String(Math.min(2, volumes.length))];
      for (const v of volumes.slice(0, 2)) args.push(q(v.center.x), q(v.center.y), q(v.center.z), n(v.radius), n(v.softness));
      this.value("xray", target, "xray", args);
    }
    /** The height of a uGUI graphic's RectTransform.sizeDelta, its width kept (the progress pips, VRGolfUI.cs:194-195). */
    uiHeight(target, height) {
      this.value("uiHeight", target, "uiHeight", [n(height)]);
    }
    /** The alpha of every graphic under a canvas (CanvasGroup.alpha, which is not on the allow-list). */
    fade(target, alpha) {
      this.value("fade", target, "fade", [n(Math.round(alpha * 100) / 100)]);
    }
  };

  // src/GolfRound.ts
  var HOLES = 8;
  var MAX_SLOTS = 8;
  var SEAT_GRACE = 30;
  var MAX_ROWS = 24;
  var NAME_MAX = 24;
  var MISSED_OVER_PAR = 2;
  function newRow(uid, name, slot, joined) {
    return { uid, name: name.slice(0, NAME_MAX), slot, joined, strokes: new Array(HOLES).fill(null), marks: new Array(HOLES).fill(""), left: false, leftAt: 0, seen: 0 };
  }
  function missedScore(strokesSoFar, par, strokeLimit) {
    const strokes = Math.max(0, Math.trunc(strokesSoFar));
    if (strokeLimit > 0) return Math.max(strokeLimit, strokes);
    return Math.max(strokes + 1, par + MISSED_OVER_PAR);
  }
  function makeRoom(rows) {
    const out = rows.slice();
    while (out.length >= MAX_ROWS) {
      let drop = -1;
      out.forEach((r, i) => {
        if (r.slot < 0 && r.left && (drop < 0 || r.leftAt < out[drop].leftAt)) drop = i;
      });
      if (drop < 0) break;
      out.splice(drop, 1);
    }
    return out;
  }
  function rowOf(rows, uid) {
    return rows.find((r) => r.uid === uid) ?? null;
  }
  function rowInSlot(rows, slot) {
    return slot < 0 ? null : rows.find((r) => r.slot === slot) ?? null;
  }
  function freeSlot(rows, maxPlayers) {
    for (let s = 0; s < Math.min(MAX_SLOTS, maxPlayers); s++) if (!rows.some((r) => r.slot === s)) return s;
    return -1;
  }
  function joinHole(currentHole, holeDecided, courseComplete) {
    if (courseComplete) return HOLES;
    return holeDecided ? currentHole + 1 : currentHole;
  }
  function activeRows(rows, hole) {
    return rows.filter((r) => r.slot >= 0 && !r.left && r.joined <= hole);
  }
  function isFinished(row, hole) {
    return row.strokes[hole] !== null && row.strokes[hole] !== void 0;
  }
  function holeFinished(rows, hole) {
    const active = activeRows(rows, hole);
    return active.length > 0 && active.every((r) => isFinished(r, hole));
  }
  function record(row, hole, strokes, mark) {
    if (hole < 0 || hole >= HOLES || isFinished(row, hole)) return false;
    row.strokes[hole] = Math.max(0, Math.trunc(strokes));
    row.marks[hole] = mark;
    return true;
  }
  function rowTotal(row) {
    let total = 0;
    for (const s of row.strokes) if (s !== null) total += s;
    return total;
  }
  function releaseSeats(rows, now) {
    let changed = false;
    for (const row of rows) {
      if (row.left && row.slot >= 0 && now - row.leftAt >= SEAT_GRACE) {
        row.slot = -1;
        changed = true;
      }
    }
    return changed;
  }
  function resetCard(rows) {
    return rows.filter((r) => !r.left && r.slot >= 0).map((r) => newRow(r.uid, r.name, r.slot, 0));
  }
  function sortedRows(rows) {
    return rows.slice().sort((a, b) => (a.slot < 0 ? 99 : a.slot) - (b.slot < 0 ? 99 : b.slot) || a.uid.localeCompare(b.uid));
  }
  var pad = (text, width) => text.length >= width ? text.slice(0, width) : text + " ".repeat(width - text.length);
  var padLeft = (text, width) => text.length >= width ? text : " ".repeat(width - text.length) + text;
  function cellText(row, hole, currentHole) {
    const s = row.strokes[hole];
    if (s !== null && s !== void 0) return String(s) + (row.marks[hole] === "max" ? "x" : row.marks[hole] === "dnf" ? "?" : "");
    if (hole < row.joined) return "-";
    return hole === currentHole && !row.left && row.slot >= 0 ? "." : "";
  }
  function headerLine() {
    let line = pad("PLAYER", 12);
    for (let h = 0; h < HOLES; h++) line += padLeft(String(h + 1), 4);
    return line + padLeft("TOT", 5);
  }
  function parLine(pars) {
    let line = pad("PAR", 12);
    for (let h = 0; h < HOLES; h++) line += padLeft(String(pars[h] ?? ""), 4);
    return line + padLeft(String(pars.reduce((a, b) => a + b, 0)), 5);
  }
  function rowLine(row, currentHole) {
    const name = row.left ? `(${row.name})` : row.name;
    let line = pad(name, 12);
    for (let h = 0; h < HOLES; h++) line += padLeft(cellText(row, h, currentHole), 4);
    return line + padLeft(String(rowTotal(row)), 5);
  }

  // src/LevelRevealAnimator.ts
  var REVEAL = {
    startDelay: 0.08,
    partDuration: 0.55,
    partStagger: 0.055,
    revealDistance: 6
  };
  var REVEAL_DIRECTIONS = [Vector3.left, Vector3.right, Vector3.up, Vector3.down, Vector3.forward, Vector3.back];
  function easeInOut(t) {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    return t * t * (3 - 2 * t);
  }
  var LevelRevealAnimator = class {
    constructor(partCount) {
      __publicField(this, "PartCount");
      this.PartCount = partCount;
    }
    /** LevelRevealAnimator.cs:38. */
    get TotalDuration() {
      return REVEAL.startDelay + REVEAL.partDuration + Math.max(0, this.PartCount - 1) * REVEAL.partStagger;
    }
    /** `IsPlaying` for a reveal that started `elapsed` seconds ago (true until the loop has covered TotalDuration). */
    IsPlaying(elapsed) {
      return this.PartCount > 0 && elapsed < this.TotalDuration;
    }
    /** LevelRevealAnimator.cs:142-152. */
    GetRevealOffset(index) {
      return REVEAL_DIRECTIONS[index % REVEAL_DIRECTIONS.length].normalized.scale(REVEAL.revealDistance);
    }
    /** The eased progress of part `index` (LevelRevealAnimator.cs:91-93). */
    PartProgress(index, elapsed) {
      const partElapsed = elapsed - REVEAL.startDelay - index * REVEAL.partStagger;
      return easeInOut(Math.min(1, Math.max(0, partElapsed / Math.max(0.05, REVEAL.partDuration))));
    }
    /** Where part `index` is relative to its authored local position (LerpUnclamped(reveal, authored, eased)). */
    PartOffset(index, elapsed) {
      if (!this.IsPlaying(elapsed)) return Vector3.zero;
      return this.GetRevealOffset(index).scale(1 - this.PartProgress(index, elapsed));
    }
  };

  // src/levels.json
  var levels_default = {
    note: "Generated by tools/levels-from-port.ts from PORT.md 5.3 and 5.1 (the upstream scene). Do not edit.",
    levels: [
      {
        index: 0,
        levelName: "THE WARM UP",
        par: 2,
        courseWidth: 4.4,
        courseLength: 10.5,
        ballSpawn: [
          0,
          0.29,
          -4.05
        ],
        holeCenter: [
          0,
          0.11,
          4.15
        ],
        revealParts: 12,
        slot: [
          0,
          0,
          0
        ]
      },
      {
        index: 1,
        levelName: "THE GARDEN",
        par: 3,
        courseWidth: 6.2,
        courseLength: 14.5,
        ballSpawn: [
          -1.5,
          0.29,
          -6
        ],
        holeCenter: [
          1.55,
          0.11,
          5.95
        ],
        revealParts: 19,
        slot: [
          10,
          0,
          19
        ]
      },
      {
        index: 2,
        levelName: "WINDMILL WAY",
        par: 4,
        courseWidth: 7,
        courseLength: 20,
        ballSpawn: [
          0,
          0.29,
          -8.45
        ],
        holeCenter: [
          1.65,
          0.11,
          8.25
        ],
        revealParts: 21,
        slot: [
          -10,
          0,
          19
        ]
      },
      {
        index: 3,
        levelName: "BUMPER BEND",
        par: 4,
        courseWidth: 7.4,
        courseLength: 18,
        ballSpawn: [
          -1.55,
          0.29,
          -7.55
        ],
        holeCenter: [
          1.55,
          0.11,
          7.45
        ],
        revealParts: 20,
        slot: [
          -20,
          0,
          49
        ]
      },
      {
        index: 4,
        levelName: "GRAND TOUR",
        par: 5,
        courseWidth: 8.5,
        courseLength: 21.5,
        ballSpawn: [
          0,
          0.29,
          -9.25
        ],
        holeCenter: [
          0,
          0.11,
          9.2
        ],
        revealParts: 22,
        slot: [
          20,
          0,
          49
        ]
      },
      {
        index: 5,
        levelName: "HILLSIDE TURN",
        par: 4,
        courseWidth: 11.5,
        courseLength: 15,
        ballSpawn: [
          -3.25,
          0.29,
          -6.25
        ],
        holeCenter: [
          4.35,
          0.11,
          5
        ],
        revealParts: 27,
        slot: [
          -30,
          0,
          69
        ]
      },
      {
        index: 6,
        levelName: "EASY ASCENT",
        par: 4,
        courseWidth: 7.5,
        courseLength: 13.3,
        ballSpawn: [
          0,
          0.29,
          -5.35
        ],
        holeCenter: [
          -3.055,
          0.11,
          1.463
        ],
        revealParts: 20,
        slot: [
          30,
          0,
          69
        ]
      },
      {
        index: 7,
        levelName: "SUMMIT RUN",
        par: 6,
        courseWidth: 8.5,
        courseLength: 13.3,
        ballSpawn: [
          0,
          0.29,
          -5.25
        ],
        holeCenter: [
          0.65,
          1.11,
          5.3
        ],
        revealParts: 19,
        slot: [
          -40,
          0,
          89
        ]
      }
    ]
  };

  // src/MiniGolfLevel.ts
  var UPSTREAM_TABLE_SCALE = 0.05;
  var CourseFrame = class _CourseFrame {
    constructor(position = Vector3.zero, rotation = Quaternion.identity, holderScale = 1, tableScale = UPSTREAM_TABLE_SCALE) {
      __publicField(this, "position");
      __publicField(this, "rotation");
      /** Holder scale times table scale: world metres per course unit. */
      __publicField(this, "worldScale");
      __publicField(this, "tableScale");
      this.position = position.clone();
      this.rotation = rotation.clone();
      this.worldScale = holderScale * tableScale;
      this.tableScale = tableScale;
    }
    /** How much bigger than upstream the table is: every world distance, speed and impulse of the tuning is scaled by it. */
    get factor() {
      return this.worldScale / UPSTREAM_TABLE_SCALE;
    }
    static fromSettings(settings) {
      const vec = (text) => {
        if (!text) return null;
        const parts = text.trim().split(/\s+/).map(Number);
        return parts.every((p2) => Number.isFinite(p2)) ? parts : null;
      };
      const p = vec(settings.get("position"));
      const r = vec(settings.get("rotation"));
      const s = vec(settings.get("scale"));
      const t = Number(settings.get("table-scale") ?? "");
      return new _CourseFrame(
        p && p.length === 3 ? new Vector3(p[0], p[1], p[2]) : Vector3.zero,
        r && r.length === 3 ? Quaternion.Euler(r[0], r[1], r[2]) : Quaternion.identity,
        s && s.length >= 1 && s[0] > 0 ? s[0] : 1,
        Number.isFinite(t) && t > 0 ? t : UPSTREAM_TABLE_SCALE
      );
    }
    /** Course space (VRCourseLevels' local space) to world space. */
    toWorld(course) {
      return this.position.add(this.rotation.rotate(course.scale(this.worldScale)));
    }
    /** World space to course space. */
    toCourse(world) {
      return this.rotation.inverse.rotate(world.sub(this.position)).scale(1 / this.worldScale);
    }
  };
  var MiniGolfLevel = class {
    constructor(entry) {
      __publicField(this, "index");
      __publicField(this, "levelName");
      __publicField(this, "par");
      __publicField(this, "courseWidth");
      __publicField(this, "courseLength");
      /** "Ball Reset Point", level-local. */
      __publicField(this, "ballSpawn");
      /** "Hole Center - Cup Assist Target", level-local. */
      __publicField(this, "holeCenter");
      __publicField(this, "revealAnimator");
      /** This level's authored slot under VRCourseLevels (its position before any swap). */
      __publicField(this, "authoredPosition");
      /** True where PORT.md says the scene value was computed and is to be confirmed in the editor (level 7's hole). */
      __publicField(this, "provisional");
      this.index = entry.index;
      this.levelName = entry.levelName;
      this.par = entry.par;
      this.courseWidth = entry.courseWidth;
      this.courseLength = entry.courseLength;
      this.ballSpawn = new Vector3(...entry.ballSpawn);
      this.holeCenter = new Vector3(...entry.holeCenter);
      this.revealAnimator = new LevelRevealAnimator(entry.revealParts);
      this.authoredPosition = new Vector3(...entry.slot);
      this.provisional = entry.provisional === true;
    }
    /** `transform.InverseTransformPoint` for a level sitting at `localPosition` (its current slot) in the course. */
    InverseTransformPoint(world, frame, localPosition) {
      return frame.toCourse(world).sub(localPosition);
    }
    TransformPoint(local, frame, localPosition) {
      return frame.toWorld(localPosition.add(local));
    }
    /** MiniGolfLevel.cs:49-55. */
    IsOutsideCourse(worldPosition, frame, localPosition) {
      const local = this.InverseTransformPoint(worldPosition, frame, localPosition);
      return IsOutsideLocal(local, this.courseWidth, this.courseLength);
    }
  };
  function IsOutsideLocal(local, courseWidth, courseLength) {
    return local.y < -2.25 || Math.abs(local.x) > courseWidth * 0.5 + 2.5 || Math.abs(local.z) > courseLength * 0.5 + 2.5;
  }
  var LEVELS = levels_default.levels.map((entry) => new MiniGolfLevel(entry));
  var SLOTS = LEVELS.map((l) => l.authoredPosition);
  var TOTAL_PAR = LEVELS.reduce((sum, l) => sum + l.par, 0);

  // src/MinimalGolfGame.ts
  var TUNING = {
    maximumImpulse: 2,
    minimumImpulse: 5e-3,
    playableSpeed: 0.1,
    vrMaximumDragDistance: 0.16,
    vrMinShotPower: 1e-3,
    assistRadius: 0.04,
    captureRadius: 8e-3,
    maximumAssistedSpeed: 0.6,
    maximumCaptureSpeed: 0.35,
    minimumPullAcceleration: 0.35,
    maximumPullAcceleration: 1.2,
    aimingLineWidth: 0.01,
    vrAimingLineMinLength: 0,
    vrAimingLineMaxLength: 0.3,
    clubReach: 0.11 + 0.08,
    // FIX K4: upstream drops 0.055 m and sinks 0.32 m in world metres (MinimalGolfGame.cs:662, 679), numbers from before
    // the course was put on a 1:20 table, so a 1.6 cm ball sank 32 cm, far through the 2.5 cm base. Scaled to the table.
    centerDrop: 0.055 * 0.05,
    sinkDepth: 0.32 * 0.05,
    revealRadius: 0.075,
    revealSoftness: 0.02
  };
  function scaledTuning(factor) {
    const out = { ...TUNING };
    for (const key of Object.keys(out)) if (key !== "vrMinShotPower") out[key] = TUNING[key] * factor;
    return out;
  }
  var CENTERING_SECONDS = 0.1;
  var SINKING_SECONDS = 0.52;
  var ADVANCE_SECONDS = 2.05;
  var MESSAGE_SECONDS = { level: 1.65, standard: 1.25, hole: 2.2, restarted: 1 };
  function LevelMessage(index, levelName) {
    return "LEVEL " + (index + 1) + "  \u2022  " + levelName;
  }
  function HoleResult(strokes, par) {
    return strokes < par ? "UNDER PAR!" : strokes === par ? "ON PAR!" : "+" + (strokes - par) + " OVER PAR";
  }
  function HoleCompleteMessage(strokes, par) {
    return "HOLE COMPLETE  \u2022  " + HoleResult(strokes, par);
  }
  var GolfAim = class {
    constructor(tuning = TUNING) {
      __publicField(this, "dragging", false);
      __publicField(this, "dragStartWorld", Vector3.zero);
      __publicField(this, "aimDirection", Vector3.zero);
      __publicField(this, "shotPower", 0);
      __publicField(this, "tuning");
      this.tuning = tuning;
    }
    /** BeginVRAim (:391-413). `canTakeAction` is CanTakeAction(); false means "WAIT FOR THE BALL" and no aim. */
    BeginVRAim(startWorld, ballY, canTakeAction) {
      if (!canTakeAction) return false;
      this.dragging = true;
      this.dragStartWorld = new Vector3(startWorld.x, ballY, startWorld.z);
      this.aimDirection = Vector3.zero;
      this.shotPower = 0;
      return true;
    }
    /** UpdateVRAim (:415-428): pull = start - hand, horizontal; full power at vrMaximumDragDistance. */
    UpdateVRAim(currentWorld) {
      if (!this.dragging) return;
      const current = new Vector3(currentWorld.x, this.dragStartWorld.y, currentWorld.z);
      const pull = this.dragStartWorld.sub(current);
      pull.y = 0;
      const effectiveMax = Math.max(0.05 * (this.tuning.vrMaximumDragDistance / TUNING.vrMaximumDragDistance), this.tuning.vrMaximumDragDistance);
      const distance = Math.min(pull.magnitude, effectiveMax);
      this.shotPower = Mathf.Clamp01(distance / effectiveMax);
      this.aimDirection = pull.sqrMagnitude > 1e-6 ? pull.normalized : Vector3.zero;
    }
    /**
     * TryEndVRAimAndShoot (:430-456) with TryApplyShot (:528-550): the impulse to apply, or null when nothing is shot
     * (no stroke). `canTakeAction` is CanTakeAction() at release.
     */
    TryEndVRAimAndShoot(canTakeAction) {
      if (!this.dragging) return null;
      this.dragging = false;
      const minPower = this.tuning.vrMinShotPower;
      if (this.shotPower < minPower || this.aimDirection.sqrMagnitude < 1e-3) {
        this.shotPower = 0;
        this.aimDirection = Vector3.zero;
        return null;
      }
      if (!canTakeAction) {
        this.shotPower = 0;
        this.aimDirection = Vector3.zero;
        return null;
      }
      const impulse = this.TryApplyShot(this.aimDirection, this.shotPower, canTakeAction);
      this.shotPower = 0;
      this.aimDirection = Vector3.zero;
      return impulse;
    }
    /** TryApplyShot (:528-550): impulse = lerp(minimumImpulse, maximumImpulse, power) along the horizontal direction. */
    TryApplyShot(direction, power, canTakeAction) {
      if (!canTakeAction) return null;
      const d = new Vector3(direction.x, 0, direction.z);
      if (d.sqrMagnitude < 1e-4) return null;
      const unit = d.normalized;
      const p = Mathf.Clamp01(power);
      if (p < this.tuning.vrMinShotPower) return null;
      const impulse = Mathf.Lerp(this.tuning.minimumImpulse, this.tuning.maximumImpulse, p);
      return unit.scale(impulse);
    }
    /** CancelAim (:478-490). */
    CancelAim() {
      this.dragging = false;
      this.shotPower = 0;
      this.aimDirection = Vector3.zero;
    }
  };
  function AimLineLength(power, direction, tuning = TUNING) {
    if (direction.sqrMagnitude < 1e-4) return 0;
    return Mathf.Lerp(tuning.vrAimingLineMinLength, tuning.vrAimingLineMaxLength, power);
  }
  var LOW = new Color(137 / 255, 224 / 255, 179 / 255, 1);
  var MIDDLE = new Color(243 / 255, 201 / 255, 107 / 255, 1);
  var HIGH = new Color(225 / 255, 130 / 255, 47 / 255, 1);
  function AimLineColor(power) {
    return power < 0.55 ? Color.Lerp(LOW, MIDDLE, power / 0.55) : Color.Lerp(MIDDLE, HIGH, (power - 0.55) / 0.45);
  }
  function SwapLayout(slotOf, previous, next) {
    const out = slotOf.slice();
    if (previous >= 0 && previous !== next) {
      const a = out[previous];
      out[previous] = out[next];
      out[next] = a;
    }
    return out;
  }
  function readSettings(settings) {
    const num = (name, fallback) => {
      const v = Number(settings.get(name) ?? "");
      return settings.has(name) && settings.get(name) !== "" && Number.isFinite(v) ? v : fallback;
    };
    const bool = (name, fallback) => {
      const v = (settings.get(name) ?? "").trim().toLowerCase();
      return v === "" ? fallback : v !== "false" && v !== "0" && v !== "no";
    };
    return {
      maxPlayers: Math.max(1, Math.min(MAX_SLOTS, Math.trunc(num("max-players", MAX_SLOTS)))),
      holeTimeout: Math.max(0, num("hole-timeout", 120)),
      strokeLimit: Math.max(0, Math.trunc(num("stroke-limit", 0))),
      desktopAim: (settings.get("desktop-aim") ?? "").trim() === "target" ? "target" : "pull",
      reveal: bool("reveal", true),
      haptics: bool("haptics", true),
      showOtherLevels: bool("show-other-levels", true)
    };
  }
  var ABSENT_SECONDS = 3;
  var CAPTURE_GRACE = 2;
  var MinimalGolfGame = class extends Behaviour {
    constructor() {
      super(...arguments);
      /** Server seconds at which this round (course) started; 0 before the first. A device's saved player state from another round is not used. */
      __publicField(this, "round", 0);
      /** -1 before the first level is loaded (upstream `currentLevel == null`). */
      __publicField(this, "currentLevelIndex", -1);
      /** For each level, the index of the authored slot it now occupies (the swap layout, K7). */
      __publicField(this, "slotOf", [0, 1, 2, 3, 4, 5, 6, 7]);
      /** Server seconds at which the current level's reveal began. */
      __publicField(this, "revealStart", 0);
      __publicField(this, "courseComplete", false);
      /** Server seconds at which everyone was done with the current hole; 0 while it is in play. */
      __publicField(this, "holeDoneAt", 0);
      /** Server seconds at which the first player finished the current hole (hole timeout); 0 before. */
      __publicField(this, "firstHoledAt", 0);
      __publicField(this, "card", []);
      // ---- from bindings.json ----
      __publicField(this, "course");
      __publicField(this, "levelObjects", []);
      __publicField(this, "aimPads", []);
      __publicField(this, "balls", []);
      __publicField(this, "ballPicks", []);
      __publicField(this, "ballAudio", []);
      __publicField(this, "aimLine");
      /** B2: the left and right hand's green sphere (attached to the local hands in a headset). */
      __publicField(this, "handSpheres", []);
      __publicField(this, "board", null);
      /** Kenney's CC0 replacements for upstream's unlicensed effects (THIRD-PARTY-NOTICES.md): three putts, three cup drops. */
      __publicField(this, "shotClips", []);
      __publicField(this, "holeClips", []);
      __publicField(this, "collisionClip", null);
      // ---- this client only ----
      __publicField(this, "frame", new CourseFrame());
      __publicField(this, "tuning", { ...TUNING });
      __publicField(this, "settings");
      __publicField(this, "relay");
      __publicField(this, "audio");
      __publicField(this, "impact");
      __publicField(this, "appliedLayout", "");
      __publicField(this, "appliedVisible", []);
      __publicField(this, "appliedPads", []);
      __publicField(this, "revealSent", "");
      __publicField(this, "ballShown", []);
      __publicField(this, "absentSince", /* @__PURE__ */ new Map());
    }
    // ---- start -----------------------------------------------------------------------------------------------------
    Start() {
      this.settings = readSettings(this.Settings);
      this.frame = CourseFrame.fromSettings(this.Settings);
      this.tuning = scaledTuning(this.frame.factor);
      this.relay = new GolfRelay(this.Host);
      this.audio = new AudioManager(this.shotClips, this.holeClips, this.collisionClip, (min, max) => this.Random.RangeInt(min, max));
      this.impact = new CameraImpactShake();
      const t = this.frame.tableScale;
      if (this.course) this.course.transform.localScale = new Vector3(t, t, t);
      const boardAt = (this.Settings.get("board") ?? "").trim().split(/\s+/).map(Number);
      if (this.board && boardAt.length === 3 && boardAt.every((v) => Number.isFinite(v))) this.board.transform.localPosition = new Vector3(boardAt[0], boardAt[1], boardAt[2]);
    }
    OnInstanceStart(kind) {
      if (this.Networking.IsReferee && (this.round === 0 || kind === "resumed")) this.StartRound(false);
    }
    // ---- reading the shared state ------------------------------------------------------------------------------------
    Now() {
      return this.Networking.GetServerTimeInSeconds();
    }
    get CurrentLevel() {
      return this.currentLevelIndex >= 0 ? LEVELS[this.currentLevelIndex] ?? null : null;
    }
    /** Where a level sits in the course now (its layout slot). */
    LevelPosition(level) {
      return SLOTS[this.slotOf[level] ?? level].clone();
    }
    /** MiniGolfLevel.IsRevealing for the current level, from the shared start time. */
    IsRevealing() {
      const level = this.CurrentLevel;
      return !!level && level.revealAnimator.IsPlaying(this.Now() - this.revealStart);
    }
    RowOf(uid) {
      return rowOf(this.card, uid);
    }
    /** The slot (and ball) of a seated, present player, or -1. */
    SlotOf(uid) {
      const row = this.RowOf(uid);
      return row && !row.left ? row.slot : -1;
    }
    /** True when that player plays the current hole (seated, and joined at or before it). */
    Plays(uid) {
      const row = this.RowOf(uid);
      return !!row && !row.left && row.slot >= 0 && row.joined <= this.currentLevelIndex && !this.courseComplete;
    }
    /** The card's result for a player and hole, or null. */
    ResultFor(uid, hole) {
      const row = this.RowOf(uid);
      return row && hole >= 0 ? row.strokes[hole] ?? null : null;
    }
    LocalPlayer() {
      return this.PlayerBehaviour(this.Networking.LocalPlayer, "GolfPlayer");
    }
    /** The per-player behaviour of whoever holds a slot, if they are present. */
    PlayerInSlot(slot) {
      const row = rowInSlot(this.card, slot);
      if (!row) return null;
      for (const p of this.Networking.GetPlayers()) if (p.uid === row.uid) return this.PlayerBehaviour(p, "GolfPlayer");
      return null;
    }
    BallKey(slot) {
      return this.balls[slot]?.key ?? "";
    }
    HoleWorld() {
      const level = this.CurrentLevel;
      return level.TransformPoint(level.holeCenter, this.frame, this.LevelPosition(level.index));
    }
    SpawnWorld() {
      const level = this.CurrentLevel;
      return level.TransformPoint(level.ballSpawn, this.frame, this.LevelPosition(level.index));
    }
    // ---- buttons on the board (any client) ----------------------------------------------------------------------------
    /** JOIN / LEAVE. */
    ToggleJoin() {
      const me = this.Networking.LocalPlayer;
      if (this.SlotOf(me.uid) >= 0) this.SendCommand("LeaveSeat");
      else this.SendCommand("Join");
    }
    /** RESTART HOLE (upstream: left Menu button or R, MinimalGolfGame.cs:244-260). */
    RestartMyHole() {
      if (this.courseComplete) {
        this.PlayAgain();
        return;
      }
      this.LocalPlayer()?.RestartCurrentLevel();
    }
    /** PLAY AGAIN (VRGolfUI.cs:145-147; clickable here, D6). */
    PlayAgain() {
      if (this.courseComplete) this.SendCommand("RestartCourse");
    }
    // ---- commands, run by the referee -------------------------------------------------------------------------------
    Join() {
      const caller = this.Networking.CallingPlayer;
      if (!caller || !this.Networking.IsReferee) return;
      const row = this.RowOf(caller.uid);
      if (row && row.slot >= 0) {
        row.left = false;
        row.name = caller.displayName.slice(0, NAME_MAX);
      } else {
        const slot = freeSlot(this.card, this.settings.maxPlayers);
        if (slot < 0) return;
        const joined = joinHole(this.currentLevelIndex, this.holeDoneAt > 0, this.courseComplete);
        if (row) {
          row.slot = slot;
          row.left = false;
          row.joined = Math.max(row.joined, joined);
        } else {
          this.card = makeRoom(this.card);
          this.card.push(newRow(caller.uid, caller.displayName, slot, joined));
        }
      }
      this.card = sortedRows(this.card);
      this.Commit();
    }
    LeaveSeat() {
      const caller = this.Networking.CallingPlayer;
      if (!caller || !this.Networking.IsReferee) return;
      const row = this.RowOf(caller.uid);
      if (!row || row.slot < 0) return;
      row.left = true;
      row.leftAt = this.Now();
      row.slot = -1;
      this.card = sortedRows(this.card);
      this.Commit();
    }
    /** RestartCourse (:825-828): only once the course is complete (D5); everyone starts again from level 1. */
    RestartCourse() {
      if (!this.Networking.IsReferee || !this.courseComplete) return;
      const caller = this.Networking.CallingPlayer;
      if (caller && this.SlotOf(caller.uid) < 0) return;
      this.StartRound(true);
    }
    // ---- the referee's side of the course ---------------------------------------------------------------------------
    Commit() {
      this.Networking.SetOwner(this.Networking.LocalPlayer, this.gameObject);
      this.RequestSerialization();
    }
    /** A new round from level 1 with every total at 0 (LoadLevel(0, true)). */
    StartRound(keepRows) {
      this.round = Math.max(this.round + 1, Math.floor(this.Now()));
      this.card = keepRows ? resetCard(this.card) : [];
      this.LoadLevel(0);
    }
    /** LoadLevel (:706-761), the shared half: layout swap, current level, reveal start; everyone's strokes go to 0 on their own. */
    LoadLevel(index) {
      const newIndex = Mathf.Clamp(index, 0, LEVELS.length - 1);
      this.slotOf = SwapLayout(this.slotOf, this.currentLevelIndex, newIndex);
      this.currentLevelIndex = newIndex;
      this.courseComplete = false;
      this.revealStart = this.Now();
      this.holeDoneAt = 0;
      this.firstHoledAt = 0;
      for (const row of this.card) row.seen = 0;
      this.Commit();
    }
    /** The strokes a player has on the current hole as far as the referee knows: their report, never below what it saw. */
    StrokesSoFar(row, hole) {
      const gp = this.PlayerByUid(row.uid);
      const reported = gp && gp.round === this.round && gp.hole === hole ? gp.holeStrokes : 0;
      return Math.max(reported, row.seen ?? 0);
    }
    PlayerByUid(uid) {
      for (const p of this.Networking.GetPlayers()) if (p.uid === uid) return this.PlayerBehaviour(p, "GolfPlayer");
      return null;
    }
    /** Runs on the referee every tick: seats, results, the end of the hole, the next level (CaptureBall :695-703). */
    RefereeUpdate() {
      const now = this.Now();
      let changed = false;
      if (this.round === 0) {
        this.StartRound(false);
        return;
      }
      const present = new Set(this.Networking.GetPlayers().map((p) => p.uid));
      for (const row of this.card) {
        if (present.has(row.uid)) {
          this.absentSince.delete(row.uid);
          if (row.left && row.slot >= 0) {
            row.left = false;
            changed = true;
          }
        } else if (!row.left) {
          const since = this.absentSince.get(row.uid) ?? now;
          this.absentSince.set(row.uid, since);
          if (now - since >= ABSENT_SECONDS) {
            row.left = true;
            row.leftAt = now;
            changed = true;
          }
        }
      }
      if (releaseSeats(this.card, now)) changed = true;
      const hole = this.currentLevelIndex;
      if (!this.courseComplete && hole >= 0) {
        for (const p of this.Networking.GetPlayers()) {
          const gp = this.PlayerBehaviour(p, "GolfPlayer");
          const row = this.RowOf(p.uid);
          if (!gp || !row || gp.round !== this.round || gp.hole !== hole) continue;
          if (!isFinished(row, hole) && gp.holeStrokes > (row.seen ?? 0)) {
            row.seen = Math.max(0, Math.trunc(gp.holeStrokes));
            changed = true;
          }
          if (row.slot < 0 || gp.finished === 0) continue;
          const strokes = this.StrokesSoFar(row, hole);
          if (record(row, hole, strokes, gp.finished === 2 ? "max" : gp.finished === 3 ? "dnf" : "")) {
            if (this.firstHoledAt === 0) this.firstHoledAt = now;
            changed = true;
          }
        }
        const par = LEVELS[hole]?.par ?? 0;
        const timeoutAt = this.firstHoledAt + this.settings.holeTimeout;
        if (this.settings.holeTimeout > 0 && this.firstHoledAt > 0 && now >= timeoutAt && this.holeDoneAt === 0) {
          for (const row of activeRows(this.card, hole)) {
            if (isFinished(row, hole)) continue;
            const gp = this.PlayerInSlot(row.slot);
            if (gp && gp.round === this.round && gp.hole === hole && gp.capturing && now < timeoutAt + CAPTURE_GRACE) continue;
            if (record(row, hole, missedScore(this.StrokesSoFar(row, hole), par, this.settings.strokeLimit), "dnf")) changed = true;
          }
        }
        if (this.holeDoneAt === 0 && holeFinished(this.card, hole)) {
          this.holeDoneAt = now;
          for (const row of this.card) {
            if (row.joined <= hole && !isFinished(row, hole)) record(row, hole, missedScore(this.StrokesSoFar(row, hole), par, this.settings.strokeLimit), "dnf");
          }
          changed = true;
        }
        if (this.holeDoneAt > 0 && now >= this.holeDoneAt + ADVANCE_SECONDS) {
          if (hole + 1 < LEVELS.length) {
            this.LoadLevel(hole + 1);
            return;
          }
          this.courseComplete = true;
          changed = true;
        }
      }
      if (changed) this.Commit();
    }
    OnPlayerLeft(player) {
      this.absentSince.set(player.uid, this.absentSince.get(player.uid) ?? this.Now());
    }
    // ---- every client: what the table looks like -------------------------------------------------------------------
    Update() {
      if (this.Networking.IsReferee) this.RefereeUpdate();
      this.ApplyLayout();
      this.ApplyReveal();
      this.RefreshBalls();
    }
    /** Level roots at their layout slots; the others hidden when `show-other-levels` is off (A3). */
    ApplyLayout() {
      const key = this.slotOf.join(",");
      if (key !== this.appliedLayout) {
        this.appliedLayout = key;
        this.levelObjects.forEach((obj, level) => {
          if (obj) obj.transform.localPosition = this.LevelPosition(level);
        });
      }
      this.levelObjects.forEach((obj, level) => {
        const visible = this.settings.showOtherLevels || level === this.currentLevelIndex;
        if (obj && this.appliedVisible[level] !== visible) {
          this.appliedVisible[level] = visible;
          obj.SetActive(visible);
        }
      });
      this.aimPads.forEach((pad2, level) => {
        const on = level === this.currentLevelIndex;
        if (pad2 && this.appliedPads[level] !== on) {
          this.appliedPads[level] = on;
          pad2.SetActive(on);
        }
      });
    }
    /** PlayReveal (A8) on this client, joined part-way when the reveal is already running. */
    ApplyReveal() {
      const level = this.CurrentLevel;
      if (!level) return;
      const key = `${this.round}:${this.currentLevelIndex}:${this.revealStart}`;
      if (key === this.revealSent) return;
      this.revealSent = key;
      const elapsed = this.Now() - this.revealStart;
      const target = this.levelObjects[level.index]?.key;
      if (target && level.revealAnimator.IsPlaying(elapsed)) this.relay.reveal(target, elapsed);
    }
    /** One ball per seated player, shown only while that player has one on the current level (A11, port of A7). */
    RefreshBalls() {
      const local = this.Networking.LocalPlayer;
      for (let slot = 0; slot < this.balls.length; slot++) {
        const ball = this.balls[slot];
        if (!ball) continue;
        const row = rowInSlot(this.card, slot);
        let visible = false;
        if (row && !row.left && !this.courseComplete && this.currentLevelIndex >= 0 && !this.IsRevealing()) {
          const gp = this.PlayerInSlot(slot);
          if (gp && gp.round === this.round && gp.hole === this.currentLevelIndex && gp.finished !== 2 && gp.finished !== 3) {
            visible = row.uid === local.uid ? gp.ballLive : true;
          }
        }
        if (this.ballShown[slot] !== visible) {
          this.ballShown[slot] = visible;
          ball.SetActive(visible);
        }
      }
    }
  };
  /** What other clients may ask the referee to run (SendCommand): the board's JOIN / LEAVE and PLAY AGAIN. */
  __publicField(MinimalGolfGame, "networkCallable", ["Join", "LeaveSeat", "RestartCourse"]);
  __publicField(MinimalGolfGame, "synced", ["round", "currentLevelIndex", "slotOf", "revealStart", "courseComplete", "holeDoneAt", "firstHoledAt", "card"]);

  // src/ProximityRevealVolume.ts
  var ProximityRevealVolume = class {
    constructor(revealRadius, edgeSoftness) {
      __publicField(this, "revealRadius");
      __publicField(this, "edgeSoftness");
      __publicField(this, "enabledReveal", true);
      __publicField(this, "requireGrip", true);
      this.revealRadius = revealRadius;
      this.edgeSoftness = edgeSoftness;
    }
    get EffectiveRadius() {
      return Math.max(0.01 * (this.revealRadius / 0.075), this.revealRadius);
    }
    get EffectiveSoftness() {
      return Mathf.Clamp(this.edgeSoftness, 0, this.EffectiveRadius);
    }
    /** IsRevealActive: on, and the grip held when a grip is required. */
    IsRevealActive(gripHeld) {
      return this.enabledReveal && (!this.requireGrip || gripHeld);
    }
    Sphere(center) {
      return { center: center.clone(), radius: this.EffectiveRadius, softness: this.EffectiveSoftness };
    }
  };

  // src/RevealVolumeManager.ts
  var RevealVolumeManager = class {
    constructor(relay, target) {
      __publicField(this, "relay");
      __publicField(this, "target");
      this.relay = relay;
      this.target = target;
    }
    /** PushGlobals: at most two volumes, in the order given. An unchanged set is not sent again. */
    PushGlobals(active) {
      if (this.target) this.relay.xray(this.target, active.slice(0, 2));
    }
  };

  // src/VRGolfClub.ts
  var CLUB_HAPTIC_SECONDS = 0.08;
  var PULL_HAPTIC_SECONDS = 0.06;
  var VRGolfClub = class {
    constructor(controller) {
      __publicField(this, "controller");
      __publicField(this, "triggerThreshold", 0.45);
      __publicField(this, "overlappingBall", false);
      __publicField(this, "aiming", false);
      __publicField(this, "wasTriggerHeld", false);
      __publicField(this, "digitalDown", false);
      __publicField(this, "digitalUp", false);
      this.controller = controller;
    }
    /** `button-pressed` / `button-released` for this hand (OVRInput.GetDown / GetUp). */
    OnButton(button, pressed) {
      if (button !== Button.Trigger) return;
      if (pressed) this.digitalDown = true;
      else this.digitalUp = true;
    }
    /** VRGolfClub.Update (:237-316), once per tick. */
    Update(game2) {
      const down = this.digitalDown;
      const up = this.digitalUp;
      this.digitalDown = false;
      this.digitalUp = false;
      if (!game2.ballLive) {
        this.wasTriggerHeld = game2.TriggerHeld(this.controller);
        if (this.aiming) {
          this.aiming = false;
          game2.CancelAim();
        }
        return;
      }
      const ball = game2.BallPosition();
      const hand = game2.HandPosition(this.controller);
      this.overlappingBall = hand !== null && Vector3.Distance(hand, ball) < game2.clubReach;
      const triggerHeld = game2.TriggerHeld(this.controller);
      const heldDownEdge = triggerHeld && !this.wasTriggerHeld;
      const heldUpEdge = !triggerHeld && this.wasTriggerHeld;
      const triggerDown = heldDownEdge || down;
      const triggerUp = heldUpEdge || up;
      if (!this.aiming && !game2.aiming && this.overlappingBall && triggerDown && triggerHeld && hand) {
        const started = game2.BeginAim(ProjectToBallPlane(hand, ball));
        this.aiming = started && game2.aiming;
        if (this.aiming) game2.Haptic(this.controller, 0.5, CLUB_HAPTIC_SECONDS);
      }
      if (this.aiming && triggerHeld && hand) {
        game2.UpdateAim(ProjectToBallPlane(hand, ball));
        const power = game2.shotPower;
        if (power > 0.05) game2.Haptic(this.controller, power * 0.3, PULL_HAPTIC_SECONDS);
      }
      if (this.aiming && triggerUp) {
        const shot = game2.EndAimAndShoot();
        this.aiming = false;
        game2.Haptic(this.controller, shot ? 0.8 : 0.3, CLUB_HAPTIC_SECONDS);
      }
      if (this.aiming && game2.IsRevealing()) {
        this.aiming = false;
        game2.CancelAim();
      }
      this.wasTriggerHeld = triggerHeld;
    }
    /** The aim was ended elsewhere (a reset, a capture, the desktop aim): this hand is no longer aiming. */
    Reset() {
      this.aiming = false;
    }
  };
  function ProjectToBallPlane(world, ball) {
    return new Vector3(world.x, ball.y, world.z);
  }
  var DESKTOP_TURN_DEGREES = 5;
  var DESKTOP_POWER_STEP = 1 / 12;
  var DesktopAim = class {
    constructor(mode = "pull") {
      __publicField(this, "mode");
      this.mode = mode;
    }
    /** A click on the current level's aim pad. */
    Click(game2, detail) {
      if (!game2.ballLive || !detail.point) return;
      const ball = game2.BallPosition();
      if (!game2.aiming && !game2.BeginAim(ball)) return;
      const point = ProjectToBallPlane(detail.point, ball);
      const hand = this.mode === "target" ? ball.scale(2).sub(point) : point;
      game2.UpdateAim(hand);
    }
    /** Keys while aiming. Returns true when the key was used. */
    Key(game2, key, start, pull, maxPull) {
      if (!game2.aiming) return false;
      if (key === "Space" || key === "Return" || key === "KeypadEnter") {
        game2.EndAimAndShoot();
        return true;
      }
      if (key === "Escape" || key === "C") {
        game2.CancelAim();
        return true;
      }
      let next = null;
      if (key === "LeftArrow" || key === "RightArrow") {
        const a = (key === "LeftArrow" ? 1 : -1) * DESKTOP_TURN_DEGREES * Math.PI / 180;
        const c = Math.cos(a);
        const s = Math.sin(a);
        next = new Vector3(pull.x * c - pull.z * s, 0, pull.x * s + pull.z * c);
      } else if (key === "UpArrow" || key === "DownArrow") {
        const length = pull.magnitude;
        const direction = length > 1e-9 ? pull.scale(1 / length) : new Vector3(0, 0, 1);
        const wanted = Math.max(0, Math.min(maxPull, length + (key === "UpArrow" ? 1 : -1) * DESKTOP_POWER_STEP * maxPull));
        next = direction.scale(wanted);
      }
      if (!next) return false;
      game2.UpdateAim(new Vector3(start.x - next.x, start.y, start.z - next.z));
      return true;
    }
  };

  // src/GolfPlayer.ts
  var PLAYING = 0;
  var HOLED = 1;
  var PICKED_UP = 2;
  var OUT_OF_TIME = 3;
  var STROKE_LIMIT_GRACE = 1;
  var HAPTIC = 0.08;
  var GolfPlayer = class extends Behaviour {
    constructor() {
      super(...arguments);
      /** The shared round this state belongs to (MinimalGolfGame.round). */
      __publicField(this, "round", 0);
      /** The level index this state is for. */
      __publicField(this, "hole", -1);
      /** Upstream `levelStrokes`: strokes of this attempt (a restart sets it to 0; the game card shows it). */
      __publicField(this, "levelStrokes", 0);
      /** Strokes on this hole including restarted attempts: what the scorecard records (K2: restarts keep their strokes). */
      __publicField(this, "holeStrokes", 0);
      /** Upstream `totalStrokes`. */
      __publicField(this, "totalStrokes", 0);
      /** PLAYING, HOLED (upstream levelComplete), PICKED_UP or OUT_OF_TIME. */
      __publicField(this, "finished", PLAYING);
      __publicField(this, "capturing", false);
      /** Counters other players' copies watch, to play the sound and the sink once each. */
      __publicField(this, "captures", 0);
      __publicField(this, "shots", 0);
      // ---- from bindings.json ----
      __publicField(this, "game");
      // ---- the local player's copy only ----
      __publicField(this, "aim", new GolfAim());
      __publicField(this, "clubs", [new VRGolfClub(Hand.Left), new VRGolfClub(Hand.Right)]);
      __publicField(this, "desktop", new DesktopAim());
      /** The slot (ball) this client last saw for this player; -1 not seated. */
      __publicField(this, "slot", -1);
      /** The ball is on the green (upstream `level.ball != null`). */
      __publicField(this, "ballLive", false);
      /** SpawnBallAfterReveal is waiting. */
      __publicField(this, "spawnPending", false);
      __publicField(this, "shotNumber", 0);
      /** The latest shot the ball graph reported at rest, and whether it is at rest now (rule B1's speed test). */
      __publicField(this, "restShot", 0);
      __publicField(this, "atRest", true);
      __publicField(this, "restSince", 0);
      __publicField(this, "captureEndsAt", -1);
      __publicField(this, "feedback", "");
      __publicField(this, "feedbackUntil", 0);
      __publicField(this, "reveal", null);
      __publicField(this, "volumes", [new ProximityRevealVolume(0.075, 0.02), new ProximityRevealVolume(0.075, 0.02)]);
      __publicField(this, "seenShots", -1);
      __publicField(this, "seenCaptures", -1);
      // ---- the tick -----------------------------------------------------------------------------------------------------
      /** B2: each hand's translucent green sphere, attached to the local player's hands in a headset (not on desktop). */
      __publicField(this, "spheresAttached", false);
    }
    get isLocal() {
      return this.Player?.isLocal === true;
    }
    // ---- ClubHost ---------------------------------------------------------------------------------------------------
    get aiming() {
      return this.aim.dragging;
    }
    get shotPower() {
      return this.aim.shotPower;
    }
    get clubReach() {
      return this.game.tuning.clubReach;
    }
    BallPosition() {
      return this.game.balls[this.slot]?.transform.position ?? Vector3.zero;
    }
    HandPosition(side) {
      const poses = this.Input.Poses;
      if (!poses) return null;
      return (side === Hand.Left ? poses.leftHand : poses.rightHand).position.clone();
    }
    TriggerHeld(side) {
      return this.Input.GetButton(Button.Trigger, side) || this.Input.GetTrigger(side) > this.clubs[side].triggerThreshold;
    }
    IsRevealing() {
      return this.game.IsRevealing();
    }
    BeginAim(startWorld) {
      if (!this.CanTakeAction()) {
        this.ShowFeedback("WAIT FOR THE BALL");
        return false;
      }
      return this.aim.BeginVRAim(startWorld, this.BallPosition().y, true);
    }
    UpdateAim(currentWorld) {
      this.aim.UpdateVRAim(currentWorld);
    }
    EndAimAndShoot() {
      const impulse = this.aim.TryEndVRAimAndShoot(this.CanTakeAction());
      for (const club of this.clubs) club.Reset();
      if (!impulse) return false;
      this.Shoot(impulse);
      return true;
    }
    CancelAim() {
      this.aim.CancelAim();
      for (const club of this.clubs) club.Reset();
    }
    Haptic(side, strength, seconds) {
      if (this.game.settings.haptics) this.Input.Haptic(side, strength, seconds);
    }
    HapticBoth(strength, seconds) {
      this.Haptic(Hand.Left, strength, seconds);
      this.Haptic(Hand.Right, strength, seconds);
    }
    // ---- upstream rules ---------------------------------------------------------------------------------------------
    /**
     * CanTakeAction (:552-555). "Speed at most 0.10" is the ball graph's report for the latest shot. New: no stroke past
     * the `stroke-limit` (the pick-up waits STROKE_LIMIT_GRACE for the cup assist; no putt may slip in meanwhile).
     */
    CanTakeAction() {
      const limit = this.game.settings?.strokeLimit ?? 0;
      if (limit > 0 && this.holeStrokes >= limit) return false;
      return this.ballLive && !this.game.IsRevealing() && !this.capturing && this.finished === PLAYING && this.atRest && this.restShot >= this.shotNumber && this.game.Plays(this.Player.uid);
    }
    /** ShowFeedback (:844-848). */
    ShowFeedback(message, duration = MESSAGE_SECONDS.standard) {
      this.feedback = message;
      this.feedbackUntil = this.Time.time + duration;
    }
    /** TryApplyShot's effects (:542-548) for an impulse GolfAim allowed. */
    Shoot(impulse) {
      this.shotNumber++;
      this.atRest = false;
      this.game.relay.impulse(this.game.BallKey(this.slot), impulse, this.shotNumber);
      this.levelStrokes++;
      this.holeStrokes++;
      this.totalStrokes++;
      this.shots++;
      this.game.audio.PlayShotSfx(this.game.ballAudio[this.slot] ?? null);
      this.HapticBoth(0.7, HAPTIC);
      this.RequestSerialization();
    }
    /** InstantiateBallAtSpawn (:557-591): the pooled ball, owned by this player, at the reset point and at rest. */
    InstantiateBallAtSpawn() {
      const ball = this.game.balls[this.slot];
      if (!ball || !this.game.CurrentLevel) return;
      const world = this.game.SpawnWorld();
      ball.TakeOwnership();
      ball.transform.position = world;
      this.game.relay.place(ball.key, world, this.shotNumber);
      this.ballLive = true;
      this.atRest = true;
      this.restShot = this.shotNumber;
      this.restSince = this.Time.time;
    }
    /** ResetBall (:603-640): stops everything pending (StopAllCoroutines) and puts the ball back. No stroke (D2). */
    ResetBall(penalty) {
      this.capturing = false;
      this.captureEndsAt = -1;
      this.spawnPending = false;
      this.CancelAim();
      this.InstantiateBallAtSpawn();
      this.HapticBoth(0.4, HAPTIC);
      if (penalty) {
        this.levelStrokes++;
        this.holeStrokes++;
        this.totalStrokes++;
      }
      this.RequestSerialization();
    }
    /** CaptureBall (:642-704), first part: the ball graph saw the cup test pass. */
    CaptureBall() {
      const key = this.game.BallKey(this.slot);
      this.capturing = true;
      this.CancelAim();
      this.captures++;
      this.game.audio.PlayHoleSfx(this.game.ballAudio[this.slot] ?? null);
      this.Haptic(Hand.Right, 0.9, 0.25);
      this.game.relay.assist(key, false, Vector3.zero, this.game.tuning);
      this.game.relay.sink(key, this.game.HoleWorld(), this.game.tuning.centerDrop, this.game.tuning.sinkDepth);
      this.captureEndsAt = this.Time.time + CENTERING_SECONDS + SINKING_SECONDS;
      this.RequestSerialization();
    }
    /** CaptureBall, after the sink: the hole is complete for this player. The referee waits for everyone, then advances. */
    FinishCapture() {
      this.captureEndsAt = -1;
      this.capturing = false;
      this.finished = HOLED;
      const level = this.game.CurrentLevel;
      this.ShowFeedback(HoleCompleteMessage(this.holeStrokes, level.par), MESSAGE_SECONDS.hole);
      this.RequestSerialization();
    }
    /** RestartCurrentLevel (:830-836) for this player only: ball back, level strokes 0, total kept (K2); no reveal replay. */
    RestartCurrentLevel() {
      if (!this.isLocal || this.slot < 0 || !this.game.Plays(this.Player.uid)) return;
      if (this.finished !== PLAYING || this.capturing || this.game.IsRevealing() || !this.ballLive) return;
      this.CancelAim();
      this.levelStrokes = 0;
      this.InstantiateBallAtSpawn();
      this.ShowFeedback("LEVEL RESTARTED", MESSAGE_SECONDS.restarted);
      this.RequestSerialization();
    }
    /** LoadLevel (:706-823), this player's part: strokes to 0, flags cleared, the ball after the reveal (A5, A6, A11). */
    OnLevelLoaded() {
      const level = this.game.CurrentLevel;
      this.hole = level.index;
      this.levelStrokes = 0;
      this.holeStrokes = 0;
      this.finished = PLAYING;
      this.capturing = false;
      this.captureEndsAt = -1;
      this.CancelAim();
      this.ballLive = false;
      this.spawnPending = true;
      this.ShowFeedback(LevelMessage(level.index, level.levelName), MESSAGE_SECONDS.level);
      this.RequestSerialization();
    }
    AttachHandSpheres() {
      if (this.spheresAttached || this.Input.IsVR !== true) return;
      this.spheresAttached = true;
      this.game.handSpheres.forEach((sphere, side) => {
        if (!sphere) return;
        sphere.SetActive(true);
        sphere.AttachToHand(side);
      });
    }
    OnDestroy() {
      if (this.spheresAttached) for (const sphere of this.game?.handSpheres ?? []) sphere?.Detach();
    }
    Update() {
      if (!this.isLocal || !this.game?.settings) return;
      const game2 = this.game;
      this.AttachHandSpheres();
      if (game2.round === 0) return;
      const uid = this.Player.uid;
      if (this.round !== game2.round) {
        this.round = game2.round;
        this.hole = -1;
        this.levelStrokes = this.holeStrokes = this.totalStrokes = 0;
        this.finished = PLAYING;
        this.capturing = false;
        this.captureEndsAt = -1;
        this.RequestSerialization();
      }
      const slot = game2.SlotOf(uid);
      if (slot !== this.slot) {
        if (this.slot >= 0) game2.relay.assist(game2.BallKey(this.slot), false, Vector3.zero, game2.tuning);
        this.slot = slot;
        this.CancelAim();
        this.ballLive = false;
        this.spawnPending = slot >= 0 && this.hole === game2.currentLevelIndex && this.finished === PLAYING && !this.capturing;
      }
      if (slot < 0 || game2.courseComplete || game2.currentLevelIndex < 0) {
        this.Idle();
        return;
      }
      if (this.hole !== game2.currentLevelIndex) this.OnLevelLoaded();
      if (!game2.Plays(uid)) {
        this.Idle();
        return;
      }
      if (this.spawnPending && !game2.IsRevealing()) {
        this.spawnPending = false;
        this.InstantiateBallAtSpawn();
      }
      if (this.capturing && this.captureEndsAt < 0) {
        this.spawnPending = false;
        this.FinishCapture();
      }
      if (this.captureEndsAt >= 0 && this.Time.time >= this.captureEndsAt) this.FinishCapture();
      if (this.finished === PLAYING && game2.ResultFor(uid, this.hole) !== null) {
        this.finished = OUT_OF_TIME;
        this.capturing = false;
        this.captureEndsAt = -1;
        this.CancelAim();
        this.ShowFeedback("OUT OF TIME");
        this.RequestSerialization();
      }
      if (this.finished !== PLAYING || !this.ballLive) {
        this.Idle();
        return;
      }
      const level = game2.CurrentLevel;
      if (!this.capturing && !game2.IsRevealing() && level.IsOutsideCourse(this.BallPosition(), game2.frame, game2.LevelPosition(level.index))) {
        this.ResetBall(false);
        this.ShowFeedback("BALL RETURNED");
      }
      this.CheckStrokeLimit();
      if (this.finished !== PLAYING) {
        this.Idle();
        return;
      }
      for (const club of this.clubs) club.Update(this);
      const key = game2.BallKey(slot);
      const armed = !game2.IsRevealing() && !this.capturing && !this.aim.dragging;
      game2.relay.assist(key, armed, game2.HoleWorld(), game2.tuning);
      this.UpdateAimingLine();
      this.UpdateReveal();
    }
    /** Stroke limit (new, PORT.md 3.4; setting `stroke-limit`, 0 = none as upstream): pick up once the last allowed stroke has stopped. */
    CheckStrokeLimit() {
      const limit = this.game.settings.strokeLimit;
      if (limit <= 0 || this.holeStrokes < limit || this.capturing || !this.atRest || this.restShot < this.shotNumber) return;
      if (this.Time.time - this.restSince < STROKE_LIMIT_GRACE) return;
      this.finished = PICKED_UP;
      this.CancelAim();
      this.ShowFeedback("STROKE LIMIT  \u2022  PICKED UP", MESSAGE_SECONDS.hole);
      this.RequestSerialization();
    }
    /** Nothing to play: no aim, no line, no assist on our ball. */
    Idle() {
      if (this.aim.dragging) this.CancelAim();
      this.UpdateAimingLine();
      if (this.slot >= 0) this.game.relay.assist(this.game.BallKey(this.slot), false, Vector3.zero, this.game.tuning);
      this.UpdateReveal();
    }
    /** UpdateAimingLine (:492-526). */
    UpdateAimingLine() {
      const target = this.game.aimLine?.key;
      if (!target) return;
      const t = this.game.tuning;
      if (!this.aim.dragging || !this.ballLive) {
        this.game.relay.line(target, false, Vector3.zero, Vector3.zero, 0, AimLineColor(0));
        return;
      }
      const from = this.BallPosition();
      const to = from.add(this.aim.aimDirection.scale(AimLineLength(this.aim.shotPower, this.aim.aimDirection, t)));
      this.game.relay.line(target, true, from, to, t.aimingLineWidth, AimLineColor(this.aim.shotPower));
    }
    /** ProximityRevealVolume per hand while its grip is held; desktop: G on the own ball. */
    UpdateReveal() {
      const target = this.game.course?.key;
      if (!target) return;
      this.reveal ?? (this.reveal = new RevealVolumeManager(this.game.relay, target));
      const t = this.game.tuning;
      const active = [];
      if (this.game.settings.reveal) {
        for (const side of [Hand.Left, Hand.Right]) {
          const volume = this.volumes[side];
          volume.revealRadius = t.revealRadius;
          volume.edgeSoftness = t.revealSoftness;
          const hand = this.HandPosition(side);
          if (hand && volume.IsRevealActive(this.Input.GetButton(Button.Grip, side))) active.push(volume.Sphere(hand));
        }
        if (this.ballLive && (this.Input.GetKey("G") || this.Input.GetKey("LeftShift")) && active.length < 2) active.push(this.volumes[0].Sphere(this.BallPosition()));
      }
      this.reveal.PushGlobals(active);
    }
    // ---- what the graphs and the page report --------------------------------------------------------------------------
    OnCaptureReported(ball, _shot) {
      if (!this.isLocal || ball !== this.slot || !this.ballLive || this.capturing || this.finished !== PLAYING) return;
      if (this.game.IsRevealing() || this.aim.dragging) return;
      this.CaptureBall();
    }
    OnRestReported(ball, shot, atRest) {
      if (!this.isLocal || ball !== this.slot || shot !== this.shotNumber) return;
      if (atRest && !this.atRest) this.restSince = this.Time.time;
      this.atRest = atRest;
      if (atRest) this.restShot = shot;
    }
    OnImpactReported(ball, speed, other) {
      if (!this.isLocal || ball !== this.slot) return;
      const strength = this.game.impact.RegisterImpact(speed, this.Time.time);
      if (strength !== null) this.HapticBoth(strength, HAPTIC);
      if (ImpactPlaysSound(other)) this.game.audio.PlayCollisionSfx(this.game.ballAudio[this.slot] ?? null);
    }
    // ---- bound in bindings.json to this per-player behaviour: the runtime hands them to the local player's copy ------------
    /** A click on an aim pad (every level's pad is bound here; only the current level's is switched on). */
    AimPadClick(detail) {
      this.OnAimPadClick(this.game.currentLevelIndex, detail);
    }
    /** A click on a ball's pick sphere: it counts for the own ball when that is the ball nearest the click point. */
    BallPickClick(detail) {
      if (this.slot < 0) return;
      let nearest = this.slot;
      if (detail.point) {
        let best = Infinity;
        this.game.balls.forEach((ball, slot) => {
          if (!ball) return;
          const d = ball.transform.position.sub(detail.point).magnitude;
          if (d < best) [best, nearest] = [d, slot];
        });
      }
      this.OnBallClick(nearest);
    }
    /** RESTART HOLE on the board (upstream: left Menu button, :244-260): the course when it is complete, else this hole. */
    RestartMyHole() {
      this.game.RestartMyHole();
    }
    /** Graph event golfCapture `<ball>|<shot>` from the ball's fixed-step graph (only the owner arms it). */
    OnGolfCapture(ball, shot) {
      this.OnCaptureReported(Number(ball), Number(shot));
    }
    /** Graph event golfRest `<ball>|<shot>|<1 at rest, 0 moving>`. */
    OnGolfRest(ball, shot, atRest) {
      this.OnRestReported(Number(ball), Number(shot), atRest === "1");
    }
    /** Graph event golfImpact `<ball>|<relative speed>|<other collider's name>`. */
    OnGolfImpact(ball, speed, other) {
      this.OnImpactReported(Number(ball), Number(speed), other ?? "");
    }
    OnAimPadClick(level, detail) {
      if (!this.isLocal || level !== this.game.currentLevelIndex || this.slot < 0 || this.finished !== PLAYING) return;
      this.desktop.mode = this.game.settings.desktopAim;
      this.desktop.Click(this, detail);
    }
    OnBallClick(slot) {
      if (this.isLocal && slot === this.slot && this.aim.dragging) this.EndAimAndShoot();
    }
    OnButtonPressed(button, side) {
      if (this.isLocal) this.clubs[side]?.OnButton(button, true);
    }
    OnButtonReleased(button, side) {
      if (this.isLocal) this.clubs[side]?.OnButton(button, false);
    }
    OnKeyPressed(key) {
      if (!this.isLocal || !this.game?.settings) return;
      if (key === "R") {
        this.game.RestartMyHole();
        return;
      }
      if (this.game.courseComplete && (key === "Return" || key === "Space")) {
        this.game.PlayAgain();
        return;
      }
      const maxPull = this.game.tuning.vrMaximumDragDistance;
      const pull = this.aim.aimDirection.scale(this.aim.shotPower * maxPull);
      this.desktop.Key(this, key, this.aim.dragStartWorld, pull, maxPull);
    }
    // ---- other players' copies ---------------------------------------------------------------------------------------
    OnDeserialization(result) {
      if (this.isLocal || !this.game?.settings) return;
      if (result.isSnapshot || this.seenShots < 0) {
        this.seenShots = this.shots;
        this.seenCaptures = this.captures;
        return;
      }
      const slot = this.game.SlotOf(this.Player.uid);
      const source = slot >= 0 ? this.game.ballAudio[slot] ?? null : null;
      if (this.shots > this.seenShots) this.game.audio.PlayShotSfx(source);
      if (this.captures > this.seenCaptures && slot >= 0 && this.game.CurrentLevel) {
        this.game.audio.PlayHoleSfx(source);
        this.game.relay.sink(this.game.BallKey(slot), this.game.HoleWorld(), this.game.tuning.centerDrop, this.game.tuning.sinkDepth);
      }
      this.seenShots = this.shots;
      this.seenCaptures = this.captures;
    }
  };
  __publicField(GolfPlayer, "perPlayer", true);
  /** A reload in the middle of a round gets its strokes back (only while it is the same round, `round`). */
  __publicField(GolfPlayer, "persistent", true);
  __publicField(GolfPlayer, "synced", ["round", "hole", "levelStrokes", "holeStrokes", "totalStrokes", "finished", "capturing", "captures", "shots"]);

  // src/VRGolfUI.ts
  var rgb = (hex, a = 1) => new Color((hex >> 16 & 255) / 255, (hex >> 8 & 255) / 255, (hex & 255) / 255, a);
  var SEAFOAM = rgb(9161640);
  var ORANGE = rgb(14778927);
  var PALE_TEXT = rgb(16445906);
  function PipStyle(i, current) {
    const isCurrent = i === current;
    const color = i < current ? SEAFOAM : isCurrent ? ORANGE : new Color(PALE_TEXT.r, PALE_TEXT.g, PALE_TEXT.b, 0.18);
    return { color, height: isCurrent ? 10 : 6 };
  }
  function PowerMeter(power, segments = 12) {
    const lit = AimLineColor(power);
    const unlit = new Color(PALE_TEXT.r, PALE_TEXT.g, PALE_TEXT.b, 0.13);
    const colors = [];
    for (let i = 0; i < segments; i++) colors.push(power >= (i + 1) / segments ? lit : unlit);
    return { percent: Mathf.RoundToInt(Math.fround(Math.fround(power) * 100)) + "%", colors };
  }
  function ToastAlpha(secondsLeft) {
    return Mathf.Clamp01(secondsLeft * 3.2);
  }
  var VRGolfUI = class extends Behaviour {
    constructor() {
      super(...arguments);
      // ---- from bindings.json ----
      __publicField(this, "game");
      __publicField(this, "courseText", null);
      __publicField(this, "levelText", null);
      __publicField(this, "strokesText", null);
      __publicField(this, "parText", null);
      __publicField(this, "pips", []);
      __publicField(this, "powerCanvas", null);
      __publicField(this, "powerLabel", null);
      __publicField(this, "powerPercent", null);
      __publicField(this, "powerSegments", []);
      __publicField(this, "feedbackCanvas", null);
      __publicField(this, "feedbackText", null);
      __publicField(this, "courseCompleteCanvas", null);
      __publicField(this, "courseCompleteTotal", null);
      __publicField(this, "joinLabel", null);
      /** Scorecard: header, par, then one line per row. */
      __publicField(this, "cardLines", []);
      __publicField(this, "shown", /* @__PURE__ */ new Map());
    }
    show(object, visible) {
      if (!object || this.shown.get(object.key) === visible) return;
      this.shown.set(object.key, visible);
      object.SetActive(visible);
    }
    Update() {
      const game2 = this.game;
      if (!game2?.settings) return;
      const me = game2.LocalPlayer();
      const uid = this.Networking.LocalPlayer.uid;
      const seated = !!me && game2.SlotOf(uid) >= 0;
      const level = game2.CurrentLevel;
      if (level) {
        if (this.courseText) this.courseText.text = level.levelName;
        if (this.levelText) this.levelText.text = `LEVEL ${level.index + 1} / ${LEVELS.length}`;
        if (this.strokesText) this.strokesText.text = seated && me.round === game2.round ? String(me.levelStrokes) : "-";
        if (this.parText) this.parText.text = String(level.par);
      }
      if (level) {
        for (let i = 0; i < this.pips.length && i < LEVELS.length; i++) {
          const pip = this.pips[i];
          if (!pip) continue;
          const style = PipStyle(i, level.index);
          this.Host.uiColor(pip.key, style.color);
          game2.relay.uiHeight(pip.key, style.height);
        }
      }
      const aiming = !!me && seated && me.aiming;
      this.show(this.powerCanvas, aiming);
      if (aiming) {
        const meter = PowerMeter(me.shotPower, this.powerSegments.length || 12);
        if (this.powerLabel) this.powerLabel.text = "PUTT STRENGTH";
        if (this.powerPercent) this.powerPercent.text = meter.percent;
        this.powerSegments.forEach((seg, i) => seg && this.Host.uiColor(seg.key, meter.colors[i]));
      }
      const left = me ? me.feedbackUntil - this.Time.time : 0;
      const toast = !!me && left > 0 && me.feedback !== "";
      this.show(this.feedbackCanvas, toast);
      if (toast) {
        if (this.feedbackText) this.feedbackText.text = me.feedback;
        if (this.feedbackCanvas) game2.relay.fade(this.feedbackCanvas.key, ToastAlpha(left));
      }
      this.show(this.courseCompleteCanvas, game2.courseComplete);
      const myRow = game2.RowOf(uid);
      if (game2.courseComplete && this.courseCompleteTotal) this.courseCompleteTotal.text = seated && myRow ? String(rowTotal(myRow)) : "-";
      if (this.joinLabel) this.joinLabel.text = seated ? "LEAVE" : freeSlot(game2.card, game2.settings.maxPlayers) < 0 && !game2.RowOf(uid) ? "TABLE FULL" : "JOIN";
      const lines = ScorecardLines(game2.card, game2.currentLevelIndex);
      this.cardLines.forEach((text, i) => {
        if (text) text.text = lines[i] ?? "";
      });
    }
  };
  function ScorecardLines(card, currentHole, rows = MAX_SLOTS) {
    const out = [headerLine(), parLine(LEVELS.map((l) => l.par))];
    const seated = sortedRows(card.filter((r) => r.slot >= 0));
    const gone = card.filter((r) => r.slot < 0).sort((a, b) => b.leftAt - a.leftAt || a.uid.localeCompare(b.uid));
    for (const row of [...seated, ...gone].slice(0, rows)) out.push(rowLine(row, currentHole));
    return out;
  }

  // src/index.ts
  var xyz = (v) => [v.x, v.y, v.z];
  var game = {
    slug: "mini-golf",
    behaviours: { MinimalGolfGame, VRGolfUI, GolfPlayer },
    // Play-mode readers beside digest, state, referee and players.
    debug: (instance) => {
      const golf = () => instance.behaviour("b1");
      return {
        hole: () => golf().currentLevelIndex,
        card: () => ScorecardLines(golf().card, golf().currentLevelIndex).join("\n"),
        layout: () => golf().slotOf.slice(),
        // for the Play-mode tests (playtest/golf-playtest.js)
        pathOf: (key) => instance.bindings.objects[key]?.path ?? "",
        revealing: () => golf().IsRevealing(),
        courseComplete: () => golf().courseComplete,
        holeWorld: () => golf().CurrentLevel ? xyz(golf().HoleWorld()) : null,
        spawnWorld: () => golf().CurrentLevel ? xyz(golf().SpawnWorld()) : null,
        ballWorld: (slot) => golf().balls[slot] ? xyz(golf().balls[slot].transform.position) : null,
        me: () => {
          const p = golf().LocalPlayer();
          if (!p) return null;
          return {
            slot: p.slot,
            hole: p.hole,
            levelStrokes: p.levelStrokes,
            holeStrokes: p.holeStrokes,
            totalStrokes: p.totalStrokes,
            finished: p.finished,
            capturing: p.capturing,
            ballLive: p.ballLive,
            canAct: p.CanTakeAction(),
            aiming: p.aiming,
            shotPower: p.shotPower,
            shotNumber: p.shotNumber,
            restShot: p.restShot,
            atRest: p.atRest,
            feedback: p.feedback,
            feedbackLeft: p.feedbackUntil - p.Time.time,
            captures: p.captures
          };
        },
        local: (x, y, z) => {
          const level = golf().CurrentLevel;
          return level ? xyz(level.InverseTransformPoint(new Vector3(x, y, z), golf().frame, golf().LevelPosition(level.index))) : null;
        },
        myUid: () => golf().Networking.LocalPlayer.uid,
        mySid: () => golf().Networking.LocalPlayer.sid,
        rows: () => golf().card.map((r) => ({ uid: r.uid, name: r.name, slot: r.slot, strokes: r.strokes.slice(), left: r.left })),
        seat: (uid) => golf().SlotOf(uid),
        // test levers (Play mode only): put the own ball somewhere (as physics or a hand could), and, on the referee, load a level
        moveBall: (x, y, z) => {
          const p = golf().LocalPlayer();
          const ball = p && p.slot >= 0 ? golf().balls[p.slot] : null;
          if (!ball || !p) return false;
          const at = new Vector3(x, y, z);
          ball.transform.position = at;
          golf().relay.place(ball.key, at, p.shotNumber);
          return true;
        },
        newRound: () => {
          if (!golf().Networking.IsReferee) return false;
          golf().StartRound(false);
          return true;
        },
        loadLevel: (level) => {
          if (!golf().Networking.IsReferee) return false;
          golf().LoadLevel(level);
          return true;
        },
        result: (uid, hole) => golf().ResultFor(uid, hole)
      };
    }
  };
  var src_default = game;

  // bindings.json
  var bindings_default = {
    behaviours: [
      {
        fields: {
          aimLine: {
            $obj: "aimLine"
          },
          aimPads: [
            {
              $obj: "aimPad0"
            },
            {
              $obj: "aimPad1"
            },
            {
              $obj: "aimPad2"
            },
            {
              $obj: "aimPad3"
            },
            {
              $obj: "aimPad4"
            },
            {
              $obj: "aimPad5"
            },
            {
              $obj: "aimPad6"
            },
            {
              $obj: "aimPad7"
            }
          ],
          ballAudio: [
            {
              $comp: "ball0",
              kind: "AudioSource"
            },
            {
              $comp: "ball1",
              kind: "AudioSource"
            },
            {
              $comp: "ball2",
              kind: "AudioSource"
            },
            {
              $comp: "ball3",
              kind: "AudioSource"
            },
            {
              $comp: "ball4",
              kind: "AudioSource"
            },
            {
              $comp: "ball5",
              kind: "AudioSource"
            },
            {
              $comp: "ball6",
              kind: "AudioSource"
            },
            {
              $comp: "ball7",
              kind: "AudioSource"
            }
          ],
          ballPicks: [
            {
              $obj: "ballPick0"
            },
            {
              $obj: "ballPick1"
            },
            {
              $obj: "ballPick2"
            },
            {
              $obj: "ballPick3"
            },
            {
              $obj: "ballPick4"
            },
            {
              $obj: "ballPick5"
            },
            {
              $obj: "ballPick6"
            },
            {
              $obj: "ballPick7"
            }
          ],
          balls: [
            {
              $obj: "ball0"
            },
            {
              $obj: "ball1"
            },
            {
              $obj: "ball2"
            },
            {
              $obj: "ball3"
            },
            {
              $obj: "ball4"
            },
            {
              $obj: "ball5"
            },
            {
              $obj: "ball6"
            },
            {
              $obj: "ball7"
            }
          ],
          board: {
            $obj: "board"
          },
          collisionClip: null,
          course: {
            $obj: "course"
          },
          handSpheres: [
            {
              $obj: "handSphereL"
            },
            {
              $obj: "handSphereR"
            }
          ],
          holeClips: [
            {
              $clip: 3,
              on: "gameSystems"
            },
            {
              $clip: 4,
              on: "gameSystems"
            },
            {
              $clip: 5,
              on: "gameSystems"
            }
          ],
          levelObjects: [
            {
              $obj: "level0"
            },
            {
              $obj: "level1"
            },
            {
              $obj: "level2"
            },
            {
              $obj: "level3"
            },
            {
              $obj: "level4"
            },
            {
              $obj: "level5"
            },
            {
              $obj: "level6"
            },
            {
              $obj: "level7"
            }
          ],
          shotClips: [
            {
              $clip: 0,
              on: "gameSystems"
            },
            {
              $clip: 1,
              on: "gameSystems"
            },
            {
              $clip: 2,
              on: "gameSystems"
            }
          ]
        },
        id: "b1",
        object: "gameSystems",
        type: "MinimalGolfGame"
      },
      {
        fields: {
          cardLines: [
            {
              $comp: "cardLine0",
              kind: "TMP"
            },
            {
              $comp: "cardLine1",
              kind: "TMP"
            },
            {
              $comp: "cardLine2",
              kind: "TMP"
            },
            {
              $comp: "cardLine3",
              kind: "TMP"
            },
            {
              $comp: "cardLine4",
              kind: "TMP"
            },
            {
              $comp: "cardLine5",
              kind: "TMP"
            },
            {
              $comp: "cardLine6",
              kind: "TMP"
            },
            {
              $comp: "cardLine7",
              kind: "TMP"
            },
            {
              $comp: "cardLine8",
              kind: "TMP"
            },
            {
              $comp: "cardLine9",
              kind: "TMP"
            }
          ],
          courseCompleteCanvas: {
            $obj: "courseCompleteCanvas"
          },
          courseCompleteTotal: {
            $comp: "courseCompleteTotal",
            kind: "TMP"
          },
          courseText: {
            $comp: "courseText",
            kind: "TMP"
          },
          feedbackCanvas: {
            $obj: "feedbackCanvas"
          },
          feedbackText: {
            $comp: "feedbackText",
            kind: "TMP"
          },
          game: {
            $beh: "b1"
          },
          joinLabel: {
            $comp: "joinLabel",
            kind: "TMP"
          },
          levelText: {
            $comp: "levelText",
            kind: "TMP"
          },
          parText: {
            $comp: "parText",
            kind: "TMP"
          },
          pips: [
            {
              $obj: "pip0"
            },
            {
              $obj: "pip1"
            },
            {
              $obj: "pip2"
            },
            {
              $obj: "pip3"
            },
            {
              $obj: "pip4"
            },
            {
              $obj: "pip5"
            },
            {
              $obj: "pip6"
            },
            {
              $obj: "pip7"
            }
          ],
          powerCanvas: {
            $obj: "powerCanvas"
          },
          powerLabel: {
            $comp: "powerLabel",
            kind: "TMP"
          },
          powerPercent: {
            $comp: "powerPercent",
            kind: "TMP"
          },
          powerSegments: [
            {
              $obj: "seg0"
            },
            {
              $obj: "seg1"
            },
            {
              $obj: "seg2"
            },
            {
              $obj: "seg3"
            },
            {
              $obj: "seg4"
            },
            {
              $obj: "seg5"
            },
            {
              $obj: "seg6"
            },
            {
              $obj: "seg7"
            },
            {
              $obj: "seg8"
            },
            {
              $obj: "seg9"
            },
            {
              $obj: "seg10"
            },
            {
              $obj: "seg11"
            }
          ],
          strokesText: {
            $comp: "strokesText",
            kind: "TMP"
          }
        },
        id: "b2",
        object: "board",
        type: "VRGolfUI"
      },
      {
        fields: {
          game: {
            $beh: "b1"
          }
        },
        id: "b3",
        object: "gameSystems",
        type: "GolfPlayer"
      }
    ],
    bundles: {
      android: "",
      windows: ""
    },
    events: [
      {
        behaviour: "b1",
        kind: "click",
        method: "ToggleJoin",
        object: "joinButton"
      },
      {
        behaviour: "b1",
        kind: "click",
        method: "PlayAgain",
        object: "playAgainButton"
      },
      {
        behaviour: "b3",
        kind: "click",
        method: "RestartMyHole",
        object: "restartButton"
      },
      {
        behaviour: "b3",
        kind: "click",
        method: "AimPadClick",
        object: "aimPad0"
      },
      {
        behaviour: "b3",
        kind: "click",
        method: "AimPadClick",
        object: "aimPad1"
      },
      {
        behaviour: "b3",
        kind: "click",
        method: "AimPadClick",
        object: "aimPad2"
      },
      {
        behaviour: "b3",
        kind: "click",
        method: "AimPadClick",
        object: "aimPad3"
      },
      {
        behaviour: "b3",
        kind: "click",
        method: "AimPadClick",
        object: "aimPad4"
      },
      {
        behaviour: "b3",
        kind: "click",
        method: "AimPadClick",
        object: "aimPad5"
      },
      {
        behaviour: "b3",
        kind: "click",
        method: "AimPadClick",
        object: "aimPad6"
      },
      {
        behaviour: "b3",
        kind: "click",
        method: "AimPadClick",
        object: "aimPad7"
      },
      {
        behaviour: "b3",
        kind: "click",
        method: "BallPickClick",
        object: "ballPick0"
      },
      {
        behaviour: "b3",
        kind: "click",
        method: "BallPickClick",
        object: "ballPick1"
      },
      {
        behaviour: "b3",
        kind: "click",
        method: "BallPickClick",
        object: "ballPick2"
      },
      {
        behaviour: "b3",
        kind: "click",
        method: "BallPickClick",
        object: "ballPick3"
      },
      {
        behaviour: "b3",
        kind: "click",
        method: "BallPickClick",
        object: "ballPick4"
      },
      {
        behaviour: "b3",
        kind: "click",
        method: "BallPickClick",
        object: "ballPick5"
      },
      {
        behaviour: "b3",
        kind: "click",
        method: "BallPickClick",
        object: "ballPick6"
      },
      {
        behaviour: "b3",
        kind: "click",
        method: "BallPickClick",
        object: "ballPick7"
      },
      {
        behaviour: "b3",
        kind: "graph",
        method: "OnGolfCapture",
        name: "golfCapture"
      },
      {
        behaviour: "b3",
        kind: "graph",
        method: "OnGolfRest",
        name: "golfRest"
      },
      {
        behaviour: "b3",
        kind: "graph",
        method: "OnGolfImpact",
        name: "golfImpact"
      }
    ],
    hash: "89c115ae664cb468cacde5366397235cf84ea1fd",
    objects: {
      aimLine: {
        click: false,
        grab: false,
        path: "AimLine",
        seat: false,
        sync: "none"
      },
      aimPad0: {
        click: true,
        grab: false,
        path: "Course/Level 1 - THE WARM UP/AimPad",
        seat: false,
        sync: "none"
      },
      aimPad1: {
        click: true,
        grab: false,
        path: "Course/Level 2 - THE GARDEN/AimPad",
        seat: false,
        sync: "none"
      },
      aimPad2: {
        click: true,
        grab: false,
        path: "Course/Level 3 - WINDMILL WAY/AimPad",
        seat: false,
        sync: "none"
      },
      aimPad3: {
        click: true,
        grab: false,
        path: "Course/Level 4 - BUMPER BEND/AimPad",
        seat: false,
        sync: "none"
      },
      aimPad4: {
        click: true,
        grab: false,
        path: "Course/Level 5 - GRAND TOUR/AimPad",
        seat: false,
        sync: "none"
      },
      aimPad5: {
        click: true,
        grab: false,
        path: "Course/Level 6 - HILLSIDE TURN/AimPad",
        seat: false,
        sync: "none"
      },
      aimPad6: {
        click: true,
        grab: false,
        path: "Course/Level 7 - EASY ASCENT/AimPad",
        seat: false,
        sync: "none"
      },
      aimPad7: {
        click: true,
        grab: false,
        path: "Course/Level 8 - SUMMIT RUN/AimPad",
        seat: false,
        sync: "none"
      },
      ball0: {
        active: false,
        click: false,
        grab: false,
        path: "Course/Balls/Ball 0",
        seat: false,
        sync: "transform"
      },
      ball1: {
        active: false,
        click: false,
        grab: false,
        path: "Course/Balls/Ball 1",
        seat: false,
        sync: "transform"
      },
      ball2: {
        active: false,
        click: false,
        grab: false,
        path: "Course/Balls/Ball 2",
        seat: false,
        sync: "transform"
      },
      ball3: {
        active: false,
        click: false,
        grab: false,
        path: "Course/Balls/Ball 3",
        seat: false,
        sync: "transform"
      },
      ball4: {
        active: false,
        click: false,
        grab: false,
        path: "Course/Balls/Ball 4",
        seat: false,
        sync: "transform"
      },
      ball5: {
        active: false,
        click: false,
        grab: false,
        path: "Course/Balls/Ball 5",
        seat: false,
        sync: "transform"
      },
      ball6: {
        active: false,
        click: false,
        grab: false,
        path: "Course/Balls/Ball 6",
        seat: false,
        sync: "transform"
      },
      ball7: {
        active: false,
        click: false,
        grab: false,
        path: "Course/Balls/Ball 7",
        seat: false,
        sync: "transform"
      },
      ballPick0: {
        click: true,
        grab: false,
        path: "Course/Balls/Ball 0/Pick",
        seat: false,
        sync: "none"
      },
      ballPick1: {
        click: true,
        grab: false,
        path: "Course/Balls/Ball 1/Pick",
        seat: false,
        sync: "none"
      },
      ballPick2: {
        click: true,
        grab: false,
        path: "Course/Balls/Ball 2/Pick",
        seat: false,
        sync: "none"
      },
      ballPick3: {
        click: true,
        grab: false,
        path: "Course/Balls/Ball 3/Pick",
        seat: false,
        sync: "none"
      },
      ballPick4: {
        click: true,
        grab: false,
        path: "Course/Balls/Ball 4/Pick",
        seat: false,
        sync: "none"
      },
      ballPick5: {
        click: true,
        grab: false,
        path: "Course/Balls/Ball 5/Pick",
        seat: false,
        sync: "none"
      },
      ballPick6: {
        click: true,
        grab: false,
        path: "Course/Balls/Ball 6/Pick",
        seat: false,
        sync: "none"
      },
      ballPick7: {
        click: true,
        grab: false,
        path: "Course/Balls/Ball 7/Pick",
        seat: false,
        sync: "none"
      },
      board: {
        click: false,
        grab: false,
        path: "Board",
        seat: false,
        sync: "none"
      },
      cardLine0: {
        click: false,
        grab: false,
        path: "Board/VR_UI/Scorecard/Line0",
        seat: false,
        sync: "none"
      },
      cardLine1: {
        click: false,
        grab: false,
        path: "Board/VR_UI/Scorecard/Line1",
        seat: false,
        sync: "none"
      },
      cardLine2: {
        click: false,
        grab: false,
        path: "Board/VR_UI/Scorecard/Line2",
        seat: false,
        sync: "none"
      },
      cardLine3: {
        click: false,
        grab: false,
        path: "Board/VR_UI/Scorecard/Line3",
        seat: false,
        sync: "none"
      },
      cardLine4: {
        click: false,
        grab: false,
        path: "Board/VR_UI/Scorecard/Line4",
        seat: false,
        sync: "none"
      },
      cardLine5: {
        click: false,
        grab: false,
        path: "Board/VR_UI/Scorecard/Line5",
        seat: false,
        sync: "none"
      },
      cardLine6: {
        click: false,
        grab: false,
        path: "Board/VR_UI/Scorecard/Line6",
        seat: false,
        sync: "none"
      },
      cardLine7: {
        click: false,
        grab: false,
        path: "Board/VR_UI/Scorecard/Line7",
        seat: false,
        sync: "none"
      },
      cardLine8: {
        click: false,
        grab: false,
        path: "Board/VR_UI/Scorecard/Line8",
        seat: false,
        sync: "none"
      },
      cardLine9: {
        click: false,
        grab: false,
        path: "Board/VR_UI/Scorecard/Line9",
        seat: false,
        sync: "none"
      },
      course: {
        click: false,
        grab: false,
        path: "Course",
        seat: false,
        sync: "none"
      },
      courseCompleteCanvas: {
        active: false,
        click: false,
        grab: false,
        path: "Board/VR_UI/CourseComplete",
        seat: false,
        sync: "none"
      },
      courseCompleteTotal: {
        click: false,
        grab: false,
        path: "Board/VR_UI/CourseComplete/ScoreBox/Total",
        seat: false,
        sync: "none"
      },
      courseText: {
        click: false,
        grab: false,
        path: "Board/VR_UI/GamePlayCard/IdentityGroup/Course",
        seat: false,
        sync: "none"
      },
      feedbackCanvas: {
        active: false,
        click: false,
        grab: false,
        path: "Board/VR_UI/FeedbackToast",
        seat: false,
        sync: "none"
      },
      feedbackText: {
        click: false,
        grab: false,
        path: "Board/VR_UI/FeedbackToast/Feedback",
        seat: false,
        sync: "none"
      },
      gameSystems: {
        click: false,
        grab: false,
        path: "GameSystems",
        seat: false,
        sync: "none"
      },
      handSphereL: {
        active: false,
        click: false,
        grab: false,
        path: "HandSpheres/Left",
        seat: false,
        sync: "none"
      },
      handSphereR: {
        active: false,
        click: false,
        grab: false,
        path: "HandSpheres/Right",
        seat: false,
        sync: "none"
      },
      joinButton: {
        click: true,
        grab: false,
        path: "Board/VR_UI/Buttons/Join",
        seat: false,
        sync: "none"
      },
      joinLabel: {
        click: false,
        grab: false,
        path: "Board/VR_UI/Buttons/Join/Label",
        seat: false,
        sync: "none"
      },
      level0: {
        click: false,
        grab: false,
        path: "Course/Level 1 - THE WARM UP",
        seat: false,
        sync: "none"
      },
      level1: {
        click: false,
        grab: false,
        path: "Course/Level 2 - THE GARDEN",
        seat: false,
        sync: "none"
      },
      level2: {
        click: false,
        grab: false,
        path: "Course/Level 3 - WINDMILL WAY",
        seat: false,
        sync: "none"
      },
      level3: {
        click: false,
        grab: false,
        path: "Course/Level 4 - BUMPER BEND",
        seat: false,
        sync: "none"
      },
      level4: {
        click: false,
        grab: false,
        path: "Course/Level 5 - GRAND TOUR",
        seat: false,
        sync: "none"
      },
      level5: {
        click: false,
        grab: false,
        path: "Course/Level 6 - HILLSIDE TURN",
        seat: false,
        sync: "none"
      },
      level6: {
        click: false,
        grab: false,
        path: "Course/Level 7 - EASY ASCENT",
        seat: false,
        sync: "none"
      },
      level7: {
        click: false,
        grab: false,
        path: "Course/Level 8 - SUMMIT RUN",
        seat: false,
        sync: "none"
      },
      levelText: {
        click: false,
        grab: false,
        path: "Board/VR_UI/GamePlayCard/IdentityGroup/Level",
        seat: false,
        sync: "none"
      },
      parText: {
        click: false,
        grab: false,
        path: "Board/VR_UI/GamePlayCard/StatsGroup/Par",
        seat: false,
        sync: "none"
      },
      pip0: {
        click: false,
        grab: false,
        path: "Board/VR_UI/GamePlayCard/ProgressGroup/Pip0",
        seat: false,
        sync: "none"
      },
      pip1: {
        click: false,
        grab: false,
        path: "Board/VR_UI/GamePlayCard/ProgressGroup/Pip1",
        seat: false,
        sync: "none"
      },
      pip2: {
        click: false,
        grab: false,
        path: "Board/VR_UI/GamePlayCard/ProgressGroup/Pip2",
        seat: false,
        sync: "none"
      },
      pip3: {
        click: false,
        grab: false,
        path: "Board/VR_UI/GamePlayCard/ProgressGroup/Pip3",
        seat: false,
        sync: "none"
      },
      pip4: {
        click: false,
        grab: false,
        path: "Board/VR_UI/GamePlayCard/ProgressGroup/Pip4",
        seat: false,
        sync: "none"
      },
      pip5: {
        click: false,
        grab: false,
        path: "Board/VR_UI/GamePlayCard/ProgressGroup/Pip5",
        seat: false,
        sync: "none"
      },
      pip6: {
        click: false,
        grab: false,
        path: "Board/VR_UI/GamePlayCard/ProgressGroup/Pip6",
        seat: false,
        sync: "none"
      },
      pip7: {
        click: false,
        grab: false,
        path: "Board/VR_UI/GamePlayCard/ProgressGroup/Pip7",
        seat: false,
        sync: "none"
      },
      playAgainButton: {
        click: true,
        grab: false,
        path: "Board/VR_UI/CourseComplete/PlayAgain",
        seat: false,
        sync: "none"
      },
      powerCanvas: {
        active: false,
        click: false,
        grab: false,
        path: "Board/VR_UI/PowerMeter",
        seat: false,
        sync: "none"
      },
      powerLabel: {
        click: false,
        grab: false,
        path: "Board/VR_UI/PowerMeter/Label",
        seat: false,
        sync: "none"
      },
      powerPercent: {
        click: false,
        grab: false,
        path: "Board/VR_UI/PowerMeter/Percent",
        seat: false,
        sync: "none"
      },
      restartButton: {
        click: true,
        grab: false,
        path: "Board/VR_UI/Buttons/Restart",
        seat: false,
        sync: "none"
      },
      seg0: {
        click: false,
        grab: false,
        path: "Board/VR_UI/PowerMeter/Seg0",
        seat: false,
        sync: "none"
      },
      seg1: {
        click: false,
        grab: false,
        path: "Board/VR_UI/PowerMeter/Seg1",
        seat: false,
        sync: "none"
      },
      seg10: {
        click: false,
        grab: false,
        path: "Board/VR_UI/PowerMeter/Seg10",
        seat: false,
        sync: "none"
      },
      seg11: {
        click: false,
        grab: false,
        path: "Board/VR_UI/PowerMeter/Seg11",
        seat: false,
        sync: "none"
      },
      seg2: {
        click: false,
        grab: false,
        path: "Board/VR_UI/PowerMeter/Seg2",
        seat: false,
        sync: "none"
      },
      seg3: {
        click: false,
        grab: false,
        path: "Board/VR_UI/PowerMeter/Seg3",
        seat: false,
        sync: "none"
      },
      seg4: {
        click: false,
        grab: false,
        path: "Board/VR_UI/PowerMeter/Seg4",
        seat: false,
        sync: "none"
      },
      seg5: {
        click: false,
        grab: false,
        path: "Board/VR_UI/PowerMeter/Seg5",
        seat: false,
        sync: "none"
      },
      seg6: {
        click: false,
        grab: false,
        path: "Board/VR_UI/PowerMeter/Seg6",
        seat: false,
        sync: "none"
      },
      seg7: {
        click: false,
        grab: false,
        path: "Board/VR_UI/PowerMeter/Seg7",
        seat: false,
        sync: "none"
      },
      seg8: {
        click: false,
        grab: false,
        path: "Board/VR_UI/PowerMeter/Seg8",
        seat: false,
        sync: "none"
      },
      seg9: {
        click: false,
        grab: false,
        path: "Board/VR_UI/PowerMeter/Seg9",
        seat: false,
        sync: "none"
      },
      strokesText: {
        click: false,
        grab: false,
        path: "Board/VR_UI/GamePlayCard/StatsGroup/Strokes",
        seat: false,
        sync: "none"
      }
    },
    refs: [
      "level0",
      "level1",
      "level2",
      "level3",
      "level4",
      "level5",
      "level6",
      "level7",
      "ball0",
      "ball1",
      "ball2",
      "ball3",
      "ball4",
      "ball5",
      "ball6",
      "ball7",
      "aimLine",
      "powerCanvas",
      "feedbackCanvas",
      "courseCompleteCanvas",
      "courseText",
      "levelText",
      "strokesText",
      "parText",
      "pip0",
      "pip1",
      "pip2",
      "pip3",
      "pip4",
      "pip5",
      "pip6",
      "pip7",
      "powerLabel",
      "powerPercent",
      "seg0",
      "seg1",
      "seg2",
      "seg3",
      "seg4",
      "seg5",
      "seg6",
      "seg7",
      "seg8",
      "seg9",
      "seg10",
      "seg11",
      "feedbackText",
      "courseCompleteTotal",
      "cardLine0",
      "cardLine1",
      "cardLine2",
      "cardLine3",
      "cardLine4",
      "cardLine5",
      "cardLine6",
      "cardLine7",
      "cardLine8",
      "cardLine9",
      "joinLabel",
      "gameSystems",
      "course"
    ],
    schema: 1,
    slug: "mini-golf"
  };

  // portkit/src/platform/bs.ts
  function pageEnv() {
    const g = globalThis;
    let storage = null;
    try {
      storage = g.localStorage ?? null;
    } catch {
      storage = null;
    }
    return {
      get BS() {
        return g.BS;
      },
      win: g.window,
      doc: g.document,
      MutationObserver: g.MutationObserver,
      storage,
      crypto: g.crypto,
      setTimeout: (fn, ms) => g.setTimeout(fn, ms),
      clearTimeout: (handle) => g.clearTimeout(handle),
      now: () => g.performance.now(),
      wallMs: () => g.Date.now(),
      random: () => g.Math.random(),
      console: g.console
    };
  }
  var DEFAULT_BS_OPTIONS = { joinTimeoutMs: 3e4, kitTimeoutMs: 12e4, kitFindMs: 2e4, userFlushMs: 200, headProbeMs: 5e3, stateBudgetBytes: 96 * 1024, stateEchoMs: 4e3, verbose: false };
  var HOST_EVENTS = {
    click: "click",
    grab: "grab",
    drop: "drop",
    triggerEnter: "trigger-enter",
    triggerExit: "trigger-exit",
    collisionEnter: "collision-enter",
    collisionExit: "collision-exit"
  };
  var DELIMITER_CODES = [182, 167, 124, 8253, 164];
  function hasDelimiter(text) {
    for (let i = 0; i < text.length; i++) if (DELIMITER_CODES.indexOf(text.charCodeAt(i)) >= 0) return true;
    return false;
  }
  var BsPlatform = class {
    constructor(env2, options = {}) {
      __publicField(this, "clock");
      __publicField(this, "limits", { ...DEFAULT_LIMITS });
      __publicField(this, "storage");
      __publicField(this, "crypto");
      __publicField(this, "env");
      __publicField(this, "options");
      __publicField(this, "scene", null);
      __publicField(this, "readyPromise", null);
      __publicField(this, "mirror", /* @__PURE__ */ new Map());
      __publicField(this, "snapshot", deferred());
      __publicField(this, "fullSeen", false);
      __publicField(this, "stateHandlers", []);
      __publicField(this, "errorHandlers", []);
      __publicField(this, "userHandlers", []);
      __publicField(this, "oneShotHandlers", []);
      __publicField(this, "playerHandlers", []);
      __publicField(this, "sessionHandlers", []);
      __publicField(this, "snippetHandlers", []);
      __publicField(this, "poseHandlers", []);
      __publicField(this, "teleportHandlers", []);
      __publicField(this, "headReading", null);
      __publicField(this, "inputHandlers", []);
      __publicField(this, "wrappers", /* @__PURE__ */ new WeakMap());
      /** uid -> the page's UserData object for everyone in the room. */
      __publicField(this, "roster", /* @__PURE__ */ new Map());
      __publicField(this, "pendingPublic", null);
      __publicField(this, "pendingProtected", null);
      /** Turns of writes not handed to the app yet (each turn is one action's writes: kept together while it fits). */
      __publicField(this, "stateQueue", []);
      /** Handed to the app, not yet seen back: path -> bytes and when. */
      __publicField(this, "unechoed", /* @__PURE__ */ new Map());
      __publicField(this, "unechoedBytes", 0);
      __publicField(this, "stateTimer", 0);
      __publicField(this, "warnedSplit", false);
      /** For tests and diagnostics: handoffs to the app, and the largest one in bytes. */
      __publicField(this, "stateStats", { handoffs: 0, largest: 0, deferred: 0 });
      __publicField(this, "pendingUser", /* @__PURE__ */ new Map());
      __publicField(this, "userTimer", 0);
      __publicField(this, "userLastFlush", -Infinity);
      __publicField(this, "userBackoff", 0);
      /** Own user state when the app has no user state to offer (Play mode on your own). */
      __publicField(this, "localUser", null);
      __publicField(this, "ownUser", /* @__PURE__ */ new Map());
      __publicField(this, "sessionId", "");
      __publicField(this, "keyNames", null);
      __publicField(this, "observer", null);
      this.env = env2;
      this.options = { ...DEFAULT_BS_OPTIONS, ...options };
      this.crypto = env2.crypto;
      this.clock = {
        now: () => env2.now(),
        wallSeconds: () => env2.wallMs() / 1e3,
        setTimeout: (fn, ms) => env2.setTimeout(fn, ms),
        clearTimeout: (handle) => env2.clearTimeout(handle)
      };
      const store = env2.storage;
      this.storage = {
        get: (key) => store ? store.getItem(key) : null,
        set: (key, value) => {
          if (!store) throw new Error("no storage on this page");
          store.setItem(key, value);
        },
        remove: (key) => store?.removeItem(key),
        keys: (prefix) => {
          const out = [];
          if (!store) return out;
          for (let i = 0; i < store.length; i++) {
            const key = store.key(i);
            if (key !== null && key.startsWith(prefix)) out.push(key);
          }
          return out;
        }
      };
    }
    random() {
      return this.env.random();
    }
    log(level, message) {
      if (level === "debug" && !this.options.verbose) return;
      const text = "[pk1] " + message;
      if (level === "error") this.env.console.error(text);
      else if (level === "warn") this.env.console.warn(text);
      else this.env.console.log(text);
    }
    // ---- the page registry --------------------------------------------------------------------------------------
    /** `window.__pk1`: made by whichever game script comes first, shared by all of them, so kept small and stable. */
    registry() {
      const win = this.env.win;
      let registry = win.__pk1;
      if (!registry || typeof registry !== "object" || !registry.holders) {
        const made = {
          v: 1,
          games: {},
          holders: {},
          debug: {},
          clock(key, id, seconds) {
            const holder = made.holders[key];
            if (holder) holder.clock(String(id), String(seconds));
          },
          event(key, name, args) {
            const holder = made.holders[key];
            if (holder) holder.event(String(name), args === void 0 || args === null ? "" : String(args));
          }
        };
        registry = made;
        win.__pk1 = made;
      }
      return registry;
    }
    /**
     * Waits until no other kit item of this page is loading (the registry's kitTurn, a chain every game script on the page
     * joins: scripts are separate bundles, so the turn lives on window.__pk1), then holds the turn. Resolves to the call
     * that hands it on; call it once the kit item has reported loaded (or given up). A script of an older portkit on the
     * same page does not take turns, so it can still overlap the others.
     */
    async kitTurn(holderName2) {
      const registry = this.registry();
      const before = registry.kitTurn instanceof Promise ? registry.kitTurn : Promise.resolve();
      let hand;
      const mine = new Promise((resolve) => {
        hand = resolve;
      });
      registry.kitTurn = before.then(() => mine);
      const waited = this.env.now();
      await before;
      const ms = this.env.now() - waited;
      if (ms > 0) this.log("debug", `kit ${holderName2}: waited ${Math.round(ms)} ms for the other kits on the page to load`);
      let handed = false;
      return () => {
        if (handed) return;
        handed = true;
        hand();
      };
    }
    claimGame(slug, info) {
      const registry = this.registry();
      if (Object.prototype.hasOwnProperty.call(registry.games, slug)) return false;
      registry.games[slug] = info;
      return true;
    }
    /**
     * Debugging hooks (state digests, a game's own test helpers such as "remove a cup" or "make me the saboteur") reach
     * the page registry only on a test page: one that set `window.__pk1_debug = true` before the script ran (the Play-mode
     * kit test's page does). A published page never does, so a shipped script exposes nothing to call.
     */
    expose(key, hooks) {
      const registry = this.registry();
      if (hooks && this.isTestPage()) registry.debug[key] = hooks;
      else delete registry.debug[key];
    }
    isTestPage() {
      return this.env.win.__pk1_debug === true;
    }
    onRelay(key, handlers) {
      const registry = this.registry();
      const holder = {
        clock: (id, seconds) => handlers.clock(id, Number(seconds)),
        event: (name, args) => handlers.event(name, parseEventArgs(args))
      };
      registry.holders[key] = holder;
      return () => {
        if (registry.holders[key] === holder) delete registry.holders[key];
      };
    }
    relaySend(payload) {
      this.attempt("relay", () => this.scene.SendToVisualScripting(TAG, payload));
    }
    // ---- ready --------------------------------------------------------------------------------------------------
    whenReady() {
      if (!this.readyPromise) this.readyPromise = this.becomeReady();
      return this.readyPromise;
    }
    async becomeReady() {
      const { env: env2 } = this;
      const loaded = deferred();
      env2.win.addEventListener("bs-loaded", () => loaded.resolve());
      await loaded.promise;
      this.scene = env2.BS.Scene.GetInstance();
      this.listen();
      const started = env2.now();
      let warned = false;
      while (!this.joined()) {
        if (env2.now() - started > this.options.joinTimeoutMs) {
          if (!warned) this.log("warn", "the local player has not joined a room; carrying on as the only player");
          warned = true;
          break;
        }
        await this.sleep(100);
      }
      this.sessionId = this.local().sid;
      this.seedMirror();
      this.watchSession();
      this.observeSnippets();
    }
    /** The local user exists and has a real session id (it reads "local" until the room is joined). */
    joined() {
      const user = this.scene.localUser;
      return !!user && typeof user.id === "string" && user.id !== "" && user.id !== "local";
    }
    sleep(ms) {
      return new Promise((resolve) => this.env.setTimeout(resolve, ms));
    }
    watchSession() {
      const check = () => {
        const now = this.local().sid;
        if (now !== this.sessionId) {
          this.sessionId = now;
          for (const handler of this.sessionHandlers.slice()) this.attempt("session handler", handler);
        }
        this.env.setTimeout(check, 1e3);
      };
      this.env.setTimeout(check, 1e3);
    }
    listen() {
      const scene = this.scene;
      const present = scene.users ?? {};
      for (const uid of Object.keys(present)) this.roster.set(uid, present[uid]);
      const on = (name, handler) => scene.On(name, (event) => {
        try {
          handler(event ? event.detail : void 0);
        } catch (error) {
          this.log("error", `${name} handler: ${error instanceof Error ? error.message : String(error)}`);
        }
      });
      on("space-state", (detail) => this.onSpaceState(detail));
      on("space-state-changed", (detail) => {
        if (this.fullSeen || !detail || !Array.isArray(detail.changes)) return;
        for (const change of detail.changes) {
          if (typeof change.property !== "string" || !change.property.startsWith(TAG + ".")) continue;
          this.applyChange(change.property, typeof change.newValue === "string" ? change.newValue : void 0);
        }
      });
      on("space-state-error", (detail) => this.onStateErrorEvent(detail));
      on("user-state-error", (detail) => this.onStateErrorEvent(detail));
      on("one-shot", (detail) => {
        if (!detail || typeof detail.data !== "string") return;
        for (const handler of this.oneShotHandlers.slice()) handler(String(detail.fromId ?? ""), detail.data);
      });
      on("user-joined", (user) => this.emitPlayer("join", user));
      on("user-left", (user) => this.emitPlayer("leave", user));
      on("user-state", (detail) => {
        if (!detail || !Array.isArray(detail.changes)) return;
        const sid = String(detail.id ?? detail.user?.id ?? "");
        for (const change of detail.changes) {
          if (typeof change.path !== "string" || !change.path.startsWith(TAG + ".")) continue;
          const value = change.deleted || typeof change.value !== "string" ? void 0 : change.value;
          if (sid === this.local().sid) {
            if (value === void 0) this.ownUser.delete(change.path);
            else this.ownUser.set(change.path, value);
          }
          this.emitUser(sid, change.path, value);
        }
      });
      on("player-teleported", (detail) => {
        if (!detail || !detail.position) return;
        const position = from3(detail.position);
        for (const handler of this.teleportHandlers.slice()) handler(position);
      });
      on("pose-update", (detail) => {
        if (!detail || !detail.head) return;
        const poses = { head: pose(detail.head), leftHand: pose(detail.leftHand), rightHand: pose(detail.rightHand) };
        for (const handler of this.poseHandlers.slice()) handler(poses);
      });
      const input = (event) => {
        for (const handler of this.inputHandlers.slice()) handler(event);
      };
      on("button-pressed", (d) => input({ type: "button", button: clampInt(d.button, 4), side: clampInt(d.side, 1), pressed: true }));
      on("button-released", (d) => input({ type: "button", button: clampInt(d.button, 4), side: clampInt(d.side, 1), pressed: false }));
      on("controller-axis-update", (d) => input({ type: "thumbstick", side: clampInt(d.hand, 1), x: Number(d.x) || 0, y: Number(d.y) || 0 }));
      on("trigger-axis-update", (d) => input({ type: "trigger", side: clampInt(d.hand, 1), value: Number(d.value) || 0 }));
      on("key-press", (d) => input({ type: "key", key: this.keyName(d.key), pressed: true }));
      on("key-release", (d) => input({ type: "key", key: this.keyName(d.key), pressed: false }));
    }
    keyName(code) {
      if (!this.keyNames) {
        this.keyNames = {};
        const codes = this.env.BS.KeyCode ?? {};
        for (const name of Object.keys(codes)) if (typeof codes[name] === "number") this.keyNames[codes[name]] = name;
      }
      return this.keyNames[Number(code)] ?? String(code);
    }
    // ---- players ------------------------------------------------------------------------------------------------
    toPlayer(user) {
      return { sid: String(user.id ?? ""), uid: String(user.uid ?? ""), name: String(user.name ?? ""), isLocal: user.isLocal === true, isAdmin: user.isSpaceAdmin === true };
    }
    local() {
      const user = this.scene?.localUser;
      if (!user) return { sid: "local", uid: "local", name: "", isLocal: true, isAdmin: false };
      const player = this.toPlayer(user);
      player.isLocal = true;
      if (!player.sid) player.sid = "local";
      return player;
    }
    /**
     * Who is in the room. The page keeps `scene.users` keyed by user id (so two sessions of one account show as
     * one player), and it removes a leaver only after `user-left` has been dispatched: the list is kept here, and
     * each player's fields are read live, because a session id is filled in after the fact.
     */
    players() {
      const out = [];
      let sawLocal = false;
      for (const user of this.roster.values()) {
        const player = this.toPlayer(user);
        if (player.isLocal) {
          sawLocal = true;
          if (!player.sid) player.sid = "local";
        } else if (!player.sid || player.sid === "local") continue;
        out.push(player);
      }
      if (!sawLocal) out.push(this.local());
      return out;
    }
    onPlayers(handler) {
      return subscribe(this.playerHandlers, handler);
    }
    onSessionChanged(handler) {
      return subscribe(this.sessionHandlers, handler);
    }
    emitPlayer(kind, user) {
      if (!user) return;
      const uid = String(user.uid ?? "");
      if (kind === "join") this.roster.set(uid, user);
      else this.roster.delete(uid);
      const player = this.toPlayer(user);
      for (const handler of this.playerHandlers.slice()) this.attempt("player handler", () => handler(kind, player));
    }
    // ---- space state --------------------------------------------------------------------------------------------
    onSpaceState(detail) {
      if (!detail || !Array.isArray(detail.changes)) return;
      if (detail.full) {
        const next = /* @__PURE__ */ new Map();
        for (const change of detail.changes) {
          if (typeof change.path === "string" && change.path.startsWith(TAG + ".") && !change.deleted && typeof change.value === "string") next.set(change.path, change.value);
        }
        this.replaceMirror(next);
        this.fullSeen = true;
        this.snapshot.resolve(true);
        return;
      }
      for (const change of detail.changes) {
        if (typeof change.path !== "string" || !change.path.startsWith(TAG + ".")) continue;
        this.applyChange(change.path, change.deleted || typeof change.value !== "string" ? void 0 : change.value);
      }
    }
    replaceMirror(next) {
      const gone = [...this.mirror.keys()].filter((path) => !next.has(path));
      for (const path of gone) this.applyChange(path, void 0);
      for (const [path, value] of next) this.applyChange(path, value);
    }
    /** Applies one change to the mirror and tells the listeners, unless the mirror already says so. */
    applyChange(path, value) {
      if (this.unechoed.has(path)) {
        this.release(path);
        if (this.stateQueue.length) Promise.resolve().then(() => this.pumpState());
      }
      const before = this.mirror.get(path);
      if (before === value) return;
      if (value === void 0) this.mirror.delete(path);
      else this.mirror.set(path, value);
      for (const handler of this.stateHandlers.slice()) {
        if (!path.startsWith(handler.prefix)) continue;
        try {
          handler.fn(path, value);
        } catch (error) {
          this.log("error", `state handler: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }
    /**
     * The mirror at the moment the adapter became ready. When the snapshot's own event was missed (the script
     * arrived after it), the page's copy of the state is asked for instead.
     */
    seedMirror() {
      if (this.fullSeen) return;
      const take = (entries) => {
        if (this.fullSeen || !entries) return;
        const next = new Map(this.mirror);
        for (const scope of ["public", "protected"]) {
          const map = entries[scope];
          if (!map) continue;
          for (const path of Object.keys(map)) if (path.startsWith(TAG + ".") && typeof map[path] === "string") next.set(path, map[path]);
        }
        this.replaceMirror(next);
      };
      take(this.scene.spaceStateJson);
      if (!this.joined()) return;
      this.attemptAsync("SpaceStateGetAll", async () => {
        const all = await this.scene.SpaceStateGetAll();
        take(all);
        this.snapshot.resolve(true);
      }).then((ok) => {
        if (!ok) this.snapshot.resolve(true);
      });
    }
    whenSnapshot(timeoutMs) {
      if (this.snapshot.settled) return this.snapshot.promise;
      const gate = deferred();
      const timer = this.env.setTimeout(() => gate.resolve(false), timeoutMs);
      this.snapshot.promise.then((ok) => {
        this.env.clearTimeout(timer);
        gate.resolve(ok);
      });
      return gate.promise;
    }
    stateGet(path) {
      return this.mirror.get(path);
    }
    stateEntries(prefix) {
      const out = [];
      for (const [path, value] of this.mirror) if (path.startsWith(prefix)) out.push([path, value]);
      return out;
    }
    /**
     * Writes go through the page's string calls (SetPublicSpaceProps / SetProtectedSpaceProps): those are the ones
     * the app queues, merges per key, sends as one batch every 0.2 s for a single rate-limit token, and retries
     * when the bucket is empty. The JSON calls (SpaceStateSet) are sent one by one and are refused outright when
     * the bucket is empty. (Runtime/LocalMultiplayer/State/SpaceStateService.cs.)
     */
    stateSet(path, value) {
      this.queueSet(path, value, false);
    }
    stateSetProtected(path, value) {
      this.queueSet(path, value, true);
    }
    queueSet(path, value, isProtected) {
      if (hasDelimiter(value) || hasDelimiter(path)) {
        this.log("error", `a state value for ${path} holds a bridge delimiter character and was not sent`);
        this.emitError(path, "invalid_value", true);
        return;
      }
      const first = this.pendingPublic === null && this.pendingProtected === null;
      if (isProtected) (this.pendingProtected ?? (this.pendingProtected = {}))[path] = value;
      else (this.pendingPublic ?? (this.pendingPublic = {}))[path] = value;
      if (!first) return;
      Promise.resolve().then(() => {
        const pub = this.pendingPublic;
        const prot = this.pendingProtected;
        this.pendingPublic = null;
        this.pendingProtected = null;
        if (pub) this.stateQueue.push({ scope: "public", writes: Object.entries(pub) });
        if (prot) this.stateQueue.push({ scope: "protected", writes: Object.entries(prot) });
        this.pumpState();
      });
    }
    /**
     * Hands queued turns to the app while the bytes it holds that the room has not echoed stay within the budget. The
     * app merges whatever it holds into its next batch (64 writes of up to 16 KiB: over the relay's 256 KiB), and does
     * so even more while it backs off, so the page's own queue is the only place a batch's size can be bounded. A turn
     * bigger than the budget is split (logged once); the leaves of one sync slot are one write each and never split.
     */
    pumpState() {
      const budget = this.options.stateBudgetBytes;
      const now = this.env.now();
      for (const [path, entry] of this.unechoed) {
        if (now - entry.at >= this.options.stateEchoMs) this.release(path);
      }
      while (this.stateQueue.length) {
        const turn = this.stateQueue[0];
        const room = budget - this.unechoedBytes;
        const size = (w) => utf8Length(w[0]) + utf8Length(w[1]) + 16;
        const total = turn.writes.reduce((sum, w) => sum + size(w), 0);
        let take;
        if (total <= room) take = turn.writes.splice(0);
        else if (this.unechoedBytes > 0) break;
        else {
          take = [];
          let bytes2 = 0;
          while (turn.writes.length && (take.length === 0 || bytes2 + size(turn.writes[0]) <= budget)) {
            bytes2 += size(turn.writes[0]);
            take.push(turn.writes.shift());
          }
          if (!this.warnedSplit) {
            this.warnedSplit = true;
            this.log("info", `one turn wrote ${total} bytes of space state, more than the ${budget} bytes sent at once: it goes in parts`);
          }
        }
        if (!turn.writes.length) this.stateQueue.shift();
        const props = {};
        let bytes = 0;
        for (const w of take) {
          props[w[0]] = w[1];
          bytes += size(w);
          if (this.mirror.get(w[0]) === w[1]) continue;
          this.release(w[0]);
          this.unechoed.set(w[0], { bytes: size(w), at: now });
          this.unechoedBytes += size(w);
        }
        this.stateStats.handoffs++;
        this.stateStats.largest = Math.max(this.stateStats.largest, bytes);
        if (turn.scope === "protected") this.attempt("SetProtectedSpaceProps", () => this.scene.SetProtectedSpaceProps(props));
        else this.attempt("SetPublicSpaceProps", () => this.scene.SetPublicSpaceProps(props));
      }
      if (this.stateQueue.length) {
        this.stateStats.deferred++;
        if (!this.stateTimer) {
          this.stateTimer = this.env.setTimeout(() => {
            this.stateTimer = 0;
            this.pumpState();
          }, 250);
        }
      }
    }
    /** A handed-off write came back (or failed, or timed out): it no longer counts against the budget. */
    release(path) {
      const entry = this.unechoed.get(path);
      if (!entry) return;
      this.unechoed.delete(path);
      this.unechoedBytes -= entry.bytes;
    }
    async stateDelete(path) {
      let delay = 250;
      for (let tries = 0; tries < 8; tries++) {
        try {
          await this.scene.SpaceStateDelete(path);
          return;
        } catch (error) {
          const code = errorCode(error);
          if (code === "not_found") return;
          if (code !== "rate_limited" && code !== "timeout") {
            this.emitError(path, code, true);
            return;
          }
          this.emitError(path, code, false);
          await this.sleep(delay);
          delay = Math.min(delay * 2, 4e3);
        }
      }
      this.emitError(path, "rate_limited", true);
    }
    onState(prefix, handler) {
      return subscribe(this.stateHandlers, { prefix, fn: handler });
    }
    onStateError(prefix, handler) {
      return subscribe(this.errorHandlers, { prefix, fn: handler });
    }
    onStateErrorEvent(detail) {
      if (!detail || typeof detail.key !== "string") return;
      if (detail.key.startsWith(TAG + ".")) this.emitError(detail.key, String(detail.code ?? "internal"), true);
    }
    emitError(path, code, final) {
      if (final && this.unechoed.has(path)) {
        this.release(path);
        if (this.stateQueue.length) Promise.resolve().then(() => this.pumpState());
      }
      for (const handler of this.errorHandlers.slice()) {
        if (path.startsWith(handler.prefix)) this.attempt("state error handler", () => handler.fn(path, code, final));
      }
    }
    // ---- user state ---------------------------------------------------------------------------------------------
    /**
     * Own user state goes through the JSON calls (UserStateSet / UserStateDelete), which answer per write. They
     * are sent one by one from a separate rate bucket, so writes are merged per leaf here and sent at most every
     * 0.2 s. Where the app offers no user state at all (Play mode on your own), the values are kept locally.
     */
    userSet(path, value) {
      if (this.localUser) {
        this.setLocalUser(path, value);
        return;
      }
      this.pendingUser.set(path, value);
      this.scheduleUserFlush();
    }
    scheduleUserFlush() {
      if (this.userTimer) return;
      const wait = Math.max(0, this.userLastFlush + Math.max(this.options.userFlushMs, this.userBackoff) - this.env.now());
      this.userTimer = this.env.setTimeout(() => {
        this.userTimer = 0;
        void this.flushUser();
      }, wait);
    }
    async flushUser() {
      this.userLastFlush = this.env.now();
      const batch = [...this.pendingUser];
      this.pendingUser.clear();
      let limited = false;
      for (const [path, value] of batch) {
        if (this.localUser) {
          this.setLocalUser(path, value);
          continue;
        }
        try {
          if (value === null) await this.scene.UserStateDelete(path);
          else await this.scene.UserStateSet(path, value);
        } catch (error) {
          const code = errorCode(error);
          if (code === "not_found") continue;
          if (code === "app_unavailable") {
            this.log("info", "no user state in this session: keeping the local player's own values locally");
            this.localUser = /* @__PURE__ */ new Map();
            this.setLocalUser(path, value);
          } else if (code === "rate_limited" || code === "timeout") {
            limited = true;
            if (!this.pendingUser.has(path)) this.pendingUser.set(path, value);
            this.emitError(path, code, false);
          } else this.emitError(path, code, true);
        }
      }
      this.userBackoff = limited ? Math.min(Math.max(this.userBackoff * 2, 250), 4e3) : 0;
      if (this.pendingUser.size) this.scheduleUserFlush();
    }
    setLocalUser(path, value) {
      const store = this.localUser;
      if (value === null) store.delete(path);
      else store.set(path, value);
      const sid = this.local().sid;
      Promise.resolve().then(() => this.emitUser(sid, path, value === null ? void 0 : value));
    }
    userGet(sid, path) {
      if (sid === this.local().sid) {
        if (this.localUser) return this.localUser.get(path);
        const own = this.ownUser.get(path);
        if (own !== void 0) return own;
      }
      for (const user of this.roster.values()) {
        if (user && user.id === sid) {
          const value = user.state ? user.state[path] : void 0;
          return typeof value === "string" ? value : void 0;
        }
      }
      return void 0;
    }
    onUser(prefix, handler) {
      return subscribe(this.userHandlers, { prefix, fn: handler });
    }
    emitUser(sid, path, value) {
      for (const handler of this.userHandlers.slice()) {
        if (path.startsWith(handler.prefix)) this.attempt("user state handler", () => handler.fn(sid, path, value));
      }
    }
    // ---- one-shots ----------------------------------------------------------------------------------------------
    oneShot(data) {
      if (utf8Length(data) > this.limits.oneShotMaxBytes) return false;
      this.attempt("OneShot", () => this.scene.OneShot(data));
      return true;
    }
    onOneShot(handler) {
      return subscribe(this.oneShotHandlers, handler);
    }
    // ---- kit ----------------------------------------------------------------------------------------------------
    async loadKit(spec) {
      const BS = this.env.BS;
      const holder = new BS.GameObject(spec.holderName);
      await holder.Async();
      const placement = {};
      if (spec.position) placement.localPosition = toBs3(BS, spec.position);
      if (spec.rotation) placement.localEulerAngles = toBs3(BS, spec.rotation);
      if (spec.scale) placement.localScale = toBs3(BS, spec.scale);
      if (Object.keys(placement).length) await holder.SetTransform(placement);
      await holder.AddComponent(new BS.AssetBundle(spec.windows, "", "", spec.android, "", "", false, false));
      const handOn = await this.kitTurn(spec.holderName);
      let ok;
      try {
        const item = new BS.KitItem("*");
        const loaded = deferred();
        item.On("loaded", () => loaded.resolve(true));
        await holder.AddComponent(item);
        if (item.isLoaded) loaded.resolve(true);
        const timer = this.env.setTimeout(() => loaded.resolve(false), this.options.kitTimeoutMs);
        ok = await loaded.promise;
        this.env.clearTimeout(timer);
      } finally {
        handOn();
      }
      if (!ok) this.log("error", `kit ${spec.holderName}: the kit item never reported loaded`);
      const scene = this.scene;
      const childrenOf = (parent) => {
        const id = String(parent.unityId);
        return Object.values(scene.objects ?? {}).filter((o) => String(o.parent) === id && !o.destroyed);
      };
      const byPath = (root, path) => {
        let at = root;
        if (path === "") return at;
        for (const name of path.split("/")) {
          at = childrenOf(at).find((o) => o.name === name);
          if (!at) return null;
        }
        return at;
      };
      const found = /* @__PURE__ */ new Map();
      let waiting = spec.objects.slice();
      const deadline = this.env.now() + this.options.kitFindMs;
      for (; ; ) {
        const roots = childrenOf(holder);
        const root = roots.find((o) => o.name === spec.rootName) ?? roots[0];
        if (root) {
          waiting = waiting.filter((object) => {
            const go = byPath(root, object.path);
            if (go) found.set(object.key, go);
            return !go;
          });
        }
        if (!waiting.length || this.env.now() >= deadline) break;
        await this.sleep(200);
      }
      for (const object of waiting) {
        try {
          const go = await holder.AddInlineObject(spec.rootName + "/" + object.path);
          if (go) found.set(object.key, go);
        } catch {
        }
      }
      const objects = /* @__PURE__ */ new Map();
      const missing = [];
      const prepare = async (object) => {
        const go = found.get(object.key);
        if (!go) {
          missing.push(object.key);
          return;
        }
        try {
          if (object.networkId) await go.SetNetworkId(object.networkId);
          let synced = null;
          let seat = null;
          if (object.sync === "transform") {
            synced = await go.AddComponent(
              new BS.SyncedObject({
                syncPosition: true,
                syncRotation: true,
                takeOwnershipOnCollision: false,
                takeOwnershipOnProximity: false,
                takeOwnershipOnGrab: object.grab,
                kinematicIfNotOwned: false
              })
            );
          }
          if (object.seat) seat = await go.AddComponent(new BS.Seat({}));
          objects.set(object.key, new BsHostObject(this, object.key, object.path, go, synced, seat, object.networkId, object.attachNetworkId ?? "", object.attach === true));
        } catch (error) {
          this.log("warn", `kit object ${object.key} (${object.path}): ${describe(error)}`);
          missing.push(object.key);
        }
      };
      await Promise.all(spec.objects.map(prepare));
      return {
        objects,
        missing,
        find: async (path) => {
          const roots = childrenOf(holder);
          const root = roots.find((o) => o.name === spec.rootName) ?? roots[0];
          const known = root ? byPath(root, path) : null;
          if (known) return new BsHostObject(this, "", path, known, null, null);
          try {
            const go = await holder.AddInlineObject(spec.rootName + "/" + path);
            return go ? new BsHostObject(this, "", path, go, null, null) : null;
          } catch {
            return null;
          }
        },
        destroy: () => {
          try {
            holder.Destroy();
          } catch {
          }
        }
      };
    }
    bundles(slug) {
      const table = this.env.win.__pk1_bundles;
      const entry = table ? table[slug] : void 0;
      if (!entry) return null;
      const address = (value) => typeof value === "string" && /^https?:\/\//i.test(value.trim()) ? value.trim() : "";
      const out = { windows: address(entry.windows), android: address(entry.android) };
      return out.windows || out.android ? out : null;
    }
    // ---- snippets -----------------------------------------------------------------------------------------------
    snippets(slug) {
      const all = Array.from(this.env.doc.querySelectorAll("bs-snippet"));
      const mine = all.filter((el) => (el.getAttribute("name") || "") === slug);
      return mine.map((el, index) => this.wrap(el, slug, index, mine));
    }
    wrap(el, slug, index, sameName) {
      let wrapper = this.wrappers.get(el);
      if (!wrapper) {
        const made = {
          _index: index,
          _peers: sameName,
          getAttribute: (name) => el.getAttribute(name),
          attributeNames: () => typeof el.getAttributeNames === "function" ? el.getAttributeNames() : [],
          get connected() {
            return el.isConnected !== false;
          },
          get active() {
            const single = el.getAttribute("single");
            if (single === null || single === "false") return true;
            if ("ownsSingleton" in el) return el.ownsSingleton === slug;
            return made._peers.indexOf(el) === 0;
          },
          get index() {
            return made._index;
          }
        };
        wrapper = made;
        this.wrappers.set(el, made);
      }
      wrapper._index = index;
      wrapper._peers = sameName;
      return wrapper;
    }
    onSnippetsChanged(handler) {
      return subscribe(this.snippetHandlers, handler);
    }
    observeSnippets() {
      if (this.observer || !this.env.MutationObserver) return;
      let queued = false;
      const observer = new this.env.MutationObserver(() => {
        if (queued) return;
        queued = true;
        this.env.setTimeout(() => {
          queued = false;
          for (const handler of this.snippetHandlers.slice()) this.attempt("snippet handler", handler);
        }, 0);
      });
      observer.observe(this.env.doc.documentElement, { childList: true, subtree: true });
      this.observer = observer;
    }
    // ---- the local player ---------------------------------------------------------------------------------------
    async isVR() {
      try {
        return await this.scene.IsVR() === true;
      } catch {
        return false;
      }
    }
    async raycast(origin, direction, maxDistance, layerMask) {
      const BS = this.env.BS;
      const reply = await this.scene.Raycast(toBs3(BS, origin), toBs3(BS, direction), maxDistance, layerMask);
      if (typeof reply !== "string") return null;
      const parts = reply.split("\xB6");
      if (parts.length < 8) return null;
      const n2 = parts.slice(2, 8).map(Number);
      return { objectId: parts[1], point: new Vector3(n2[0], n2[1], n2[2]), normal: new Vector3(n2[3], n2[4], n2[5]) };
    }
    onPose(handler) {
      return subscribe(this.poseHandlers, handler);
    }
    onTeleported(handler) {
      return subscribe(this.teleportHandlers, handler);
    }
    localPosition() {
      if (!this.headReading) this.headReading = this.readHead();
      return this.headReading;
    }
    /**
     * The page has no call that answers where the local player is. A throwaway object attached to the local
     * player's head (BS.AttachedObject, NonPhysics, attachment point Head = 0) is moved there by the app; its
     * transform, read once, is the head's position. The object starts at the origin, so the first reading away
     * from it is the answer. Then the object goes. UNVERIFIED in the app (checked in editor Play mode only, see
     * spikes/RESULTS.md S7).
     */
    async readHead() {
      const BS = this.env.BS;
      const uid = this.local().uid;
      let probe = null;
      const answer = deferred();
      const timer = this.env.setTimeout(() => answer.resolve(null), this.options.headProbeMs);
      try {
        probe = new BS.GameObject("pk1-head-probe");
        await probe.Async();
        const attached = await probe.AddComponent(
          new BS.AttachedObject({
            uid,
            attachmentPosition: new BS.Vector3(0, 0, 0),
            attachmentRotation: new BS.Quaternion(0, 0, 0, 1),
            attachmentType: 1,
            // NonPhysics
            attachmentPoint: 0,
            // Head
            autoSync: false,
            jointAvatar: false
          })
        );
        const PN = this.api.PN ?? this.api.PropertyName;
        const look = () => {
          const p = probe.transform?.position;
          if (p && (Number(p.x) || Number(p.y) || Number(p.z))) answer.resolve(from3(p));
        };
        await probe.WatchTransform([PN.position], look);
        await attached.Attach(uid);
        look();
        return await answer.promise;
      } catch (error) {
        this.log("info", `the local position could not be read at start: ${describe(error)}`);
        return null;
      } finally {
        this.env.clearTimeout(timer);
        answer.resolve(null);
        if (probe) {
          try {
            probe.Destroy();
          } catch {
          }
        }
      }
    }
    onInput(handler) {
      return subscribe(this.inputHandlers, handler);
    }
    haptic(side, strength, seconds) {
      this.attempt("SendHapticImpulse", () => this.scene.SendHapticImpulse(strength, seconds, side));
    }
    teleport(position, yDegrees, stopMovement) {
      this.attempt("TeleportTo", () => this.scene.TeleportTo(toBs3(this.env.BS, position), yDegrees, stopMovement));
    }
    setAbility(ability, allowed) {
      this.attempt("SetCan" + ability, () => this.scene["SetCan" + ability](allowed));
    }
    setBlock(control, blocked) {
      this.attempt("SetBlock" + control, () => this.scene["SetBlock" + control](blocked));
    }
    // ---- helpers ------------------------------------------------------------------------------------------------
    /** Runs a bridge call whose result nobody waits for; a failure is logged, never thrown into game code. */
    attempt(what, call) {
      try {
        const result = call();
        if (result && typeof result.then === "function") {
          result.then(void 0, (error) => this.log("warn", `${what} failed: ${describe(error)}`));
        }
      } catch (error) {
        this.log("warn", `${what} failed: ${describe(error)}`);
      }
    }
    async attemptAsync(what, call) {
      try {
        await call();
        return true;
      } catch (error) {
        this.log("debug", `${what} failed: ${describe(error)}`);
        return false;
      }
    }
    /** @internal for BsHostObject */
    get api() {
      return this.env.BS;
    }
    /** @internal for BsHostObject */
    userSession(user) {
      return user && typeof user.id === "string" ? user.id : void 0;
    }
  };
  var BsHostObject = class {
    constructor(platform, key, path, go, synced, seat, networkId2 = "", attachNetworkId = "", attachable = false) {
      __publicField(this, "key");
      __publicField(this, "path");
      __publicField(this, "platform");
      __publicField(this, "go");
      __publicField(this, "synced");
      __publicField(this, "seat");
      __publicField(this, "watchers", []);
      __publicField(this, "watching", false);
      __publicField(this, "attachNetworkId");
      __publicField(this, "hasNetworkId");
      __publicField(this, "attachable");
      __publicField(this, "attached", null);
      this.platform = platform;
      this.key = key;
      this.path = path;
      this.go = go;
      this.synced = synced;
      this.seat = seat;
      this.hasNetworkId = networkId2 !== "";
      this.attachNetworkId = attachNetworkId;
      this.attachable = attachable;
    }
    on(kind, handler) {
      const name = HOST_EVENTS[kind];
      if (!name) return () => {
      };
      const listener = (event) => {
        const d = event && event.detail ? event.detail : {};
        const detail = {};
        if (d.point) detail.point = from3(d.point);
        if (d.normal) detail.normal = from3(d.normal);
        if (typeof d.side === "number") detail.side = d.side;
        if (typeof d.name === "string") detail.otherName = d.name;
        const sid = this.platform.userSession(d.user);
        if (sid) detail.playerSid = sid;
        handler(detail);
      };
      this.go.On(name, listener);
      return () => this.go.Off(name, listener);
    }
    setTransform(patch) {
      const BS = this.platform.api;
      const out = {};
      if (patch.position) out.position = toBs3(BS, patch.position);
      if (patch.localPosition) out.localPosition = toBs3(BS, patch.localPosition);
      if (patch.localScale) out.localScale = toBs3(BS, patch.localScale);
      if (patch.rotation) out.rotation = new BS.Quaternion(patch.rotation.x, patch.rotation.y, patch.rotation.z, patch.rotation.w);
      if (patch.localRotation) out.localRotation = new BS.Quaternion(patch.localRotation.x, patch.localRotation.y, patch.localRotation.z, patch.localRotation.w);
      this.platform.attempt("SetTransform", () => this.go.SetTransform(out));
    }
    /**
     * Asking to watch a transform makes the host push its current value before it answers
     * (BSScene.WatchJsTransform calls SyncProperties(true)), so one round trip is a fresh read.
     * UNVERIFIED in the app: that the push reaches the page before the answer does.
     */
    async readTransform() {
      const PN = this.platform.api.PN ?? this.platform.api.PropertyName;
      try {
        await this.go.WatchTransform([PN.position, PN.rotation], () => this.report());
        this.watching = true;
      } catch {
        return null;
      }
      return this.current();
    }
    watchTransform(handler) {
      this.watchers.push(handler);
      if (!this.watching) void this.readTransform();
      return () => {
        const at = this.watchers.indexOf(handler);
        if (at >= 0) this.watchers.splice(at, 1);
      };
    }
    current() {
      const t = this.go.transform;
      if (!t || !t.position) return null;
      const r = t.rotation ?? { x: 0, y: 0, z: 0, w: 1 };
      return { position: from3(t.position), rotation: new Quaternion(Number(r.x) || 0, Number(r.y) || 0, Number(r.z) || 0, r.w === void 0 ? 1 : Number(r.w)) };
    }
    report() {
      const now = this.current();
      if (now) for (const watcher of this.watchers.slice()) watcher(now);
    }
    setActive(active) {
      this.platform.attempt("SetActive", () => this.go.SetActive(active));
    }
    setLayer(layer) {
      this.platform.attempt("SetLayer", () => this.go.SetLayer(layer));
    }
    takeOwnership() {
      if (this.synced) this.platform.attempt("TakeOwnership", () => this.synced.TakeOwnership());
    }
    async doIOwn() {
      if (!this.synced) return false;
      try {
        return await this.synced.DoIOwn() === true;
      } catch {
        return false;
      }
    }
    /** UNVERIFIED: that a kit object's own BSAudioSource is known to the page once the object is. */
    playClip(index) {
      const BS = this.platform.api;
      const source = this.go.GetComponent ? this.go.GetComponent((BS.CT ?? BS.ComponentType).AudioSource) : null;
      if (source) this.platform.attempt("PlayOneShot", () => source.PlayOneShot(index));
      else this.platform.log("warn", `no audio source known on ${this.path}`);
    }
    sit() {
      if (this.seat) this.platform.attempt("Sit", () => this.seat.Sit());
    }
    stand() {
      if (this.seat) this.platform.attempt("Stand", () => this.seat.Stand());
    }
    /** UNVERIFIED in Play mode: BS.AttachedObject added to a kit object, attachment point set, then Attach(local user id). */
    attachToHand(side, position, rotation) {
      this.attach(side === 0 ? 1 : 2, position, rotation, false);
    }
    /** UNVERIFIED in Play mode: as attachToHand, at the head (attachment point 0); with autoSync the app shows it to others. */
    attachToHead(position, rotation, autoSync) {
      this.attach(0, position, rotation, autoSync);
    }
    attach(point, position, rotation, autoSync) {
      const BS = this.platform.api;
      const uid = this.platform.local().uid;
      void (async () => {
        try {
          if (autoSync && !this.attachable) {
            this.platform.log("warn", `${this.key}: attached with autoSync but not marked attachable in the bindings (KitStage.Attachable): other players will not see the attachment`);
          }
          if (autoSync && !this.hasNetworkId && this.attachNetworkId) {
            await this.go.SetNetworkId(this.attachNetworkId);
            this.hasNetworkId = true;
          }
          if (!this.attached) {
            this.attached = await this.go.AddComponent(
              new BS.AttachedObject({
                uid,
                attachmentPosition: new BS.Vector3(position.x, position.y, position.z),
                attachmentRotation: new BS.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w),
                attachmentType: 1,
                // NonPhysics
                attachmentPoint: point,
                // Head 0, LeftHand 1, RightHand 2
                autoSync,
                jointAvatar: false
              })
            );
          } else {
            this.attached.attachmentPoint = point;
            this.attached.attachmentPosition = new BS.Vector3(position.x, position.y, position.z);
            this.attached.attachmentRotation = new BS.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);
            this.attached.autoSync = autoSync;
          }
          await this.attached.Attach(uid);
        } catch (error) {
          this.platform.log("warn", `AttachedObject on ${this.path}: ${String(error)}`);
        }
      })();
    }
    detach() {
      if (!this.attached) return;
      const uid = this.platform.local().uid;
      this.platform.attempt("Detach", () => this.attached.Detach(uid));
    }
    releaseGrab() {
      this.platform.attempt("ReleaseGrab", () => this.go.ReleaseGrab());
    }
  };
  function subscribe(list, item) {
    list.push(item);
    return () => {
      const at = list.indexOf(item);
      if (at >= 0) list.splice(at, 1);
    };
  }
  function toBs3(BS, v) {
    return new BS.Vector3(v.x, v.y, v.z);
  }
  function from3(v) {
    return new Vector3(Number(v.x) || 0, Number(v.y) || 0, Number(v.z) || 0);
  }
  function pose(source) {
    const p = source?.position ?? {};
    const r = source?.rotation ?? {};
    return { position: from3(p), rotation: new Quaternion(Number(r.x) || 0, Number(r.y) || 0, Number(r.z) || 0, r.w === void 0 ? 1 : Number(r.w)) };
  }
  function clampInt(value, max) {
    const n2 = Math.trunc(Number(value) || 0);
    return n2 < 0 ? 0 : n2 > max ? max : n2;
  }
  function errorCode(error) {
    if (error && typeof error === "object" && typeof error.code === "string") return error.code;
    return "internal";
  }
  function describe(error) {
    if (error instanceof Error) return error.message;
    return typeof error === "string" ? error : JSON.stringify(error);
  }

  // pk-mini-golf.entry.ts
  var env = pageEnv();
  var claimed = env.win.__pk1 && env.win.__pk1.games && Object.prototype.hasOwnProperty.call(env.win.__pk1.games, src_default.slug);
  if (!claimed) boot(new BsPlatform(env), src_default, bindings_default);
})();
