# /bin/sh

R="\033[0;31m"
G="\033[0;32m"

POSITIONAL_ARGS=()

while [[ $# -gt 0 ]]; do
  case $1 in
    -i|--input)
      INPUTPATH="$2"
      shift # past argument
      shift # past value
      ;;
    -h|--help)
      printf "This script will restore a mongodb data dump into a local mongodb docker container."
      printf
      printf "options:"
      printf -e "${G}-i --input      The input path for the database dump including the filename (default: ./versioned_articles.bson.gz)"
      exit 0
      ;;

    -*|--*)
      printf -e "${R}Unknown option $1"
      exit 1
      ;;
  esac
done

INPUTPATH="${INPUTPATH:-./versioned_articles.bson.gz}"

# push local file to docker container
mongo_container_id=$(docker ps -f 'name=mongodb' -q)
docker cp ${INPUTPATH} $mongo_container_id:/tmp/versioned_articles.bson.gz

docker compose exec mongodb mongorestore --uri="mongodb://admin:testtest@localhost:27017" --authenticationDatabase=admin --db=epp --gzip --drop --nsInclude=epp.versioned_articles /tmp/versioned_articles.bson.gz
