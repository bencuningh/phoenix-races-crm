function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  get notionApiKey() {
    return required("NOTION_API_KEY");
  },
  get notionDataSourceId() {
    return required("NOTION_DATA_SOURCE_ID");
  },
  get supabaseUrl() {
    return required("SUPABASE_URL");
  },
  get supabaseServiceRoleKey() {
    return required("SUPABASE_SERVICE_ROLE_KEY");
  },
  get googleClientId() {
    return required("GOOGLE_CLIENT_ID");
  },
  get googleClientSecret() {
    return required("GOOGLE_CLIENT_SECRET");
  },
  get googleRedirectUri() {
    return required("GOOGLE_REDIRECT_URI");
  },
  get cronSecret() {
    return process.env.CRON_SECRET ?? "";
  },
  get followupThresholdDays() {
    const raw = process.env.FOLLOWUP_THRESHOLD_DAYS;
    const parsed = raw ? Number.parseInt(raw, 10) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 12;
  },
};
