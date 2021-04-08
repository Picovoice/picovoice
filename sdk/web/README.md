# picovoice-web-template

This is a template package for building the picovoice-web-* projects. Each language requires a separate NPM package due to the size of the payload included. The code in each package is largely identical. Using this template you can generate all of these projects.

## Create picovoice-web-* projects

Use `yarn` then `yarn build` to gather dependencies and generate a project per language from the project template:

```console
yarn
yarn build
```

## Build individual projects

Now each individual project will exist, e.g.:

```console
cd picovoice-web-en-worker
yarn
yarn build
```
