# 1. How To Run

- Image: `LUbuntu-22.04.2-desktop-amd64.iso`
- Hardware:
  - 4 Processors, 1 core per processor
  - 8GB ram (min 3GB ram)
  - Port `8080` and `3000` are free and not utilised by other applications
  - Internet connection
- Software Prerequisites:
  - NodeJS: `18.16.0`
  - npm: `9.5.1`
  - yarn: `1.22.19`

# 2. How to install Software Prerequisites

Starting from a fresh install of the LUbuntu-22.04.2 image

## 2.1. Install NodeJS and NPM

1. Update system and packages

```bash
sudo apt update && sudo apt upgrade -y
```

2. Install `curl`

```bash
sudo apt install curl -y
```

3. Install NodeJS from NodeSource repository

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install nodejs -y
```

4. Check you have NodeJS installed

Node version should be `v18.16.0` (or newer). NPM version should be `9.5.1` (or newer).

```bash
node --version
npm --version
```

## 2.2. Install Yarn

NodeJS and NPM must have been installed first

1. Install Yarn using NPM

```bash
sudo npm install -g yarn
```

2. Check Yarn version

Yarn version should be `1.22.19`.

```bash
yarn --version
```

# 3. Running Application

All software prerequisites must have been installed first. ZIP file submission assumed to be called `gitHappensFinalSoftwareQuality.zip`

Note that when running the application, the `backend` and `frontend` both must be running simultaneously. Multiple terminals would be necessary.

1. Unzip the file.

This should unzip the contents of the file into a folder called `gitHappensFinalSoftwareQuality`.

```bash
unzip gitHappensFinalSoftwareQuality.zip
```

2. Change directory into the project folder

```bash
cd gitHappensFinalSoftwareQuality
```

The contents of the folder should look as follows:

```bash
tree -L 1
```

The following output is expected:

```bash
.
├── backend
├── docker-compose.local.yml
├── docker-compose.yml
├── frontend
├── HOW_TO_RUN_DOCKER.md
├── HOW_TO_RUN.md
├── README.md
└── work-diaries
```

3. Install the dependencies for the backend

```bash
cd backend
yarn install
```

4. Run the backend in development mode

```bash
yarn dev
```

The following initial terminal output should be expected:

```
yarn run v1.22.19
$ cross-env NODE_ENV=development nodemon
[nodemon] 2.0.22
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): src/**/* .env
[nodemon] watching extensions: js,ts,json
[nodemon] starting `ts-node -r tsconfig-paths/register --transpile-only src/server.ts`
body-parser deprecated undefined extended: provide extended option src/app.ts:20:35
2023-04-19 22:21:21 info: =================================
2023-04-19 22:21:21 info: ======= ENV: development =======
2023-04-19 22:21:21 info: 🚀 App listening on the port 8080
2023-04-19 22:21:21 info: == Visit http://localhost:8080 ==
2023-04-19 22:21:21 info: =================================
2023-04-19 22:21:21 info: Connected to external MongoDB
```

5. Install dependencies for the frontend

It is best another terminal be opened in the `gitHappensFinalSoftwareQuality` folder.

```bash
cd frontend
yarn install
```

6. Run the frontend in development mode

```bash
yarn dev
```

The following initial terminal output should be expected:

```
yarn run v1.22.19
$ next dev
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
info  - Loaded env from /home/ubuntu/Desktop/gitHappensFinalSoftwareQuality/frontend/.env.local
Attention: Next.js now collects completely anonymous telemetry regarding usage.
This information is used to shape Next.js' roadmap and prioritize features.
You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
https://nextjs.org/telemetry

event - compiled client and server successfully in 4.7s (1644 modules)
```

# 4. Using the Application

Using any web browser, navigate to `http://localhost:3000`. The application should be running.
