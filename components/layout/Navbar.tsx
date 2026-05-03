import { getStreamCounts } from "@/lib/services/stream-service";
import NavbarClient from "@/components/layout/NavbarClient";

export default async function Navbar() {
  let liveCount = 0;
  try {
    const counts = await getStreamCounts();
    liveCount = counts.live;
  } catch {
    // Fail silently — nav still renders
  }

  return <NavbarClient liveCount={liveCount} />;
}
