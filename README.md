# template-processor
A lightweight class for generating markup from a template and some data.

## Install
```bash
npm install template-processor
```

## Example

Given the following document,

```html
<!doctype html>
<html>
<body>
<template>
	<a href="{{ url }}">{{ text }}</a>
</template>
</body>
</html>
```

The code below (JavaScript or Typescript) will append the following markup to the body.

```html
<a href="https://www.example.com/" rel="external">AN EXAMPLE</a>
```

API:

1. Import the `Processor` class.
2. The constructor’s `instructions` argument must be a function returning `void`.
3. The `process` method returns a `DocumentFragment`.

### JavaScript
```js
// import the module
const {Processor} = require('template-processor')

// get your own template & write your own instructions
let template = document.querySelector('template')
function instructions(frag, data, opts) {
	frag.querySelector('a').href        = data.url
	frag.querySelector('a').textContent = (opts.uppercase) ? data.text.toUpperCase() : data.text
	if (data.url.slice(0,4) === 'http') {
		frag.querySelector('a').setAttribute('rel', 'external')
	}
}

// construct a new processor with the stuff you wrote
let my_processor = new Processor(template, instructions)

// process some data.
let snippet_to_append = my_processor.process({
	url: 'https://www.example.com/',
	text: 'an example',
}, { uppercase: true })

document.body.append(snippet_to_append)
```

### TypeScript
```ts
// import the module
import {Processor} from 'template-processor'

// get your own template & write your own instructions
type DataType = { url: string, text: string }
type OptsType = { uppercase?: boolean }
let template: HTMLTemplateElement = document.querySelector('template') !
function instructions(frag: DocumentFragment, data: DataType, opts: OptsType): void {
	frag.querySelector('a').href        = data.url
	frag.querySelector('a').textContent = (opts.uppercase) ? data.text.toUpperCase() : data.text
	if (data.url.slice(0,4) === 'http') {
		frag.querySelector('a').setAttribute('rel', 'external')
	}
}

// construct a new processor with the stuff you wrote
let my_processor: Processor<DataType, OptsType> = new Processor(template, instructions)

// process some data.
let snippet_to_append: DocumentFragment = my_processor.process({
	url: 'https://www.example.com/',
	text: 'an example',
}, { uppercase: true })

document.body.append(snippet_to_append)
```


## Async Example

Asynchronous processing is available.

1. Import the `ProcessorAsync` class.
2. The constructor’s `instructions` argument may be an async function returning a `Promise<void>`.
3. The `ProcessorAsync#process` method is also async, returning a `Promise<DocumentFragment>`.

### JavaScript
```js
const {ProcessorAsync} = require('template-processor')

async function instructions(frag, data, opts) {
	await doSomeAsyncStuff();
}
let my_processor = new ProcessorAsync(template, instructions)

my_processor.process(data, opts).then((docfrag) => document.body.append(docfrag))
```

### TypeScript
```ts
import {ProcessorAsync} from 'template-processor'

async function instructions(frag: DocumentFragment, data: DataType, opts: OptsType): Promise<void> {
	await doSomeAsyncStuff();
}
let my_processor: Processor<DataType, OptsType> = new ProcessorAsync(template, instructions)

my_processor.process(data, opts).then((docfrag) => document.body.append(docfrag))
```
