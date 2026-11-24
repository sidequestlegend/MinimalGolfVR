// The mini-golf kit: MinimalGolfVR's eight levels, ball and board (dilmerv/MinimalGolfVR, MIT; Kenney Minigolf Kit, CC0)
// made into a kit the snippet script loads, with eight pooled balls (one per player), the game's relay ops, a fixed-step
// graph per ball (cup pull, capture, rest, impacts), a reveal clip per level and the windmill graph.
// What changes against upstream, and why: altspace/PORT.md, sections 10 and 12.
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using Newtonsoft.Json.Linq;
using PortKit;
using TMPro;
using Unity.VisualScripting;
using UnityEditor;
using UnityEditor.Animations;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Rendering;
using Object = UnityEngine.Object;

namespace MiniGolf
{
    public sealed class MiniGolfKitBuilder : KitBuilder
    {
        public const string Up = "Assets/Upstream/Assets/MinimalGolf";
        public const string UpstreamScene = Up + "/Scenes/MinimalGolf.unity";
        const string BallPrefab = Up + "/Prefabs/GolfBall.prefab";
        const string MaterialFolder = "Assets/Kit/Materials";
        const string AnimationFolder = "Assets/Kit/Animations";
        const string ToonShader = "Mini Golf/Toon (Kit)";
        public const int Balls = 8;
        /// <summary>Upstream's table scale (VRCoursePlacement.tableScale): the Course node carries it; the page sets it from `table-scale`.</summary>
        const float TableScale = 0.05f;

        /// <summary>One colour per ball slot (slot 0 is upstream's blue), so players can tell their balls apart.</summary>
        static readonly Color[] BallColours =
        {
            new Color(0.25f, 0.55f, 1f), new Color(1f, 0.35f, 0.3f), new Color(1f, 0.85f, 0.25f), new Color(0.65f, 0.4f, 1f),
            new Color(1f, 0.55f, 0.15f), new Color(0.3f, 0.9f, 0.85f), new Color(1f, 0.5f, 0.8f), new Color(0.95f, 0.95f, 0.95f),
        };

        public override string Slug => "mini-golf";
        public override string Title => "Mini Golf";
        public override string Summary => "Eight holes of table-top mini golf for up to eight players, each with a ball, and a shared scorecard. A port of MinimalGolfVR.";
        public override string Description =>
            "Mini golf on a 1:20 table: eight short holes (par 32) with gates, a windmill, bumpers, hills and ramps. Pull back from your " +
            "ball and let go to putt (in VR: trigger near the ball; on desktop: click the green, then Space). Up to eight players, one ball " +
            "each, a shared scorecard; the next hole comes when everyone has holed out. A port of MinimalGolfVR by Dilmer Valecillos " +
            "(https://github.com/dilmerv/MinimalGolfVR, MIT) with the Kenney Minigolf Kit (CC0) and Kenney sounds (CC0).";
        /// <summary>The green of the current hole at table height.</summary>
        public override string SnippetPosition => "0 1 0";
        /// <summary>PORT.md 8.2 and readSettings (MinimalGolfGame.ts).</summary>
        public override IReadOnlyList<(string name, string value)> SnippetSettings => new[]
        {
            ("room", ""), ("table-scale", "0.05"), ("max-players", "8"), ("show-other-levels", "true"), ("hole-timeout", "120"),
            ("stroke-limit", "0"), ("desktop-aim", "pull"), ("reveal", "true"), ("haptics", "true"),
        };

        // what Compose found, for Finishing and the report
        readonly List<string> levelReport = new List<string>();

        protected override void Compose(KitStage stage)
        {
            var scene = EditorSceneManager.OpenScene(UpstreamScene, OpenSceneMode.Additive);
            try { ComposeFrom(stage, scene); }
            finally { EditorSceneManager.CloseScene(scene, true); }
        }

