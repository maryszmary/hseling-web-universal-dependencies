# How to deploy the application via docker?

In order to deploy the extended annotatrix on your local machine, do the following steps.

**Prerequisites:** you should have docker-compose installed.

1. Clone the repositories

```bash
git clone https://github.com/maryszmary/hseling-web-universal-dependencies/
git clone https://github.com/hseling/hseling-web-universal-dependencies/
```

2. Go to hseling-web-universal-dependencies in terminal and checkout to the `localhost_deploy` branch

```bash
cd hseling-web-universal-dependencies
git checkout localhost_deploy
```
3. Build

```bash
docker-compose build
```

4. Run

```bash
docker-compose up -d
```

5. Go to ```http://localhost:8000/``` in the browser


If you want to deploy the application on remote machine, go to files `client/gui/menu.js` and `server/public/js/bundle.js` and change `API_ROOT` variable as necessary.
