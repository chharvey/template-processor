const Processor_module = require('./dist/class/Processor.class.js')

module.exports = {
	Processor               : Processor_module.default,
	ProcessingFunction      : Processor_module.ProcessingFunction,
	ProcessingFunctionAsync : Processor_module.ProcessingFunctionAsync,
}
