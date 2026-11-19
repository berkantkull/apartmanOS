import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { LoadingView } from "../../components/ui";
import { useAuth } from "../../auth-context";
import { colors } from "../../theme";

const icons = {
  index: ["grid", "grid-outline"],
  aidatlar: ["wallet", "wallet-outline"],
  duyurular: ["megaphone", "megaphone-outline"],
  daha: ["apps", "apps-outline"],
} as const;

export default function AppTabsLayout() {
  const { token, data, loading } = useAuth();
  if (loading) return <LoadingView />;
  if (!token) return <Redirect href="/auth" />;
  if (!data?.membership) return <Redirect href="/setup" />;

  return (
    <Tabs screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: colors.blue,
      tabBarInactiveTintColor: "#7A8FA4",
      tabBarStyle: { height: 74, paddingTop: 8, paddingBottom: 9, borderTopColor: colors.line, backgroundColor: colors.white },
      tabBarLabelStyle: { fontSize: 10, fontWeight: "800" },
      tabBarIcon: ({ color, focused, size }) => {
        const pair = icons[route.name as keyof typeof icons] || icons.daha;
        return <Ionicons name={focused ? pair[0] : pair[1]} color={String(color)} size={size} />;
      },
    })}>
      <Tabs.Screen name="index" options={{ title: "Genel Bakış" }} />
      <Tabs.Screen name="aidatlar" options={{ title: "Aidatlar" }} />
      <Tabs.Screen name="duyurular" options={{ title: "Duyurular" }} />
      <Tabs.Screen name="daha" options={{ title: "Daha Fazla" }} />
    </Tabs>
  );
}
