"use client";

import { useParams } from "next/navigation";
import { OnlineRoom } from "./OnlineRoom";

export default function RoomPage() {
  const params = useParams<{ id: string }>();
  const roomId = params.id?.toUpperCase();
  if (!roomId) return null;
  return <OnlineRoom roomId={roomId} />;
}
