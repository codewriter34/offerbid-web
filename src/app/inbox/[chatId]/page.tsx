import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import ThreadClient from "./ThreadClient";

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: "Chat",
    description: "An end-to-end encrypted conversation.",
    path: "/inbox",
    index: false,
  });
}

export default function ThreadPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  return <ThreadClient params={params} />;
}
