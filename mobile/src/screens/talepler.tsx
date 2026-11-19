import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppScreen, Card, EmptyState, Field, Pill, PrimaryButton, ScreenHeader, SectionTitle, SecondaryButton } from "../components/ui";
import { useAuth } from "../auth-context";
import { colors, shortDate } from "../theme";
import type { MaintenanceRequest } from "../types";

const statusNames = { new: "Yeni", reviewing: "İnceleniyor", in_progress: "İşleme Alındı", resolved: "Çözüldü", cancelled: "İptal Edildi" } as const;
const priorityNames = { low: "Düşük", normal: "Normal", high: "Yüksek", urgent: "Acil" } as const;

export default function RequestsScreen() {
  const { data, loading, refresh, runAction } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<MaintenanceRequest | null>(null);
  const membership = data?.membership;
  const requests = data?.requests || [];
  const canManage = membership ? ["owner", "manager"].includes(membership.role) : false;
  if (!membership) return null;

  return <><AppScreen refreshing={loading} onRefresh={() => refresh(membership.community_id)}><ScreenHeader title="Arıza & Talepler" subtitle="Arızaları bildirin, süreci takip edin ve çözüm durumunu görün." /><PrimaryButton label="Yeni bildirim oluştur" icon="add-circle-outline" onPress={() => setCreateOpen(true)} /><SectionTitle title={`Kayıtlar (${requests.length})`} />{requests.length ? requests.map(item => <Pressable key={item.id} onPress={() => canManage && setSelected(item)}><Card style={styles.card}><View style={styles.top}><View style={[styles.icon, { backgroundColor: item.priority === "urgent" ? colors.dangerSoft : colors.ice }]}><Ionicons name={item.request_type === "fault" ? "construct-outline" : "chatbubble-ellipses-outline"} size={22} color={item.priority === "urgent" ? colors.danger : colors.blue} /></View><View style={styles.body}><Text style={styles.title}>{item.title}</Text><Text style={styles.meta}>{item.category} · {shortDate(item.created_at)}{item.unit ? ` · ${item.unit}` : ""}</Text></View><Pill label={statusNames[item.status]} tone={item.status === "resolved" ? "green" : item.priority === "urgent" ? "red" : "amber"} /></View><Text style={styles.description}>{item.description}</Text><View style={styles.footer}><Text style={styles.creator}>{item.creator_name}</Text><Pill label={priorityNames[item.priority]} tone={item.priority === "urgent" ? "red" : item.priority === "high" ? "amber" : "blue"} /></View>{item.manager_note ? <Text style={styles.note}>Yönetici notu: {item.manager_note}</Text> : null}</Card></Pressable>) : <Card><EmptyState icon="construct-outline" title="Henüz bildirim yok" text="Arıza ve talepler burada takip edilir." /></Card>}</AppScreen><CreateRequestModal visible={createOpen} onClose={() => setCreateOpen(false)} /><UpdateRequestModal item={selected} onClose={() => setSelected(null)} onAction={runAction} /></>;
}

function CreateRequestModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { runAction } = useAuth();
  const [requestType, setRequestType] = useState<"Arıza" | "Talep">("Arıza");
  const [category, setCategory] = useState(""); const [title, setTitle] = useState(""); const [description, setDescription] = useState(""); const [priority, setPriority] = useState("Normal"); const [busy, setBusy] = useState(false);
  async function submit() { if (!category.trim() || !title.trim() || !description.trim()) { Alert.alert("Eksik bilgi", "Kategori, başlık ve açıklama gereklidir."); return; } setBusy(true); try { await runAction({ action: "createMaintenanceRequest", requestType, category: category.trim(), title: title.trim(), description: description.trim(), priority }); setCategory(""); setTitle(""); setDescription(""); setPriority("Normal"); onClose(); Alert.alert("Bildirim oluşturuldu", "Yöneticiler uygulama içinde bilgilendirildi."); } catch (reason) { Alert.alert("Bildirim oluşturulamadı", reason instanceof Error ? reason.message : "İşlem tamamlanamadı."); } finally { setBusy(false); } }
  return <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}><SafeAreaView style={styles.modalPage}><ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled"><ScreenHeader title="Yeni bildirim" subtitle="Sorunu veya talebinizi ayrıntılı biçimde yazın." /><View style={styles.segment}><Choice label="Arıza" active={requestType === "Arıza"} onPress={() => setRequestType("Arıza")} /><Choice label="Talep" active={requestType === "Talep"} onPress={() => setRequestType("Talep")} /></View><Field label="Kategori" value={category} onChangeText={setCategory} placeholder="Örn. Asansör, su tesisatı" autoCapitalize="words" /><Field label="Başlık" value={title} onChangeText={setTitle} placeholder="Kısa bir başlık" autoCapitalize="sentences" /><Field label="Açıklama" value={description} onChangeText={setDescription} placeholder="Nerede ve ne zaman başladığını anlatın" multiline autoCapitalize="sentences" /><SectionTitle title="Öncelik" /><View style={styles.priorityRow}>{["Düşük", "Normal", "Yüksek", "Acil"].map(item => <Choice key={item} label={item} active={priority === item} onPress={() => setPriority(item)} compact />)}</View><PrimaryButton label="Bildirimi gönder" icon="send-outline" busy={busy} onPress={() => void submit()} /><SecondaryButton label="Vazgeç" onPress={onClose} /></ScrollView></SafeAreaView></Modal>;
}

function UpdateRequestModal({ item, onClose, onAction }: { item: MaintenanceRequest | null; onClose: () => void; onAction: (payload: Record<string, unknown>) => Promise<void> }) {
  const [note, setNote] = useState(""); const [busy, setBusy] = useState(false);
  async function update(status: string) { if (!item) return; setBusy(true); try { await onAction({ action: "updateMaintenanceRequest", id: item.id, status, managerNote: note.trim() }); setNote(""); onClose(); } catch (reason) { Alert.alert("Talep güncellenemedi", reason instanceof Error ? reason.message : "İşlem tamamlanamadı."); } finally { setBusy(false); } }
  return <Modal visible={!!item} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}><SafeAreaView style={styles.modalPage}><ScrollView contentContainerStyle={styles.modalContent}><ScreenHeader title="Talebi güncelle" subtitle={item?.title} /><Field label="Yönetici notu" value={note} onChangeText={setNote} placeholder="Yapılan işlem veya açıklama" multiline autoCapitalize="sentences" /><SectionTitle title="Yeni durum" />{["İnceleniyor", "İşleme Alındı", "Çözüldü", "İptal Edildi"].map(status => <PrimaryButton key={status} label={status} busy={busy} onPress={() => void update(status)} />)}<SecondaryButton label="Vazgeç" onPress={onClose} /></ScrollView></SafeAreaView></Modal>;
}

function Choice({ label, active, onPress, compact = false }: { label: string; active: boolean; onPress: () => void; compact?: boolean }) { return <Pressable onPress={onPress} style={[styles.choice, compact && styles.choiceCompact, active && styles.choiceActive]}><Text style={[styles.choiceText, active && styles.choiceTextActive]}>{label}</Text></Pressable>; }

const styles = StyleSheet.create({
  card: { gap: 12 }, top: { flexDirection: "row", alignItems: "center", gap: 10 }, icon: { width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center" }, body: { flex: 1 }, title: { color: colors.ink, fontSize: 14, fontWeight: "900" }, meta: { color: colors.muted, fontSize: 11, marginTop: 3 }, description: { color: colors.ink, fontSize: 13, lineHeight: 19 }, footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, creator: { color: colors.muted, fontSize: 11 }, note: { color: colors.navyLight, backgroundColor: colors.ice, borderRadius: 10, padding: 10, fontSize: 12, lineHeight: 18 },
  modalPage: { flex: 1, backgroundColor: colors.cloud }, modalContent: { padding: 20, paddingBottom: 45, gap: 16 }, segment: { flexDirection: "row", gap: 8 }, priorityRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, choice: { flex: 1, minHeight: 46, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, alignItems: "center", justifyContent: "center", paddingHorizontal: 12 }, choiceCompact: { flexGrow: 1, flexBasis: "44%" }, choiceActive: { borderColor: colors.blue, backgroundColor: colors.ice }, choiceText: { color: colors.muted, fontSize: 12, fontWeight: "800" }, choiceTextActive: { color: colors.blue },
});
