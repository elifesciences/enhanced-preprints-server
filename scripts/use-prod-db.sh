# /bin/sh

# push local file to docker container
mongo_container_id=$(docker ps -f 'name=mongodb' -q)
docker cp versioned_articles.dump $mongo_container_id:/tmp/staging.dump

docker compose exec mongodb mongorestore --uri="mongodb://admin:testtest@localhost:27017" --authenticationDatabase=admin --drop --nsInclude=epp.versioned_articles /tmp/staging.dump