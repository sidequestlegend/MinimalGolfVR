// Golden vectors: MinimalGolfVR's own gameplay C# (Assets/MinimalGolf/Scripts, unchanged), driven through its real
// methods on stand-ins for Unity (UnityStubs.cs). `npm run golden` writes ../vectors/upstream.json, which
// test/golden.test.ts plays through the TypeScript port. The level table is the port's own src/levels.json (generated
// from PORT.md), and the tuning is set to the scene's values (SCENE:2061-2098), as the upstream scene does.
#pragma warning disable CS8600, CS8602, CS8604, CS8618, CS8625
using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text.Json;
using Golden;
using MinimalGolf;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace MinimalGolf
{
    // Upstream types the compiled files name but whose code is not needed (editor tooling and the x-ray manager).
    public sealed class VRCoursePlacement : MonoBehaviour { }
    public sealed class ProximityRevealVolume : MonoBehaviour { }
}

public static class Harness
{
    const BindingFlags All = BindingFlags.Instance | BindingFlags.Static | BindingFlags.Public | BindingFlags.NonPublic;

    static FieldInfo Field(Type t, string n)
    {
        for (; t != null; t = t.BaseType) { var f = t.GetField(n, All); if (f != null) return f; }
        throw new Exception("no field " + n);
    }
    static void Set(object o, string n, object v) => Field(o.GetType(), n).SetValue(o, v);
    static T Get<T>(object o, string n) => (T)Field(o.GetType(), n).GetValue(o);
    static object Call(object o, string n, params object[] a)
    {
        var m = o.GetType().GetMethods(All).First(x => x.Name == n && x.GetParameters().Length == a.Length);
        return m.Invoke(o, a);
    }

    static double[] V(Vector3 v) => new double[] { v.x, v.y, v.z };
    static double[] C(Color c) => new double[] { c.r, c.g, c.b, c.a };
    static double[] Q(Quaternion q) => new double[] { q.x, q.y, q.z, q.w };

    class LevelRow { public string name; public int par; public float width, length; public Vector3 spawn, hole, slot; public int parts; }

    static List<LevelRow> LevelTable(string path)
    {
        using var doc = JsonDocument.Parse(File.ReadAllText(path));
        Vector3 v(JsonElement e) => new Vector3(e[0].GetSingle(), e[1].GetSingle(), e[2].GetSingle());
        return doc.RootElement.GetProperty("levels").EnumerateArray().Select(e => new LevelRow
        {
            name = e.GetProperty("levelName").GetString(),
            par = e.GetProperty("par").GetInt32(),
            width = e.GetProperty("courseWidth").GetSingle(),
            length = e.GetProperty("courseLength").GetSingle(),
            spawn = v(e.GetProperty("ballSpawn")),
            hole = v(e.GetProperty("holeCenter")),
            slot = v(e.GetProperty("slot")),
            parts = e.GetProperty("revealParts").GetInt32(),
        }).ToList();
    }

    class Scene
    {
        public MinimalGolfGame game;
        public MiniGolfLevel[] levels;
        public Rigidbody[] balls;
        public Transform anchor, courseLevels;
        public LineRenderer line;
    }

    static GameObject Child(Transform parent, string name)
    {
        var go = new GameObject(name);
        go.transform.SetParent(parent, false);
        return go;
    }

