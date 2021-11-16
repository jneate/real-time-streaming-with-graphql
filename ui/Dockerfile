FROM nginx:alpine AS base-nginx-container

# Remove the default nginx config
RUN rm -v /etc/nginx/nginx.conf

# Create the folder structure to form the URI Path
RUN mkdir -p /usr/share/nginx/html/test/ui

# Update folder permissions, especially important if you're running inside RedHat OpenShit
RUN chmod -R a+rwx /usr/share

# Set working directory
WORKDIR /usr/share/nginx/html/test/ui

FROM node:alpine AS base-jet-build

# Create out JET Specific Folders
RUN mkdir -p /usr/src/ui/web \
  && mkdir -p /usr/src/ui/src \
  && mkdir -p /usr/src/ui/scripts

# Update permissions
RUN chmod -R a+rwx /usr/src/ui

# Set working directory
WORKDIR /usr/src/ui

# Instal OJET Cli globally
RUN npm install -g @oracle/ojet-cli@11.1.0 \
  && npm install @oracle/oraclejet@11.1.0 \
  && npm install @oracle/oraclejet-tooling@11.1.0 \
  && npm install underscore@1.10.2 \
  && npm install glob@7.1.1 \
  && npm install fs-extra@8.1.0

FROM base-jet-build AS build-container

# Copy Oracle JET scripts folder
COPY scripts /usr/src/ui/scripts/

# Copy Oracle JET config file
COPY oraclejetconfig.json /usr/src/ui/

# Copy source code
COPY src /usr/src/ui/src/

# Start the build process in release mode
RUN ojet build --release

FROM base-nginx-container

# Expose specific port
EXPOSE 8080

# Copy my nginx Config
COPY nginx.conf /etc/nginx/

# Copy the Source Code
COPY --from=build-container /usr/src/ui/web /usr/share/nginx/html/test/ui

# Copy over the package.json - This is personal preference if you wish to have the json metadata in your final application
COPY package.json /usr/share/nginx/html/test/ui

# Start nginx service
CMD ["nginx","-g","daemon off;"]