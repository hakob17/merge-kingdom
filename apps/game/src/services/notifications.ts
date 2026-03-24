/**
 * Push notification triggers for idle milestones.
 * Uses expo-notifications for local scheduling.
 */

export interface IdleMilestone {
  coinsThreshold: number;
  title: string;
  body: string;
  delayHours: number;
}

export const IDLE_MILESTONES: IdleMilestone[] = [
  {
    coinsThreshold: 1000,
    title: "Your kingdom is earning!",
    body: "You've earned 1,000 coins while away. Come collect!",
    delayHours: 1,
  },
  {
    coinsThreshold: 5000,
    title: "Coins piling up!",
    body: "Your kingdom earned 5,000 coins. Don't let them overflow!",
    delayHours: 3,
  },
  {
    coinsThreshold: 10000,
    title: "10K coins waiting!",
    body: "Your kingdom earned 10K while you were away! Collect now.",
    delayHours: 6,
  },
  {
    coinsThreshold: 25000,
    title: "Your treasury overflows!",
    body: "25,000 coins earned offline. Your kingdom needs you!",
    delayHours: 8,
  },
];

/**
 * Schedule idle milestone notifications.
 * Call this when the app goes to background.
 *
 * In production, use expo-notifications:
 *   import * as Notifications from 'expo-notifications';
 */
export async function scheduleIdleNotifications(incomePerSecond: number) {
  if (incomePerSecond <= 0) return;

  // Cancel previously scheduled idle notifications
  await cancelIdleNotifications();

  for (const milestone of IDLE_MILESTONES) {
    const secondsToReach = milestone.coinsThreshold / incomePerSecond;
    const hoursToReach = secondsToReach / 3600;

    // Only schedule if it will be reached within 8 hours (max offline)
    if (hoursToReach <= 8) {
      const triggerSeconds = Math.max(secondsToReach, milestone.delayHours * 3600);

      // In production:
      // await Notifications.scheduleNotificationAsync({
      //   content: { title: milestone.title, body: milestone.body },
      //   trigger: { seconds: triggerSeconds, channelId: 'idle-milestones' },
      // });

      console.log(
        `[Notifications] Scheduled: "${milestone.title}" in ${(triggerSeconds / 3600).toFixed(1)}h`
      );
    }
  }
}

/** Cancel all scheduled idle notifications */
export async function cancelIdleNotifications() {
  // In production:
  // await Notifications.cancelAllScheduledNotificationsAsync();
  console.log("[Notifications] Cancelled all idle notifications");
}

/** Request notification permissions (call once at app start) */
export async function requestNotificationPermissions(): Promise<boolean> {
  // In production:
  // const { status } = await Notifications.requestPermissionsAsync();
  // return status === 'granted';
  console.log("[Notifications] Permissions requested (mock: granted)");
  return true;
}
