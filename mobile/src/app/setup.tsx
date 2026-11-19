import { Redirect } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { AppScreen, Brand, Card, ErrorBanner, Field, LoadingView, NumberField, PrimaryButton, SecondaryButton } from "../components/ui";
import { useAuth } from "../auth-context";
import { colors } from "../theme";

type SetupMode = "create" | "join";

export default function SetupScreen() {
  const { data, loading, runAction, signOut } = useAuth();
  const invitation = data?.invitations?.[0];
  const [mode, setMode] = useState<SetupMode>(invitation ? "join" : "create");
  const [name, setName] = useState("");
  const [blockCount, setBlockCount] = useState("1");
  const [unitCount, setUnitCount] = useState("12");
  const [monthlyDue, setMonthlyDue] = useState("1000");
  const [code, setCode] = useState(invitation?.token || "");
  const [unit, setUnit] = useState(invitation?.unit || "");
  const [phone, setPhone] = useState(invitation?.phone || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const year = useMemo(() => String(new Date().getFullYear()), []);

  if (loading) return <LoadingView label="Apartman bilgileriniz hazırlanıyor" />;
  if (data?.membership) return <Redirect href="/(app)" />;

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      if (mode === "create") {
        if (!name.trim()) throw new Error("Apartman veya site adını yazın.");
        await runAction({ action: "createCommunity", name, blockCount, unitCount, monthlyDue, period: year });
      } else {
        if (!code.trim() || !unit.trim() || phone.replace(/\D/g, "").length < 10) throw new Error("Davet kodu, daire ve telefon bilgilerini tamamlayın.");
        await runAction({ action: "joinCommunity", code, unit, phone });
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Kurulum tamamlanamadı.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppScreen>
      <Brand compact />
      <View style={styles.intro}><Text style={styles.title}>Apartman bağlantınızı tamamlayın</Text><Text style={styles.lead}>Hesabınız açık. Yönetim alanınızı oluşturun veya yöneticinizin davetiyle katılın.</Text></View>
      {invitation ? <Card style={styles.inviteCard}><Text style={styles.inviteTitle}>{invitation.community_name || "Apartman yönetimi"} sizi davet etti</Text><Text style={styles.inviteText}>Davet kodunuz otomatik dolduruldu. Daire ve telefon bilginizi tamamlayın.</Text></Card> : null}
      <View style={styles.tabs}>
        <Pressable onPress={() => setMode("create")} style={[styles.tab, mode === "create" && styles.activeTab]}><Text style={[styles.tabText, mode === "create" && styles.activeTabText]}>Yeni apartman</Text></Pressable>
        <Pressable onPress={() => setMode("join")} style={[styles.tab, mode === "join" && styles.activeTab]}><Text style={[styles.tabText, mode === "join" && styles.activeTabText]}>Davetle katıl</Text></Pressable>
      </View>
      <Card style={styles.form}>
        {mode === "create" ? <>
          <Field label="Site / apartman adı" value={name} onChangeText={setName} placeholder="Örn. Güneş Apartmanı" autoCapitalize="words" />
          <View style={styles.row}><View style={styles.half}><NumberField label="Blok sayısı" value={blockCount} onChangeText={setBlockCount} /></View><View style={styles.half}><NumberField label="Daire sayısı" value={unitCount} onChangeText={setUnitCount} /></View></View>
          <NumberField label="Aylık aidat" value={monthlyDue} onChangeText={setMonthlyDue} placeholder="1000" />
        </> : <>
          <Field label="Davet kodu" value={code} onChangeText={setCode} placeholder="Örn. A7K9P2M" autoCapitalize="characters" />
          <Field label="Daireniz" value={unit} onChangeText={setUnit} placeholder="Örn. A Blok · Daire 4" />
          <Field label="Telefon numaranız" value={phone} onChangeText={setPhone} placeholder="05xx xxx xx xx" keyboardType="phone-pad" />
        </>}
        <ErrorBanner message={error} />
        <PrimaryButton label={mode === "create" ? "Yönetim alanını oluştur" : "Apartmana katıl"} onPress={submit} busy={busy} icon={mode === "create" ? "business-outline" : "enter-outline"} />
      </Card>
      <SecondaryButton label="Farklı hesapla giriş yap" icon="log-out-outline" tone="danger" onPress={() => Alert.alert("Çıkış yapılsın mı?", "Bu telefondaki oturum kapatılacak.", [{ text: "Vazgeç", style: "cancel" }, { text: "Çıkış yap", style: "destructive", onPress: () => void signOut() }])} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  intro: { gap: 8, marginTop: 8 },
  title: { color: colors.ink, fontSize: 30, lineHeight: 35, fontWeight: "900", letterSpacing: -1 },
  lead: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  inviteCard: { backgroundColor: colors.ice, borderColor: "#B9DFFF" },
  inviteTitle: { color: colors.navy, fontWeight: "900", fontSize: 15 },
  inviteText: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 5 },
  tabs: { flexDirection: "row", backgroundColor: "#E5EEF6", padding: 4, borderRadius: 14 },
  tab: { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 11 },
  activeTab: { backgroundColor: colors.white },
  tabText: { color: colors.muted, fontWeight: "800", fontSize: 13 },
  activeTabText: { color: colors.navy },
  form: { gap: 15 },
  row: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
});
