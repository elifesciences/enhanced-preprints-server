.PHONY: watch stop

# Install Node.js dependencies if either, the node_modules directory is not present or package.json has changed.
node_modules: package.json
	@yarn
	@touch $@

# Convert the sass to css
public/styles.css: node_modules $(shell find src/**/*.scss -type f)
	@yarn sass

watch: node_modules public/styles.css
	@docker build . --target dev -t epp-watch
	@docker run -d --rm --name epp-watch -p 8080:3000 -v $(CURDIR):/opt/epp:rw epp-watch /opt/epp/scripts/watch.sh

stop:
	@-docker stop epp-watch
