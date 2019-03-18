import * as xjs from 'extrajs'


/**
 * A processing function specifies how to transform a template into markup.
 *
 * This function modifies a given document fragment, filling it in with given data.
 * Additionally it may use any rendering options passed.
 * It *should not* have a `this` context, and it *should not* have a return value.
 *
 * If this function does have a `this` context, a `this_arg` may be passed to
 * {@link Processor.process} or {@link Processor#process}.
 * Any return value of the function does nothing.
 *
 * @param   <T> the type of the `data` parameter
 * @param   <U> the type of the `options` object parameter
 * @param   frag the template content to process
 * @param   data the data to fill the template when processing
 * @param   options additional processing options
 */
export type ProcessingFunction<T, U extends object = object> = (frag: DocumentFragment, data: T, opts: U) => void
/**
 * Asynchronous {@link ProcessingFunction}.
 * @param   <T> the type of the `data` parameter
 * @param   <U> the type of the `options` object parameter
 * @param   frag the template content to process
 * @param   data the data to fill the template upon rendering
 * @param   options additional processing options
 */
export type ProcessingFunctionAsync<T, U extends object = object> = (frag: DocumentFragment, data: T, opts: U) => Promise<void>


/**
 * A Processor stores processing operations for a template and a processing function.
 */
export default class Processor<T, U extends object = object> {
	/**
	 * Process a document fragment with some data, and return the same fragment, modified.
	 *
	 * This method is equivalent to {@link Processor#process}, but useful if you have
	 * a document fragment but no `<template>` element to which it belongs.
	 * @param   <V>          the type of the data to fill
	 * @param   <W>          the type of the `options` object
	 * @param   frag         the document fragment to process
	 * @param   instructions the processing function to use, taking `frag` as an argument
	 * @param   data         the data to fill
	 * @param   options      additional processing options
	 * @param   this_arg     the `this` context, if any, in which the instructions is called
	 * @returns the processed document fragment (modified)
	 */
	static process<V, W extends object = object>(frag: DocumentFragment, instructions: ProcessingFunction<V, W>, data: V, options: W = ({} as W), this_arg: unknown = null): DocumentFragment {
		instructions.call(this_arg, frag, data, options)
		return frag
	}
	/**
	 * Asynchronous {@link Processor.process}.
	 * @param   <V>          the type of the data to fill
	 * @param   <W>          the type of the `options` object
	 * @param   frag         the document fragment to process
	 * @param   instructions the processing function to use, taking `frag` as an argument
	 * @param   data         the data to fill
	 * @param   options      additional processing options
	 * @param   this_arg     the `this` context, if any, in which the instructions is called
	 * @returns the processed document fragment (modified)
	 */
	static async processAsync<V, W extends object = object>(frag: DocumentFragment, instructions: ProcessingFunctionAsync<V, W>, data: V|Promise<V>, options: W|Promise<W> = ({} as W), this_arg: unknown = null): Promise<DocumentFragment> {
		await instructions.call(this_arg, frag, await data, await options)
		return frag
	}