    /// <summary>The scene's play objects, as SCENE has them: anchor, VRCourseLevels at 0.05, eight levels at their slots.</summary>
    static Scene Build(List<LevelRow> table, Vector3 anchorAt, float anchorYaw)
    {
        Runner.Reset();
        var s = new Scene();
        s.anchor = new GameObject("VRCourseAnchor").transform;
        s.anchor.localPosition = anchorAt;
        s.anchor.localRotation = Quaternion.Euler(0, anchorYaw, 0);
        s.courseLevels = Child(s.anchor, "VRCourseLevels").transform;
        s.courseLevels.localScale = new Vector3(0.05f, 0.05f, 0.05f);
        s.levels = new MiniGolfLevel[table.Count];
        s.balls = new Rigidbody[table.Count];
        for (int k = 0; k < table.Count; k++)
        {
            var row = table[k];
            var go = Child(s.courseLevels, $"Level {k + 1} - {row.name}");
            go.transform.localPosition = row.slot;
            var level = go.AddComponent<MiniGolfLevel>();
            go.AddComponent<LevelRevealAnimator>();
            level.levelName = row.name;
            level.par = row.par;
            level.courseWidth = row.width;
            level.courseLength = row.length;
            var player = Child(go.transform, "PLAYER");
            var spawn = Child(player.transform, "Ball Reset Point");
            spawn.transform.localPosition = row.spawn;
            level.ballSpawn = spawn.transform;
            var hole = Child(Child(go.transform, "HOLE").transform, "Hole Center - Cup Assist Target");
            hole.transform.localPosition = row.hole;
            level.holeCenter = hole.transform;
            var ball = Child(player.transform, "Golf Ball").AddComponent<Rigidbody>();
            ball.transform.localPosition = row.spawn;
            level.ball = ball;
            s.levels[k] = level;
            s.balls[k] = ball;
        }
        var systems = new GameObject("GAME SYSTEMS");
        s.game = systems.AddComponent<MinimalGolfGame>();
        s.line = Child(systems.transform, "Aiming Line").AddComponent<LineRenderer>();
        s.game.levels = s.levels;
        s.game.aimingLine = s.line;
        s.game.vrCourseLevels = s.courseLevels;
        // Scene values (SCENE:2061-2098), where the C# defaults differ.
        s.game.aimingLineWidth = 0.01f;
        s.game.vrAimingLineMinLength = 0f;
        s.game.vrAimingLineMaxLength = 0.3f;
        s.game.thumbstickRotationSpeed = 70f;
        s.game.vrMaximumDragDistance = 0.16f;
        s.game.vrMinShotPower = 0.001f;
        Set(s.game, "maximumImpulse", 2.0f);
        Set(s.game, "minimumImpulse", 0.005f);
        Set(s.game, "maximumDragDistance", 0.35f);
        Set(s.game, "playableSpeed", 0.10f);
        Set(s.game, "assistRadius", 0.04f);
        Set(s.game, "captureRadius", 0.008f);
        Set(s.game, "maximumAssistedSpeed", 0.6f);
        Set(s.game, "maximumCaptureSpeed", 0.35f);
        Set(s.game, "minimumPullAcceleration", 0.35f);
        Set(s.game, "maximumPullAcceleration", 1.2f);
        Call(s.game, "Awake");
        Call(s.game, "Start");
        return s;
    }

    static int[] SlotOf(Scene s, List<LevelRow> table)
    {
        return s.levels.Select(l => table.FindIndex(r => (r.slot - l.transform.localPosition).sqrMagnitude < 1e-6f)).ToArray();
    }

    public static int Main(string[] args)
    {
        string here = AppContext.BaseDirectory;
        string root = Path.GetFullPath(Path.Combine(here, "../../../.."));
        string levelsPath = Path.Combine(root, "src", "levels.json");
        string outPath = args.Length > 0 ? Path.GetFullPath(args[0], root) : Path.Combine(root, "vectors", "upstream.json");
        var table = LevelTable(levelsPath);
        var output = new Dictionary<string, object>
        {
            ["source"] = "MinimalGolfVR cc7ed63 Assets/MinimalGolf/Scripts, compiled with dotnet 8 against golden/UnityStubs.cs; driven by golden/Harness.cs",
            ["aim"] = Aim(table),
            ["club"] = Club(table),
            ["assist"] = Assist(table),
            ["capture"] = Capture(table),
            ["layout"] = Layout(table),
            ["bounds"] = Bounds(table),
            ["reveal"] = Reveal(table),
            ["ui"] = Ui(table),
            ["impact"] = Impact(),
            ["audio"] = Audio(),
            ["windmill"] = Windmill(),
        };
        Directory.CreateDirectory(Path.GetDirectoryName(outPath));
        File.WriteAllText(outPath, JsonSerializer.Serialize(output, new JsonSerializerOptions { WriteIndented = false }) + "\n");
        Console.WriteLine("wrote " + outPath);
        return 0;
    }

    // ---- the shot: BeginVRAim, UpdateVRAim, TryEndVRAimAndShoot (MinimalGolfGame.cs:391-456, 528-550) ---------------

