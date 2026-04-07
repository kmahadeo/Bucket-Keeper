// Stub for expo-sqlite on web platform
// SQLite is not available on web; the app uses API-only mode

export function openDatabaseSync() {
  console.warn('SQLite is not available on web');
  return null;
}

export default { openDatabaseSync };
