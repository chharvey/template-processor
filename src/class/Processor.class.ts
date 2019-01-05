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
export type ProcessingFunction<T, U extends object> = (this: any, frag: DocumentFragment, data: T, opts: U) => void
/**
 * Asynchronous {@link ProcessingFunction}.
 * @param   <T> the type of the `data` parameter
 * @param   <U> the type of the `options` object parameter
 * @param   frag the template content to process
 * @param   data the data to fill the template upon rendering
 * @param   options additional processing options
 */
export type ProcessingFunctionAsync<T, U extends object> = (this: any, frag: DocumentFragment, data: T, opts: U) => Promise<void>


/**
 * A Processor stores processing operations for a template and a processing function.
 */
export default class Processor<T, U extends object> {
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
	static process<V, W extends object>(frag: DocumentFragment, instructions: ProcessingFunction<V, W>, data: V, options: W = ({} as W), this_arg: unknown = null): DocumentFragment {
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
	static async processAsync<V, W extends object>(frag: DocumentFragment, instructions: ProcessingFunctionAsync<V, W>, data: V, options: W = ({} as W), this_arg: unknown = null): Promise<DocumentFragment> {
		await instructions.call(this_arg, frag, data, options)
		return frag
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
			console.warn('An asynchronous instruction is available; did you mean to call `processAsync()`?')
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
	async processAsync(data: T, options?: U, this_arg?: unknown): Promise<DocumentFragment> {
		if (this._INSTRUCTIONS_ASYNC === null) {
			console.warn('No asynchronous instructions found. Executing synchronous instructions instead…')
			return this.process(data, options, this_arg)
		}
		let frag: DocumentFragment = this._TEMPLATE.content.cloneNode(true) as DocumentFragment // NB{LINK} https://dom.spec.whatwg.org/#dom-node-clonenode
		return Processor.processAsync(frag, this._INSTRUCTIONS_ASYNC, data, options, this_arg)
	}
}
