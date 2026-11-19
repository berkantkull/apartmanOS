import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppScreen, Card, EmptyState, Field, Pill, PrimaryButton, ScreenHeader, SectionTitle, SecondaryButton } from "../components/ui";
import { useAuth } from "../auth-context";
import { colors } from "../theme";
import type { PackageDelivery } from "../types";

type ResidentChoice = { value: string; name: string; unit: string; unitId: string };

const formatDateTime = (value: string) => new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export default function DeliveriesScreen() {
  const { data, loading, refresh, runAction } = useAuth();
  const [filter, setFilter] = useState<"waiting" | "delivered">("waiting");
  const [createOpen, setCreateOpen] = useState(false);
  const [completing, setCompleting] = useState<PackageDelivery | null>(null);
  const [busyId, setBusyId] = useState("");
  const membership = data?.membership;
  const deliveries = data?.deliveries || [];
  const canRecord = membership ? ["owner", "manager", "security"].includes(membership.role) : false;
  const visible = deliveries.filter(item => item.status === filter);
  const waiting = deliveries.filter(item => item.status === "waiting").length;

  if (!membership) return null;

  async function remind(item: PackageDelivery) {
    setBusyId(item.id);
    try {
      await runAction({ action: "remindPackageDelivery", id: item.id });
      Alert.alert("Hatırlatma gönderildi", "Hesabı bulunan sakin uygulama içinde bilgilendirildi.");
    } catch (reason) {
      Alert.alert("Hatırlatma gönderilemedi", reason instanceof Error ? reason.message : "İşlem tamamlanamadı.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <>
      <AppScreen refreshing={loading} onRefresh={() => refresh(membership.community_id)}>
        <ScreenHeader title="Kargo & Teslimat" subtitle="Gelen kargoları kaydedin, sakini bilgilendirin ve teslimatı tamamlayın." />
        <View style={styles.metrics}>
          <Card style={styles.metric}><Text style={styles.metricLabel}>Bekleyen</Text><Text style={styles.metricValue}>{waiting}</Text><Text style={styles.metricNote}>Teslim alınmayı bekliyor</Text></Card>
          <Card style={styles.metric}><Text style={styles.metricLabel}>Teslim edilen</Text><Text style={styles.metricValue}>{deliveries.length - waiting}</Text><Text style={styles.metricNote}>Kargo geçmişi</Text></Card>
        </View>
        {canRecord ? <PrimaryButton label="Yeni kargo kaydı" icon="cube-outline" onPress={() => setCreateOpen(true)} /> : null}
        <View style={styles.segment}>
          <Segment label={`Bekleyen (${waiting})`} active={filter === "waiting"} onPress={() => setFilter("waiting")} />
          <Segment label={`Geçmiş (${deliveries.length - waiting})`} active={filter === "delivered"} onPress={() => setFilter("delivered")} />
        </View>
        <SectionTitle title={filter === "waiting" ? "Teslim alınmayı bekleyenler" : "Teslimat geçmişi"} />
        {visible.length ? visible.map(item => (
          <Card key={item.id} style={styles.deliveryCard}>
            <View style={styles.cardTop}>
              <View style={styles.packageIcon}><Ionicons name={item.status === "waiting" ? "cube-outline" : "checkmark-done-outline"} size={24} color={item.status === "waiting" ? colors.blue : colors.success} /></View>
              <View style={styles.cardBody}><Text style={styles.resident}>{item.resident_name}</Text><Text style={styles.unit}>{item.unit_label}</Text></View>
              <Pill label={item.status === "waiting" ? "Bekliyor" : "Teslim edildi"} tone={item.status === "waiting" ? "amber" : "green"} />
            </View>
            <View style={styles.detailRow}><Ionicons name="car-outline" size={17} color={colors.muted} /><Text style={styles.detailText}>{item.courier_company}{item.tracking_number ? ` · ${item.tracking_number}` : ""}</Text></View>
            <View style={styles.detailRow}><Ionicons name="time-outline" size={17} color={colors.muted} /><Text style={styles.detailText}>{formatDateTime(item.arrived_at)}</Text></View>
            {item.notes ? <Text style={styles.note}>{item.notes}</Text> : null}
            {item.status === "delivered" ? <Text style={styles.delivered}>Teslim alan: {item.recipient_name || "Belirtilmedi"}{item.delivered_at ? ` · ${formatDateTime(item.delivered_at)}` : ""}</Text> : null}
            {canRecord && item.status === "waiting" ? <View style={styles.actions}>
              <Pressable disabled={busyId === item.id} onPress={() => void remind(item)} style={({ pressed }) => [styles.actionOutline, pressed && styles.pressed]}><Ionicons name="notifications-outline" size={17} color={colors.navyLight} /><Text style={styles.actionOutlineText}>{busyId === item.id ? "Gönderiliyor…" : "Hatırlat"}</Text></Pressable>
              <Pressable onPress={() => setCompleting(item)} style={({ pressed }) => [styles.actionPrimary, pressed && styles.pressed]}><Ionicons name="checkmark-circle-outline" size={18} color={colors.white} /><Text style={styles.actionPrimaryText}>Teslim et</Text></Pressable>
            </View> : null}
          </Card>
        )) : <Card><EmptyState icon="cube-outline" title={filter === "waiting" ? "Bekleyen kargo yok" : "Teslimat geçmişi boş"} text={filter === "waiting" ? "Yeni kargo kaydedildiğinde burada görünecek." : "Tamamlanan teslimatlar burada saklanır."} /></Card>}
      </AppScreen>
      <CreateDeliveryModal visible={createOpen} onClose={() => setCreateOpen(false)} />
      <CompleteDeliveryModal item={completing} onClose={() => setCompleting(null)} />
    </>
  );
}

function CreateDeliveryModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { data, runAction } = useAuth();
  const [residentKey, setResidentKey] = useState("");
  const [courierCompany, setCourierCompany] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const choices = useMemo<ResidentChoice[]>(() => {
    const account = (data?.members || []).filter(item => item.role === "resident").map(item => ({ value: `member:${item.id}`, name: item.display_name, unit: item.unit || "Daire belirtilmedi", unitId: "" }));
    const manual = (data?.residents || []).filter(item => item.source === "manual").map(item => ({ value: `resident:${item.id}`, name: item.name, unit: item.unit, unitId: "" }));
    const property = (data?.properties?.units || []).filter(item => item.tenant_name || item.owner_name).map(item => ({ value: `property:${item.id}`, name: item.tenant_name || item.owner_name || "Daire sakini", unit: item.label, unitId: item.id }));
    return [...account, ...manual, ...property].filter((choice, index, list) => list.findIndex(item => `${item.name}|${item.unit}`.toLocaleLowerCase("tr") === `${choice.name}|${choice.unit}`.toLocaleLowerCase("tr")) === index);
  }, [data?.members, data?.properties?.units, data?.residents]);
  const selected = choices.find(item => item.value === residentKey) || choices[0];

  async function submit() {
    if (!selected || !courierCompany.trim()) {
      Alert.alert("Eksik bilgi", "Sakin ve kargo firması seçilmelidir.");
      return;
    }
    setBusy(true);
    try {
      await runAction({ action: "createPackageDelivery", residentKey: selected.value, unitLabel: selected.unit, unitId: selected.unitId, courierCompany: courierCompany.trim(), trackingNumber: trackingNumber.trim(), notes: notes.trim(), arrivedAt: new Date().toISOString() });
      setResidentKey(""); setCourierCompany(""); setTrackingNumber(""); setNotes("");
      onClose();
      Alert.alert("Kargo kaydedildi", "Sakin hesabı varsa anlık uygulama bildirimi oluşturuldu.");
    } catch (reason) {
      Alert.alert("Kargo kaydedilemedi", reason instanceof Error ? reason.message : "İşlem tamamlanamadı.");
    } finally {
      setBusy(false);
    }
  }

  return <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}><SafeAreaView style={styles.modalPage}><ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled"><ScreenHeader title="Yeni kargo" subtitle="Teslimat sahibini ve kargo bilgilerini seçin." /><SectionTitle title="Sakin / daire" />{choices.length ? <View style={styles.choiceList}>{choices.map(choice => <Pressable key={choice.value} onPress={() => setResidentKey(choice.value)} style={[styles.choice, selected?.value === choice.value && styles.choiceActive]}><View style={[styles.radio, selected?.value === choice.value && styles.radioActive]}>{selected?.value === choice.value ? <View style={styles.radioDot} /> : null}</View><View style={styles.cardBody}><Text style={styles.choiceName}>{choice.name}</Text><Text style={styles.unit}>{choice.unit}</Text></View></Pressable>)}</View> : <Card><EmptyState icon="people-outline" title="Kargo bağlanacak sakin yok" text="Önce Daireler ve Sakinler bölümünden en az bir sakin veya daire oluşturun." /></Card>}<Field label="Kargo firması" value={courierCompany} onChangeText={setCourierCompany} placeholder="Örn. Trendyol Express" autoCapitalize="words" /><Field label="Takip numarası (isteğe bağlı)" value={trackingNumber} onChangeText={setTrackingNumber} placeholder="Takip numarası" /><Field label="Not (isteğe bağlı)" value={notes} onChangeText={setNotes} placeholder="Örn. Güvenlik bankosunda" multiline /><PrimaryButton label="Kaydet ve bildir" icon="notifications-outline" busy={busy} disabled={!choices.length} onPress={() => void submit()} /><SecondaryButton label="Vazgeç" onPress={onClose} /></ScrollView></SafeAreaView></Modal>;
}

