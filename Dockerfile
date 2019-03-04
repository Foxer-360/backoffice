FROM node:11.10.1

# Prepare Git LFS
WORKDIR /usr/git-lfs

ADD https://github.com/git-lfs/git-lfs/releases/download/v2.7.1/git-lfs-linux-amd64-v2.7.1.tar.gz .
RUN tar -xf ./git-lfs-linux-amd64-v2.7.1.tar.gz
RUN ln -s /usr/git-lfs/git-lfs /bin/git-lfs

# Setup BackOffice
WORKDIR /usr/src/backoffice

COPY package*.json .
COPY yarn.lock .

RUN yarn

COPY . .
RUN yarn deps

RUN rm -rf components/medicon/node_modules/@types
RUN rm -rf components/mediconLekarny/node_modules/@types

EXPOSE 3000

CMD ["yarn", "start"]
