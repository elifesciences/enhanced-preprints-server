# /bin/sh

R="\033[0;31m"
G="\033[0;32m"

POSITIONAL_ARGS=()

while [[ $# -gt 0 ]]; do
  case $1 in
    -o|--output)
      OUTPUTPATH="$2"
      shift # past argument
      shift # past value
      ;;
    -r|--remote)
      if [ "$REMOTE" != "staging" ] && [ "$REMOTE" != "prod" ]; then
        echo "Error: Invalid value for remote. Allowed values are 'staging' or 'prod'."
        exit 1
      fi
      REMOTE="$2"
      shift # past argument
      shift # past value
      ;;
    -h|--help)
      echo "This script will clone the mongodb data on either staging or prod so it can be used locally."
      echo "kubectl will need to be setup and authenticated to access the cluster"
      echo
      echo "options:"
      echo -e "${G}-o --output      The output path for the database dump including the filename (default: ./database.dump)"
      echo -e "${G}-r --remote      Which remote to use, must be either 'staging' or 'prod' (default: staging)"
      exit 0
      ;;
    -*|--*)
      echo -e "${R}Unknown option $1"
      exit 1
      ;;
  esac
done

OUTPUTPATH="${OUTPUTPATH:-./database.dump}"
REMOTE="${REMOTE:-staging}"

# port forward to cluster
kubectl port-forward -n epp--${REMOTE} service/epp-database-psmdb-db-replicaset 27017:27017 &
process_pid=$!

# get creds for db
credentials=$(kubectl get secret epp-database-psmdb-db-secrets -o yaml -n epp--${REMOTE})
password=$(echo "$credentials" | grep 'MONGODB_DATABASE_ADMIN_PASSWORD' | cut -d ':' -f 2 | xargs | base64 -d | cut -d '%' -f 1)
username=$(echo "$credentials" | grep 'MONGODB_DATABASE_ADMIN_USER' | cut -d ':' -f 2 | xargs | base64 -d | cut -d '%' -f 1)

# clone db to local file
mongodump --host 127.0.0.1 --port 27017 --username $username --password $password --authenticationDatabase admin --db epp --collection versioned_articles --out ${OUTPUTPATH}

# kill port forwarding
kill $process_pid
