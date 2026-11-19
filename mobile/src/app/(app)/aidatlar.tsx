import { StyleSheet, Text, View } from "react-native";
import { AppScreen, Card, EmptyState, ListItem, MetricCard, Pill, ScreenHeader, SectionTitle } from "../../components/ui";
import { useAuth } from "../../auth-context";
import { colors, money, shortDate } from "../../theme";

const statusLabels = { paid: "Ödendi", pending: "Bekliyor", late: "Gecikmiş" } as const;

export default function DuesScreen() {
  const { data, loading, refresh } = useAuth();
  const dues = data?.dues || [];
  const payments = dues.reduce((sum, item) => sum + item.paid_amount, 0);
  const debt = dues.reduce((sum, item) => sum + item.balance, 0);
  const late = dues.filter(item => item.status === "late").reduce((sum, item) => sum + item.balance, 0);
  const ownUnit = data?.membership?.unit;
  const visible = ownUnit && data?.membership?.role === "resident" ? dues.filter(item => item.unit === ownUnit) : dues;

  return (
    <AppScreen refreshing={loading} onRefresh={() => refresh(data?.membership?.community_id)}>
      <ScreenHeader title="Aidat & Borçlar" subtitle="Tahakkuk, ödeme ve gecikme durumları." />
      <View style={styles.metrics}>
        <MetricCard label="Toplam tahsilat" value={money(payments)} note={`${dues.filter(item => item.status === "paid").length} tamamlandı`} icon="checkmark-circle-outline" tone="green" />
        <MetricCard label="Toplam borç" value={money(debt)} note={`${dues.filter(item => item.balance > 0).length} açık kayıt`} icon="wallet-outline" tone="red" />
      </View>
      {late > 0 ? <Card style={styles.lateCard}><Text style={styles.lateTitle}>Gecikmiş borç</Text><Text style={styles.lateValue}>{money(late)}</Text><Text style={styles.lateText}>Son ödeme tarihi geçen kayıtların toplamı.</Text></Card> : null}
      <SectionTitle title={ownUnit && data?.membership?.role === "resident" ? "Dairenizin kayıtları" : "Tüm aidat kayıtları"} />
      <Card>
        {visible.length ? visible.map(item => {
          const tone = item.status === "paid" ? "green" : item.status === "late" ? "red" : "amber";
          return <ListItem key={item.id} icon="calendar-outline" tone={tone} title={`${item.period} · ${item.resident_name}`} subtitle={`${item.unit} · Son ödeme ${shortDate(item.due_date)} · Kalan ${money(item.balance)}`} trailing={<Pill label={statusLabels[item.status]} tone={tone} />} />;
        }) : <EmptyState icon="wallet-outline" title="Aidat kaydı yok" text="Yönetici tarafından oluşturulan aidatlar burada görünecek." />}
      </Card>
      <Text style={styles.note}>Ödeme girişi ve makbuz işlemleri mobil uygulamanın sonraki adımında etkinleştirilecek.</Text>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  metrics: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  lateCard: { backgroundColor: colors.dangerSoft, borderColor: "#FFD5D5" },
  lateTitle: { color: colors.danger, fontWeight: "800", fontSize: 12 },
  lateValue: { color: colors.ink, fontSize: 26, fontWeight: "900", marginTop: 3 },
  lateText: { color: colors.muted, fontSize: 12, marginTop: 4 },
  note: { color: colors.muted, fontSize: 11, lineHeight: 17, textAlign: "center", paddingHorizontal: 20 },
});
