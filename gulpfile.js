const gulp  = require('gulp')
const typescript = require('gulp-typescript')
// require('typescript') // DO NOT REMOVE … peerDependency of `gulp-typescript`

const tsconfig = require('./tsconfig.json')

gulp.task('dist', async function () {
	return gulp.src('./src/class/*.class.ts')
		.pipe(typescript(tsconfig.compilerOptions))
		.pipe(gulp.dest('./dist/class/'))
})

gulp.task('build', ['dist'])