        void ComposeFrom(KitStage stage, UnityEngine.SceneManagement.Scene scene)
        {
            GameObject SceneRoot(string name) => scene.GetRootGameObjects().FirstOrDefault(g => g.name == name) ?? throw new Exception($"the upstream scene has no '{name}'");
            var anchor = SceneRoot("VRCourseAnchor").transform;
            var levelsUp = anchor.Find("VRCourseLevels") ?? throw new Exception("no VRCourseLevels");
            var uiUp = anchor.Find("VR_UI_Root") ?? throw new Exception("no VR_UI_Root");
            var lineUp = SceneRoot("GAME SYSTEMS").transform.Find("Aiming Line") ?? throw new Exception("no Aiming Line");

            var materials = Materials();
            var root = stage.Root;

            // ---- the game's objects: GameSystems holds the behaviours and the sound clips ----
            var systems = stage.Create("GameSystems");
            var course = stage.Create("Course");
            stage.Object(systems, key: "gameSystems");
            stage.Object(course, key: "course");
            course.transform.localScale = Vector3.one * TableScale;

            // ---- the eight levels, at their authored slots ----
            var levelObjects = new List<GameObject>();
            var pads = new List<GameObject>();
            var levelTable = JObject.Parse(File.ReadAllText("ts/src/levels.json"))["levels"] as JArray;
            int index = 0;
            foreach (Transform up in levelsUp)
            {
                var level = stage.Copy(up.gameObject, course.transform);
                levelObjects.Add(level);
                Untag(level);
                var info = LevelInfo(level, up, index, levelTable);
                RevealClip(level, index);
                Windmill(stage, level);
                pads.Add(AimPad(stage, level, index, info.width, info.length));
                stage.Object(level, key: $"level{index}");
                stage.Ref(level);
                index++;
            }
            if (levelObjects.Count != 8) throw new Exception($"expected 8 levels, found {levelObjects.Count}");
            foreach (var r in course.GetComponentsInChildren<Renderer>(true)) Retexture(r, materials);

            // ---- eight pooled balls, one per seat ----
            var ballsParent = stage.Create("Balls", course.transform);
            var ballAsset = AssetDatabase.LoadAssetAtPath<GameObject>(BallPrefab) ?? throw new Exception("no GolfBall.prefab");
            var ballGraph = BallGraph();
            var balls = new List<GameObject>();
            var picks = new List<GameObject>();
            for (int s = 0; s < Balls; s++)
            {
                var ball = stage.Copy(ballAsset, ballsParent.transform, $"Ball {s}");
                Untag(ball);
                ball.transform.localPosition = new Vector3(s * 0.5f, 0.29f, -4.05f);
                var body = ball.GetComponent<Rigidbody>();
                body.isKinematic = true;                                                    // until the `place` op puts it on a green
                body.interpolation = RigidbodyInterpolation.Interpolate;
                body.collisionDetectionMode = CollisionDetectionMode.ContinuousDynamic;
                var visual = ball.transform.Find("Visual").GetComponent<Renderer>();
                visual.sharedMaterial = BallMaterial(s, materials["Ball Blue"]);
                var audio = ball.AddComponent<AudioSource>();
                audio.playOnAwake = false;
                audio.spatialBlend = 1f;                                                    // 3D at the table (PORT.md 10.1 #9)
                audio.volume = 0.7f;                                                         // upstream sfxVolume
                audio.minDistance = 0.4f;
                audio.maxDistance = 5f;
                audio.rolloffMode = AudioRolloffMode.Linear;
                audio.priority = 32;
                // the desktop pick: a trigger the size of the ball, on the UI layer (the kit builder sets it). No larger: a weak
                // putt is a click on the green a centimetre behind the ball, which a bigger pick would catch first
                var pick = stage.Create("Pick", ball.transform);
                var pickCollider = pick.AddComponent<SphereCollider>();
                pickCollider.radius = 0.16f;
                pickCollider.isTrigger = true;
                var vars = ball.AddComponent<Variables>();
                vars.declarations.Set("PkSlot", s.ToString(CultureInfo.InvariantCulture));
                foreach (var (name, value) in BallVariables) vars.declarations.Set(name, value);
                stage.AddGraph(ball, "ball", ballGraph);
                stage.Object(ball, key: $"ball{s}", sync: "transform");
                stage.Ref(ball);
                stage.Object(pick, key: $"ballPick{s}", click: true);
                ball.SetActive(false);                                                      // the page shows a seated player's ball
                balls.Add(ball);
                picks.Add(pick);
            }

            // ---- the aiming line ----
            var line = stage.Copy(lineUp.gameObject, root.transform, "AimLine");
            var lr = line.GetComponent<LineRenderer>();
            lr.useWorldSpace = true;
            lr.positionCount = 2;
            lr.sharedMaterial = materials["Aiming Line"];
            lr.shadowCastingMode = ShadowCastingMode.Off;
            lr.receiveShadows = false;
            lr.enabled = false;
            line.SetActive(true);
            stage.Object(line, key: "aimLine");
            stage.Ref(line);

            // ---- B2: the hand spheres (attached to the local hands in a headset by the page) ----
            var spheres = stage.Create("HandSpheres");
            var handSpheres = new List<GameObject>();
            foreach (var side in new[] { "Left", "Right" })
            {
                var sphere = stage.Primitive(PrimitiveType.Sphere, side, spheres.transform);
                Object.DestroyImmediate(sphere.GetComponent<Collider>());
                sphere.transform.localScale = Vector3.one * 0.1f;                            // radius 0.05 m (sphereRadius)
                var r = sphere.GetComponent<MeshRenderer>();
                r.sharedMaterial = materials["Hand Sphere"];
                r.shadowCastingMode = ShadowCastingMode.Off;
                r.receiveShadows = false;
                sphere.SetActive(false);
                stage.Object(sphere, key: side == "Left" ? "handSphereL" : "handSphereR");
                handSpheres.Add(sphere);
            }

            // ---- the board ----
            var ui = Board(stage, uiUp.gameObject, out var boardFields, out var joinButton, out var restartButton, out var playAgain);

            // ---- the sounds: CC0 replacements (THIRD-PARTY-NOTICES.md) on GameSystems, played through each ball's source ----
            var clips = new[] { "putt1.wav", "putt2.wav", "putt3.wav", "cup1.ogg", "cup2.ogg", "cup3.ogg" }
                .Select(f => AssetDatabase.LoadAssetAtPath<AudioClip>("Assets/Kit/Audio/" + f) ?? throw new Exception("missing clip " + f)).ToArray();
            var clipValues = ClipList(stage, systems, clips);

            // ---- behaviours (no upstream stand-in is used: the TypeScript's fields are its own) ----
            var game = stage.Behaviour(systems, "MinimalGolfGame", new JObject
            {
                ["course"] = stage.ObjectValue(course),
                ["levelObjects"] = new JArray(levelObjects.Select(l => (JToken)stage.ObjectValue(l))),
                ["aimPads"] = new JArray(pads.Select(p => (JToken)stage.ObjectValue(p))),
                ["balls"] = new JArray(balls.Select(b => (JToken)stage.ObjectValue(b))),
                ["ballPicks"] = new JArray(picks.Select(p => (JToken)stage.ObjectValue(p))),
                ["ballAudio"] = new JArray(balls.Select(b => (JToken)stage.ComponentValue(b, "AudioSource"))),
                ["aimLine"] = stage.ObjectValue(line),
                ["handSpheres"] = new JArray(handSpheres.Select(h => (JToken)stage.ObjectValue(h))),
                ["board"] = stage.ObjectValue(ui),
                ["shotClips"] = new JArray(clipValues.Take(3)),
                ["holeClips"] = new JArray(clipValues.Skip(3)),
                ["collisionClip"] = null,
            });
            stage.Ref(course);
            boardFields["game"] = stage.BehaviourValue(game);
            stage.Behaviour(ui, "VRGolfUI", boardFields);
            var player = stage.Behaviour(systems, "GolfPlayer", new JObject { ["game"] = stage.BehaviourValue(game) });

            stage.Event(joinButton, "click", game, "ToggleJoin");
            stage.Event(playAgain, "click", game, "PlayAgain");
            stage.Event(restartButton, "click", player, "RestartMyHole");
            foreach (var pad in pads) stage.Event(pad, "click", player, "AimPadClick");
            foreach (var pick in picks) stage.Event(pick, "click", player, "BallPickClick");

            stage.Report.AppendLine("   levels against ts/src/levels.json:");
            foreach (var l in levelReport) stage.Report.AppendLine("     " + l);
        }

        // ------------------------------------------------------------------ levels

