export const configConstant = {
  database: {
    host: 'DATABASE_HOST',
    port: 'DATABASE_PORT',
    username: 'DATABASE_USERNAME',
    password: 'DATABASE_PASSWORD',
    name: 'DATABASE_NAME',
  },
  
  baseUrls: {
    identityService: 'IDENTITY_SERVICE_URL',
    notificationService: 'NOTIFICATION_SERVICE_URL',
    coreService: 'CORE_SERVICE_URL'
  },
  jwt: {
    access_secret: 'ACCESS_SECRET',
    access_time: 'ACCESS_TIME',
    refresh_secret: 'REFRESH_SECRET',
    refresh_time: 'REFRESH_TIME',
    reset_time: 'RESET_TIME',
    reset_secret: 'RESET_SECRET',
    verify_secret:'JWT_VERIFICATION_TOKEN_SECRET'
  },
  amq: {
    url: 'RABBITMQ_URL',
    queue: 'RABBITMQ_QUEUE',
    durable: 'RABBITMQ_DURABLE'
  }
  
};