    static List<object> Aim(List<LevelRow> table)
    {
        var s = Build(table, new Vector3(0, 1.1f, 0.55f), 0);
        var game = s.game;
        var ball = s.balls[0];
        var outList = new List<object>();
        float[] lengths = { 0f, 0.00005f, 0.00016f, 0.0001599f, 0.0002f, 0.001f, 0.01f, 0.05f, 0.08f, 0.1599f, 0.16f, 0.2f, 0.5f };
        Vector3[] dirs = { new Vector3(0, 0, -1), new Vector3(1, 0, 1).normalized, new Vector3(-0.3f, 0, 0.8f).normalized };
        float[] speeds = { 0f, 0.1f, 0.1001f, 0.5f };
        var cases = new List<(Vector3 start, Vector3[] path, float beginSpeed, float releaseSpeed)>();
        foreach (var d in dirs)
            foreach (var len in lengths)
                cases.Add((new Vector3(0.05f, 0.02f, 0.03f), new[] { d * (len * 0.5f), d * len }, 0f, 0f));
        foreach (var sp in speeds)
        {
            cases.Add((Vector3.zero, new[] { new Vector3(0, 0, -0.1f) }, sp, 0f));
            cases.Add((Vector3.zero, new[] { new Vector3(0, 0, -0.1f) }, 0f, sp));
        }
        cases.Add((Vector3.zero, new[] { new Vector3(0, 0.3f, 0) }, 0f, 0f)); // vertical only
        cases.Add((Vector3.zero, new[] { new Vector3(0, -0.2f, 0.12f) }, 0f, 0f));
        foreach (var c in cases)
        {
            Record.Clear();
            Set(game, "levelStrokes", 0);
            Set(game, "totalStrokes", 0);
            Set(game, "feedback", "");
            ball.linearVelocity = new Vector3(c.beginSpeed, 0, 0);
            var ballPos = ball.position;
            bool began = game.BeginVRAim(ballPos + c.start);
            var steps = new List<object>();
            foreach (var p in c.path)
            {
                game.UpdateVRAim(ballPos + p);
                steps.Add(new Dictionary<string, object>
                {
                    ["hand"] = V(ballPos + p),
                    ["power"] = (double)game.ShotPower,
                    ["direction"] = V(game.AimDirection),
                    ["lineFrom"] = V(s.line.positions[0]),
                    ["lineTo"] = V(s.line.positions[1]),
                    ["lineColor"] = C(s.line.startColor),
                });
            }
            ball.linearVelocity = new Vector3(c.releaseSpeed, 0, 0);
            bool shot = game.TryEndVRAimAndShoot();
            outList.Add(new Dictionary<string, object>
            {
                ["ball"] = V(ballPos),
                ["start"] = V(ballPos + c.start),
                ["beginSpeed"] = (double)c.beginSpeed,
                ["releaseSpeed"] = (double)c.releaseSpeed,
                ["began"] = began,
                ["steps"] = steps,
                ["shot"] = shot,
                ["events"] = Record.Events.ToList(),
                ["levelStrokes"] = game.LevelStrokes,
                ["totalStrokes"] = game.TotalStrokes,
                ["feedback"] = game.CurrentFeedback,
            });
            ball.linearVelocity = Vector3.zero;
        }
        // TryApplyShot directly: the power floor, clamping and vertical directions.
        foreach (var p in new[] { -0.5f, 0f, 0.0005f, 0.000999f, 0.001f, 0.25f, 0.5f, 1f, 1.5f })
            foreach (var d in new[] { new Vector3(0, 0, 1), new Vector3(3, 0, 4), new Vector3(0, 1, 0), new Vector3(0.001f, 5, 0.001f), new Vector3(0.006f, 1, 0.008f) })
            {
                Record.Clear();
                bool ok = game.TryApplyShot(d, p);
                outList.Add(new Dictionary<string, object> { ["apply"] = true, ["direction"] = V(d), ["power"] = (double)p, ["shot"] = ok, ["events"] = Record.Events.ToList() });
            }
        return outList;
    }

    // ---- the club in a hand: VRGolfClub.Update (:237-316) -----------------------------------------------------------

