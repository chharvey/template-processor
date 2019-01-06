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
3. The constructor’s `instructions_async` argument, if provided, must be an asynchronous function returning a `Promise<void>`.
	(If providing `instructions_async`, the `instructions` argument is still required. It could be an empty function or a fallback to the async.)
4. The `process` instance method returns a `DocumentFragment`.
5. The asynchronous `processAsync` instance method returns a `Promise<DocumentFragment>`.

### JavaScript
```js
// import the module
const { Processor } = require('template-processor')

// get your own template & write your own instructions
let template = document.querySelector('template')
function instructions(frag, data, opts) {
	frag.querySelector('a').href        = data.url
	frag.querySelector('a').textContent = (opts.uppercase) ? data.text.toUpperCase() : data.text
	if (data.url.slice(0,4) === 'http') {
		frag.querySelector('a').setAttribute('rel', 'external')
	}
}
// if your instructions uses I/O, you can write an asynchronous function
async function instructionsAsync(frag, data, opts) {
	await doSomeAsyncStuff();
}

// construct a new processor with the stuff you wrote
let my_processor = new Processor(template, instructions)
// optionally provide the async instructions
my_processor = new Processor(template, instructions, instructionsAsync)

// process some data synchronously
let snippet = my_processor.process({
	url: 'https://www.example.com/',
	text: 'an example',
}, { uppercase: true })
document.body.append(snippet)

// process some data asynchronously
my_processor.processAsync({
	url: 'https://www.example.com/',
	text: 'an example',
}, { uppercase: true }).then((snippet) => {
	document.body.append(snippet)
})

// you can also pass in Promises for the data and options
my_processor.processAsync(Promise.resolve({
	url: 'https://www.example.com/',
	text: 'an example',
}), Promise.resolve({ uppercase: true })).then((snippet) => {
	document.body.append(snippet)
})
```

### TypeScript
```ts
// import the module
import { Processor } from 'template-processor'

// get your own template & write your own instructions
type DataType = { url: string; text: string; }
type OptsType = { uppercase?: boolean; }
let template: HTMLTemplateElement = document.querySelector('template') !
function instructions(frag: DocumentFragment, data: DataType, opts: OptsType): void {
	frag.querySelector('a').href        = data.url
	frag.querySelector('a').textContent = (opts.uppercase) ? data.text.toUpperCase() : data.text
	if (data.url.slice(0,4) === 'http') {
		frag.querySelector('a').setAttribute('rel', 'external')
	}
}
// if your instructions uses I/O, you can write an asynchronous function
async function instructionsAsync(frag: DocumentFragment, data: DataType, opts: OptsType): Promise<void> {
	await doSomeAsyncStuff();
}

// construct a new processor with the stuff you wrote
let my_processor: Processor<DataType, OptsType> = new Processor(template, instructions)
// optionally provide the async instructions
my_processor = new Processor(template, instructions, instructionsAsync)

// process some data synchronously
let snippet: DocumentFragment = my_processor.process({
	url: 'https://www.example.com/',
	text: 'an example',
}, { uppercase: true })
document.body.append(snippet)

// process some data asynchronously
my_processor.processAsync({
	url: 'https://www.example.com/',
	text: 'an example',
}, { uppercase: true }).then((snippet) => {
	document.body.append(snippet)
})

// you can also pass in Promises for the data and options
let data: Promise<DataType> = Promise.resolve({
	url: 'https://www.example.com/',
	text: 'an example',
})
let opts: Promise<OptsType> = Promise.resolve({ uppercase: true })
my_processor.processAsync(data, opts).then((snippet) => {
	document.body.append(snippet)
})
```


## Whole Document Example

Sometimes you don’t have a `<template>` element, or you have an entire document to process,
including for example a `<head>` element or attributes on the `<html>` or `<body>` elements.
Template elements may only contain flow content, so we cannot process document content
or metadata content in the same way.

Starting in v2, we can process ‘templates’ of Document objects.
The *static* methods `Processor.process` and `Processor.processAsync`
may now take and return a `Document` object (in addition to `DocumentFragment`).

Note that in these examples, we are not constructing a new Processor object, but simply using static methods.

API:

1. Import the `Processor` class.
2. The `instructions` argument must be a function returning `void`.
3. The `instructions_async` argument must be an asynchronous function returning a `Promise<void>`.
4. The `Processor.process` static method returns a `Document` or `DocumentFragment`, depending on the first argument.
5. The asynchronous `Processor.processAsync` static method returns a `Promise<Document>` or `Promise<DocumentFragment>`, depending on the first argument.


