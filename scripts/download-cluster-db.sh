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
    -h|--help)
      printf "This script will download the mongodb data from prod so it can be used locally.\nkubectl will need to be setup and authenticated to access the cluster\n\n"
      printf "options:\n"
      printf "${G}-o --output      The output path for the database dump including the filename (default: ./versioned_articles.bson.gz)\n"
      exit 0
      ;;
    -*|--*)
      printf -e "${R}Unknown option $1"
      exit 1
      ;;
  esac
done

OUTPUTPATH="${OUTPUTPATH:-./versioned_articles.bson.gz}"

backup_folder=$(kubectl get perconaservermongodbs.psmdb.percona.com -n epp--prod epp-database-psmdb-db -o yaml | yq '.spec.backup.storages["epp-prod-backups"].s3|(.bucket + "/" + .prefix + "/")' | tr -d '"')
recent_folder=$(aws s3 ls ${backup_folder} | awk '{print $2}' | sort | tail -n 1)
recent_backup="s3://${backup_folder}${recent_folder}replicaset/epp.versioned_articles.gz"

echo "Downloading ${recent_backup}"

aws s3 cp $recent_backup ${OUTPUTPATH}