    static List<object> Club(List<LevelRow> table)
    {
        var outList = new List<object>();
        // Each script: frames of (hand offset from the ball, trigger axis, digital held, ball speed); one or two hands.
        var scripts = new Dictionary<string, List<(Vector3 r, float tr, bool held, Vector3 l, float tl, bool heldL, float speed)>>();
        List<(Vector3, float, bool, Vector3, float, bool, float)> Script(params (Vector3, float, bool, Vector3, float, bool, float)[] f) => f.ToList();
        var far = new Vector3(0, 0.3f, 0.5f);
        scripts["near press, pull, release"] = Script(
            (new Vector3(0.1f, 0.05f, 0.05f), 0f, false, far, 0, false, 0),
            (new Vector3(0.1f, 0.05f, 0.05f), 0.9f, true, far, 0, false, 0),
            (new Vector3(0.1f, 0.05f, 0.0f), 0.9f, true, far, 0, false, 0),
            (new Vector3(0.1f, 0.05f, -0.06f), 0.9f, true, far, 0, false, 0),
            (new Vector3(0.12f, 0.05f, -0.12f), 0.9f, true, far, 0, false, 0),
            (new Vector3(0.12f, 0.05f, -0.12f), 0f, false, far, 0, false, 0),
            (new Vector3(0.12f, 0.05f, -0.12f), 0f, false, far, 0, false, 0));
        scripts["just inside reach"] = Script(
            (new Vector3(0, 0, 0.1899f), 0f, false, far, 0, false, 0),
            (new Vector3(0, 0, 0.1899f), 0.5f, false, far, 0, false, 0),
            (new Vector3(0, 0, 0.25f), 0.5f, false, far, 0, false, 0),
            (new Vector3(0, 0, 0.25f), 0.2f, false, far, 0, false, 0));
        scripts["just outside reach"] = Script(
            (new Vector3(0, 0, 0.1901f), 0f, false, far, 0, false, 0),
            (new Vector3(0, 0, 0.1901f), 0.9f, true, far, 0, false, 0),
            (new Vector3(0, 0, 0.1f), 0.9f, true, far, 0, false, 0),
            (new Vector3(0, 0, 0.1f), 0f, false, far, 0, false, 0));
        scripts["analog below threshold"] = Script(
            (new Vector3(0.05f, 0, 0), 0.44f, false, far, 0, false, 0),
            (new Vector3(0.05f, 0, -0.1f), 0.44f, false, far, 0, false, 0),
            (new Vector3(0.05f, 0, -0.1f), 0f, false, far, 0, false, 0));
        scripts["ball moving at press"] = Script(
            (new Vector3(0.05f, 0, 0), 0f, false, far, 0, false, 0.3f),
            (new Vector3(0.05f, 0, 0), 0.9f, true, far, 0, false, 0.3f),
            (new Vector3(0.05f, 0, -0.1f), 0.9f, true, far, 0, false, 0f),
            (new Vector3(0.05f, 0, -0.1f), 0f, false, far, 0, false, 0f));
        scripts["tiny pull"] = Script(
            (new Vector3(0.05f, 0, 0), 0f, false, far, 0, false, 0),
            (new Vector3(0.05f, 0, 0), 0.9f, true, far, 0, false, 0),
            (new Vector3(0.05f, 0, -0.0001f), 0.9f, true, far, 0, false, 0),
            (new Vector3(0.05f, 0, -0.0001f), 0f, false, far, 0, false, 0));
        // B13: the left hand starts an aim while the right is aiming; the left's release shoots.
        scripts["second hand while aiming"] = Script(
            (new Vector3(0.05f, 0, 0), 0f, false, new Vector3(-0.05f, 0, 0), 0f, false, 0),
            (new Vector3(0.05f, 0, 0), 0.9f, true, new Vector3(-0.05f, 0, 0), 0f, false, 0),
            (new Vector3(0.05f, 0, -0.04f), 0.9f, true, new Vector3(-0.05f, 0, 0), 0f, false, 0),
            (new Vector3(0.05f, 0, -0.04f), 0.9f, true, new Vector3(-0.05f, 0, 0), 0.9f, true, 0),
            (new Vector3(0.05f, 0, -0.08f), 0.9f, true, new Vector3(-0.05f, 0, 0.1f), 0.9f, true, 0),
            (new Vector3(0.05f, 0, -0.08f), 0.9f, true, new Vector3(-0.05f, 0, 0.1f), 0f, false, 0),
            (new Vector3(0.05f, 0, -0.08f), 0f, false, new Vector3(-0.05f, 0, 0.1f), 0f, false, 0));

        foreach (var kv in scripts)
        {
            var s = Build(table, new Vector3(0, 1.1f, 0.55f), 0);
            var game = s.game;
            var ball = s.balls[0];
            VRGolfClub MakeClub(OVRInput.Controller c)
            {
                var go = new GameObject(c == OVRInput.Controller.LTouch ? "VR Club Left" : "VR Club Right");
                go.AddComponent<SphereCollider>();
                var club = go.AddComponent<VRGolfClub>();
                club.controller = c;
                club.game = game;
                club.overlapRadius = 0.11f;
                club.triggerThreshold = 0.45f;
                club.showSphere = false;
                Call(club, "Awake");
                return club;
            }
            var right = MakeClub(OVRInput.Controller.RTouch);
            var left = MakeClub(OVRInput.Controller.LTouch);
            bool wasR = false, wasL = false;
            var frames = new List<object>();
            var ballPos = ball.position;
            foreach (var f in kv.Value)
            {
                Record.Clear();
                OVRInput.Held.Clear(); OVRInput.Down.Clear(); OVRInput.Up.Clear();
                OVRInput.Trigger[OVRInput.Controller.RTouch] = f.tr;
                OVRInput.Trigger[OVRInput.Controller.LTouch] = f.tl;
                void Buttons(bool held, ref bool was, OVRInput.Controller c)
                {
                    string k = OVRInput.Button.PrimaryIndexTrigger + "/" + c;
                    if (held) OVRInput.Held.Add(k);
                    if (held && !was) OVRInput.Down.Add(k);
                    if (!held && was) OVRInput.Up.Add(k);
                    was = held;
                }
                Buttons(f.held, ref wasR, OVRInput.Controller.RTouch);
                Buttons(f.heldL, ref wasL, OVRInput.Controller.LTouch);
                ball.linearVelocity = new Vector3(f.speed, 0, 0);
                right.transform.position = ballPos + f.r;
                left.transform.position = ballPos + f.l;
                Call(right, "Update");
                Call(left, "Update");
                frames.Add(new Dictionary<string, object>
                {
                    ["right"] = V(ballPos + f.r), ["rightTrigger"] = (double)f.tr, ["rightHeld"] = f.held,
                    ["left"] = V(ballPos + f.l), ["leftTrigger"] = (double)f.tl, ["leftHeld"] = f.heldL,
                    ["speed"] = (double)f.speed,
                    ["aiming"] = game.IsAiming, ["power"] = (double)game.ShotPower,
                    ["rightAiming"] = Get<bool>(right, "aiming"), ["leftAiming"] = Get<bool>(left, "aiming"),
                    ["events"] = Record.Events.ToList(),
                    ["strokes"] = game.LevelStrokes, ["feedback"] = game.CurrentFeedback,
                });
            }
            outList.Add(new Dictionary<string, object> { ["name"] = kv.Key, ["ball"] = V(ballPos), ["frames"] = frames });
        }
        return outList;
    }

