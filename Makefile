ENV = NODE_ENV=test DEBUG=mm:*
BIN = ./node_modules/.bin
TESTS = test/*.test.js
MOCHA_OPTS = -b --timeout 10000 --reporter spec

lint:
	@echo "Linting..."
	@$(BIN)/jscs index.js bin lib test
test: lint
	@echo "Testing..."
	@$(ENV) $(BIN)/_mocha $(MOCHA_OPTS) $(TESTS)
test-cov: lint
	@echo "Testing..."
	@$(ENV) $(BIN)/istanbul cover $(BIN)/_mocha -- $(MOCHA_OPTS) $(TESTS)
test-coveralls: test-cov
	@cat ./coverage/lcov.info | $(BIN)/coveralls --verbose
.PHONY: lint test test-cov test-coveralls

fixture-build:
	@$(ENV) ./bin/mm.js --context=test/fixture build
fixture-up:
	@$(ENV) ./bin/mm.js --context=test/fixture up
fixture-down:
	@$(ENV) ./bin/mm.js --context=test/fixture down
.PHONY: fixture-build fixture-up fixture-down
