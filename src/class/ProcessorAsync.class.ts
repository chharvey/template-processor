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
export default class ProcessorAsync<T, U extends object> {
	/**
	 * This object’s template, which is to be processed.
	 */
	private readonly _TEMPLATE: HTMLTemplateElement;
	/**
	 * Asynchronous {@link Processor._INSTRUCTIONS}.
	 */
	private readonly _INSTRUCTIONS: ProcessingFunctionAsync<T, U>;

	/**
	 * Construct a new Processor object.
	 * @param template  the template to process
	 * @param instructions the processing function to use
	 */
	constructor(template: HTMLTemplateElement, instructions: ProcessingFunctionAsync<T, U>) {
		this._TEMPLATE     = template
		this._INSTRUCTIONS = instructions
	}

	/**
	 * Asynchronous {@link Processor.process}.
	 * @param   <T>      the type of the data to fill
	 * @param   <U>      the type of the `options` object
	 * @param   data     the data to fill
	 * @param   options  additional processing options
	 * @param   this_arg the `this` context, if any, in which this object’s processor is called
	 * @returns the processed output
	 */
	async process(data: T, options: U = ({} as U), this_arg: unknown = null): Promise<DocumentFragment> {
		let frag = this._TEMPLATE.content.cloneNode(true) as DocumentFragment // NB{LINK} https://dom.spec.whatwg.org/#dom-node-clonenode
		await this._INSTRUCTIONS.call(this_arg, frag, data, options)
		return frag
	}
}
