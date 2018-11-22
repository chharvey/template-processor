/**
 * A processing function specifies how to transform a template into markup.
 *
 * This function modifies a given document fragment, filling it in with given data.
 * Additionally it may use any rendering options passed.
 * It *should not* have a `this` context, and it *should not* have a return value.
 *
 * If this function does have a `this` context, a `this_arg` may be passed to
 * {@link Processor.process}.
 * Any return value of the function does nothing.
 *
 * @param   <T> the type of the `data` parameter
 * @param   <U> the type of the `options` object parameter
 * @param   frag the template content to process
 * @param   data the data to fill the template when processing
 * @param   options additional processing options
 */
export interface ProcessingFunction<T, U extends object> extends Function {
	(this: any, frag: DocumentFragment, data: T, opts: U): void;
	call(this_arg: any, frag: DocumentFragment, data: T, opts: U): void;
}

/**
 * Asynchronous {@link Processor}.
 * @param   <T> the type of the `data` parameter
 * @param   <U> the type of the `options` object parameter
 * @param   frag the template content with which to render
 * @param   data the data to fill the template upon rendering
 * @param   options additional rendering options
 */
export interface ProcessingFunctionAsync<T, U extends object> extends Function {
	(this: any, frag: DocumentFragment, data: T, opts: U): Promise<void>;
	call(this_arg: any, frag: DocumentFragment, data: T, opts: U): Promise<void>;
}


/**
 * A Processor stores processing operations for a template and a processing function.
 */
export default class Processor<T, U extends object> {
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
	process(data: T, options: U = ({} as U), this_arg: unknown = null): DocumentFragment {
		let frag: DocumentFragment = this._TEMPLATE.content.cloneNode(true) as DocumentFragment // NB{LINK} https://dom.spec.whatwg.org/#dom-node-clonenode
		this._INSTRUCTIONS.call(this_arg, frag, data, options)
		return frag
	}

	/**
	 * Asynchronous {@link Processor.process}.
	 * @param   <T>      the type of the data to fill
	 * @param   <U>      the type of the `options` object
	 * @param   data     the data to fill
	 * @param   options  additional processing options
	 * @param   this_arg the `this` context, if any, in which this object’s instructions is called
	 * @returns the processed output
	 */
	async processAsync(data: T, options: U = ({} as U), this_arg: unknown = null): Promise<DocumentFragment> {
		if (this._INSTRUCTIONS_ASYNC === null) {
			console.warn('No asynchronous instructions found. Executing synchronous instructions instead…')
			return this.process(data, options, this_arg)
		}
		let frag: DocumentFragment = this._TEMPLATE.content.cloneNode(true) as DocumentFragment // NB{LINK} https://dom.spec.whatwg.org/#dom-node-clonenode
		await this._INSTRUCTIONS_ASYNC.call(this_arg, frag, data, options)
		return frag
	}
}
