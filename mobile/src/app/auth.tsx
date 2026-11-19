import { Ionicons } from "@expo/vector-icons";
import { Redirect } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { Brand, ErrorBanner, Field, LoadingView, PrimaryButton } from "../components/ui";
import { useAuth } from "../auth-context";
import { colors, shadow } from "../theme";

type Mode = "login" | "register";

export default function AuthScreen() {
  const { token, data, loading, signIn, register } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (loading && token) return <LoadingView label="Hesabınız açılıyor" />;
  if (token && data?.membership) return <Redirect href="/(app)" />;
  if (token) return <Redirect href="/setup" />;

  const submit = async () => {
    setError("");
    if (!email.trim() || password.length < 8) {
      setError("Geçerli bir e-posta ve en az 8 karakterli şifre girin.");
      return;
    }
    if (mode === "register" && (displayName.trim().length < 2 || phone.replace(/\D/g, "").length < 10)) {
      setError("Kayıt için ad soyad ve geçerli telefon numarası gerekli.");
      return;
    }
    setBusy(true);
    try {
      const payload = { email: email.trim(), password, displayName: displayName.trim(), phone: phone.trim() };
      await (mode === "login" ? signIn(payload) : register(payload));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Giriş tamamlanamadı.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.page}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.brandArea}>
            <Brand />
            <Text style={styles.heroTitle}>Apartmanınız cebinizde, yönetim her an yanınızda.</Text>
            <Text style={styles.heroText}>Mevcut apartmanOS hesabınızla giriş yapın veya ücretsiz hesabınızı oluşturun.</Text>
          </View>

          <View style={styles.authCard}>
            <View style={styles.tabs}>
              <Pressable onPress={() => { setMode("login"); setError(""); }} style={[styles.tab, mode === "login" && styles.activeTab]}><Text style={[styles.tabText, mode === "login" && styles.activeTabText]}>Giriş yap</Text></Pressable>
              <Pressable onPress={() => { setMode("register"); setError(""); }} style={[styles.tab, mode === "register" && styles.activeTab]}><Text style={[styles.tabText, mode === "register" && styles.activeTabText]}>Yeni hesap</Text></Pressable>
            </View>
            <View style={styles.form}>
              {mode === "register" ? <Field label="Ad soyad" value={displayName} onChangeText={setDisplayName} placeholder="Adınız ve soyadınız" autoCapitalize="words" /> : null}
              <Field label="E-posta" value={email} onChangeText={setEmail} placeholder="ornek@eposta.com" keyboardType="email-address" autoComplete="email" />
              {mode === "register" ? <Field label="Telefon" value={phone} onChangeText={setPhone} placeholder="05xx xxx xx xx" keyboardType="phone-pad" autoComplete="tel" /> : null}
              <View>
                <Field label="Şifre" value={password} onChangeText={setPassword} placeholder="En az 8 karakter" secureTextEntry={!showPassword} autoComplete={mode === "login" ? "current-password" : "new-password"} />
                <Pressable onPress={() => setShowPassword(value => !value)} style={styles.eyeButton}><Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.muted} /></Pressable>
              </View>
              <ErrorBanner message={error} />
              <PrimaryButton label={mode === "login" ? "Hesabıma giriş yap" : "Hesabımı oluştur"} icon={mode === "login" ? "log-in-outline" : "person-add-outline"} onPress={submit} busy={busy} />
              <Text style={styles.securityNote}><Ionicons name="shield-checkmark-outline" size={14} color={colors.success} />  Oturumunuz telefonun güvenli alanında saklanır.</Text>
            </View>
          </View>
          <Text style={styles.footer}>apartmanOS · Berkant Kul · Stark Bilişim Hizmetleri</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  page: { flex: 1, backgroundColor: colors.cloud },
  content: { flexGrow: 1, padding: 22, paddingTop: 36, paddingBottom: 32, justifyContent: "center" },
  brandArea: { gap: 16, marginBottom: 26 },
  heroTitle: { color: colors.ink, fontSize: 31, lineHeight: 36, fontWeight: "900", letterSpacing: -1.2, marginTop: 8 },
  heroText: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  authCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 22, padding: 7, ...shadow },
  tabs: { flexDirection: "row", backgroundColor: colors.cloud, borderRadius: 15, padding: 4 },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 11 },
  activeTab: { backgroundColor: colors.white, ...shadow },
  tabText: { color: colors.muted, fontSize: 13, fontWeight: "800" },
  activeTabText: { color: colors.navy },
  form: { gap: 15, padding: 14, paddingTop: 20 },
  eyeButton: { position: "absolute", right: 14, bottom: 16 },
  securityNote: { color: colors.muted, textAlign: "center", fontSize: 11, lineHeight: 17 },
  footer: { color: colors.muted, textAlign: "center", fontSize: 11, marginTop: 22 },
});
