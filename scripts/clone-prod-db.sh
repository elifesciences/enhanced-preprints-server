# /bin/sh

# port forward to cluster
kubectl port-forward -n epp--prod service/epp-database-psmdb-db-replicaset 27017:27017

# get creds for db
password = kubectl get secret epp-database-psmdb-db-secrets -o yaml -n epp--prod | grep 'MONGODB_DATABASE_ADMIN_PASSWORD' | cut -d ':' -f 2 | xargs | base64 -d | cut -d '%' -f 1

# clone db to local file
mongodump --host 127.0.0.1 --port 27017 --username $(username) --password $(password) --authenticationDatabase admin --db epp --collection versioned_articles --out ./versioned_articles.dump

# kill port forwarding

# push local file to docker container