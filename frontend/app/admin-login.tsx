import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const ADMIN_USER = process.env.EXPO_PUBLIC_ADMIN_USER;
const ADMIN_PASS = process.env.EXPO_PUBLIC_ADMIN_PASS;

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      router.replace("/(admin)/home");
    } else {
      setError("Invalid credentials. Try again.");
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <TouchableOpacity style={s.back} onPress={() => router.back()}>
        <Text style={s.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={s.center}>
        <View style={s.iconBox}>
          <Text style={s.iconText}>🛡️</Text>
        </View>
        <Text style={s.title}>Admin Access</Text>
        <Text style={s.sub}>Restricted to authorized personnel only</Text>

        <View style={s.form}>
          <View style={s.inputWrap}>
            <Text style={s.label}>Username</Text>
            <TextInput
              style={s.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              placeholderTextColor="#2a3050"
              autoCapitalize="none"
            />
          </View>

          <View style={s.inputWrap}>
            <Text style={s.label}>Password</Text>
            <View style={s.passRow}>
              <TextInput
                style={[s.input, { flex: 1 }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                placeholderTextColor="#2a3050"
                secureTextEntry={!showPass}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={s.showBtn}
                onPress={() => setShowPass(!showPass)}
              >
                <Text style={s.showBtnText}>{showPass ? "Hide" : "Show"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {error !== "" && <Text style={s.error}>{error}</Text>}

          <TouchableOpacity style={s.loginBtn} onPress={handleLogin}>
            <Text style={s.loginBtnText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050814", padding: 24 },
  back: { marginTop: 8 },
  backText: { color: "#4a5578", fontSize: 14 },
  center: { flex: 1, justifyContent: "center", gap: 8 },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#7c3aed22",
    borderWidth: 1,
    borderColor: "#7c3aed44",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    alignSelf: "center",
  },
  iconText: { fontSize: 32 },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
  },
  sub: {
    fontSize: 13,
    color: "#4a5578",
    textAlign: "center",
    marginBottom: 32,
  },
  form: { gap: 16 },
  inputWrap: { gap: 6 },
  label: { fontSize: 12, color: "#4a5578", letterSpacing: 1 },
  input: {
    backgroundColor: "#0e0820",
    borderWidth: 1,
    borderColor: "#7c3aed33",
    borderRadius: 12,
    padding: 14,
    color: "#fff",
    fontSize: 15,
  },
  passRow: { flexDirection: "row", gap: 8 },
  showBtn: {
    backgroundColor: "#0e0820",
    borderWidth: 1,
    borderColor: "#7c3aed33",
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  showBtnText: { color: "#a78bfa", fontSize: 13 },
  error: { color: "#ff4757", fontSize: 13, textAlign: "center" },
  loginBtn: {
    backgroundColor: "#7c3aed",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  loginBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
