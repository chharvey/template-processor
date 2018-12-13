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
 * @param   <T> the type of the data to fill when processing
 * @param   <U> the type of the processing options object
 * @param   frag the document or document fragment to process
 * @param   data the data to fill the content when processing
 * @param   opts additional processing options
 */
export interface ProcessingFunction<T, U extends object> extends Function {
	(this: any, frag: Document|DocumentFragment, data: T, opts: U): void;
	call(this_arg: unknown, frag: Document|DocumentFragment, data: T, opts: U): void;
}
/**
 * Asynchronous {@link ProcessingFunction}.
 * @param   <T> the type of the data to fill when processing
 * @param   <U> the type of the processing options object
 * @param   frag the document or document fragment to process
 * @param   data the data to fill the content upon rendering
 * @param   options additional processing options
 */
export interface ProcessingFunctionAsync<T, U extends object> extends Function {
	(this: any, frag: Document|DocumentFragment, data: T, opts: U): Promise<void>;
	call(this_arg: unknown, frag: Document|DocumentFragment, data: T, opts: U): Promise<void>;
}


/**
 * A Processor stores processing operations for a template and a processing function.
 * @param   <T> the type of the data to fill when processing
 * @param   <U> the type of the processing options object
 */
export default class Processor<T, U extends object> {
	/**
	 * Process a document or document fragment with some data, and return the same content, modified.
	 *
	 * This method is equivalent to {@link Processor#process}, but useful if you have
	 * a whole document, or a document fragment but no `<template>` element to which it belongs.
	 * @param   <S>          the content to process
	 * @param   <V>          the type of the data to fill when processing
	 * @param   <W>          the type of the processing options object
	 * @param   frag         the document or document fragment to process
	 * @param   instructions the processing function to use, taking `frag` as an argument
	 * @param   data         the data to fill the content when processing
	 * @param   options      additional processing options
	 * @param   this_arg     the `this` context, if any, in which the instructions is called
	 * @returns the processed content (modified)
	 */
	static process<S extends Document|DocumentFragment, V, W extends object>(frag: S, instructions: ProcessingFunction<V, W>, data: V, options: W = ({} as W), this_arg: unknown = null): S {
		instructions.call(this_arg, frag, data, options)
		return frag
	}
	/**
	 * Asynchronous {@link Processor.process}.
	 * @param   <S>          the content to process
	 * @param   <V>          the type of the data to fill when processing
	 * @param   <W>          the type of the processing options object
	 * @param   frag         the document or document fragment to process
	 * @param   instructions the processing function to use, taking `frag` as an argument
	 * @param   data         the data to fill the content when processing
	 * @param   options      additional processing options
	 * @param   this_arg     the `this` context, if any, in which the instructions is called
	 * @returns the processed content (modified)
	 */
	static async processAsync<S extends Document|DocumentFragment, V, W extends object>(frag: S, instructions: ProcessingFunctionAsync<V, W>, data: V, options: W = ({} as W), this_arg: unknown = null): Promise<S> {
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
	 * Asynchronous {@link Processor#_INSTRUCTIONS}.
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
	 * @param   data     the data to fill the content when processing
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
	 * @param   data     the data to fill the content when processing
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
