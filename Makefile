ifneq ($(shell docker compose version 2>/dev/null),)
  DOCKER_COMPOSE=docker compose
else
  DOCKER_COMPOSE=docker-compose
endif

.PHONY: start-dev

start-dev:
	@$(DOCKER_COMPOSE) up
