test:
	npx jest

verbose-test:
	npx jest --verbose

watch-test:
	npx jest --watchAll

lint:
	npm run lint -- test

.PHONY: test