    // ---- the cup: FixedUpdate (:351-388) --------------------------------------------------------------------------------

    static List<object> Assist(List<LevelRow> table)
    {
        var s = Build(table, new Vector3(0, 1.1f, 0.55f), 0);
        var game = s.game;
        var ball = s.balls[0];
        var hole = s.levels[0].holeCenter.position;
        var outList = new List<object>();
        float[] distances = { 0f, 0.0005f, 0.001f, 0.0015f, 0.004f, 0.0079f, 0.008f, 0.0081f, 0.02f, 0.039f, 0.04f, 0.0401f, 0.06f };
        float[] speeds = { 0f, 0.2f, 0.34f, 0.35f, 0.36f, 0.59f, 0.6f, 0.61f };
        float[] heights = { 0.005f, 1.3f };
        var dir = new Vector3(0.6f, 0, -0.8f);
        foreach (var d in distances)
            foreach (var sp in speeds)
                foreach (var h in heights)
                {
                    Record.Clear();
                    Set(game, "capturing", false);
                    ball.position = hole + dir * d + new Vector3(0, h, 0);
                    ball.linearVelocity = new Vector3(0, 0.05f, sp);
                    Call(game, "FixedUpdate");
                    bool capturing = game.IsCapturing;
                    game.StopAllCoroutines();
                    Set(game, "capturing", false);
                    outList.Add(new Dictionary<string, object>
                    {
                        ["ball"] = V(ball.position), ["velocity"] = V(ball.linearVelocity), ["hole"] = V(hole),
                        ["events"] = Record.Events.ToList(), ["capture"] = capturing,
                    });
                }
        return outList;
    }

    // ---- CaptureBall (:642-704): the path, the message, the next level --------------------------------------------------

    static List<object> Capture(List<LevelRow> table)
    {
        var outList = new List<object>();
        const float dt = 1f / 64f;
        foreach (int strokes in new[] { 1, 2, 3, 4 })
        {
            var s = Build(table, new Vector3(0, 1.1f, 0.55f), 0);
            var game = s.game;
            var ball = s.balls[0];
            var hole = s.levels[0].holeCenter.position;
            ball.position = hole + new Vector3(0.003f, 0.005f, -0.002f);
            ball.linearVelocity = new Vector3(0, 0, 0.1f);
            Set(game, "levelStrokes", strokes);
            Set(game, "totalStrokes", strokes + 5);
            Time.deltaTime = dt; Time.unscaledDeltaTime = dt;
            Record.Clear();
            var start = ball.position;
            Call(game, "FixedUpdate");
            var samples = new List<object> { new double[] { ball.position.x, ball.position.y, ball.position.z, ball.transform.localScale.x } };
            int frames = 0;
            while (!game.IsLevelComplete && frames < 1000)
            {
                Runner.Frame(dt);
                frames++;
                samples.Add(new double[] { ball.position.x, ball.position.y, ball.position.z, ball.transform.localScale.x });
            }
            string message = game.CurrentFeedback;
            float completeAt = Time.time;
            while (game.CurrentLevelIndex == 0 && frames < 1000) { Runner.Frame(dt); frames++; }
            outList.Add(new Dictionary<string, object>
            {
                ["strokes"] = strokes, ["par"] = s.levels[0].par, ["dt"] = (double)dt,
                ["start"] = V(start), ["hole"] = V(hole), ["samples"] = samples,
                ["events"] = Record.Events.ToList(),
                ["message"] = message,
                ["advanceAfter"] = (double)(Time.time - completeAt),
                ["nextLevel"] = game.CurrentLevelIndex, ["nextMessage"] = game.CurrentFeedback,
                ["levelStrokesAfter"] = game.LevelStrokes, ["totalStrokesAfter"] = game.TotalStrokes,
            });
        }
        return outList;
    }

