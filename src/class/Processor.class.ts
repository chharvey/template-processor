/**
 * A processing function specifies how to transform a template into markup.
 *
 * This function modifies a given document or document fragment, filling it in with given data.
 * Additionally it may use any rendering options passed.
 * It *should not* have a `this` context, and it *should not* have a return value.
 *
 * If this function does have a `this` context, a `this_arg` may be passed to
 * {@link Processor.process} or {@link Processor#process}.
 * Any return value of the function does nothing.
 *
 * @typeparam S  the type of content to process
 * @typeparam T  the type of the data to fill when processing
 * @typeparam U  the type of the processing options object
 * @param   frag the document or document fragment to process
 * @param   data the data to fill the content when processing
 * @param   opts additional processing options
 */
export type ProcessingFunction<S extends Document | DocumentFragment, T, U extends object = object> = (frag: S, data: T, opts: U) => void
/**
 * Asynchronous {@link ProcessingFunction}.
 * @typeparam S  the type of content to process
 * @typeparam T  the type of the data to fill when processing
 * @typeparam U  the type of the processing options object
 * @param   frag the document or document fragment to process
 * @param   data the data to fill the content upon rendering
 * @param   opts additional processing options
 */
export type ProcessingFunctionAsync<S extends Document | DocumentFragment, T, U extends object = object> = (frag: S, data: T, opts: U) => Promise<void>


/**
 * A Processor stores processing operations for a template and a processing function.
 * @typeparam T the type of the data to fill when processing
 * @typeparam U the type of the processing options object
 */
