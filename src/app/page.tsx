import { redirect } from "next/navigation";

/** Chapters are delivered as direct links (e.g. /1.1), following the SkilliZee convention. */
export default function Home() {
  redirect("/1.1");
}
