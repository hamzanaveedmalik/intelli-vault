import { auth } from "~/server/auth";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  // Note: Workspace check is handled in middleware
  // This layout only checks authentication
  // The workspace creation page is allowed to render without a workspace

  return <>{children}</>;
}

