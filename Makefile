.PHONY: build-dev dev test coverage shell docs db-shell-dev db-init-dev down-dev lint top-dev logs-dev

YML_DEV=environment/dev/docker-compose.yml
COMPOSE_DEV=docker-compose -f ${YML_DEV}

build-dev:
	${COMPOSE_DEV} build

dev: build-dev | down-dev
	${COMPOSE_DEV} up

test: build-dev down-dev
	${COMPOSE_DEV} run --rm --no-deps --service-ports light-explorer test

coverage: build-dev down-dev
	${COMPOSE_DEV} run --rm --no-deps --service-ports light-explorer coverage

lint: build-dev down-dev
	${COMPOSE_DEV} run --rm --no-deps --service-ports light-explorer lint

docs: build-dev down-dev
	${COMPOSE_DEV} run --rm --no-deps light-explorer docs

shell: build-dev down-dev
	${COMPOSE_DEV} run --rm --no-deps light-explorer /bin/bash

db-shell: build-dev down-dev
	${COMPOSE_DEV} run --rm --service-ports mongo-shell

db-init-dev: build-dev down-dev
	${COMPOSE_DEV} run --rm --service-ports mongo-shell /scripts/init_db.js

top-dev:
	${COMPOSE_DEV} top

logs-dev:
	${COMPOSE_DEV} logs -f ${LOG}

down-dev:
	${COMPOSE_DEV} down
