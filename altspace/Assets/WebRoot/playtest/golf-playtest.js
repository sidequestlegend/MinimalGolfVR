// Rungs 3 and 4: the mini-golf table in editor Play mode, driven through the SDK's desktop player with the port kit's
// input (InputSim: a mouse and keyboard of the test's own; the SDK casts its own rays and raises click and key events
// itself), and checked in Unity with the kit's probe command. Not part of the snippet: the test page loads it first.
//
// window.__golfPlan:
//   "single"  one player: JOIN, hole 1 played to the cup with desktop controls (click the green, Space), the stroke count,
//             the capture and the next level; out of bounds; then a full-power shot in four directions on every hole
//             (tunnelling through rails at the 1:20 scale with an 8 mm ball).
//   "multi"   two Local Multiplayer players: each has a ball, each sees the other's ball move, the scorecard shows both,
//             the hole advances only when both have holed out; one player reloads (late join) and the digests match.
(function () {
  "use strict";
  const KEY = "mini-golf:0";
  const HOLDER = "pk1:mini-golf:0";
  const SCALE = 0.05;
  const say = (kind, what, detail) => console.log("PKTEST " + kind + " " + what + (detail !== undefined ? ": " + detail : ""));
  let passed = 0;
  let failed = 0;
  const check = (ok, what, detail) => {
    if (ok) passed++;
    else failed++;
    say(ok ? "PASS" : "FAIL", what, detail);
    return ok;
  };
  const replies = new Map();
  let count = 0;
  window.__pktest = Object.assign(window.__pktest || {}, {
    reply(id, text) {
      const resolve = replies.get(id);
      if (resolve) {
        replies.delete(id);
        resolve(text);
      }
    },
  });
  const cmd = (line, ms) =>
    new Promise((resolve) => {
      const id = "g" + ++count;
      replies.set(id, resolve);
      console.log("PKTEST CMD " + id + " " + line);
      setTimeout(() => {
        if (replies.delete(id)) resolve("error: no reply");
      }, ms || 30000);
    });
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  async function until(test, ms, step) {
    const end = Date.now() + ms;
    for (;;) {
      let value = false;
      try {
        value = test();
      } catch (e) {
        value = false;
      }
      if (value) return value;
      if (Date.now() > end) return false;
      await sleep(step || 100);
    }
  }
  const debug = () => window.__pk1 && window.__pk1.debug && window.__pk1.debug[KEY];
  const probe = (what, path, extra) => cmd("probe " + HOLDER + " " + what + " " + path.replace(/ /g, "%20") + (extra ? " " + extra : ""));
  const P = (text) => text.split(" ").map(Number);
  const fmt = (v) => (v ? v.map((x) => x.toFixed(3)).join(",") : "null");
  const me = () => debug().me();

  async function clickObject(key, what) {
    const pos = await probe("pos", debug().pathOf(key));
    await cmd("look " + pos);
    const r = await cmd("click " + pos);
    say("INFO", "click " + what, r);
    return r.startsWith("ok");
  }

  async function waitStarted() {
    const ok = await until(() => debug() && debug().hole && debug().hole() >= 0, 120000, 250);
    check(!!ok, "the kit loads from a hand-written bs-snippet and the instance starts", ok ? "hole " + debug().hole() : "no debug hooks after 120 s");
    return !!ok;
  }

  async function join(name) {
    await sleep(1500);
    // playtest.sh empties the local relay's saved room before each run: nobody is seated from an earlier one
    await clickObject("joinButton", "JOIN");
    const seated = await until(() => debug().seat(debug().myUid()) >= 0 && me() && me().slot >= 0, 20000, 200);
    let label = "";
    for (let i = 0; i < 20 && label !== "LEAVE"; i++) {
      label = await probe("text", debug().pathOf("joinLabel"));
      if (label !== "LEAVE") await sleep(150);
    }
    check(!!seated && label === "LEAVE", "JOIN (a UI collider, real mouse) seats " + name, "slot " + debug().seat(debug().myUid()) + ", button " + label);
    return !!seated;
  }

  /** Waits until the own ball is on the green and at rest (the ball graph reported golfRest for the latest shot). */
  const ready = (ms) => until(() => me() && me().canAct, ms || 20000, 100);

  /** The level-local frame of the current hole: course point -> world (no holder rotation in these tests). */
  function frame() {
    const spawn = debug().spawnWorld();
    const hole = debug().holeWorld();
    return { spawn, hole, greenY: spawn[1] - 0.29 * SCALE };
  }

  /**
   * A desktop putt with the real input path: look at the ball, click the aim pad at `ball - dir * pull` (upstream's
   * slingshot: the hand pulled back), then UpArrow `boost` times (each adds 1/12 of the full 16 cm pull), then Space.
   */
  async function putt(dir, pull, boost, label) {
    const before = me().levelStrokes;
    const shotsBefore = me().shotNumber;
    const ball = debug().ballWorld(me().slot);
    const f = frame();
    // where the hand is pulled to, from the ball; a point on the far side of the ball (seen from the player, who stands
    // at -z) hides behind it, so the click goes a quarter turn to the side and LeftArrow turns the aim back (5 degrees a tap)
    let hand = [-dir[0] * pull, -dir[1] * pull];
    const hidden = hand[1] > 0.002;
    if (hidden) hand = [hand[1], -hand[0]];
    const point = [ball[0] + hand[0], f.greenY + 0.15 * SCALE, ball[2] + hand[1]];
    await cmd("look " + ball.join(" "));
    const clicked = await cmd("click " + point.join(" "));
    await until(() => me().aiming, 2000, 50);
    if (!me().aiming) {
      say("INFO", label + ": no aim after the click", clicked);
      return false;
    }
    if (hidden) for (let i = 0; i < 18; i++) await cmd("key LeftArrow tap");
    for (let i = 0; i < (boost || 0); i++) await cmd("key UpArrow tap");
    const power = me().shotPower;
    await cmd("key Space tap");
    const shot = await until(() => me().shotNumber > shotsBefore, 3000, 50);
    say("INFO", label, `pull ${pull.toFixed(3)} m${hidden ? " (clicked to the side, turned back with 18 x LeftArrow)" : ""} + ${boost || 0} steps, power ${power.toFixed(3)}, strokes ${before} -> ${me().levelStrokes}${shot ? "" : " (NO SHOT)"}`);
    return !!shot;
  }

  /** After a putt: the ball holed out (true), stopped (false), or neither in time (null). */
  async function settle(ms) {
    const shot = me().shotNumber;
    const done = await until(() => me().finished !== 0 || me().capturing || (me().restShot >= shot && me().atRest), ms || 20000, 100);
    if (!done) return null;
    // at rest inside the cup's pull (assistRadius 0.04 m): the assist keeps drawing it in; give it time to drop
    const b = debug().ballWorld(me().slot);
    const h = debug().holeWorld();
    if (me().finished === 0 && !me().capturing && Math.hypot(b[0] - h[0], b[2] - h[2]) < 0.045) await until(() => me().capturing || me().finished !== 0, 4000, 50);
    if (me().capturing || me().finished === 1) {
      await until(() => me().finished === 1, 3000, 50);
      return true;
    }
    return false;
  }

  /** Plays the current hole to the cup by aiming at the hole and learning the pull from how far each putt rolled. */
  async function playToCup(maxStrokes, gain) {
    let k = gain || 0.03;
    for (let stroke = 0; stroke < maxStrokes; stroke++) {
      if (!(await ready(20000))) return false;
      const ball = debug().ballWorld(me().slot);
      const hole = debug().holeWorld();
      const dx = hole[0] - ball[0];
      const dz = hole[2] - ball[2];
      const dist = Math.hypot(dx, dz);
      const dir = [dx / dist, dz / dist];
      // at least 1.05 cm: a click closer to the ball lands on the ball's own pick, which putts only while aiming
      const pull = Math.max(0.0105, Math.min(0.16, k * dist));
      if (!(await putt(dir, pull, 0, `putt ${stroke + 1} from ${dist.toFixed(3)} m`))) return false;
      const result = await settle(20000);
      if (result === true) return true;
      if (result === null) return false;
      const after = debug().ballWorld(me().slot);
      const rolled = (after[0] - ball[0]) * dir[0] + (after[2] - ball[2]) * dir[1];
      if (rolled > 0.005) k = Math.max(0.004, Math.min(0.4, k * Math.min(2, Math.max(0.5, dist / rolled))));
      say("INFO", "rolled " + rolled.toFixed(3) + " m toward the hole; pull per metre now " + k.toFixed(4));
    }
    return false;
  }

  async function single() {
    if (!(await waitStarted())) return;
    // every ball has an id of this instance's own, and none shows before anyone is seated
    const ids = [];
    let hidden = 0;
    for (let s = 0; s < 8; s++) {
      ids.push(await probe("netid", debug().pathOf("ball" + s)));
      if ((await probe("active", debug().pathOf("ball" + s))) === "False") hidden++;
    }
    check(new Set(ids).size === 8 && ids.every((id, s) => id === "pk1/mini-golf/0/ball" + s), "the eight pooled balls have network ids of this instance (BS Synced Object added by the script)", ids.join(" "));
    check(hidden === 8, "no ball shows before a player is seated", hidden + " of 8 hidden");
    const level = await probe("text", debug().pathOf("courseText"));
    check(level === "THE WARM UP", "the board shows hole 1 (relay op text)", level);

    if (!(await join("the player"))) return;
    const slot = me().slot;
    const ballPath = debug().pathOf("ball" + slot);
    const live = await ready(20000);
    const pos = P(await probe("pos", ballPath));
    const spawn = debug().spawnWorld();
    const off = Math.hypot(pos[0] - spawn[0], pos[2] - spawn[2]);
    check(!!live && off < 0.01, "after the reveal the ball is placed at the reset point and reported at rest (ball graph: golfRest)", `ball ${fmt(pos)}, reset point ${fmt(spawn)}, ${off.toFixed(4)} m apart`);
    let shows = "";
    for (let i = 0; i < 20 && shows !== "True"; i++) {
      shows = await probe("active", ballPath);
      if (shows !== "True") await sleep(150);
    }
    check(shows === "True", "the own ball shows", shows);
    await cmd("shot start 0 " + (spawn[1] + 0.45) + " " + (spawn[2] - 0.35) + " 0 " + spawn[1] + " " + (spawn[2] + 0.25) + " 60");

    // ---- hole 1: one short putt, RESTART HOLE (board button, real mouse), then to the cup ----
    {
      const f = frame();
      const ball = debug().ballWorld(slot);
      const dx = f.hole[0] - ball[0];
      const dz = f.hole[2] - ball[2];
      const d = Math.hypot(dx, dz);
      await putt([dx / d, dz / d], 0.0105, 0, "a short first putt");
      await settle(15000);
      await ready(20000);
      await clickObject("restartButton", "RESTART HOLE");
      const restarted = await until(() => me().feedback === "LEVEL RESTARTED", 4000, 50);
      await ready(5000);
      const back = debug().ballWorld(slot);
      check(!!restarted && me().levelStrokes === 0 && me().holeStrokes === 1 && Math.hypot(back[0] - spawn[0], back[2] - spawn[2]) < 0.01,
        "RESTART HOLE (board button): ball back at the reset point, level strokes 0, the hole keeps its stroke (K2)", `level ${me().levelStrokes}, hole ${me().holeStrokes}, ball ${fmt(back)}`);
    }
    const holed = await playToCup(8, 0.03);
    const strokes = me().levelStrokes;
    const holeStrokes = me().holeStrokes;
    check(holed, "hole 1 played to the cup with desktop controls (click the green, Space)", `${strokes} strokes this attempt, ${holeStrokes} on the hole, finished ${me().finished}`);
    const strokesText = await probe("text", debug().pathOf("strokesText"));
    check(strokesText === String(strokes) && strokes >= 1, "the board shows the stroke count (this attempt, as upstream)", `board '${strokesText}', player ${strokes}`);
    await sleep(700);
    const scale = P(await probe("scale", ballPath));
    const sunk = P(await probe("pos", ballPath));
    const hole = debug().holeWorld();
    check(holed && scale[0] < 0.2 && sunk[1] < hole[1], "the capture: the ball shrinks and sinks into the cup (sink op, ball graph)", `scale ${fmt(scale)}, ball ${fmt(sunk)}, hole ${fmt(hole)}`);
    const toast = await probe("text", debug().pathOf("feedbackText"));
    const par = 2; // hole 1, THE WARM UP
    const expected = holeStrokes < par ? "UNDER PAR!" : holeStrokes === par ? "ON PAR!" : "+" + (holeStrokes - par) + " OVER PAR";
    check(toast === "HOLE COMPLETE  \u2022  " + expected, "the hole-complete message counts the hole's strokes, the restarted attempt included (review finding 6)", `${toast} (${holeStrokes} strokes, par ${par})`);
    const card = await probe("text", debug().pathOf("cardLine2"));
    check(new RegExp("\\s" + holeStrokes + "\\s").test(card), "the scorecard records the hole, the restarted attempt included", card);
    const next = await until(() => debug().hole() === 1, 8000, 100);
    const name2 = await probe("text", debug().pathOf("courseText"));
    const level2 = await probe("text", debug().pathOf("levelText"));
    check(!!next && name2 === "THE GARDEN" && level2 === "LEVEL 2 / 8", "the next level loads 2.05 s later (THE GARDEN)", `${name2}, ${level2}`);
    const placed2 = await ready(20000);
    const spawn2 = debug().spawnWorld();
    const pos2 = P(await probe("pos", ballPath));
    check(!!placed2 && Math.hypot(pos2[0] - spawn2[0], pos2[2] - spawn2[2]) < 0.01 && me().levelStrokes === 0, "on hole 2 the ball is back at its reset point, level strokes 0, total kept", `ball ${fmt(pos2)}, total ${me().totalStrokes}`);
    await cmd("shot hole2 0 " + (spawn2[1] + 0.5) + " " + (spawn2[2] - 0.4) + " 0 " + spawn2[1] + " " + (spawn2[2] + 0.3) + " 60");

    // ---- out of bounds: the ball is put below the course (as falling off would); it comes back, no stroke ----
    const before = me().levelStrokes;
    debug().moveBall(spawn2[0], spawn2[1] - 0.2, spawn2[2]);
    const returned = await until(() => me().feedback === "BALL RETURNED", 4000, 50);
    await ready(5000);
    const pos3 = P(await probe("pos", ballPath));
    check(!!returned && me().levelStrokes === before && Math.hypot(pos3[0] - spawn2[0], pos3[2] - spawn2[2]) < 0.01 && Math.abs(pos3[1] - spawn2[1]) < 0.01,
      "out of bounds resets the ball to the reset point, BALL RETURNED, no stroke (D1, D2)", `ball ${fmt(pos3)}, strokes ${before} -> ${me().levelStrokes}`);

    // ---- tunnelling: full power in four directions on every hole, in a new round (hole 1 is already on the card) ----
    debug().newRound();
    await until(() => debug().hole() === 0 && debug().seat(debug().myUid()) < 0, 5000, 100);
    if (await join("the player, in a new round")) await tunnelling();
  }

  async function tunnelling() {
    const W = [4.4, 6.2, 7, 7.4, 8.5, 11.5, 7.5, 8.5];
    const L = [10.5, 14.5, 20, 18, 21.5, 15, 13.3, 13.3];
    let shots = 0;
    let through = 0;
    for (let level = 0; level < 8; level++) {
      if (debug().hole() !== level) {
        debug().loadLevel(level);
        await until(() => debug().hole() === level, 5000, 100);
      }
      // the ball of this level: placed at its reset point after the reveal
      const placed = await until(() => {
        const b = debug().ballWorld(me().slot);
        const s = debug().spawnWorld();
        return me().hole === level && me().canAct && b && Math.hypot(b[0] - s[0], b[2] - s[2]) < 0.005;
      }, 20000, 100);
      if (!placed) {
        check(false, `tunnelling, hole ${level + 1}: the ball is placed`, JSON.stringify(me()));
        continue;
      }
      const results = [];
      for (const [name, dir] of [["forward", [0, 1]], ["back", [0, -1]], ["left", [-1, 0]], ["right", [1, 0]]]) {
        await ready(15000);
        const f = frame();
        void f;
        // a sampler running through the putt (the Space tap alone lasts 0.35 s): every position the page hears, in level units
        const track = [];
        let tracking = true;
        (async () => {
          while (tracking) {
            const b = debug().ballWorld(me().slot);
            if (b) track.push(debug().local(b[0], b[1], b[2]));
            await sleep(15);
          }
        })();
        const shot = await putt(dir, 0.05, 9, `hole ${level + 1} full power ${name}`);
        if (!shot) {
          results.push(name + " no shot");
          continue;
        }
        shots++;
        // follow the roll: the ball must stay inside the rails (|x| <= width/2, |z| <= length/2 in level units)
        // follow the roll in level units; a ball outside |x| <= width/2 or |z| <= length/2 has left between the rails
        let outside = false;
        let beyond = 0;
        const path = [];
        const end = Date.now() + 9000;
        while (Date.now() < end) {
          const b = debug().ballWorld(me().slot);
          const l = debug().local(b[0], b[1], b[2]);
          path.push(l.map((x) => x.toFixed(2)).join(","));
          if (me().feedback === "BALL RETURNED" && me().feedbackLeft > 0) {
            outside = true;
            break;
          }
          beyond = Math.max(beyond, Math.abs(l[0]) - W[level] / 2, Math.abs(l[2]) - L[level] / 2);
          if (me().finished !== 0 || (me().restShot >= me().shotNumber && me().atRest)) break;
          await sleep(25);
        }
        tracking = false;
        const b = debug().ballWorld(me().slot);
        const l = debug().local(b[0], b[1], b[2]);
        // how it left, if it did: the first sample past the rails' outer line, and its height against the rail tops
        // (rails are 0.54 high on a green whose top is 0.1, so a ball centre above 0.64 + 0.16 = 0.8 is over them)
        const out = track.find((t) => Math.abs(t[0]) > W[level] / 2 || Math.abs(t[2]) > L[level] / 2);
        const peak = track.reduce((m, t) => Math.max(m, t[1]), -9);
        let verdict = "inside";
        if (outside || out) {
          const crossing = out ? out.map((x) => x.toFixed(2)).join(",") : "not sampled";
          verdict = out && out[1] > 0.8 ? `FLEW OVER THE RAILS (launched; crossing at ${crossing}, peak height ${peak.toFixed(2)})` : `THROUGH THE RAILS (crossing at ${crossing}, peak height ${peak.toFixed(2)})`;
        }
        results.push(`${name}: ${verdict}, rest at (${l.map((x) => x.toFixed(2)).join(",")})`);
        if (verdict.indexOf("THROUGH") >= 0) through++;
        // back to the reset point for the next direction (RESTART HOLE, key R), unless the hole was finished
        if (me().finished === 0) await cmd("key R tap");
        else {
          debug().loadLevel(level);
          await until(() => me().finished === 0, 5000, 100);
        }
        await sleep(400);
      }
      check(results.length === 4 && results.every((r) => r.indexOf("THROUGH") < 0 && r.indexOf("no shot") < 0), `tunnelling, hole ${level + 1} (${W[level]} x ${L[level]} units): no full-power shot passes through a rail`, results.join("; "));
    }
    say("INFO", `tunnelling: ${shots} full-power shots, ${through} through a rail`);
  }

  // ---- two players -------------------------------------------------------------------------------------------
  const heard = [];
  function channel() {
    const scene = window.BS.Scene.GetInstance();
    scene.On("one-shot", (e) => {
      const data = e && e.detail && e.detail.data;
      if (typeof data !== "string" || data.indexOf("golfTest") < 0) return;
      try {
        heard.push(JSON.parse(data));
      } catch (x) {
        /* not ours */
      }
    });
    return (message) => scene.OneShot(JSON.stringify(Object.assign({ golfTest: 1 }, message)));
  }
  const reloaded = () => {
    try {
      return sessionStorage.getItem("golfTestReloaded") === "1";
    } catch (e) {
      return false;
    }
  };

  async function multi() {
    if (!(await waitStarted())) return;
    const send = channel();
    const two = await until(() => debug().players().length >= 2, 90000, 500);
    check(!!two, "two players in the room", JSON.stringify(debug().players()));
    if (!two) return;
    await sleep(2000);
    const back = reloaded();
    const mine = debug().myUid();
    const first = back ? false : debug().players().map((p) => p.sid).sort()[0] === debug().mySid();
    const who = first ? "A" : "B";
    if (back) {
      // after the reload: the same hole, the same seat, the same digest as the other page
      const seat = await until(() => debug().seat(mine) >= 0, 30000, 250);
      check(!!seat && debug().hole() === 1, "after reloading its page B is still seated on hole 2 (late join)", `seat ${debug().seat(mine)}, hole ${debug().hole()}`);
      const ballBack = await ready(20000);
      check(!!ballBack, "B's ball is back on the green under B's control after the reload", JSON.stringify(me()));
      await sleep(2500);
      send({ kind: "back", stamp: debug().stamp() });
      const theirs = await until(() => heard.find((m) => m.kind === "digest2"), 20000, 250);
      // digests are compared at the same version (the same writes): wait until this page has the other's version
      const same = theirs && (await until(() => debug().version() === theirs.stamp.version, 10000, 100));
      const mineNow = debug().stamp();
      check(!!same && theirs.stamp.digest === mineNow.digest, "both pages hold the same state digest after the reload (at the same version)", theirs ? `${theirs.stamp.digest} / ${mineNow.digest} at ${mineNow.version}` : "no digest heard");
      try {
        sessionStorage.removeItem("golfTestReloaded");
      } catch (e) {
        /* nothing */
      }
      return;
    }
    say("INFO", "this page is " + who);
    if (!first) await sleep(3000);
    if (!(await join(who))) return;
    const both = await until(() => debug().rows().filter((r) => r.slot >= 0 && !r.left).length === 2, 30000, 250);
    check(!!both, "both players are seated", JSON.stringify(debug().rows()));
    await ready(20000);
    const mySlot = me().slot;
    const theirSlot = debug().rows().find((r) => r.uid !== mine).slot;
    // each sees two balls; the scorecard lists both
    const otherBallPath = debug().pathOf("ball" + theirSlot);
    let theirsActive = "";
    for (let i = 0; i < 40 && theirsActive !== "True"; i++) {
      theirsActive = await probe("active", otherBallPath);
      if (theirsActive !== "True") await sleep(250);
    }
    check(theirsActive === "True" && (await probe("active", debug().pathOf("ball" + mySlot))) === "True", "each player has a ball, and sees the other's", `mine ball${mySlot}, theirs ball${theirSlot} active ${theirsActive}`);
    const names = [];
    for (let i = 2; i < 4; i++) names.push(await probe("text", debug().pathOf("cardLine" + i)));
    check(names.filter((n) => n.trim().length > 0).length === 2, "the scorecard shows both players", names.join(" | "));

    // A putts first; B watches A's ball move (synced transform), then B putts and A watches
    const watch = async (slot) => {
      const start = P(await probe("pos", debug().pathOf("ball" + slot)));
      let moved = 0;
      for (let i = 0; i < 40; i++) {
        const now = P(await probe("pos", debug().pathOf("ball" + slot)));
        moved = Math.max(moved, Math.hypot(now[0] - start[0], now[2] - start[2]));
        if (moved > 0.02) break;
        await sleep(150);
      }
      return moved;
    };
    if (first) {
      await until(() => heard.some((m) => m.kind === "watching"), 20000, 100);
      const f = frame();
      const ball = debug().ballWorld(mySlot);
      const dx = f.hole[0] - ball[0];
      const dz = f.hole[2] - ball[2];
      const d = Math.hypot(dx, dz);
      await putt([dx / d, dz / d], 0.0105, 0, "A's first putt (short)");
      await settle(15000);
      send({ kind: "puttDone" });
      send({ kind: "watching" });
      const moved = await watch(theirSlot);
      check(moved > 0.02, "A sees B's ball move", moved.toFixed(3) + " m");
    } else {
      send({ kind: "watching" });
      const moved = await watch(theirSlot);
      check(moved > 0.02, "B sees A's ball move", moved.toFixed(3) + " m");
      await until(() => heard.some((m) => m.kind === "watching") && heard.some((m) => m.kind === "puttDone"), 30000, 100);
      await sleep(500);
      const f = frame();
      const ball = debug().ballWorld(mySlot);
      const dx = f.hole[0] - ball[0];
      const dz = f.hole[2] - ball[2];
      const d = Math.hypot(dx, dz);
      await putt([dx / d, dz / d], 0.0105, 0, "B's first putt (short)");
      await settle(15000);
    }

    // A holes out first; the hole must not advance until B has holed out too
    if (first) {
      const holed = await playToCup(10, 0.03);
      check(holed, "A holes out", `${me().holeStrokes} strokes`);
      await sleep(3500);
      check(debug().hole() === 0, "the hole waits for B (A holed out, B still playing)", "hole " + (debug().hole() + 1));
      send({ kind: "aHoled" });
      const adv = await until(() => debug().hole() === 1, 120000, 250);
      check(!!adv, "the hole advances once both have holed out", "hole " + (debug().hole() + 1));
      const rows = debug().rows();
      check(rows.every((r) => r.strokes[0] !== null && r.strokes[0] >= 1), "the scorecard has both players' strokes for hole 1", JSON.stringify(rows.map((r) => [r.name, r.strokes[0]])));
      // B reloads now; A waits for its word and compares digests
      const backMsg = await until(() => heard.find((m) => m.kind === "back"), 120000, 250);
      const same = backMsg && (await until(() => debug().version() === backMsg.stamp.version, 10000, 100));
      const mineNow = debug().stamp();
      check(!!same && backMsg.stamp.digest === mineNow.digest, "B's page, reloaded, holds the same state as A's (digest at the same version)", backMsg ? `${backMsg.stamp.digest} / ${mineNow.digest} at ${mineNow.version}` : "no word from B");
      send({ kind: "digest2", stamp: debug().stamp() });
      await sleep(1500);
    } else {
      await until(() => heard.some((m) => m.kind === "aHoled"), 180000, 250);
      check(debug().hole() === 0, "B is still on hole 1 after A holed out", "hole " + (debug().hole() + 1));
      const holed = await playToCup(10, 0.03);
      check(holed, "B holes out", `${me().holeStrokes} strokes`);
      const adv = await until(() => debug().hole() === 1, 10000, 250);
      check(!!adv, "B sees the next hole load", "hole " + (debug().hole() + 1));
      await ready(20000);
      try {
        sessionStorage.setItem("golfTestReloaded", "1");
      } catch (e) {
        /* no storage */
      }
      say("INFO", "B reloads its page");
      await sleep(500);
      location.reload();
      await sleep(60000);
    }
  }

  window.__golfRun = async function (plan) {
    try {
      if (plan === "single") await single();
      else if (plan === "multi") await multi();
      else if (plan === "tunnel") {
        if ((await waitStarted()) && (await join("the player"))) await tunnelling();
      }
    } catch (e) {
      check(false, "the test ran to its end", e && e.stack ? e.stack.split("\n").slice(0, 3).join(" | ") : String(e));
    }
    say("INFO", "page result " + passed + " passed, " + failed + " failed");
    console.log("PKTEST DONE");
  };
  if (window.__golfPlan) window.__golfRun(window.__golfPlan);
})();