        (float width, float length) LevelInfo(GameObject level, Transform up, int index, JArray table)
        {
            var mb = level.GetComponents<MonoBehaviour>().FirstOrDefault(m => m != null && m.GetType().Name == "MiniGolfLevel") ?? throw new Exception($"{level.name} has no MiniGolfLevel");
            var so = new SerializedObject(mb);
            float width = so.FindProperty("courseWidth").floatValue, length = so.FindProperty("courseLength").floatValue;
            string name = so.FindProperty("levelName").stringValue;
            int par = so.FindProperty("par").intValue;
            Vector3 Local(string field)
            {
                var t = (Transform)new SerializedObject(up.GetComponents<MonoBehaviour>().First(m => m != null && m.GetType().Name == "MiniGolfLevel")).FindProperty(field).objectReferenceValue;
                return up.InverseTransformPoint(t.position);
            }
            var spawn = Local("ballSpawn");
            var hole = Local("holeCenter");
            var entry = table[index];
            Vector3 V(JToken t) => new Vector3((float)t[0], (float)t[1], (float)t[2]);
            bool same(Vector3 a, Vector3 b) => (a - b).magnitude < 0.005f;
            string verdict = (string)entry["levelName"] == name && (int)entry["par"] == par && same(V(entry["ballSpawn"]), spawn) && same(V(entry["holeCenter"]), hole)
                             && Mathf.Abs((float)entry["courseWidth"] - width) < 0.001f && Mathf.Abs((float)entry["courseLength"] - length) < 0.001f
                             && same(V(entry["slot"]), up.localPosition) ? "same" : "DIFFERENT";
            levelReport.Add(FormattableString.Invariant($"{index + 1} {name} par {par} {width}x{length} spawn ({spawn.x:0.###},{spawn.y:0.###},{spawn.z:0.###}) hole ({hole.x:0.###},{hole.y:0.###},{hole.z:0.###}) slot {up.localPosition}: {verdict}"));
            return (width, length);
        }

        /// <summary>The objects upstream tagged RevealOccluder (F4): their material becomes the occluder variant.</summary>
        readonly HashSet<GameObject> occluders = new HashSet<GameObject>();

        void Untag(GameObject go)
        {
            foreach (var t in go.GetComponentsInChildren<Transform>(true))
            {
                t.gameObject.layer = 0;
                if (t.CompareTag("RevealOccluder")) occluders.Add(t.gameObject);
                t.gameObject.tag = "Untagged";                                              // custom tags do not exist in the app
            }
        }

        /// <summary>
        /// LevelRevealAnimator.PlayReveal as a baked clip (A8): part i starts revealDistance level units away along direction
        /// i mod 6 and eases (smoothstep: two keys with flat tangents) to its place over partDuration, from startDelay + i x
        /// partStagger. An empty entry still counts. Played by the relay op `reveal` from a time, so a late joiner joins part-way.
        /// </summary>
        void RevealClip(GameObject level, int index)
        {
            var mb = level.GetComponents<MonoBehaviour>().FirstOrDefault(m => m != null && m.GetType().Name == "LevelRevealAnimator") ?? throw new Exception($"{level.name} has no LevelRevealAnimator");
            var so = new SerializedObject(mb);
            var parts = so.FindProperty("animatedParts");
            var dirs = so.FindProperty("revealDirections");
            float delay = so.FindProperty("startDelay").floatValue, duration = so.FindProperty("partDuration").floatValue;
            float stagger = so.FindProperty("partStagger").floatValue, distance = so.FindProperty("revealDistance").floatValue;
            var clip = new AnimationClip { name = "Reveal", legacy = false, frameRate = 60 };
            int count = parts.arraySize, animated = 0;
            for (int i = 0; i < count; i++)
            {
                var part = parts.GetArrayElementAtIndex(i).objectReferenceValue as Transform;
                if (part == null) continue;
                var dir = dirs.arraySize > 0 ? dirs.GetArrayElementAtIndex(i % dirs.arraySize).vector3Value : Vector3.left;
                if (dir.sqrMagnitude < 0.0001f) dir = Vector3.left;
                var from = part.localPosition + dir.normalized * distance;
                var to = part.localPosition;
                float start = delay + i * stagger, end = start + Mathf.Max(0.05f, duration);
                string path = AnimationUtility.CalculateTransformPath(part, level.transform);
                for (int axis = 0; axis < 3; axis++)
                {
                    var curve = new AnimationCurve(new Keyframe(0f, from[axis], 0f, 0f), new Keyframe(start, from[axis], 0f, 0f), new Keyframe(end, to[axis], 0f, 0f));
                    clip.SetCurve(path, typeof(Transform), "m_LocalPosition." + "xyz"[axis], curve);
                }
                animated++;
            }
            float total = delay + duration + Mathf.Max(0, count - 1) * stagger;
            Directory.CreateDirectory(AnimationFolder);
            string clipPath = $"{AnimationFolder}/level{index + 1}_reveal.anim";
            AssetDatabase.DeleteAsset(clipPath);
            AssetDatabase.CreateAsset(clip, clipPath);
            string controllerPath = $"{AnimationFolder}/level{index + 1}_reveal.controller";
            AssetDatabase.DeleteAsset(controllerPath);
            var controller = AnimatorController.CreateAnimatorControllerAtPath(controllerPath);
            var state = controller.layers[0].stateMachine.AddState("Reveal");
            state.motion = clip;
            state.writeDefaultValues = false;
            controller.layers[0].stateMachine.defaultState = state;
            var animator = level.AddComponent<Animator>();
            animator.runtimeAnimatorController = controller;
            animator.updateMode = AnimatorUpdateMode.Fixed;                               // colliders move with the parts (A10)
            animator.cullingMode = AnimatorCullingMode.AlwaysAnimate;
            animator.applyRootMotion = false;
            animator.enabled = false;                                                     // the `reveal` op switches it on
            var vars = level.GetComponent<Variables>() ?? level.AddComponent<Variables>();
            vars.declarations.Set("PkRevealLength", total);
            levelReport.Add(FormattableString.Invariant($"{index + 1} reveal: {count} parts ({animated} animated), {total:0.###} s"));
        }

        /// <summary>The level's aim pad (desktop): a thin trigger over the green on the UI layer; a click on it aims.</summary>
        static GameObject AimPad(KitStage stage, GameObject level, int index, float width, float length)
        {
            var pad = stage.Create("AimPad", level.transform);
            var box = pad.AddComponent<BoxCollider>();
            box.isTrigger = true;
            box.center = new Vector3(0f, 0.13f, 0f);                                     // just over the green's top (0.1)
            box.size = new Vector3(width + 1f, 0.04f, length + 1f);
            stage.Object(pad, key: $"aimPad{index}", click: true);
            return pad;
        }