    // ---- LoadLevel's swap (:718-761), RestartCurrentLevel, RestartCourse --------------------------------------------------

    static List<object> Layout(List<LevelRow> table)
    {
        var s = Build(table, new Vector3(0, 1.1f, 0.55f), 0);
        var game = s.game;
        var outList = new List<object>();
        void Note(string step)
        {
            outList.Add(new Dictionary<string, object>
            {
                ["step"] = step, ["current"] = game.CurrentLevelIndex, ["slotOf"] = SlotOf(s, table),
                ["levelStrokes"] = game.LevelStrokes, ["totalStrokes"] = game.TotalStrokes, ["feedback"] = game.CurrentFeedback,
            });
        }
        Note("start");
        for (int k = 1; k < 8; k++)
        {
            Set(game, "levelStrokes", k);
            Set(game, "totalStrokes", game.TotalStrokes + k);
            game.DebugLoadLevel(k);
            Note("load " + k);
        }
        Set(game, "levelStrokes", 3);
        game.RestartCurrentLevel();
        Note("restart current");
        Call(game, "RestartCourse");
        Note("restart course");
        foreach (int k in new[] { 3, 3, 0, 5, 7, 2, 1, 4, 6, 0 })
        {
            game.DebugLoadLevel(k);
            Note("load " + k);
        }
        Call(game, "RestartCourse");
        Note("restart course");
        return outList;
    }

    // ---- MiniGolfLevel.IsOutsideCourse (:49-55) in a moved, turned and scaled course ---------------------------------

    static List<object> Bounds(List<LevelRow> table)
    {
        var s = Build(table, new Vector3(0.3f, 1.1f, 0.55f), 30f);
        var outList = new List<object>();
        for (int k = 0; k < s.levels.Length; k++)
        {
            var level = s.levels[k];
            float hx = level.courseWidth * 0.5f + 2.5f, hz = level.courseLength * 0.5f + 2.5f;
            var locals = new List<Vector3>();
            foreach (float e in new[] { -0.01f, 0.01f })
            {
                locals.Add(new Vector3(hx + e, 0.3f, 0));
                locals.Add(new Vector3(-hx - e, 0.3f, 1));
                locals.Add(new Vector3(0.5f, 0.3f, hz + e));
                locals.Add(new Vector3(-0.5f, 0.3f, -hz - e));
                locals.Add(new Vector3(0, -2.25f - e, 0));
            }
            locals.Add(level.ballSpawn.localPosition);
            locals.Add(level.holeCenter.localPosition);
            foreach (var local in locals)
            {
                var world = level.transform.TransformPoint(local);
                outList.Add(new Dictionary<string, object>
                {
                    ["level"] = k, ["slot"] = V(level.transform.localPosition), ["world"] = V(world), ["outside"] = level.IsOutsideCourse(world),
                    ["anchor"] = V(s.anchor.localPosition), ["anchorRotation"] = Q(s.anchor.localRotation), ["scale"] = 0.05,
                });
            }
        }
        return outList;
    }

    // ---- LevelRevealAnimator: total length and part positions (:38, :77-104, :142-152) -------------------------------------

