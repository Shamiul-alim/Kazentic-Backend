export default () => ({
  env: {
    JWT_BEARER_SECRET: process.env.JWT_BEARER_SECRET || null,
  },
  environment: {
    is_production: process.env.IS_PRODUCTION == "yes" ? true : false,
    is_log_active: process.env.IS_LOG_ACTIVE == "yes" ? true : false,
  },
});