        /// <summary>WindmillRotor (I1): the blades at 72 degrees a second about their own Z, from the synced clock (every player sees the same).</summary>
        void Windmill(KitStage stage, GameObject level)
        {
            var rotor = level.GetComponentsInChildren<MonoBehaviour>(true).FirstOrDefault(m => m != null && m.GetType().Name == "WindmillRotor");
            if (rotor == null) return;
            float degrees = new SerializedObject(rotor).FindProperty("degreesPerSecond").floatValue;
            double period = 360.0 / degrees;
            var g = new GraphWriter();
            Type clock = GraphTypes.Find("BS.SyncedClock");
            void Turn() => g.Set(typeof(Transform), "localRotation", null,
                g.Call(typeof(Quaternion), "Euler", new[] { typeof(float), typeof(float), typeof(float) }, null, 0f, 0f,
                    g.Call(clock, "Phase01", new[] { typeof(double) }, null, period) * 360f));
            g.On(new FixedUpdate(), _ => Turn());
            g.On(new Update(), _ => Turn());
            stage.AddGraph(rotor.gameObject, "windmill", g);
            levelReport.Add(FormattableString.Invariant($"windmill on {level.name}: {degrees} degrees/s, period {period:0.###} s"));
        }

        // ------------------------------------------------------------------ the ball graph

        static readonly (string name, object value)[] BallVariables =
        {
            ("PkArmed", false), ("PkHole", Vector3.zero), ("PkAssistR", 0.04f), ("PkCaptureR", 0.008f), ("PkMaxAssist", 0.6f),
            ("PkMaxCapture", 0.35f), ("PkMinPull", 0.35f), ("PkMaxPull", 1.2f), ("PkPlayable", 0.1f), ("PkLive", false),
            ("PkShot", "0"), ("PkRest", true), ("PkSettle", 0f), ("PkSinking", false), ("PkSinkT0", 0f), ("PkSinkFrom", Vector3.zero),
            ("PkSinkHole", Vector3.zero), ("PkSinkDrop", 0f), ("PkSinkDepth", 0f),
        };

        /// <summary>
        /// One graph per ball (the same asset on all eight). FixedUpdate, on the client that placed the ball (its owner):
        /// the rest watch (golfRest when the speed crosses playableSpeed, rule B1) and, while armed, MinimalGolfGame.FixedUpdate's
        /// cup pull and capture test (:351-388, golfCapture). Update: the capture move (:659-692) after the `sink` op.
        /// OnCollisionEnter: golfImpact with the relative speed and the other collider's name. OnEnable: scale 1 and the
        /// other balls ignored (they do not collide with each other, PORT.md 10.1 #2; IgnoreCollision does not survive a
        /// collider being switched off, so it is made again each time).
        /// </summary>
        static GraphWriter BallGraph()
        {
            var g = new GraphWriter();
            Val F(string n) => g.ObjVar(n, typeof(float));
            Val B(string n) => g.ObjVar(n, typeof(bool));
            Val V(string n) => g.ObjVar(n, typeof(Vector3));
            Val Slot() => g.ObjVar("PkSlot", typeof(string));
            Val Shot() => g.ObjVar("PkShot", typeof(string));

            g.On(new FixedUpdate(), _ =>
            {
                // (a member with no target is the ball's own Rigidbody)
                g.If(g.And(g.And(B("PkLive"), g.Not(B("PkSinking"))), g.Not(g.Get(typeof(Rigidbody), "isKinematic", null))), () =>
                {
                    var velocity = g.Keep(g.Get(typeof(Rigidbody), "linearVelocity", null));
                    var position = g.Keep(g.Get(typeof(Rigidbody), "position", null));
                    // rest watch (B1: the ball's 3D speed at most playableSpeed); a few steps after a shot before it counts
                    g.If(g.Greater(F("PkSettle"), 0.5f), () => g.SetObjVar("PkSettle", F("PkSettle") - 1f), () =>
                    {
                        var rest = g.Keep(g.Not(g.Greater(g.Magnitude(velocity), F("PkPlayable"))));
                        g.If(g.Not(g.Same(rest, B("PkRest"))), () =>
                        {
                            g.SetObjVar("PkRest", rest);
                            g.PageEvent("golfRest", Slot(), Shot(), g.Select(rest, "1", "0", typeof(string)));
                        });
                    });
                    g.If(B("PkArmed"), () =>
                    {
                        var horizontal = g.Keep(g.Magnitude(g.V3(g.X(velocity), 0f, g.Z(velocity))));
                        var hole = g.Keep(V("PkHole"));
                        var offset = g.Keep(g.V3(g.X(hole) - g.X(position), 0f, g.Z(hole) - g.Z(position)));
                        var distance = g.Keep(g.Magnitude(offset));
                        g.If(g.And(g.Not(g.Greater(distance, F("PkAssistR"))), g.Not(g.Greater(horizontal, F("PkMaxAssist")))), () =>
                        {
                            var closeness = g.Keep(1f - g.Clamp01(distance / F("PkAssistR")));
                            var acceleration = g.Lerp(F("PkMinPull"), F("PkMaxPull"), closeness * closeness);
                            g.If(g.Greater(distance, 0.001f), () =>
                                g.Do(typeof(Rigidbody), "AddForce", new[] { typeof(Vector3), typeof(ForceMode) }, null, g.Normalized(offset) * acceleration, ForceMode.Acceleration));
                            g.If(g.And(g.And(g.Not(g.Greater(distance, F("PkCaptureR"))), g.Not(g.Greater(horizontal, F("PkMaxCapture")))),
                                       g.Less(g.Abs(g.Y(position) - g.Y(hole)), 1.25f)), () =>
                            {
                                g.SetObjVar("PkArmed", false);
                                g.PageEvent("golfCapture", Slot(), Shot());
                            });
                        });
                    });
                });
            });

            g.On(new Update(), _ =>
            {
                g.If(B("PkSinking"), () =>
                {
                    var transform = g.Keep(g.Get(typeof(GameObject), "transform", null));
                    var elapsed = g.Keep(g.Get(typeof(Time), "time") - F("PkSinkT0"));
                    var from = g.Keep(V("PkSinkFrom"));
                    var hole = g.Keep(V("PkSinkHole"));
                    var centred = g.Keep(g.V3(g.X(hole), g.Y(from) - F("PkSinkDrop"), g.Z(hole)));
                    g.If(g.Less(elapsed, 0.10f), () =>
                    {
                        var t = g.Keep(g.Call(typeof(Mathf), "SmoothStep", new[] { typeof(float), typeof(float), typeof(float) }, null, 0f, 1f, elapsed / 0.10f));
                        g.Set(typeof(Transform), "position", transform, g.Lerp3(from, centred, t));
                        g.Set(typeof(Transform), "localScale", transform, g.Scale(g.Get(typeof(Vector3), "one"), g.Lerp(1f, 0.88f, t)));
                    }, () =>
                    {
                        var t = g.Keep(g.Call(typeof(Mathf), "SmoothStep", new[] { typeof(float), typeof(float), typeof(float) }, null, 0f, 1f, g.Clamp01((elapsed - 0.10f) / 0.52f)));
                        g.Set(typeof(Transform), "position", transform, g.Lerp3(centred, g.V3(g.X(hole), g.Y(hole) - F("PkSinkDepth"), g.Z(hole)), t));
                        g.Set(typeof(Transform), "localScale", transform, g.Scale(g.Get(typeof(Vector3), "one"), g.Lerp(0.88f, 0.08f, t)));
                        g.If(g.Greater(elapsed, 0.62f), () => g.SetObjVar("PkSinking", false));
                    });
                });
            });

            g.On(new OnCollisionEnter(), hit =>
            {
                g.If(B("PkLive"), () =>
                {
                    var speed = g.Magnitude(g.EventOut(hit, "relativeVelocity", typeof(Vector3)));
                    g.PageEvent("golfImpact", Slot(), g.InvariantText(speed), g.EncodeArg(g.Get(typeof(Collider), "name", g.EventOut(hit, "collider", typeof(Collider)))));
                });
            });

            g.On(new OnEnable(), _ =>
            {
                var transform = g.Keep(g.Get(typeof(GameObject), "transform", null));
                g.Set(typeof(Transform), "localScale", transform, g.Get(typeof(Vector3), "one"));
                g.SetObjVar("PkSinking", false);
                var mine = g.Keep(g.ComponentOf(g.Get(typeof(Component), "gameObject", transform), typeof(SphereCollider)));
                g.ForEach(g.Get(typeof(Transform), "parent", transform), typeof(Transform), sibling =>
                {
                    var theirs = g.Keep(g.ComponentOf(g.Get(typeof(Component), "gameObject", sibling), typeof(SphereCollider)));
                    g.IfNotNull(theirs, () => g.If(g.Not(g.Same(theirs, mine)), () =>
                        g.Do(typeof(Physics), "IgnoreCollision", new[] { typeof(Collider), typeof(Collider) }, null, mine, theirs)));
                });
            });
            return g;
        }

