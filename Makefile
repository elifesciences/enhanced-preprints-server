.PHONY: watch watch-couchdb watch-sqlite stop

# Install Node.js dependencies if either, the node_modules directory is not present or package.json has changed.
node_modules: package.json
	@yarn
	@touch $@

# Convert the sass to css
public/styles.css: node_modules $(shell find src/**/*.scss -type f)
	@yarn sass

watch: node_modules public/styles.css
	@docker-compose up

stop:
	@-docker stop epp-watch
