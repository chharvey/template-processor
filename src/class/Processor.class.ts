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
	 * Construct a new Processor object.
	 * @param template  the template to process
	 * @param instructions the processing function to use
	 */
	constructor(template: HTMLTemplateElement, instructions: ProcessingFunction<T, U>) {
		this._TEMPLATE     = template
		this._INSTRUCTIONS = instructions
	}

	/**
	 * Process this component’s template with some data, and return the resulting fragment.
	 * @param   <T>      the type of the data to fill
	 * @param   <U>      the type of the `options` object
	 * @param   data     the data to fill
	 * @param   options  additional processing options
	 * @param   this_arg the `this` context, if any, in which this object’s processor is called
	 * @returns the processed output
	 */
	process(data: T, options: U = ({} as U), this_arg: unknown = null): DocumentFragment {
		let frag = this._TEMPLATE.content.cloneNode(true) as DocumentFragment // NB{LINK} https://dom.spec.whatwg.org/#dom-node-clonenode
		this._INSTRUCTIONS.call(this_arg, frag, data, options)
		return frag
	}
}