function CompleteDeliveryModal({ item, onClose }: { item: PackageDelivery | null; onClose: () => void }) {
  const { runAction } = useAuth();
  const [recipientName, setRecipientName] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit() {
    if (!item || !recipientName.trim()) { Alert.alert("Eksik bilgi", "Teslim alan kişinin adını girin."); return; }
    setBusy(true);
    try {
      await runAction({ action: "completePackageDelivery", id: item.id, recipientName: recipientName.trim() });
      setRecipientName(""); onClose(); Alert.alert("Teslimat tamamlandı", "Kargo teslim edildi olarak işaretlendi.");
    } catch (reason) { Alert.alert("Teslimat kaydedilemedi", reason instanceof Error ? reason.message : "İşlem tamamlanamadı."); }
    finally { setBusy(false); }
  }
  return <Modal visible={!!item} animationType="slide" transparent onRequestClose={onClose}><View style={styles.overlay}><View style={styles.sheet}><Text style={styles.sheetTitle}>Kargoyu teslim et</Text><Text style={styles.sheetText}>{item ? `${item.resident_name} · ${item.unit_label}` : ""}</Text><Field label="Teslim alan kişi" value={recipientName} onChangeText={setRecipientName} placeholder="Ad soyad" autoCapitalize="words" /><PrimaryButton label="Teslimatı tamamla" busy={busy} icon="checkmark-circle-outline" onPress={() => void submit()} /><SecondaryButton label="Vazgeç" onPress={onClose} /></View></View></Modal>;
}

