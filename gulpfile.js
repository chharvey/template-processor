const gulp  = require('gulp')
const typescript = require('gulp-typescript')
// require('typescript') // DO NOT REMOVE … peerDependency of `gulp-typescript`

const tsconfig = require('./tsconfig.json')

function dist() {
	return gulp.src('./src/class/*.class.ts')
		.pipe(typescript(tsconfig.compilerOptions))
		.pipe(gulp.dest('./dist/class/'))
}

const build = gulp.parallel(dist)

module.exports = {
	dist,
	build,
}
