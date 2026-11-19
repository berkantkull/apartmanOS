import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { PropsWithChildren, ReactNode } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardTypeOptions,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import { colors, shadow } from "../theme";

export function LoadingView({ label = "apartmanOS hazırlanıyor" }: { label?: string }) {
  return (
    <SafeAreaView style={styles.loadingPage}>
      <View style={styles.loadingLogo}><Image source={require("../../assets/apartmanos-icon.png")} style={styles.logoImage} /></View>
      <ActivityIndicator color={colors.blue} size="large" />
      <Text style={styles.loadingText}>{label}</Text>
    </SafeAreaView>
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.brand, compact && styles.brandCompact]}>
      <View style={[styles.brandMark, compact && styles.brandMarkCompact]}>
        <Image source={require("../../assets/apartmanos-icon.png")} resizeMode="contain" style={styles.logoImage} />
      </View>
      <View>
        <Text style={[styles.brandName, compact && styles.brandNameCompact]}>apartman<Text style={styles.brandBlue}>OS</Text></Text>
        {!compact ? <Text style={styles.brandTagline}>Apartman ve site yönetimi</Text> : null}
      </View>
    </View>
  );
}

export function AppScreen({ children, refreshing = false, onRefresh, style }: PropsWithChildren<{ refreshing?: boolean; onRefresh?: () => void; style?: StyleProp<ViewStyle> }>) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.screenContent, style]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.blue} /> : undefined}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function ScreenHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Text style={styles.headerEyebrow}>apartmanOS</Text>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function Card({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Field({ label, error, ...inputProps }: TextInputProps & { label: string; error?: string }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor="#8BA0B4"
        autoCapitalize="none"
        {...inputProps}
        style={[styles.field, inputProps.multiline && styles.fieldMultiline, inputProps.style]}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

export function NumberField(props: Omit<TextInputProps, "keyboardType"> & { label: string }) {
  return <Field {...props} keyboardType={"number-pad" as KeyboardTypeOptions} />;
}

export function PrimaryButton({ label, onPress, busy = false, disabled = false, icon }: { label: string; onPress: () => void; busy?: boolean; disabled?: boolean; icon?: keyof typeof Ionicons.glyphMap }) {
  return (
    <Pressable disabled={disabled || busy} onPress={onPress} style={({ pressed }) => [styles.primaryPressable, (pressed || disabled) && styles.buttonPressed]}>
      <LinearGradient colors={[colors.navyLight, colors.blue, colors.cyan]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryButton}>
        {busy ? <ActivityIndicator color={colors.white} /> : <>{icon ? <Ionicons name={icon} size={19} color={colors.white} /> : null}<Text style={styles.primaryText}>{label}</Text></>}
      </LinearGradient>
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress, icon, tone = "default" }: { label: string; onPress: () => void; icon?: keyof typeof Ionicons.glyphMap; tone?: "default" | "danger" }) {
  const color = tone === "danger" ? colors.danger : colors.navyLight;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}>
      {icon ? <Ionicons name={icon} size={18} color={color} /> : null}
      <Text style={[styles.secondaryText, { color }]}>{label}</Text>
    </Pressable>
  );
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && onAction ? <Pressable onPress={onAction}><Text style={styles.sectionAction}>{action}</Text></Pressable> : null}
    </View>
  );
}

export function MetricCard({ label, value, note, icon, tone = "blue" }: { label: string; value: string; note: string; icon: keyof typeof Ionicons.glyphMap; tone?: "blue" | "green" | "amber" | "red" }) {
  const palette = {
    blue: [colors.ice, colors.blue],
    green: [colors.successSoft, colors.success],
    amber: [colors.warningSoft, colors.warning],
    red: [colors.dangerSoft, colors.danger],
  }[tone];
  return (
    <Card style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: palette[0] }]}><Ionicons name={icon} size={21} color={palette[1]} /></View>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricNote}>{note}</Text>
    </Card>
  );
}

export function ListItem({ icon, title, subtitle, trailing, tone = "blue" }: { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle: string; trailing?: ReactNode; tone?: "blue" | "green" | "amber" | "red" }) {
  const color = tone === "green" ? colors.success : tone === "amber" ? colors.warning : tone === "red" ? colors.danger : colors.blue;
  return (
    <View style={styles.listItem}>
      <View style={[styles.listIcon, { backgroundColor: `${color}14` }]}><Ionicons name={icon} size={19} color={color} /></View>
      <View style={styles.listBody}><Text style={styles.listTitle} numberOfLines={1}>{title}</Text><Text style={styles.listSubtitle} numberOfLines={2}>{subtitle}</Text></View>
      {trailing}
    </View>
  );
}

