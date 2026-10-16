/** Layout math shared by the receipt renderer and regression tests. */
export function meetingReceiptCanvasHeight(attendeeGroups: number): number {
  // Default postcard look for small meetings; expand for larger groups.
  return Math.max(1600, 1060 + Math.max(0, Math.floor(attendeeGroups)) * 62);
}

export function meetingReceiptLastRowBottom(attendeeGroups: number): number {
  return 886 + Math.max(0, attendeeGroups - 1) * 62 + 42;
}

export function meetingReceiptFooterTop(attendeeGroups: number): number {
  return meetingReceiptCanvasHeight(attendeeGroups) - 124;
}
