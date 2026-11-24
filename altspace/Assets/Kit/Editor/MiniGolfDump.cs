// A look at the upstream scene as this editor (6000.3.21f1) imports it: PortKit/Mini Golf/Dump Upstream Scene writes every
// object of the course, the UI and the aiming line with its transform and components to Logs/minigolf_dump.txt.
// Used to check that the newer-version scene opens here (PORT.md 6.6) and to write the kit builder against it.
using System.Linq;
using System.Text;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

namespace MiniGolf
{
    public static class MiniGolfDump
    {
        [MenuItem("PortKit/Mini Golf/Dump Upstream Scene")]
        public static void Dump()
        {
            var report = new StringBuilder();
            var scene = EditorSceneManager.OpenScene("Assets/Upstream/Assets/MinimalGolf/Scenes/MinimalGolf.unity", OpenSceneMode.Additive);
            try
            {
                report.AppendLine($"scene {scene.path}: loaded {scene.isLoaded}, {scene.rootCount} roots");
                foreach (var root in scene.GetRootGameObjects())
                {
                    report.AppendLine($"ROOT {root.name} active {root.activeSelf}");
                    if (root.name == "VRCourseAnchor" || root.name == "GAME SYSTEMS" || root.name == "Environment" || root.name == "WARM SUN")
                        Walk(root.transform, 1, report);
                }
            }
            finally
            {
                EditorSceneManager.CloseScene(scene, true);
            }
            report.AppendLine("DONE");
            System.IO.File.WriteAllText("Logs/minigolf_dump.txt", report.ToString());
        }

        static void Walk(Transform t, int depth, StringBuilder report)
        {
            var go = t.gameObject;
            string pad = new string(' ', depth * 2);
            report.Append($"{pad}{go.name} [{(go.activeSelf ? "on" : "OFF")} L{go.layer} {go.tag}] p{F(t.localPosition)} r{F(t.localEulerAngles)} s{F(t.localScale)}");
            foreach (var c in go.GetComponents<Component>())
            {
                if (c == null) { report.Append(" MISSING"); continue; }
                if (c is Transform) continue;
                report.Append(" | " + c.GetType().Name);
                if (c is MeshFilter mf) report.Append($"({(mf.sharedMesh ? mf.sharedMesh.name + ":" + AssetDatabase.GetAssetPath(mf.sharedMesh) : "NO MESH")})");
                if (c is Renderer r) report.Append($"({string.Join(",", r.sharedMaterials.Select(m => m ? m.name + "/" + (m.shader ? m.shader.name : "?") : "null"))})");
                if (c is BoxCollider b) report.Append($"(c{F(b.center)} s{F(b.size)}{(b.isTrigger ? " trig" : "")} {(b.sharedMaterial ? b.sharedMaterial.name : "")})");
                if (c is MeshCollider mc) report.Append($"({(mc.sharedMesh ? mc.sharedMesh.name : "NO MESH")} cvx{mc.convex})");
                if (c is SphereCollider sc) report.Append($"(r{sc.radius} c{F(sc.center)}{(sc.isTrigger ? " trig" : "")})");
                if (c is MonoBehaviour mb && mb.GetType().Name == "MiniGolfLevel") report.Append(EditorJsonUtility.ToJson(mb).Length > 0 ? " " + EditorJsonUtility.ToJson(mb) : "");
                if (c is MonoBehaviour mb2 && mb2.GetType().Name == "LevelRevealAnimator")
                {
                    var so = new SerializedObject(mb2);
                    var parts = so.FindProperty("animatedParts");
                    report.Append($" parts {parts.arraySize}:");
                    for (int i = 0; i < parts.arraySize; i++) report.Append(" " + (parts.GetArrayElementAtIndex(i).objectReferenceValue ? parts.GetArrayElementAtIndex(i).objectReferenceValue.name : "null"));
                }
            }
            if (PrefabUtility.IsPartOfPrefabInstance(go) && PrefabUtility.GetNearestPrefabInstanceRoot(go) == go)
                report.Append($" PREFAB({AssetDatabase.GetAssetPath(PrefabUtility.GetCorrespondingObjectFromSource(go))})");
            report.AppendLine();
            foreach (Transform child in t) Walk(child, depth + 1, report);
        }

        static string F(Vector3 v) => $"({v.x:0.###},{v.y:0.###},{v.z:0.###})";
    }
}
