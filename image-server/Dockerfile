FROM ubuntu:22.04@sha256:34fea4f31bf187bc915536831fd0afc9d214755bf700b5cdb1336c82516d154e

ENV CANTALOUPE_VERSION=5.0.5

EXPOSE 8182

# Update packages and install tools
RUN apt-get update -qy && apt-get dist-upgrade -qy && \
    apt-get install -qy --no-install-recommends curl imagemagick \
    libopenjp2-tools ffmpeg unzip default-jre-headless && \
    apt-get -qqy autoremove && apt-get -qqy autoclean

# Run non privileged
RUN adduser --system cantaloupe

# Get and unpack Cantaloupe release archive
# RUN curl --silent --fail -OL https://github.com/cantaloupe-project/cantaloupe/releases/download/v$CANTALOUPE_VERSION/cantaloupe-$CANTALOUPE_VERSION.zip
RUN cd /opt \
    && curl --silent --fail -OL https://github.com/cantaloupe-project/cantaloupe/releases/download/v$CANTALOUPE_VERSION/cantaloupe-$CANTALOUPE_VERSION.zip \
    && unzip cantaloupe-$CANTALOUPE_VERSION.zip \
    && ln -s cantaloupe-$CANTALOUPE_VERSION cantaloupe \
    && rm cantaloupe-$CANTALOUPE_VERSION.zip \
    && mkdir -p /var/log/cantaloupe /var/cache/cantaloupe \
    && cp -rs /opt/cantaloupe/deps/Linux-x86-64/* /usr/

COPY cantaloupe.properties /opt/cantaloupe/

RUN chown -R cantaloupe /opt/cantaloupe-$CANTALOUPE_VERSION /var/log/cantaloupe /var/cache/cantaloupe



USER cantaloupe
CMD ["sh", "-c", "java -Dcantaloupe.config=/opt/cantaloupe/cantaloupe.properties -jar /opt/cantaloupe/cantaloupe-$CANTALOUPE_VERSION.jar"]