        // ------------------------------------------------------------------ the game's relay ops (PORT.md 11.3)

        public override void RelayOps(RelayGraph.Ops ops)
        {
            var g = ops.g;
            Val Body() => g.Keep(g.ComponentOf(ops.Target, typeof(Rigidbody)));
            Val At(int i) => g.V3(ops.Number(i), ops.Number(i + 1), ops.Number(i + 2));
            void Var(string name, object value, Type type = null) => g.SetObjVar(name, value, ops.Target, type);

            // impulse | ball | x y z | shot: AddForce(v, Impulse) (:542); the rest watch starts again for that shot
            ops.Add("impulse", () =>
            {
                var body = Body();
                g.IfNotNull(body, () =>
                {
                    g.Do(typeof(Rigidbody), "WakeUp", Type.EmptyTypes, body);
                    g.Do(typeof(Rigidbody), "AddForce", new[] { typeof(Vector3), typeof(ForceMode) }, body, At(0), ForceMode.Impulse);
                    Var("PkShot", ops.Arg(3), typeof(string));
                    Var("PkRest", false);
                    Var("PkSettle", 3f);
                    Var("PkLive", true);
                });
            });
            // place | ball | x y z | shot: InstantiateBallAtSpawn (:557-591): at rest there, scale 1, dynamic, interpolated; the
            // per-ball sleep threshold (J4: upstream's project value 0.14; the world-wide bounce threshold cannot be set)
            ops.Add("place", () =>
            {
                var body = Body();
                g.IfNotNull(body, () =>
                {
                    var at = g.Keep(At(0));
                    var transform = g.Keep(g.Get(typeof(GameObject), "transform", ops.Target));
                    g.Set(typeof(Rigidbody), "isKinematic", body, false);
                    g.Set(typeof(Rigidbody), "interpolation", body, RigidbodyInterpolation.Interpolate);
                    g.Set(typeof(Rigidbody), "sleepThreshold", body, 0.14f);
                    g.Set(typeof(Transform), "localScale", transform, g.Get(typeof(Vector3), "one"));
                    g.Set(typeof(Transform), "position", transform, at);
                    g.Set(typeof(Rigidbody), "position", body, at);
                    g.Set(typeof(Rigidbody), "linearVelocity", body, g.Get(typeof(Vector3), "zero"));
                    g.Set(typeof(Rigidbody), "angularVelocity", body, g.Get(typeof(Vector3), "zero"));
                    Var("PkSinking", false);
                    Var("PkShot", ops.Arg(3), typeof(string));
                    Var("PkRest", false);
                    Var("PkSettle", 1f);
                    Var("PkLive", true);
                });
            });
            // assist | ball | 1 | hole x y z | assistRadius captureRadius maxAssisted maxCapture minPull maxPull playable   or   0
            ops.Add("assist", () => g.If(ops.Flag(0), () =>
            {
                Var("PkHole", At(1));
                Var("PkAssistR", ops.Number(4));
                Var("PkCaptureR", ops.Number(5));
                Var("PkMaxAssist", ops.Number(6));
                Var("PkMaxCapture", ops.Number(7));
                Var("PkMinPull", ops.Number(8));
                Var("PkMaxPull", ops.Number(9));
                Var("PkPlayable", ops.Number(10));
                Var("PkArmed", true);
            }, () => Var("PkArmed", false)));
            // sink | ball | hole x y z | centerDrop | sinkDepth: the capture move (Update in the ball graph); kinematic while it runs
            ops.Add("sink", () =>
            {
                var body = Body();
                g.IfNotNull(body, () =>
                {
                    g.Set(typeof(Rigidbody), "isKinematic", body, true);
                    g.Set(typeof(Rigidbody), "interpolation", body, RigidbodyInterpolation.None);
                });
                Var("PkArmed", false);
                Var("PkSinkFrom", g.Get(typeof(Transform), "position", g.Get(typeof(GameObject), "transform", ops.Target)));
                Var("PkSinkHole", At(0));
                Var("PkSinkDrop", ops.Number(3));
                Var("PkSinkDepth", ops.Number(4));
                Var("PkSinkT0", g.Get(typeof(Time), "time"));
                Var("PkSinking", true);
            });
            // line | aimLine | 1 | from x y z | to x y z | width | r g b a   or   0 (:492-526)
            ops.Add("line", () => ops.With(typeof(LineRenderer), line =>
            {
                g.Set(typeof(LineRenderer), "enabled", line, ops.Flag(0));
                g.If(ops.Flag(0), () =>
                {
                    g.Do(typeof(LineRenderer), "SetPosition", new[] { typeof(int), typeof(Vector3) }, line, 0, At(1));
                    g.Do(typeof(LineRenderer), "SetPosition", new[] { typeof(int), typeof(Vector3) }, line, 1, At(4));
                    var width = g.Keep(ops.Number(7));
                    g.Set(typeof(LineRenderer), "startWidth", line, width);
                    g.Set(typeof(LineRenderer), "endWidth", line, width);
                    var colour = g.Keep(ops.Colour(8));
                    g.Set(typeof(LineRenderer), "startColor", line, colour);
                    g.Set(typeof(LineRenderer), "endColor", line, colour);
                });
            }));
            // reveal | level | seconds in: the level's baked clip from that time (A8; a late joiner joins part-way)
            ops.Add("reveal", () => ops.With(typeof(Animator), animator =>
            {
                g.Set(typeof(Animator), "enabled", animator, true);
                var length = g.Max(g.ObjVarOf(ops.Target, "PkRevealLength", typeof(float)), 0.01f);
                g.Do(typeof(Animator), "Play", new[] { typeof(string), typeof(int), typeof(float) }, animator, "Reveal", 0, g.Clamp01(ops.Number(0) / length));
            }));
            // xray | course | count | per sphere: cx cy cz radius softness (RevealVolumeManager.PushGlobals; the kit's toon shader reads them)
            ops.Add("xray", () =>
            {
                var count = g.Keep(ops.Number(0));
                g.Do(typeof(Shader), "SetGlobalFloat", new[] { typeof(string), typeof(float) }, null, "_PkRevealCount", count);
                g.If(g.Greater(count, 0.5f), () =>
                {
                    g.Do(typeof(Shader), "SetGlobalVector", new[] { typeof(string), typeof(Vector4) }, null, "_PkReveal0", V4(g, ops.Number(1), ops.Number(2), ops.Number(3), ops.Number(4)));
                    g.If(g.Greater(count, 1.5f), () =>
                    {
                        g.Do(typeof(Shader), "SetGlobalVector", new[] { typeof(string), typeof(Vector4) }, null, "_PkReveal1", V4(g, ops.Number(6), ops.Number(7), ops.Number(8), ops.Number(9)));
                        g.Do(typeof(Shader), "SetGlobalVector", new[] { typeof(string), typeof(Vector4) }, null, "_PkRevealSoft", V4(g, ops.Number(5), ops.Number(10), 0f, 0f));
                    }, () => g.Do(typeof(Shader), "SetGlobalVector", new[] { typeof(string), typeof(Vector4) }, null, "_PkRevealSoft", V4(g, ops.Number(5), 0f, 0f, 0f)));
                });
            });
            // uiHeight | pip | height: RectTransform.sizeDelta.y (VRGolfUI.cs:194-195)
            ops.Add("uiHeight", () => ops.With(typeof(RectTransform), rect =>
                g.Set(typeof(RectTransform), "sizeDelta", rect, g.V2(g.Get(typeof(Vector2), "x", g.Get(typeof(RectTransform), "sizeDelta", rect)), ops.Number(0)))));
            // fade | canvas | alpha: every graphic under it (CanvasGroup.alpha, which is not on the allow list)
            ops.Add("fade", () =>
            {
                var alpha = g.Keep(ops.Number(0));
                var graphics = g.Call(typeof(GameObject), "GetComponentsInChildren", new[] { typeof(Type) }, ops.Target, g.TypeOf(typeof(UnityEngine.UI.Graphic)));
                g.ForEach(graphics, typeof(UnityEngine.UI.Graphic), graphic =>
                    g.Do(typeof(UnityEngine.UI.Graphic), "CrossFadeAlpha", new[] { typeof(float), typeof(float), typeof(bool) }, graphic, alpha, 0f, true));
            });
        }

