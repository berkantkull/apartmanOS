import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { AppScreen, Brand, Card, ListItem, Pill, ScreenHeader, SectionTitle, SecondaryButton } from "../../components/ui";
import { useAuth } from "../../auth-context";
import { colors, roleNames } from "../../theme";

export default function MoreScreen() {
  const { data, loading, refresh, signOut } = useAuth();
  const membership = data?.membership;
  const requests = data?.requests || [];
  const meetings = data?.meetings || [];
  const deliveries = data?.deliveries || [];
  const communities = data?.communities || [];

  if (!membership) return null;

  const modules = [
    { icon: "trending-up-outline" as const, title: "Gelir - gider", subtitle: `${(data?.expenses || []).length} gider kaydı`, route: null },
    { icon: "construct-outline" as const, title: "Arıza ve talepler", subtitle: `${requests.filter(item => !["resolved", "cancelled"].includes(item.status)).length} açık talep`, route: "/talepler" as const },
    { icon: "calendar-outline" as const, title: "Toplantı ve kararlar", subtitle: `${meetings.length} toplantı`, route: null },
    { icon: "car-outline" as const, title: "Otopark ve araçlar", subtitle: "Web panelinde yönetilebilir", route: null },
    { icon: "cube-outline" as const, title: "Kargo ve teslimatlar", subtitle: `${deliveries.filter(item => item.status === "waiting").length} bekleyen kargo`, route: "/kargolar" as const },
    { icon: "people-outline" as const, title: "Daireler ve sakinler", subtitle: `${membership.unit || "Yönetim görünümü"}`, route: null },
  ];

  return (
    <AppScreen refreshing={loading} onRefresh={() => refresh(membership.community_id)}>
      <ScreenHeader title="Daha Fazla" subtitle="Diğer yönetim modülleri ve hesap ayarları." />
      <Card style={styles.profileCard}>
        <Brand compact />
        <View style={styles.profileLine} />
        <View style={styles.userRow}><View style={styles.avatar}><Text style={styles.avatarText}>{data?.user.displayName.split(/\s+/).map(part => part[0]).join("").slice(0, 2).toLocaleUpperCase("tr")}</Text></View><View style={styles.userBody}><Text style={styles.userName}>{data?.user.displayName}</Text><Text style={styles.userEmail}>{data?.user.email}</Text></View><Pill label={roleNames[membership.role]} /></View>
      </Card>

      {communities.length > 1 ? <><SectionTitle title="Apartmanlarım" /><Card>{communities.map(item => <Pressable key={item.community_id} onPress={() => refresh(item.community_id)}><ListItem icon="business-outline" title={item.name} subtitle={`${item.block_count} blok · ${item.unit_count} daire`} trailing={item.community_id === membership.community_id ? <Ionicons name="checkmark-circle" size={21} color={colors.success} /> : <Ionicons name="chevron-forward" size={18} color={colors.muted} />} /></Pressable>)}</Card></> : null}

      <SectionTitle title="Yönetim modülleri" />
      <Card>
        {modules.map(module => module.route ? <Pressable key={module.title} onPress={() => router.push(module.route!)}><ListItem icon={module.icon} title={module.title} subtitle={module.subtitle} trailing={<Ionicons name="chevron-forward" size={18} color={colors.muted} />} /></Pressable> : <ListItem key={module.title} icon={module.icon} title={module.title} subtitle={module.subtitle} trailing={<Pill label="Web" />} />)}
      </Card>

      <SectionTitle title="Hesap" />
      <SecondaryButton label="Oturumu kapat" icon="log-out-outline" tone="danger" onPress={() => Alert.alert("Oturum kapatılsın mı?", "Bu telefondaki güvenli oturum silinecek.", [{ text: "Vazgeç", style: "cancel" }, { text: "Çıkış yap", style: "destructive", onPress: () => void signOut() }])} />
      <Text style={styles.version}>apartmanOS Mobil · İlk Expo Go sürümü</Text>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  profileCard: { gap: 15 },
  profileLine: { height: 1, backgroundColor: colors.line },
  userRow: { flexDirection: "row", alignItems: "center", gap: 11 },
  avatar: { width: 46, height: 46, borderRadius: 14, backgroundColor: colors.navy, alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.white, fontWeight: "900" },
  userBody: { flex: 1 },
  userName: { color: colors.ink, fontWeight: "900", fontSize: 15 },
  userEmail: { color: colors.muted, fontSize: 11, marginTop: 3 },
  version: { color: colors.muted, fontSize: 11, textAlign: "center" },
});
