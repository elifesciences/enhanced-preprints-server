FROM ubuntu:20.04@sha256:fd92c36d3cb9b1d027c4d2a72c6bf0125da82425fc2ca37c414d4f010180dc19

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