    static Dictionary<string, object> Reveal(List<LevelRow> table)
    {
        var totals = new List<object>();
        foreach (int n in table.Select(r => r.parts).Concat(new[] { 0, 1, 2 }))
        {
            var go = new GameObject("level");
            var anim = go.AddComponent<LevelRevealAnimator>();
            anim.Configure(Enumerable.Range(0, n).Select(i => new GameObject("p" + i).transform).ToArray());
            totals.Add(new Dictionary<string, object> { ["parts"] = n, ["total"] = (double)anim.TotalDuration });
        }
        var runs = new List<object>();
        foreach (int n in new[] { 3, 27 })
        {
            Runner.Reset();
            const float dt = 1f / 64f;
            var go = new GameObject("level");
            var anim = go.AddComponent<LevelRevealAnimator>();
            var parts = Enumerable.Range(0, n).Select(i => { var t = new GameObject("p" + i).transform; t.localPosition = new Vector3(i, 0.5f * i, -i); return t; }).ToArray();
            anim.Configure(parts);
            Time.unscaledDeltaTime = dt;
            anim.PlayReveal();
            var frames = new List<object>();
            int[] watch = n == 3 ? new[] { 0, 1, 2 } : new[] { 0, 5, 13, 26 };
            int frame = 1;
            while (anim.IsPlaying && frame < 400)
            {
                frames.Add(new Dictionary<string, object>
                {
                    ["frame"] = frame, ["playing"] = anim.IsPlaying,
                    ["offsets"] = watch.Select(i => V(parts[i].localPosition - new Vector3(i, 0.5f * i, -i))).ToList(),
                });
                Runner.Frame(dt);
                frame++;
            }
            frames.Add(new Dictionary<string, object> { ["frame"] = frame, ["playing"] = anim.IsPlaying, ["offsets"] = watch.Select(i => V(parts[i].localPosition - new Vector3(i, 0.5f * i, -i))).ToList() });
            runs.Add(new Dictionary<string, object> { ["parts"] = n, ["dt"] = (double)dt, ["watch"] = watch, ["frames"] = frames });
        }
        return new Dictionary<string, object> { ["totals"] = totals, ["runs"] = runs };
    }

    // ---- VRGolfUI (:167-235) ------------------------------------------------------------------------------------------

    static Dictionary<string, object> Ui(List<LevelRow> table)
    {
        var s = Build(table, new Vector3(0, 1.1f, 0.55f), 0);
        var game = s.game;
        var ui = new GameObject("GAME SYSTEMS UI").AddComponent<VRGolfUI>();
        ui.game = game;
        Canvas Canvas(string name) => Child(null, name).AddComponent<Canvas>();
        T Add<T>(Transform parent, string path) where T : Component, new()
        {
            var t = parent;
            foreach (var part in path.Split('/'))
            {
                var next = t.Find(part);
                t = next != null ? next : Child(t, part).transform;
            }
            return t.gameObject.AddComponent<T>();
        }
        ui.gamePlayCanvas = Canvas("GamePlayCard");
        foreach (var n in new[] { "Title", "Course", "Level", "LabelStrokes", "Strokes", "LabelPar", "Par", "ProgressLabel" }) Add<TextMeshProUGUI>(ui.gamePlayCanvas.transform, n);
        var pips = Enumerable.Range(0, 8).Select(i => Add<Image>(ui.gamePlayCanvas.transform, "ProgressGroup/Pip" + i)).ToArray();
        foreach (var p in pips) p.rectTransform.sizeDelta = new Vector2(20, 6);
        ui.powerCanvas = Canvas("PowerMeter");
        var label = Add<TextMeshProUGUI>(ui.powerCanvas.transform, "Label");
        var percent = Add<TextMeshProUGUI>(ui.powerCanvas.transform, "Percent");
        var segs = Enumerable.Range(0, 12).Select(i => Add<Image>(ui.powerCanvas.transform, "Seg" + i)).ToArray();
        ui.feedbackCanvas = Canvas("FeedbackToast");
        var group = ui.feedbackCanvas.gameObject.AddComponent<CanvasGroup>();
        var feedback = Add<TextMeshProUGUI>(ui.feedbackCanvas.transform, "Feedback");
        ui.courseCompleteCanvas = Canvas("CourseComplete");
        var total = Add<TextMeshProUGUI>(ui.courseCompleteCanvas.transform, "ScoreBox/Total");
        Add<Button>(ui.courseCompleteCanvas.transform, "PlayAgain");

        var progress = new List<object>();
        for (int k = 0; k < 8; k++)
        {
            game.DebugLoadLevel(k);
            Set(game, "levelStrokes", k + 1);
            Call(ui, "Update");
            progress.Add(new Dictionary<string, object>
            {
                ["current"] = k,
                ["course"] = ui.gamePlayCanvas.transform.Find("Course").GetComponent<TMP_Text>().text,
                ["level"] = ui.gamePlayCanvas.transform.Find("Level").GetComponent<TMP_Text>().text,
                ["strokes"] = ui.gamePlayCanvas.transform.Find("Strokes").GetComponent<TMP_Text>().text,
                ["par"] = ui.gamePlayCanvas.transform.Find("Par").GetComponent<TMP_Text>().text,
                ["colors"] = pips.Select(p => C(p.color)).ToList(),
                ["heights"] = pips.Select(p => (double)p.rectTransform.sizeDelta.y).ToList(),
            });
        }
        var power = new List<object>();
        foreach (float p in new[] { 0f, 0.04f, 0.0833f, 0.08334f, 0.125f, 0.25f, 0.375f, 0.5f, 0.545f, 0.55f, 0.555f, 0.625f, 0.75f, 0.875f, 0.999f, 1f })
        {
            Set(game, "dragging", true);
            Set(game, "shotPower", p);
            Call(ui, "Update");
            power.Add(new Dictionary<string, object>
            {
                ["power"] = (double)p, ["shown"] = ui.powerCanvas.gameObject.activeSelf, ["label"] = label.text, ["percent"] = percent.text,
                ["colors"] = segs.Select(x => C(x.color)).ToList(),
            });
        }
        Set(game, "dragging", false);
        Call(ui, "Update");
        bool hiddenAfter = !ui.powerCanvas.gameObject.activeSelf;
        var toast = new List<object>();
        Set(game, "feedback", "BALL RETURNED");
        Set(game, "feedbackUntil", 10f);
        foreach (float t in new[] { 8f, 9.6f, 9.7f, 9.6875f, 9.9f, 9.99f, 10f, 10.5f })
        {
            Time.unscaledTime = t;
            Call(ui, "Update");
            toast.Add(new Dictionary<string, object> { ["now"] = (double)t, ["until"] = 10.0, ["shown"] = ui.feedbackCanvas.gameObject.activeSelf, ["alpha"] = (double)group.alpha, ["text"] = feedback.text });
        }
        Set(game, "courseComplete", true);
        Set(game, "totalStrokes", 41);
        Call(ui, "Update");
        return new Dictionary<string, object>
        {
            ["progress"] = progress, ["power"] = power, ["powerHiddenAfter"] = hiddenAfter, ["toast"] = toast,
            ["complete"] = new Dictionary<string, object> { ["shown"] = ui.courseCompleteCanvas.gameObject.activeSelf, ["total"] = total.text },
        };
    }

