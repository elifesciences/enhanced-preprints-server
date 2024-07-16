# /bin/sh

# port forward to cluster
kubectl port-forward -n epp--staging service/epp-database-psmdb-db-replicaset 27017:27017 &
process_pid=$!

# get creds for db
credentials = $(kubectl get secret epp-database-psmdb-db-secrets -o yaml -n epp--staging)
password = $(echo "$credentials" | grep 'MONGODB_DATABASE_ADMIN_PASSWORD' | cut -d ':' -f 2 | xargs | base64 -d | cut -d '%' -f 1)
username = $(echo "$credentials" | grep 'MONGODB_DATABASE_ADMIN_USERNAME' | cut -d ':' -f 2 | xargs | base64 -d | cut -d '%' -f 1)

# clone db to local file
mongodump --host 127.0.0.1 --port 27017 --username $username --password $password --authenticationDatabase admin --db epp --collection versioned_articles --out ./staging.dump

# kill port forwarding
kill $process_pid