        /// <summary>new Vector4(x, y, z, w): GraphWriter has no helper for it (UnityEngine.Vector4..ctor is on the allow list).</summary>
        static Val V4(GraphWriter g, object x, object y, object z, object w)
        {
            var ctor = typeof(Vector4).GetConstructor(new[] { typeof(float), typeof(float), typeof(float), typeof(float) });
            g.usedMembers.Add("UnityEngine.Vector4..ctor");
            var unit = g.Add(new InvokeMember(new Member(typeof(Vector4), ctor)));
            g.Feed(unit, unit.inputParameters[0].key, x);
            g.Feed(unit, unit.inputParameters[1].key, y);
            g.Feed(unit, unit.inputParameters[2].key, z);
            g.Feed(unit, unit.inputParameters[3].key, w);
            return new Val(g, unit.result, typeof(Vector4));
        }

        // ------------------------------------------------------------------ the board

        GameObject Board(KitStage stage, GameObject uiUp, out JObject fields, out GameObject join, out GameObject restart, out GameObject playAgain)
        {
            var board = stage.Copy(uiUp, stage.Root.transform, "Board");
            stage.Object(board, key: "board");
            Untag(board);
            var vrUi = board.transform.Find("VR_UI");
            Transform F(string name) => vrUi.GetComponentsInChildren<Transform>(true).FirstOrDefault(t => t.name == name) ?? throw new Exception($"the board has no '{name}'");
            Transform In(Transform under, string name) => under.GetComponentsInChildren<Transform>(true).FirstOrDefault(t => t.name == name) ?? throw new Exception($"'{under.name}' has no '{name}'");
            var font = KitText.DefaultFont();
            foreach (var tmp in board.GetComponentsInChildren<TMP_Text>(true)) if (tmp.font == null) tmp.font = font;
            // Clicks arrive through colliders on the UI layer (no uGUI raycasting: chess's way); persistent listeners go
            foreach (var raycaster in board.GetComponentsInChildren<UnityEngine.UI.GraphicRaycaster>(true)) Object.DestroyImmediate(raycaster);
            foreach (var button in board.GetComponentsInChildren<UnityEngine.UI.Button>(true))
                for (int i = button.onClick.GetPersistentEventCount() - 1; i >= 0; i--) UnityEditor.Events.UnityEventTools.RemovePersistentListener(button.onClick, i);
            foreach (var group in board.GetComponentsInChildren<CanvasGroup>(true)) Object.DestroyImmediate(group);

            var card = F("GamePlayCard");
            var power = F("PowerMeter");
            var toast = F("FeedbackToast");
            var complete = F("CourseComplete");
            // upstream hides the power meter and the toast by scale 0 until its script shows them; here they are switched
            foreach (var canvas in new[] { power, toast }) canvas.localScale = card.localScale;
            power.gameObject.SetActive(false);
            toast.gameObject.SetActive(false);
            complete.gameObject.SetActive(false);
            stage.Object(power.gameObject, key: "powerCanvas");
            stage.Object(toast.gameObject, key: "feedbackCanvas");
            stage.Object(complete.gameObject, key: "courseCompleteCanvas");
            foreach (var t in new[] { power, toast, complete }) stage.Ref(t.gameObject);

            GameObject Text(Transform t, string key) { stage.Object(t.gameObject, key: key); stage.Ref(t.gameObject); return t.gameObject; }
            fields = new JObject
            {
                ["courseText"] = stage.ComponentValue(Text(In(card, "Course"), "courseText"), "TMP"),
                ["levelText"] = stage.ComponentValue(Text(In(card, "Level"), "levelText"), "TMP"),
                ["strokesText"] = stage.ComponentValue(Text(In(card, "Strokes"), "strokesText"), "TMP"),
                ["parText"] = stage.ComponentValue(Text(In(card, "Par"), "parText"), "TMP"),
                ["pips"] = new JArray(Enumerable.Range(0, 8).Select(i => (JToken)stage.ObjectValue(Text(In(card, "Pip" + i), "pip" + i)))),
                ["powerCanvas"] = stage.ObjectValue(power.gameObject),
                ["powerLabel"] = stage.ComponentValue(Text(In(power, "Label"), "powerLabel"), "TMP"),
                ["powerPercent"] = stage.ComponentValue(Text(In(power, "Percent"), "powerPercent"), "TMP"),
                ["powerSegments"] = new JArray(Enumerable.Range(0, 12).Select(i => (JToken)stage.ObjectValue(Text(In(power, "Seg" + i), "seg" + i)))),
                ["feedbackCanvas"] = stage.ObjectValue(toast.gameObject),
                ["feedbackText"] = stage.ComponentValue(Text(In(toast, "Feedback"), "feedbackText"), "TMP"),
                ["courseCompleteCanvas"] = stage.ObjectValue(complete.gameObject),
                ["courseCompleteTotal"] = stage.ComponentValue(Text(In(In(complete, "ScoreBox"), "Total"), "courseCompleteTotal"), "TMP"),
            };
            playAgain = In(complete, "PlayAgain").gameObject;
            stage.Object(playAgain, key: "playAgainButton");
            var playAgainLabel = playAgain.GetComponentInChildren<TMP_Text>(true);
            if (playAgainLabel != null) playAgainLabel.text = "PLAY AGAIN";               // upstream said "• TRIGGER"; A/X never worked (D6)
            ClickCollider(playAgain);

            // ---- new: the scorecard (a line per player), JOIN / LEAVE and RESTART HOLE, and the credits line ----
            var mono = KitText.StaticFontAsset(AssetDatabase.LoadAssetAtPath<Font>("Assets/Kit/Fonts/SpaceMono-Regular.ttf") ?? throw new Exception("no Space Mono"),
                string.Concat(Enumerable.Range(32, 95).Select(c => (char)c)) + "•", "Assets/Kit/Fonts/SpaceMono SDF.asset");
            mono.fallbackFontAssetTable = new List<TMP_FontAsset> { font };
            var scorecard = Panel(stage, vrUi, "Scorecard", new Vector3(0f, 0.62f, 0.6f), card, new Vector2(1060f, 300f));
            var lines = new JArray();
            for (int i = 0; i < 10; i++)
            {
                var line = Label(stage, scorecard.transform, "Line" + i, mono, 24f, new Vector2(0f, 120f - i * 27f), new Vector2(1020f, 28f), TextAlignmentOptions.Left);
                line.GetComponent<TMP_Text>().richText = false;                              // player names are shown as typed
                lines.Add(stage.ComponentValue(Text(line.transform, "cardLine" + i), "TMP"));
            }
            fields["cardLines"] = lines;

            var buttons = stage.Create("Buttons", vrUi);
            join = Button(stage, buttons.transform, "Join", "JOIN", new Vector3(-0.45f, 0.36f, 0.6f), card, font);
            restart = Button(stage, buttons.transform, "Restart", "RESTART HOLE", new Vector3(0.45f, 0.36f, 0.6f), card, font);
            fields["joinLabel"] = stage.ComponentValue(Text(join.transform.Find("Label"), "joinLabel"), "TMP");
            stage.Object(join, key: "joinButton");
            stage.Object(restart, key: "restartButton");

            var credits = Panel(stage, vrUi, "Credits", new Vector3(0f, 0.795f, 0.6f), card, new Vector2(1060f, 40f));
            Label(stage, credits.transform, "Text", font, 15f, Vector2.zero, new Vector2(1040f, 36f), TextAlignmentOptions.Center).GetComponent<TMP_Text>().text =
                "Mini Golf: a port of MinimalGolfVR by Dilmer Valecillos (MIT). Models: Kenney Minigolf Kit (CC0). Sounds: Kenney (CC0). " +
                "Fonts: Liberation Sans, Space Mono (SIL OFL 1.1). Licences: THIRD-PARTY-NOTICES.md in the kit.";
            return board;
        }

