type Environment = Record<string, unknown>;

export function validateEnvironment(config: Environment) {
  const databaseUrl = config.DATABASE_URL;
  const jwtSecret = config.JWT_SECRET;
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

  return {
    ...config,
    JWT_EXPIRES_IN: config.JWT_EXPIRES_IN ?? '1d',
    NODE_ENV: config.NODE_ENV ?? 'development',
    PORT: port,
  };
}
