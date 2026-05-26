type Environment = Record<string, unknown>;

export function validateEnvironment(config: Environment) {
  const databaseUrl = config.DATABASE_URL;
  const aiProvider = String(config.AI_PROVIDER ?? 'openai')
    .trim()
    .toLowerCase();
  const aiMaxTokensValue = config.AI_MAX_TOKENS ?? 1200;
  const aiMaxTokens = Number(aiMaxTokensValue);
  const aiTemperatureValue = config.AI_TEMPERATURE ?? 0.4;
  const aiTemperature = Number(aiTemperatureValue);
  const jwtSecret = config.JWT_SECRET;
  const maxUploadSizeMbValue = config.MAX_UPLOAD_SIZE_MB ?? 5;
  const maxUploadSizeMb = Number(maxUploadSizeMbValue);
  const portValue = config.PORT ?? 3001;
  const port = Number(portValue);

  if (typeof databaseUrl !== 'string' || databaseUrl.trim().length === 0) {
    throw new Error('DATABASE_URL is required.');
  }

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('PORT must be a positive integer.');
  }

  if (typeof jwtSecret !== 'string' || jwtSecret.trim().length === 0) {
    throw new Error('JWT_SECRET is required.');
  }

  if (!Number.isInteger(maxUploadSizeMb) || maxUploadSizeMb <= 0) {
    throw new Error('MAX_UPLOAD_SIZE_MB must be a positive integer.');
  }

  if (!Number.isInteger(aiMaxTokens) || aiMaxTokens <= 0) {
    throw new Error('AI_MAX_TOKENS must be a positive integer.');
  }

  if (!Number.isFinite(aiTemperature) || aiTemperature < 0 || aiTemperature > 2) {
    throw new Error('AI_TEMPERATURE must be a number between 0 and 2.');
  }

  if (!['gemini', 'openai'].includes(aiProvider)) {
    throw new Error('AI_PROVIDER must be either openai or gemini.');
  }

  return {
    ...config,
    AI_MAX_TOKENS: aiMaxTokens,
    AI_PROVIDER: aiProvider,
    AI_TEMPERATURE: aiTemperature,
    GEMINI_MODEL: config.GEMINI_MODEL ?? 'gemini-2.5-flash',
    JWT_EXPIRES_IN: config.JWT_EXPIRES_IN ?? '1d',
    MAX_UPLOAD_SIZE_MB: maxUploadSizeMb,
    MEDIA_UPLOAD_DIR: config.MEDIA_UPLOAD_DIR ?? 'uploads/media',
    NODE_ENV: config.NODE_ENV ?? 'development',
    PORT: port,
    PUBLIC_MEDIA_BASE_URL:
      config.PUBLIC_MEDIA_BASE_URL ??
      `http://localhost:${port}/uploads/media`,
  };
}