function Segment({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) { return <Pressable onPress={onPress} style={[styles.segmentButton, active && styles.segmentActive]}><Text style={[styles.segmentText, active && styles.segmentTextActive]}>{label}</Text></Pressable>; }

const styles = StyleSheet.create({
  metrics: { flexDirection: "row", gap: 12 }, metric: { flex: 1 }, metricLabel: { color: colors.muted, fontSize: 12, fontWeight: "700" }, metricValue: { color: colors.ink, fontSize: 28, fontWeight: "900", marginTop: 4 }, metricNote: { color: colors.muted, fontSize: 10, marginTop: 2 },
  segment: { flexDirection: "row", padding: 4, borderRadius: 14, backgroundColor: colors.line }, segmentButton: { flex: 1, minHeight: 42, borderRadius: 11, alignItems: "center", justifyContent: "center" }, segmentActive: { backgroundColor: colors.white }, segmentText: { color: colors.muted, fontWeight: "800", fontSize: 12 }, segmentTextActive: { color: colors.navy },
  deliveryCard: { gap: 12 }, cardTop: { flexDirection: "row", alignItems: "center", gap: 11 }, packageIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.ice, alignItems: "center", justifyContent: "center" }, cardBody: { flex: 1 }, resident: { color: colors.ink, fontSize: 15, fontWeight: "900" }, unit: { color: colors.muted, fontSize: 12, marginTop: 3 }, detailRow: { flexDirection: "row", alignItems: "center", gap: 8 }, detailText: { color: colors.muted, fontSize: 12, flex: 1 }, note: { color: colors.ink, fontSize: 12, lineHeight: 18, backgroundColor: colors.cloud, padding: 11, borderRadius: 10 }, delivered: { color: colors.success, fontSize: 12, fontWeight: "800" }, actions: { flexDirection: "row", gap: 9 }, actionOutline: { flex: 1, minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: colors.line, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }, actionOutlineText: { color: colors.navyLight, fontWeight: "800", fontSize: 12 }, actionPrimary: { flex: 1, minHeight: 44, borderRadius: 12, backgroundColor: colors.blue, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }, actionPrimaryText: { color: colors.white, fontWeight: "900", fontSize: 12 }, pressed: { opacity: 0.72 },
  modalPage: { flex: 1, backgroundColor: colors.cloud }, modalContent: { padding: 20, paddingBottom: 45, gap: 16 }, choiceList: { gap: 8 }, choice: { minHeight: 64, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, padding: 12, flexDirection: "row", alignItems: "center", gap: 11 }, choiceActive: { borderColor: colors.blue, backgroundColor: colors.ice }, choiceName: { color: colors.ink, fontWeight: "800", fontSize: 13 }, radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.line, alignItems: "center", justifyContent: "center" }, radioActive: { borderColor: colors.blue }, radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.blue },
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "#001B3470" }, sheet: { backgroundColor: colors.cloud, borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 22, paddingBottom: 36, gap: 15 }, sheetTitle: { color: colors.ink, fontSize: 23, fontWeight: "900" }, sheetText: { color: colors.muted, fontSize: 13 },
});
