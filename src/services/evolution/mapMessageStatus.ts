import { MessageStatus } from '@prisma/client'

const STATUS_MAP: Record<string, MessageStatus> = {
  '0': MessageStatus.FAILED,
  ERROR: MessageStatus.FAILED,
  '1': MessageStatus.PENDING,
  PENDING: MessageStatus.PENDING,
  '2': MessageStatus.SENT,
  SERVER_ACK: MessageStatus.SENT,
  '3': MessageStatus.DELIVERED,
  DELIVERY_ACK: MessageStatus.DELIVERED,
  '4': MessageStatus.READ,
  READ: MessageStatus.READ,
  '5': MessageStatus.READ,
  PLAYED: MessageStatus.READ
}

export function mapMessageStatus(
  raw: string | number | undefined | null
): MessageStatus | null {
  if (raw == null) return null
  return STATUS_MAP[String(raw)] ?? null
}
