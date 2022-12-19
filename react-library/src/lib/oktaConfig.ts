export const oktaConfig = {
    clientId: '0oa7l2yk6kaVMeGTY5d7',
    issuer: 'https://dev-72970343.okta.com/oauth2/default',
    redirectUri: 'http://localhost:3000/login/callback',
    scopes: ['openid', 'profile', 'email'],
    pkce: true,
    disableHttpsCheck: true,
}