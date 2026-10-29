"use client";

// ─────────────────────────────────────────────────────────────
// Home · below-the-fold section group.
// Everything after the hero + trust bar streams in as a separate
// chunk: the critical hydration path (hero paint / LCP) only needs
// the hero + navbar, so these ~10 sections no longer compete for
// main-thread time during first paint on phones. The placeholder
// reserves rough height so scroll position stays stable.
// ─────────────────────────────────────────────────────────────
import type { RouteId } from "@/lib/content";
import {
  BookingStrip,
  CitiesStrip,
  EventTypesGrid,
  FaqTeaser,
  HonoursStrip,
  PackagesTeaser,
  SignatureActs,
  StorySection,
  TestimonialsStrip,
  VideoReel,
} from "./sections";

export function HomeBelowFold({ navigate }: { navigate: (r: RouteId) => void }) {
  return (
    <>
      <StorySection navigate={navigate} />
      <SignatureActs />
      <EventTypesGrid navigate={navigate} />
      <VideoReel />
      <PackagesTeaser navigate={navigate} />
      <TestimonialsStrip />
      <HonoursStrip navigate={navigate} />
      <CitiesStrip />
      <FaqTeaser navigate={navigate} />
      <BookingStrip navigate={navigate} />
    </>
  );
}
