# 1. How To Run with Docker

- Image: `LUbuntu-22.04.2-desktop-amd64.iso`
- Hardware:
  - 4 Processors, 1 core per processor
  - 8GB ram
  - Port `8080` and `3000` are free and not utilised by other applications
  - Internet connection
- Software Prerequisites:
  - Docker engine

# 2. How to install Software Prerequisites

Starting from a fresh install of the LUbuntu-22.04.2 image

## 2.1. Install Docker Engine

Following the guide at https://docs.docker.com/engine/install/ubuntu/.

1. Remove any old versions of Docker

```bash
sudo apt-get remove docker docker-engine docker.io containerd runc
```

2. Update `apt` package

```bash
sudo apt-get update && sudo apt-get install ca-certificates curl gnupg -y
```

3. Add Docker's official GPG key

```bash
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
```

4. Use the following commands to setup the repository:

```bash
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

5. Update `apt` package

```bash
sudo apt-get update
```

6. Install the latest version of Docker

```bash
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y
```

7. Verify docker engine is installed successfully by running the `hello-world` image

```bash
sudo docker run hello-world
```

The following output should be expected:

```
Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world
2db29710123e: Pull complete
Digest: sha256:4e83453afed1b4fa1a3500525091dbfca6ce1e66903fd4c01ff015dbcb1ba33e
Status: Downloaded newer image for hello-world:latest

Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
    (amd64)
 3. The Docker daemon created a new container from that image which runs the
    executable that produces the output you are currently reading.
 4. The Docker daemon streamed that output to the Docker client, which sent it
    to your terminal.

To try something more ambitious, you can run an Ubuntu container with:
 $ docker run -it ubuntu bash

Share images, automate workflows, and more with a free Docker ID:
 https://hub.docker.com/

For more examples and ideas, visit:
 https://docs.docker.com/get-started/
```

8. Verify docker version

Docker version 23.0.4, build f480fb1

```bash
docker --version
```

# 3. Running Application

Docker software prerequisites must have been installed first. ZIP file submission assumed to be called `gitHappensFinalSoftwareQuality.zip`

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

3. Run `docker compose` to build and run the application

This process might take a while to build the images and run the containers.

```bash
sudo docker compose up --build
```

4. Verify docker containers are running in another terminal

```bash
sudo docker container ls
```

```
CONTAINER ID   IMAGE                      COMMAND                  CREATED              STATUS          PORTS                                       NAMES
a5ecec26017a   3900-githappens-frontend   "/bin/sh -c 'yarn ru…"   42 seconds ago       Up 41 seconds   0.0.0.0:3000->3000/tcp, :::3000->3000/tcp   githappensfinalsoftwarequality-frontend-1
83d91be10c19   3900-githappens-backend    "/bin/sh -c 'yarn ru…"   About a minute ago   Up 41 seconds   0.0.0.0:8080->8080/tcp, :::8080->8080/tcp   githappensfinalsoftwarequality-backend-1
```

5. To stop docker containers

```bash
docker compose down
```

# 4. Using the Application

Using any web browser, navigate to `http://localhost:3000`. The application should be running.
