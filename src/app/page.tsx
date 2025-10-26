import { redirect } from "next/navigation";

export default function Home() {
  // Route to default dashboard view
  redirect("/dashboard");

  return null;
}