    // ---- CameraImpactShake.RegisterImpact (:28-40) ---------------------------------------------------------------------

    static List<object> Impact()
    {
        Runner.Reset();
        var shake = new GameObject("OVRCameraRig").AddComponent<CameraImpactShake>();
        Call(shake, "Awake");
        var outList = new List<object>();
        foreach (var (t, v) in new[] { (0f, 0.3f), (0f, 0.35f), (0.1f, 5f), (0.18f, 5f), (0.181f, 7.5f), (0.2f, 3f), (1f, 10f), (2f, 1f), (2.1f, 1f), (2.2f, 0.349f), (2.5f, 3.925f) })
        {
            Record.Clear();
            Time.unscaledTime = t;
            shake.RegisterImpact(v);
            outList.Add(new Dictionary<string, object> { ["now"] = (double)t, ["speed"] = (double)v, ["events"] = Record.Events.ToList() });
        }
        return outList;
    }

    // ---- AudioManager: a random clip, never the same twice (:164-187) -----------------------------------------------------

    static Dictionary<string, object> Audio()
    {
        var go = new GameObject("AUDIO MANAGER");
        var audio = go.AddComponent<AudioManager>();
        Call(audio, "Awake");
        AudioClip Clip(string n) => new AudioClip { name = n };
        audio.ConfigureSfx(new[] { Clip("hit1"), Clip("hit2"), Clip("hit3") }, new[] { Clip("hole1"), Clip("hole2"), Clip("hole3") }, null, 0.7f);
        UnityEngine.Random.Seed(7);
        Record.Clear();
        for (int i = 0; i < 300; i++)
        {
            if (i % 3 == 2) audio.PlayHoleSfx();
            else audio.PlayShotSfx();
        }
        var plays = Record.Events.ToList();
        var draws = UnityEngine.Random.Draws.Select(d => d.ToList()).ToList();
        return new Dictionary<string, object> { ["plays"] = plays, ["draws"] = draws };
    }

    // ---- WindmillRotor.FixedUpdate (:9-12) ------------------------------------------------------------------------------

    static List<object> Windmill()
    {
        var go = new GameObject("blades");
        var rotor = go.AddComponent<WindmillRotor>();
        var outList = new List<object>();
        for (int step = 1; step <= 600; step++)
        {
            Call(rotor, "FixedUpdate");
            if (step % 25 == 0) outList.Add(new Dictionary<string, object> { ["steps"] = step, ["rotation"] = Q(go.transform.localRotation) });
        }
        return outList;
    }
}
