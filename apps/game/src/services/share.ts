/**
 * Share integration — one-tap kingdom screenshot with game watermark.
 * Uses expo-sharing and expo-view-shot in production.
 */

export interface ShareOptions {
  type: "kingdom" | "merge_chain" | "achievement";
  title?: string;
}

/**
 * Capture a screenshot and share it.
 *
 * In production:
 *   import * as Sharing from 'expo-sharing';
 *   import { captureRef } from 'react-native-view-shot';
 */
export async function shareScreenshot(
  _viewRef: unknown,
  options: ShareOptions
): Promise<boolean> {
  const messages: Record<string, string> = {
    kingdom: "Check out my kingdom in Merge Kingdom! 🏰",
    merge_chain: "Just completed an epic merge chain! ✨",
    achievement: "New achievement unlocked in Merge Kingdom! 🏆",
  };

  // In production:
  // const uri = await captureRef(viewRef, { format: 'png', quality: 0.9 });
  // // Add watermark overlay
  // const watermarkedUri = await addWatermark(uri);
  // await Sharing.shareAsync(watermarkedUri, {
  //   mimeType: 'image/png',
  //   dialogTitle: messages[options.type],
  //   UTI: 'public.png',
  // });

  console.log(`[Share] ${options.type}: ${messages[options.type]}`);
  return true;
}

/**
 * Check if sharing is available on the device.
 * In production: return await Sharing.isAvailableAsync();
 */
export async function isSharingAvailable(): Promise<boolean> {
  return true;
}
