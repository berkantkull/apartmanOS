import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppScreen, Card, EmptyState, Pill, ScreenHeader } from "../../components/ui";
import { useAuth } from "../../auth-context";
import { colors, shortDate } from "../../theme";

export default function AnnouncementsScreen() {
  const { data, loading, refresh } = useAuth();
  const [openedAt] = useState(() => Date.now());
  const announcements = (data?.announcements || []).filter(item => !item.publish_at || Date.parse(item.publish_at) <= openedAt);

  return (
    <AppScreen refreshing={loading} onRefresh={() => refresh(data?.membership?.community_id)}>
      <ScreenHeader title="Duyurular" subtitle="Yönetiminizden güncel bilgilendirmeler." />
      {announcements.length ? announcements.map(item => (
        <Card key={item.id} style={Boolean(item.is_urgent) ? styles.urgentCard : undefined}>
          <View style={styles.topRow}>
            <View style={[styles.kindIcon, Boolean(item.is_urgent) && styles.urgentIcon]}><Text style={[styles.kindLetter, Boolean(item.is_urgent) && styles.urgentLetter]}>{item.is_urgent ? "!" : "D"}</Text></View>
            <View style={styles.meta}><Text style={styles.category}>{item.category || item.kind}</Text><Text style={styles.date}>{shortDate(item.publish_at || item.created_at)}</Text></View>
            {!item.is_read ? <Pill label="Okunmadı" /> : null}
          </View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.body}>{item.body}</Text>
          {item.is_urgent ? <View style={styles.urgentLine}><Text style={styles.urgentText}>Acil duyuru</Text></View> : null}
        </Card>
      )) : <Card><EmptyState icon="megaphone-outline" title="Henüz duyuru yok" text="Apartman veya siteniz için yayınlanan duyurular burada görünecek." /></Card>}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  urgentCard: { borderColor: "#FFC9C9", backgroundColor: "#FFFBFB" },
  topRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  kindIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.ice, alignItems: "center", justifyContent: "center" },
  urgentIcon: { backgroundColor: colors.dangerSoft },
  kindLetter: { color: colors.blue, fontWeight: "900" },
  urgentLetter: { color: colors.danger },
  meta: { flex: 1 },
  category: { color: colors.navy, fontSize: 12, fontWeight: "900" },
  date: { color: colors.muted, fontSize: 11, marginTop: 2 },
  title: { color: colors.ink, fontSize: 18, lineHeight: 23, fontWeight: "900", marginTop: 15 },
  body: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 7 },
  urgentLine: { alignSelf: "flex-start", backgroundColor: colors.dangerSoft, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginTop: 14 },
  urgentText: { color: colors.danger, fontSize: 11, fontWeight: "900" },
});