        static GameObject Panel(KitStage stage, Transform parent, string name, Vector3 at, Transform like, Vector2 size)
        {
            var panel = stage.Create(name, parent);
            var rect = panel.AddComponent<RectTransform>();
            panel.AddComponent<Canvas>().renderMode = RenderMode.WorldSpace;
            rect.sizeDelta = size;
            rect.localPosition = at;
            rect.localRotation = like.localRotation;
            rect.localScale = like.localScale;
            var bg = stage.Create("BG", panel.transform);
            var bgRect = bg.AddComponent<RectTransform>();
            bgRect.sizeDelta = size;
            bg.AddComponent<UnityEngine.UI.Image>().color = new Color(0.07f, 0.16f, 0.15f, 0.92f);
            return panel;
        }

        static GameObject Label(KitStage stage, Transform parent, string name, TMP_FontAsset font, float size, Vector2 at, Vector2 box, TextAlignmentOptions align)
        {
            var go = stage.Create(name, parent);
            var text = go.AddComponent<TextMeshProUGUI>();
            text.rectTransform.sizeDelta = box;
            text.rectTransform.anchoredPosition = at;
            text.font = font;
            text.fontSize = size;
            text.color = new Color(0.98f, 0.945f, 0.82f);
            text.alignment = align;
            text.textWrappingMode = TextWrappingModes.NoWrap;
            text.text = "";
            return go;
        }

