ifneq ($(shell docker compose version 2>/dev/null),)
  DOCKER_COMPOSE=docker compose
else
  DOCKER_COMPOSE=docker-compose
endif

.PHONY: lint
lint:
	yarn lint

.PHONY: test
test:
	yarn test

.PHONY: test-integration
test-integration:
	yarn test:integration

.PHONY: check
check: lint test

.PHONY: start-dev
start-dev:
	@$(DOCKER_COMPOSE) up
