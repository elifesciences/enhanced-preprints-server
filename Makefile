.PHONY: watch watch-couchdb watch-sqlite stop

# Install Node.js dependencies if either, the node_modules directory is not present or package.json has changed.
node_modules: package.json
	@yarn
	@touch $@

# Convert the sass to css
public/styles.css: node_modules $(shell find src/**/*.scss -type f)
	@yarn sass

watch: node_modules public/styles.css
	@docker build . --target prod -t epp-watch
	@docker run -d --rm --name epp-watch -p 8080:3000 -v $(CURDIR)/src:/opt/epp/src:rw epp-watch /opt/epp/scripts/watch.sh

watch-couchdb: node_modules public/styles.css
	@docker-compose --profile couchdb up

watch-sqlite: node_modules public/styles.css
	@docker-compose --profile sqlite up

watch-mongodb: node_modules public/styles.css
	@docker-compose --profile mongodb up

stop:
	@-docker stop epp-watch
