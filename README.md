# spot-service

1. Create `service_config.js` file with the following properties:

```
module.exports = {
    client_id: '<client_id>', // The spotify web developer client id.
    client_secret: '<client_secret>', // The spotify secret
    redirect_uri: 'http://localhost:4000/callback', // The callback uri used for OAuth Requests
    app_url: 'http://localhost:9000/' // Client React Application
}

```

2. Docker Commands

```
Build Imagine - docker build . -t ttatro32690/node-web-app
Run Container - docker run -p 4000:4000 -d ttatro32690/node-web-app
```