	/**
	 * Populate a list or sequence of similar elements with items containing data.
	 *
	 * This method appends items to the end of the list.
	 * The items are the result of rendering the given data.
	 * In order to determine how the data is rendered, the given list must have
	 * a `<template>` child, which in turn has a valid content model.
	 *
	 * Notes:
	 * - The list element may contain multiple `<template>` children, but this method uses only the first one.
	 * - The list element may also already have any number of children; they are not affected.
	 *
	 * Example:
	 * ```js
	 * let { document } = new jsdom.JSDOM(`
	 * <ol>
	 * 	<template>
	 * 		<li>
	 * 			<a href="{{ url }}">{{ text }}</a>
	 * 		</li>
	 * 	</template>
	 * </ol>
	 * `).window
	 * let dataset = [
	 * 	{ "url": "#0", "text": "Career Connections" },
	 * 	{ "url": "#1", "text": "Getting Licensed & Certified" },
	 * 	{ "url": "#2", "text": "Career resources" },
	 * 	{ "url": "#3", "text": "Code of Ethics" }
	 * ]
	 * let options = {
	 * 	suffix: ' &rarr;'
	 * }
	 * Processor.populateList(document.querySelector('ol'), function (f, d, o) {
	 * 	f.querySelector('a').href        = d.url
	 * 	f.querySelector('a').textContent = d.text + o.suffix
	 * }, dataset, options)
	 * ```
	 *
	 * @param   <V>          the type of the data to fill
	 * @param   <W>          the type of the `options` object
	 * @param   list         the list containing a template to process
	 * @param   instructions the processing function to use
	 * @param   dataset      the data to populate the list
	 * @param   options      additional processing options for all items
	 * @param   this_arg     the `this` context, if any, in which the instructions is called
	 * @throws  {ReferenceError} if the given list does not contain a `<template>`
	 * @throws  {TypeError}      if the `<template>` does not have valid children
	 */
	static populateList<V, W extends object = object>(list: HTMLElement, instructions: ProcessingFunction<V, W>, dataset: V[], options?: W, this_arg: unknown = null): void {
		let template: HTMLTemplateElement|null = list.querySelector('template')
		if (template === null) {
			throw new ReferenceError(`This <${list.tagName.toLowerCase()}> does not have a <template> descendant.`)
		}
		xjs.Object.switch<void>(list.tagName.toLowerCase(), {
			'ol'    : ( tpl: HTMLTemplateElement) => checkDOM(tpl, 'li'   ),
			'ul'    : ( tpl: HTMLTemplateElement) => checkDOM(tpl, 'li'   ),
			'table' : ( tpl: HTMLTemplateElement) => checkDOM(tpl, 'tbody'),
			'thead' : ( tpl: HTMLTemplateElement) => checkDOM(tpl, 'tr'   ),
			'tbody' : ( tpl: HTMLTemplateElement) => checkDOM(tpl, 'tr'   ),
			'tfoot' : ( tpl: HTMLTemplateElement) => checkDOM(tpl, 'tr'   ),
			'tr'    : ( tpl: HTMLTemplateElement) => checkDOM(tpl, 'td'   ),
			'dl'    : ( tpl: HTMLTemplateElement) => checkDOM_dl(tpl),
			default : (_tpl: HTMLTemplateElement) => {},
		})(template)
		let processor: Processor<V, W> = new Processor(template, instructions)
		list.append(...dataset.map((data) => processor.process(data, options, this_arg)))
	}
	/**
	 * Asynchronous {@link Processor.populateList}
	 * @param   <V>          the type of the data to fill
	 * @param   <W>          the type of the `options` object
	 * @param   list         the list containing a template to process
	 * @param   instructions the processing function to use
	 * @param   dataset      the data to populate the list
	 * @param   options      additional processing options for all items
	 * @param   this_arg     the `this` context, if any, in which the instructions is called
	 * @throws  {ReferenceError} if the given list does not contain a `<template>`
	 * @throws  {TypeError}      if the `<template>` does not have valid children
	 */
	static async populateListAsync<V, W extends object = object>(list: HTMLElement, instructions: ProcessingFunctionAsync<V, W>, dataset: V[]|Promise<V[]>, options?: W|Promise<W>, this_arg: unknown = null): Promise<void> {
		let template: HTMLTemplateElement|null = list.querySelector('template')
		if (template === null) {
			throw new ReferenceError(`This <${list.tagName.toLowerCase()}> does not have a <template> descendant.`)
		}
		xjs.Object.switch<void>(list.tagName.toLowerCase(), {
			'ol'    : ( tpl: HTMLTemplateElement) => checkDOM(tpl, 'li'   ),
			'ul'    : ( tpl: HTMLTemplateElement) => checkDOM(tpl, 'li'   ),
			'table' : ( tpl: HTMLTemplateElement) => checkDOM(tpl, 'tbody'),
			'thead' : ( tpl: HTMLTemplateElement) => checkDOM(tpl, 'tr'   ),
			'tbody' : ( tpl: HTMLTemplateElement) => checkDOM(tpl, 'tr'   ),
			'tfoot' : ( tpl: HTMLTemplateElement) => checkDOM(tpl, 'tr'   ),
			'tr'    : ( tpl: HTMLTemplateElement) => checkDOM(tpl, 'td'   ),
			'dl'    : ( tpl: HTMLTemplateElement) => checkDOM_dl(tpl),
			default : (_tpl: HTMLTemplateElement) => {},
		})(template)
		let processor: Processor<V, W> = new Processor(template, () => {}, instructions)
		list.append(... await Promise.all((await dataset).map((data) => processor.processAsync(data, options, this_arg))))
	}


	/**
	 * This object’s template, which is to be processed.
	 */
	private readonly _TEMPLATE: HTMLTemplateElement;
	/**
	 * This object’s processing function, which contains instructions for processing the template.
	 */
	private readonly _INSTRUCTIONS: ProcessingFunction<T, U>;
	/**
	 * Asynchronous {@link Processor._INSTRUCTIONS}.
	 */
	private readonly _INSTRUCTIONS_ASYNC: ProcessingFunctionAsync<T, U>|null;

