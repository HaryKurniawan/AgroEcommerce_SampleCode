import type {
  ApiChatMessage,
  ApiChatProductMeta,
  ApiChatOrderMeta,
} from "@/types";

/**
 * Parse message content to extract product and order metadata
 */
export function parseMessageMetadata(content: string) {
  let actualContent = content;
  let productMeta: ApiChatProductMeta | null = null;
  let orderMeta: ApiChatOrderMeta | null = null;

  // Parse PRODUCT_META
  const metaIndex = actualContent.indexOf("---PRODUCT_META---");
  if (metaIndex !== -1) {
    try {
      const jsonStr = actualContent
        .substring(metaIndex + "---PRODUCT_META---".length)
        .trim();
      productMeta = JSON.parse(jsonStr);
      actualContent = actualContent.substring(0, metaIndex).trim();
    } catch (err) {
      console.error("Failed to parse PRODUCT_META", err);
    }
  }

  // Parse ORDER_META
  const orderMetaIndex = actualContent.indexOf("---ORDER_META---");
  if (orderMetaIndex !== -1) {
    try {
      const jsonStr = actualContent
        .substring(orderMetaIndex + "---ORDER_META---".length)
        .trim();
      orderMeta = JSON.parse(jsonStr);
      actualContent = actualContent.substring(0, orderMetaIndex).trim();
    } catch (err) {
      console.error("Failed to parse ORDER_META", err);
    }
  }

  return { actualContent, productMeta, orderMeta };
}

/**
 * Map backend message format to frontend ApiChatMessage format
 */
export function mapBackendMessage(msg: any): ApiChatMessage {
  return {
    id: msg.id || `msg-${msg.createdAt || Date.now()}-${Math.random()}`,
    senderId: msg.pengirimId || msg.senderId,
    content:
      msg.isiPesan ||
      msg.content ||
      msg.text ||
      msg.message ||
      msg.body ||
      msg.pesan ||
      "",
    isRead: msg.sudahDibaca === true || msg.status === "DIBACA",
    createdAt: msg.createdAt || msg.tanggalDibuat || new Date().toISOString(),
  };
}

/**
 * Group messages by date
 */
export function groupMessagesByDate(messages: ApiChatMessage[]) {
  const grouped: { date: string; messages: ApiChatMessage[] }[] = [];

  messages.forEach((msg) => {
    const dateKey = new Date(msg.createdAt).toDateString();
    const lastGroup = grouped[grouped.length - 1];

    if (lastGroup && lastGroup.date === dateKey) {
      lastGroup.messages.push(msg);
    } else {
      grouped.push({ date: dateKey, messages: [msg] });
    }
  });

  return grouped;
}

/**
 * Get sender ID from message (handles multiple field names)
 */
export function getMessageSenderId(msg: ApiChatMessage): string {
  return (
    (msg as any).pengirimId ||
    msg.senderId ||
    (msg as { userId?: string }).userId ||
    (msg as { sender?: { id: string } }).sender?.id ||
    ""
  );
}
