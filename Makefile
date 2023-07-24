install:
	npm ci

lint:
	npx eslint .

fix-lint:
	npx eslint --fix .

develop:
	npx webpack serve

build:
	rm -rf dist
	NODE_ENV=production npx webpack