module.exports = {
    appNamespace: process.env.BASE_APP_NAMESPACE ?? 'auth',
    servicePort: process.env.BASE_APP_PORT ?? '3008',
    jwtSecret:process.env.AUTH_ACCESS_JWT_SECRET,
    jwtForResetPasswordSecret:process.env.AUTH_ACCESS_JWT_SECRET_RESET_PASSWORD,
    intraServiceApiEndpoints: {
        nes: process.env.INTRA_SERVICE_NOTIFICAION_SERVICE_URL,
    },
};