export default class Processor<T, U extends object = object> {
	/**
	 * Process a document or document fragment with some data, and return the same content, modified.
	 *
	 * This method is equivalent to {@link Processor#process}, but useful if you have
	 * a whole document, or a document fragment but no `<template>` element to which it belongs.
	 * @typeparam S          the type of content to process
	 * @typeparam V          the type of the data to fill when processing
	 * @typeparam W          the type of the processing options object
	 * @param   frag         the document or document fragment to process
	 * @param   instructions the processing function to use, taking `frag` as an argument
	 * @param   data         the data to fill the content when processing
	 * @param   options      additional processing options
	 * @returns the processed content (modified)
	 */
	static process<S extends Document | DocumentFragment, V, W extends object = object>(
		frag:         S,
		instructions: ProcessingFunction<S, V, W>,
		data:         V,
		options:      W = ({} as W),
	): S {
		instructions(frag, data, options)
		return frag
	}
	/**
	 * Asynchronous {@link Processor.process}.
	 * @typeparam S          the type of content to process
	 * @typeparam V          the type of the data to fill when processing
	 * @typeparam W          the type of the processing options object
	 * @param   frag         the document or document fragment to process
	 * @param   instructions the processing function to use, taking `frag` as an argument
	 * @param   data         the data to fill the content when processing
	 * @param   options      additional processing options
	 * @returns the processed content (modified)
	 */
	static async processAsync<S extends Document | DocumentFragment, V, W extends object = object>(
		frag:         S,
		instructions: ProcessingFunctionAsync<S, V, W>,
		data:         V | Promise<V>,
		options:      W | Promise<W> = ({} as W),
	): Promise<S> {
		await instructions(frag, await data, await options)
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
	 * const { document } = new jsdom.JSDOM(`
	 * <ol>
	 * 	<template>
	 * 		<li>
	 * 			<a href="{{ url }}">{{ text }}</a>
	 * 		</li>
	 * 	</template>
	 * </ol>
	 * `).window
	 * const dataset = [
	 * 	{ "url": "#0", "text": "Career Connections" },
	 * 	{ "url": "#1", "text": "Getting Licensed & Certified" },
	 * 	{ "url": "#2", "text": "Career resources" },
	 * 	{ "url": "#3", "text": "Code of Ethics" }
	 * ]
	 * const options = {
	 * 	suffix: ' &rarr;'
	 * }
	 * Processor.populateList(document.querySelector('ol'), (f, d, o) => {
	 * 	f.querySelector('a').href        = d.url
	 * 	f.querySelector('a').textContent = d.text + o.suffix
	 * }, dataset, options)
	 * ```
	 *
	 * @typeparam V          the type of the data to fill
	 * @typeparam W          the type of the `options` object
	 * @param   list         the list containing a template to process
	 * @param   instructions the processing function to use
	 * @param   dataset      the data to populate the list
	 * @param   options      additional processing options for all items
	 */
	static populateList<V, W extends object = object>(
		list:         HTMLElement,
		instructions: ProcessingFunction<DocumentFragment, V, W>,
		dataset:      ReadonlyArray<V>,
		options?:     W,
	): void {
		const template: HTMLTemplateElement = checkDOM(list)
		const processor: Processor<V, W> = new Processor(template, instructions)
		list.append(...dataset.map((data) => processor.process(data, options)))
	}
	/**
	 * Asynchronous {@link Processor.populateList}
	 * @typeparam V          the type of the data to fill
	 * @typeparam W          the type of the `options` object
	 * @param   list         the list containing a template to process
	 * @param   instructions the processing function to use
	 * @param   dataset      the data to populate the list
	 * @param   options      additional processing options for all items
	 */
	static async populateListAsync<V, W extends object = object>(
		list:         HTMLElement,
		instructions: ProcessingFunctionAsync<DocumentFragment, V, W>,
		dataset:      ReadonlyArray<V> | Promise<ReadonlyArray<V>>,
		options?:     W | Promise<W>,
	): Promise<void> {
		const template: HTMLTemplateElement = checkDOM(list)
		const processor: Processor<V, W> = new Processor(template, () => {}, instructions)
		list.append(...await Promise.all((await dataset).map((data) => processor.processAsync(data, options))))
	}


	/**
	 * This object’s template, which is to be processed.
	 */
	private readonly _TEMPLATE: HTMLTemplateElement;
	/**
	 * This object’s processing function, which contains instructions for processing the template.
	 */
	private readonly _INSTRUCTIONS: ProcessingFunction<DocumentFragment, T, U>;
	/**
	 * Asynchronous {@link Processor#_INSTRUCTIONS}.
	 */
	private readonly _INSTRUCTIONS_ASYNC: ProcessingFunctionAsync<DocumentFragment, T, U> | null;

	/**
	 * Construct a new Processor object.
	 * @param template           the template to process
	 * @param instructions       the processing function to use
	 * @param instructions_async an alternative processing function, asynchronous
	 */
	constructor (
		template: HTMLTemplateElement,
		instructions: ProcessingFunction<DocumentFragment, T, U>,
		instructions_async: ProcessingFunctionAsync<DocumentFragment, T, U> | null = null,
	) {
		this._TEMPLATE           = template
		this._INSTRUCTIONS       = instructions
		this._INSTRUCTIONS_ASYNC = instructions_async
	}

	/**
	 * Process this component’s template with some data, and return the resulting fragment.
	 * @typeparam T      the type of the data to fill
	 * @typeparam U      the type of the `options` object
	 * @param   data     the data to fill the content when processing
	 * @param   options  additional processing options
	 * @returns the processed output
	 */
	process(data: T, options?: U): DocumentFragment {
		if (this._INSTRUCTIONS_ASYNC !== null) {
			console.info('An asynchronous instruction is available; did you mean to call `processAsync()`?')
		}
		const frag: DocumentFragment = this._TEMPLATE.content.cloneNode(true) as DocumentFragment // NB{LINK} https://dom.spec.whatwg.org/#dom-node-clonenode
		return Processor.process(frag, this._INSTRUCTIONS, data, options)
	}
	/**
	 * Asynchronous {@link Processor#process}.
	 * @typeparam T      the type of the data to fill
	 * @typeparam U      the type of the `options` object
	 * @param   data     the data to fill the content when processing
	 * @param   options  additional processing options
	 * @returns the processed output
	 */
	async processAsync(data: T | Promise<T>, options?: U | Promise<U>): Promise<DocumentFragment> {
		if (this._INSTRUCTIONS_ASYNC === null) {
			console.warn('No asynchronous instructions found. Executing synchronous instructions instead…')
			return this.process(await data, await options)
		}
		const frag: DocumentFragment = this._TEMPLATE.content.cloneNode(true) as DocumentFragment // NB{LINK} https://dom.spec.whatwg.org/#dom-node-clonenode
		return Processor.processAsync(frag, this._INSTRUCTIONS_ASYNC, data, options)
	}
}


/**
 * Check the proper DOM structure of a `<template>` element within one of the following types of elements:
 * - `<ol>`
 * - `<ul>`
 * - `<table>`
 * - `<thead/tfoot/tbody>`
 * - `<tr>`
 * - `<dl>`
 *
 * For all types except `dl`, the `<template>` element must have exactly 1 child, which must be of a valid type.
 *
 * For `dl` elements, the `<template>` must have at least 2 children, at least 1 `dt` and 1 `dd`,
 * and no other types of children, and all `dd` children must follow all `dt` children.
 *
 * @param   list : the list containing a template to validate
 * @returns the template if it passes all the tests
 * @throws  {ReferenceError} if the given list does not contain a `<template>`
 * @throws  {TypeError} if the `<template>` does not have valid children
 */
function checkDOM(list: HTMLElement): HTMLTemplateElement {
	const template: HTMLTemplateElement | null = list.querySelector('template')
	if (template === null) {
		throw new ReferenceError(`This <${ list.tagName.toLowerCase() }> does not have a <template> descendant.`)
	}
	const child_tagname: string | null = new Map<string, string>([
		['ol',    'li'],
		['ul',    'li'],
		['table', 'tbody'],
		['thead', 'tr'],
		['tbody', 'tr'],
		['tfoot', 'tr'],
		['tr',    'td'],
		['dl',    'dt-dd'],
	]).get(list.tagName.toLowerCase()) || null
	if (child_tagname === null) {
		throw new TypeError(`<${ list.tagName.toLowerCase() }> elements are not yet supported.`)
	} else if (child_tagname !== 'dt-dd') { // the element is a `ol/ul/table/thead/tfoot/tbody/tr`
		if (template.content.children.length !== 1) {
			throw new TypeError(`The <template> must contain exactly 1 element.`)
		}
		if (!template.content.children[0].matches(child_tagname)) {
			throw new TypeError(`The <template> must contain exactly 1 <${ child_tagname }>.`)
		}
	} else { // the element is a `dl`
		if (template.content.children.length < 2) {
			throw new TypeError(`The <template> must contain at least 2 elements.`)
		}
		if (template.content.querySelector('dt') === null || template.content.querySelector('dd') === null) {
			throw new TypeError(`The <template> must contain at least 1 <dt> and at least 1 <dd>.`)
		}
		if ([...template.content.querySelectorAll('*')].some((el) => !el.matches('dt, dd'))) {
			throw new TypeError(`The <template> must only contain <dt> or <dd> elements.`)
		}
		if (
			[...template.content.children].indexOf(template.content.querySelector('dt:last-of-type')!) >=
			[...template.content.children].indexOf(template.content.querySelector('dd:first-of-type')!)
		) {
			throw new TypeError(`All <dd> elements must follow all <dt> elements inside the <template>.`)
		}
	}
	return template
}
