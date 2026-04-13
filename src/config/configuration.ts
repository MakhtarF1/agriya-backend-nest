export default () => ({
  app: {
    name: process.env.APP_NAME || 'AGRIYA API',
    url: process.env.APP_URL || 'http://localhost:8000',
    webUrl: process.env.WEB_URL || 'http://localhost:3000',
    env: process.env.NODE_ENV || 'development',
    defaultLocale: process.env.DEFAULT_LOCALE || 'fr',
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'change-me-super-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  corsOrigins: process.env.CORS_ORIGINS || '',
  mediaStoragePath: process.env.MEDIA_STORAGE_PATH || 'storage',
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    chatModel: process.env.OPENAI_MODEL_CHAT || 'gpt-4.1-mini',
    visionModel: process.env.OPENAI_MODEL_VISION || 'gpt-4.1-mini',
    audioModel: process.env.OPENAI_MODEL_AUDIO || 'gpt-4o-mini-transcribe',
  },
});
