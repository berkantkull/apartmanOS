import { Redirect } from "expo-router";
import { LoadingView } from "../components/ui";
import { useAuth } from "../auth-context";

export default function IndexScreen() {
  const { token, data, loading } = useAuth();
  if (loading) return <LoadingView />;
  if (!token) return <Redirect href="/auth" />;
  if (!data?.membership) return <Redirect href="/setup" />;
  return <Redirect href="/(app)" />;
}
