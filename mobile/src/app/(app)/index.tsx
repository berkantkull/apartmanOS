import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppScreen, Card, EmptyState, ListItem, MetricCard, Pill, ScreenHeader, SectionTitle } from "../../components/ui";
import { useAuth } from "../../auth-context";
import { colors, money, roleNames, shortDate } from "../../theme";

export default function DashboardScreen() {
  const { data, loading, refresh } = useAuth();
  const community = data?.community;
  const membership = data?.membership;
  const dues = data?.dues || [];
  const expenses = data?.expenses || [];
  const incomes = data?.incomes || [];
  const announcements = data?.announcements || [];
  const requests = data?.requests || [];
  const collected = dues.reduce((sum, item) => sum + item.paid_amount, 0);
  const debt = dues.reduce((sum, item) => sum + item.balance, 0);
  const expenseTotal = expenses.reduce((sum, item) => sum + item.amount, 0);
  const incomeTotal = incomes.reduce((sum, item) => sum + item.amount, 0);
  const balance = collected + incomeTotal - expenseTotal;
  const unread = announcements.filter(item => !item.is_read).length;
  const openRequests = requests.filter(item => !["resolved", "cancelled"].includes(item.status)).length;

  if (!community || !membership) return null;

  return (
    <AppScreen refreshing={loading} onRefresh={() => refresh(membership.community_id)}>
      <ScreenHeader
        title="Genel Bakış"
        subtitle="Bugün bilmeniz gerekenler tek ekranda."
        right={<View style={styles.avatar}><Text style={styles.avatarText}>{data?.user.displayName.split(/\s+/).map(part => part[0]).join("").slice(0, 2).toLocaleUpperCase("tr")}</Text></View>}
      />

      <LinearGradient colors={[colors.navy, colors.navyLight, colors.blue]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.communityCard}>
        <View style={styles.communityIcon}><Ionicons name="business-outline" size={25} color={colors.white} /></View>
        <View style={styles.communityBody}><Text style={styles.communityName}>{community.name}</Text><Text style={styles.communityMeta}>{community.block_count} blok · {community.unit_count} daire · {roleNames[membership.role]}</Text></View>
        <Ionicons name="chevron-forward" size={20} color="#A9D9FF" />
      </LinearGradient>

      <View style={styles.metrics}>
        <MetricCard label="Toplanan aidat" value={money(collected)} note={`${dues.filter(item => item.status === "paid").length} ödeme tamamlandı`} icon="checkmark-circle-outline" tone="green" />
        <MetricCard label="Toplam borç" value={money(debt)} note={`${dues.filter(item => item.balance > 0).length} açık kayıt`} icon="alert-circle-outline" tone="red" />
        <MetricCard label="Toplam gider" value={money(expenseTotal)} note={`${expenses.length} gider kaydı`} icon="trending-down-outline" tone="amber" />
        <MetricCard label="Toplam bakiye" value={money(balance)} note={`${money(incomeTotal)} diğer gelir`} icon="wallet-outline" tone="blue" />
      </View>

      <SectionTitle title="Hızlı erişim" />
      <View style={styles.quickGrid}>
        <QuickAction icon="wallet-outline" label="Aidatlar" note={`${dues.length} kayıt`} onPress={() => router.push("/(app)/aidatlar")} />
        <QuickAction icon="megaphone-outline" label="Duyurular" note={`${unread} okunmamış`} onPress={() => router.push("/(app)/duyurular")} />
        <QuickAction icon="construct-outline" label="Arıza ve talep" note={`${openRequests} açık`} onPress={() => router.push("/(app)/talepler")} />
        <QuickAction icon="cube-outline" label="Kargolar" note={`${(data?.deliveries || []).filter(item => item.status === "waiting").length} bekliyor`} onPress={() => router.push("/(app)/kargolar")} />
      </View>

      <SectionTitle title="Son duyurular" action="Tümünü gör" onAction={() => router.push("/(app)/duyurular")} />
      <Card>
        {announcements.length ? announcements.slice(0, 3).map(item => (
          <ListItem key={item.id} icon={item.is_urgent ? "alert-circle-outline" : "megaphone-outline"} tone={item.is_urgent ? "red" : "blue"} title={item.title} subtitle={`${shortDate(item.publish_at || item.created_at)} · ${item.body}`} trailing={!item.is_read ? <Pill label="Yeni" /> : undefined} />
        )) : <EmptyState icon="megaphone-outline" title="Henüz duyuru yok" text="Yeni duyurular burada görünecek." />}
      </Card>

      <SectionTitle title="Son giderler" />
      <Card>
        {expenses.length ? expenses.slice(0, 4).map(item => <ListItem key={item.id} icon="receipt-outline" tone="amber" title={item.title} subtitle={`${item.category} · ${shortDate(item.expense_date)}`} trailing={<Text style={styles.amount}>{money(item.amount)}</Text>} />) : <EmptyState icon="receipt-outline" title="Henüz gider yok" text="Kaydedilen giderler burada özetlenecek." />}
      </Card>
    </AppScreen>
  );
}

function QuickAction({ icon, label, note, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; note: string; onPress: () => void }) {
  return <Pressable style={styles.quickPress} onPress={onPress}><Card style={styles.quickCard}><Ionicons name={icon} size={24} color={colors.blue} /><Text style={styles.quickLabel}>{label}</Text><Text style={styles.quickNote}>{note}</Text></Card></Pressable>;
}

const styles = StyleSheet.create({
  avatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.navy, alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.white, fontWeight: "900" },
  communityCard: { minHeight: 94, borderRadius: 20, padding: 17, flexDirection: "row", alignItems: "center", gap: 13 },
  communityIcon: { width: 48, height: 48, borderRadius: 15, backgroundColor: "#FFFFFF18", alignItems: "center", justifyContent: "center" },
  communityBody: { flex: 1 },
  communityName: { color: colors.white, fontSize: 18, fontWeight: "900" },
  communityMeta: { color: "#C8E7FF", fontSize: 12, marginTop: 4 },
  metrics: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 },
  quickPress: { width: "48%" },
  quickCard: { minHeight: 116 },
  quickLabel: { color: colors.ink, fontSize: 14, fontWeight: "900", marginTop: 12 },
  quickNote: { color: colors.muted, fontSize: 11, marginTop: 3 },
  amount: { color: colors.ink, fontSize: 13, fontWeight: "900" },
});