        static GameObject Button(KitStage stage, Transform parent, string name, string label, Vector3 at, Transform like, TMP_FontAsset font)
        {
            var go = stage.Create(name, parent);
            var rect = go.AddComponent<RectTransform>();
            go.AddComponent<Canvas>().renderMode = RenderMode.WorldSpace;
            rect.sizeDelta = new Vector2(300f, 70f);
            rect.localPosition = at;
            rect.localRotation = like.localRotation;
            rect.localScale = like.localScale;
            go.AddComponent<UnityEngine.UI.Image>().color = new Color(0.882f, 0.51f, 0.184f);  // upstream's orange
            var text = Label(stage, go.transform, "Label", font, 30f, Vector2.zero, new Vector2(290f, 64f), TextAlignmentOptions.Center);
            text.GetComponent<TMP_Text>().text = label;
            text.GetComponent<TMP_Text>().color = new Color(0.07f, 0.16f, 0.15f);
            ClickCollider(go);
            return go;
        }

        static void ClickCollider(GameObject go)
        {
            var rect = go.GetComponent<RectTransform>();
            var box = go.GetComponent<BoxCollider>();
            if (box == null) box = go.AddComponent<BoxCollider>();
            box.center = rect.rect.center;
            box.size = new Vector3(rect.rect.width, rect.rect.height, Mathf.Min(rect.rect.width, rect.rect.height) * 0.2f);
        }

        /// <summary>The clips on `holder`'s BS Audio Source and its PkClips list (the relay `audio` op reads that); their $clip values.</summary>
        static List<JToken> ClipList(KitStage stage, GameObject holder, AudioClip[] clips)
        {
            holder.AddComponent<AudioSource>().playOnAwake = false;
            var bsAudio = holder.AddComponent(GraphTypes.Find("BS.BSAudioSource"));
            var so = new SerializedObject(bsAudio);
            var list = so.FindProperty("clips");
            list.arraySize = clips.Length;
            for (int i = 0; i < clips.Length; i++) list.GetArrayElementAtIndex(i).objectReferenceValue = clips[i];
            var playOnAwake = so.FindProperty("playOnAwake");
            if (playOnAwake != null) playOnAwake.boolValue = false;
            so.ApplyModifiedPropertiesWithoutUndo();
            var mirror = new AotList();
            foreach (var c in clips) mirror.Add(c);
            (holder.GetComponent<Variables>() ?? holder.AddComponent<Variables>()).declarations.Set(RelayGraph.ClipsVariable, mirror);
            stage.Ref(holder);
            var on = stage.ObjectValue(holder)["$obj"];
            return Enumerable.Range(0, clips.Length).Select(i => (JToken)new JObject { ["$clip"] = i, ["on"] = on.DeepClone() }).ToList();
        }

        // ------------------------------------------------------------------ materials

        /// <summary>
        /// The seven materials the course uses (175 scene copies reduce to these, PORT.md 5.3), the ball's, an occluder variant
        /// of the Kenney one (the x-ray clips it, drawn double-sided: F3, F5), the aiming line and the hand sphere. All made
        /// on the kit's toon shader or stock URP; URP's own keyword setup is run on the stock ones (coordinator's note: else
        /// extra passes stay on and bundles grow).
        /// </summary>
        Dictionary<string, Material> Materials()
        {
            Directory.CreateDirectory(MaterialFolder);
            var toon = Shader.Find(ToonShader) ?? throw new Exception($"shader '{ToonShader}' not found (did it compile?)");
            var made = new Dictionary<string, Material>();
            foreach (var name in new[] { "Course Green", "Cup Gold Rim", "Dark Cup", "Dark Green Rails", "Kenney Colormap Toon", "Obstacle Accent", "Warm Cream Base", "Ball Blue" })
            {
                var up = AssetDatabase.LoadAssetAtPath<Material>($"{Up}/Materials/{name}.mat") ?? throw new Exception($"no upstream material {name}");
                var m = new Material(toon) { name = name };
                m.CopyPropertiesFromMaterial(up);
                m.shaderKeywords = Array.Empty<string>();
                m.SetFloat("_PkOccluder", 0f);
                m.enableInstancing = true;
                made[name] = Save(m);
            }
            var occluder = new Material(made["Kenney Colormap Toon"]) { name = "Kenney Colormap Toon Occluder" };
            occluder.SetFloat("_PkOccluder", 1f);
            occluder.SetFloat("_CullMode", (float)CullMode.Off);
            made["Occluder"] = Save(occluder);

            var particles = Shader.Find("Universal Render Pipeline/Particles/Unlit") ?? throw new Exception("URP Particles/Unlit not found");
            var lineMat = new Material(particles) { name = "Aiming Line" };
            lineMat.SetColor("_BaseColor", Color.white);
            made["Aiming Line"] = Save(lineMat);
            UnityEditor.BaseShaderGUI.SetMaterialKeywords(made["Aiming Line"]);

            var unlit = Shader.Find("Universal Render Pipeline/Unlit") ?? throw new Exception("URP Unlit not found");
            var sphere = new Material(unlit) { name = "Hand Sphere" };
            sphere.SetFloat("_Surface", 1f);
            sphere.SetFloat("_Blend", 0f);
            sphere.SetColor("_BaseColor", new Color(0.3f, 0.9f, 0.6f, 0.2f));             // sphereColor, sphereOpacity
            made["Hand Sphere"] = Save(sphere);
            UnityEditor.BaseShaderGUI.SetMaterialKeywords(made["Hand Sphere"]);
            AssetDatabase.SaveAssets();
            return made;
        }

        static Material Save(Material m)
        {
            string path = $"{MaterialFolder}/{m.name}.mat";
            var existing = AssetDatabase.LoadAssetAtPath<Material>(path);
            if (existing != null)
            {
                existing.shader = m.shader;
                existing.CopyPropertiesFromMaterial(m);
                existing.shaderKeywords = m.shaderKeywords;
                existing.enableInstancing = m.enableInstancing;
                m = existing;
            }
            else AssetDatabase.CreateAsset(m, path);
            EditorUtility.SetDirty(m);
            return m;
        }

        static Material BallMaterial(int slot, Material blue)
        {
            var m = new Material(blue) { name = $"Ball {slot}" };
            var tint = BallColours[slot];
            m.SetColor("_BaseColor", tint);
            return Save(m);
        }

        void Retexture(Renderer r, Dictionary<string, Material> materials)
        {
            var shared = r.sharedMaterials;
            bool occluder = occluders.Contains(r.gameObject);
            for (int i = 0; i < shared.Length; i++)
            {
                if (shared[i] == null) continue;
                string name = shared[i].name.Replace(" (Instance)", "");
                if (occluder && name == "Kenney Colormap Toon") name = "Occluder";
                if (!materials.TryGetValue(name, out var mine)) throw new Exception($"no kit material for '{shared[i].name}' on {r.name}");
                shared[i] = mine;
            }
            r.sharedMaterials = shared;
        }
    }
}