### JavaScript
```js
// import the module
const { Processor } = require('template-processor')

// get your own document & write your own instructions
let document;
function instructions(doc, data, opts) {
	doc.querySelector('a').href        = data.url
	doc.querySelector('a').textContent = (opts.uppercase) ? data.text.toUpperCase() : data.text
	if (data.url.slice(0,4) === 'http') {
		doc.querySelector('a').setAttribute('rel', 'external')
	}
}
// if your instructions uses I/O, you can write an asynchronous function
async function instructionsAsync(doc, data, opts) {
	await doSomeAsyncStuff();
}

// process some data synchronously
// Since a `Document` object is passed, the modified `Document` is returned.
// If a `DocumentFragment` object were passed, it would return that modified `DocumentFragment`.
let output = Processor.process(document, instructions, {
	url: 'https://www.example.com/',
	text: 'an example',
}, { uppercase: true })
fs.writeFileSync('output.html', output.toString(), 'utf8')

// process some data asynchronously
Processor.processAsync(document, instructionsAsync, {
	url: 'https://www.example.com/',
	text: 'an example',
}, { uppercase: true }).then((output) => {
	return util.promisify(fs.writeFile)('output.html', output.toString(), 'utf8')
})
```

### TypeScript
```ts
// import the module
import { Processor } from 'template-processor'

// get your own document & write your own instructions
type DataType = { url: string; text: string; }
type OptsType = { uppercase?: boolean; }
let document: Document;
function instructions(doc: Document, data: DataType, opts: OptsType): void {
	doc.querySelector('a').href        = data.url
	doc.querySelector('a').textContent = (opts.uppercase) ? data.text.toUpperCase() : data.text
	if (data.url.slice(0,4) === 'http') {
		doc.querySelector('a').setAttribute('rel', 'external')
	}
}
// if your instructions uses I/O, you can write an asynchronous function
async function instructionsAsync(doc: Document, data: DataType, opts: OptsType): Promise<void> {
	await doSomeAsyncStuff();
}

// process some data synchronously
// Since a `Document` object is passed, the modified `Document` is returned.
// If a `DocumentFragment` object were passed, it would return that modified `DocumentFragment`.
let output: Document = Processor.process(document, instructions, {
	url: 'https://www.example.com/',
	text: 'an example',
}, { uppercase: true })
fs.writeFileSync('output.html', output.toString(), 'utf8')

// process some data asynchronously
Processor.processAsync(document, instructionsAsync, {
	url: 'https://www.example.com/',
	text: 'an example',
}, { uppercase: true }).then((output) => {
	return util.promisify(fs.writeFile)('output.html', output.toString(), 'utf8')
})
```


## Why?

The point is to have one template and one instruction, but tons of data.

```js
const dataset = [
	{ "name": "twitter" , "url": "//twitter.com/god"    , "text": "Follow God on Twitter"        },
	{ "name": "google"  , "url": "//plus.google.com/god", "text": "Follow God on Google+"        },
	{ "name": "facebook", "url": "//facebook.com/god"   , "text": "Like God on Facebook"         },
	{ "name": "linkedin", "url": "//linkedin.com/god"   , "text": "Connect with God on LinkedIn" },
	{ "name": "youtube" , "url": "//youtube.com/god"    , "text": "Watch God on YouTube"         },
	// even more and more
]
const document = createDocument`
<html>
<body>
<h1>Social Media Links</h1>
<ul class="c-LinkList">
	<template>
		<li class="c-LinkList__Item">
			<a class="c-LinkList__Link" href="{{ url }}">
				<i class="{{ name }}"></i>
				<slot name="text">{{ text }}</slot>
			</a>
		</li>
	</template>
</ul>
</body>
</html>
`
let processor = new Processor(document.querySelector('ul > template'), (frag, data, opts) => {
	frag.querySelector('a.c-LinkList__Link').href        = data.url
	frag.querySelector('i'                 ).className   = `icon icon-${data.name}`
	frag.querySelector('slot[name="text"]' ).textContent = data.text
})
// sync way:
document.querySelector('ul').append(...dataset.map((data) => processor.process(data)))
// async way (promises):
Promise.all(dataset.map((data) => processor.processAsync(data))).then((frags) => document.querySelector('ul').append(...frags))
// async way (await):
document.querySelector('ul').append(...await Promise.all(dataset.map((data) => processor.processAsync(data))))
```