	/**
	 * Construct a new Processor object.
	 * @param template           the template to process
	 * @param instructions       the processing function to use
	 * @param instructions_async an alternative processing function, asynchronous
	 */
	constructor(template: HTMLTemplateElement, instructions: ProcessingFunction<T, U>, instructions_async: ProcessingFunctionAsync<T, U>|null = null) {
		this._TEMPLATE           = template
		this._INSTRUCTIONS       = instructions
		this._INSTRUCTIONS_ASYNC = instructions_async
	}

	/**
	 * Process this component’s template with some data, and return the resulting fragment.
	 * @param   <T>      the type of the data to fill
	 * @param   <U>      the type of the `options` object
	 * @param   data     the data to fill
	 * @param   options  additional processing options
	 * @param   this_arg the `this` context, if any, in which this object’s instructions is called
	 * @returns the processed output
	 */
	process(data: T, options?: U, this_arg?: unknown): DocumentFragment {
		if (this._INSTRUCTIONS_ASYNC !== null) {
			console.info('An asynchronous instruction is available; did you mean to call `processAsync()`?')
		}
		let frag: DocumentFragment = this._TEMPLATE.content.cloneNode(true) as DocumentFragment // NB{LINK} https://dom.spec.whatwg.org/#dom-node-clonenode
		return Processor.process(frag, this._INSTRUCTIONS, data, options, this_arg)
	}
	/**
	 * Asynchronous {@link Processor#process}.
	 * @param   <T>      the type of the data to fill
	 * @param   <U>      the type of the `options` object
	 * @param   data     the data to fill
	 * @param   options  additional processing options
	 * @param   this_arg the `this` context, if any, in which this object’s instructions is called
	 * @returns the processed output
	 */
	async processAsync(data: T|Promise<T>, options?: U|Promise<U>, this_arg?: unknown): Promise<DocumentFragment> {
		if (this._INSTRUCTIONS_ASYNC === null) {
			console.warn('No asynchronous instructions found. Executing synchronous instructions instead…')
			return this.process(await data, await options, this_arg)
		}
		let frag: DocumentFragment = this._TEMPLATE.content.cloneNode(true) as DocumentFragment // NB{LINK} https://dom.spec.whatwg.org/#dom-node-clonenode
		return Processor.processAsync(frag, this._INSTRUCTIONS_ASYNC, data, options, this_arg)
	}
}


/**
 * Check the proper DOM structure of a `<template>` element within a
 * `<ol>`, `<ul>`, `<table>`, `<thead/tfoot/tbody>`, or `<tr>` element.
 * @param   tpl           the `<template>` element within the list
 * @param   child_tagname the tagname of the child within the `<template>`
 * @throws  {TypeError} if the `<template>` has less than or more than 1 child element
 * @throws  {TypeError} if the `<template>` has the incorrect child element type
 */
function checkDOM(tpl: HTMLTemplateElement, child_tagname: string): void {
	if (tpl.content.children.length !== 1) {
		throw new TypeError('The <template> must contain exactly 1 element.')
	}
	if (!tpl.content.children[0].matches(child_tagname)) {
		throw new TypeError(`The <template> must contain exactly 1 <${child_tagname}>.`)
	}
}

/**
 * {@link checkDOM} for `<dl>` lists.
 *
 * Specifically, the `<template>` must contain at least 1 `<dt>` followed by at least 1 `<dd>`.
 * @param   tpl           the `<template>` element within the list
 * @param   child_tagname the tagname of the child within the `<template>`
 * @throws  {TypeError} if the `<template>` has less than 1 child element
 * @throws  {TypeError} if the `<template>` has the incorrect children element types
 */
function checkDOM_dl(tpl: HTMLTemplateElement): void {
	if (tpl.content.children.length < 1) {
		throw new TypeError('The <template> must contain at least 1 element.')
	}
	if (tpl.content.querySelector('dt') === null || tpl.content.querySelector('dd') === null) {
		throw new TypeError(`The <template> must contain at least 1 <dt> and at least 1 <dd>.`)
	}
	if ([...tpl.content.querySelectorAll('*')].some((el) => !el.matches('dt, dd'))) {
		throw new TypeError(`The <template> must only contain <dt> or <dd> elements.`)
	}
	if ([...tpl.content.children].indexOf(tpl.content.querySelector('dt:last-of-type') !) >= [...tpl.content.children].indexOf(tpl.content.querySelector('dd:first-of-type') !)) {
		throw new TypeError(`All <dd> elements must follow all <dt> elements inside the <template>.`)
	}
}