export function Pill({ label, tone = "blue" }: { label: string; tone?: "blue" | "green" | "amber" | "red" }) {
  const palette = tone === "green" ? [colors.successSoft, colors.success] : tone === "amber" ? [colors.warningSoft, colors.warning] : tone === "red" ? [colors.dangerSoft, colors.danger] : [colors.ice, colors.blue];
  return <View style={[styles.pill, { backgroundColor: palette[0] }]}><Text style={[styles.pillText, { color: palette[1] }]}>{label}</Text></View>;
}

export function EmptyState({ icon, title, text }: { icon: keyof typeof Ionicons.glyphMap; title: string; text: string }) {
  return (
    <View style={styles.empty}><View style={styles.emptyIcon}><Ionicons name={icon} size={28} color={colors.blue} /></View><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyText}>{text}</Text></View>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return <View style={styles.errorBanner}><Ionicons name="alert-circle-outline" size={20} color={colors.danger} /><Text>{message}</Text></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cloud },
  screenContent: { padding: 20, paddingBottom: 120, gap: 16 },
  loadingPage: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.cloud, gap: 18 },
  loadingLogo: { width: 74, height: 74, borderRadius: 22, backgroundColor: colors.white, padding: 9, ...shadow },
  loadingText: { color: colors.muted, fontSize: 14, fontWeight: "600" },
  logoImage: { width: "100%", height: "100%" },
  brand: { flexDirection: "row", alignItems: "center", gap: 12 },
  brandCompact: { gap: 9 },
  brandMark: { width: 64, height: 64, borderRadius: 19, padding: 7, backgroundColor: colors.white, ...shadow },
  brandMarkCompact: { width: 44, height: 44, borderRadius: 13, padding: 5 },
  brandName: { color: colors.navy, fontSize: 27, fontWeight: "900", letterSpacing: -1.1 },
  brandNameCompact: { fontSize: 21 },
  brandBlue: { color: colors.blue },
  brandTagline: { color: colors.muted, fontSize: 12, marginTop: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  headerText: { flex: 1 },
  headerEyebrow: { color: colors.blue, fontSize: 11, fontWeight: "800", letterSpacing: 1.2, textTransform: "uppercase" },
  headerTitle: { color: colors.ink, fontSize: 29, lineHeight: 34, fontWeight: "900", letterSpacing: -1 },
  headerSubtitle: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 4 },
  card: { backgroundColor: colors.white, borderRadius: 18, borderWidth: 1, borderColor: colors.line, padding: 16, ...shadow },
  fieldWrap: { gap: 7 },
  fieldLabel: { color: colors.ink, fontSize: 13, fontWeight: "800" },
  field: { minHeight: 52, borderRadius: 13, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, color: colors.ink, fontSize: 15, paddingHorizontal: 15 },
  fieldMultiline: { minHeight: 100, paddingTop: 14, textAlignVertical: "top" },
  fieldError: { color: colors.danger, fontSize: 12 },
  primaryPressable: { borderRadius: 14, overflow: "hidden" },
  primaryButton: { minHeight: 54, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  primaryText: { color: colors.white, fontSize: 15, fontWeight: "900" },
  secondaryButton: { minHeight: 48, borderRadius: 13, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, paddingHorizontal: 16 },
  secondaryText: { fontSize: 14, fontWeight: "800" },
  buttonPressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { color: colors.ink, fontSize: 19, fontWeight: "900", letterSpacing: -0.3 },
  sectionAction: { color: colors.blue, fontSize: 13, fontWeight: "800" },
  metricCard: { width: "48%", minHeight: 150 },
  metricIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  metricLabel: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  metricValue: { color: colors.ink, fontSize: 23, fontWeight: "900", letterSpacing: -0.7, marginTop: 3 },
  metricNote: { color: colors.muted, fontSize: 11, marginTop: 4 },
  listItem: { minHeight: 70, flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  listIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  listBody: { flex: 1, gap: 3 },
  listTitle: { color: colors.ink, fontSize: 14, fontWeight: "800" },
  listSubtitle: { color: colors.muted, fontSize: 12, lineHeight: 17 },
  pill: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  pillText: { fontSize: 10, fontWeight: "900" },
  empty: { alignItems: "center", paddingVertical: 28, paddingHorizontal: 20 },
  emptyIcon: { width: 56, height: 56, borderRadius: 18, backgroundColor: colors.ice, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  emptyTitle: { color: colors.ink, fontSize: 16, fontWeight: "900" },
  emptyText: { color: colors.muted, fontSize: 13, lineHeight: 19, textAlign: "center", marginTop: 5 },
  errorBanner: { flexDirection: "row", alignItems: "center", gap: 9, padding: 13, borderRadius: 12, backgroundColor: colors.dangerSoft, borderWidth: 1, borderColor: "#FFD2D2" },
});
