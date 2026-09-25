import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import InboxClient from "./InboxClient";

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: "Inbox",
    description: "Your end-to-end encrypted conversations with sellers and buyers.",
    path: "/inbox",
    index: false,
  });
}

export default function InboxPage() {
  return <InboxClient />;
}
