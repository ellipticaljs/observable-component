var gulp=require('gulp'),
    fs = require('fs-extra'),
    concat=require('gulp-concat'),
    uglify = require('gulp-uglify'),
    BUILD_JSON=require('./build.json'),
    BUILD_NAME='observable.component.js',
    MIN_NAME='observable.component.min.js',
    REPO_NAME='observable component',
    DIST='./dist',
    JQ='./node_modules/component-extensions/dist/jquery.js',
    CSS ='./node_modules/component-extensions/css/styles.css',
    DUST='./node_modules/component-extensions/dist/dust.js',
    MS='./node_modules/jquery-mutation-summary/dist/mutation.summary.js',
    UTILS='./node_modules/component-extensions/dist/elliptical.utils.js',
    MOMENT='./node_modules/component-extensions/dist/moment.js',
    BUNDLE_JSON=require('./bundle.json'),
    BUNDLE='./bundle';


gulp.task('default',function(){
    console.log(REPO_NAME + ' ..."tasks: gulp build|minify"');
});


gulp.task('build',function(){
    fileStream(BUNDLE_JSON,DIST);
    fileStream(JQ,DIST);
    fileStream(CSS,DIST);
    concatFileStream(BUILD_JSON,DIST,BUILD_NAME);
});

gulp.task('minify',function(){
    fileStream(CSS,DIST);
    minFileStream(DUST,DIST,'dust.min.js');
    minFileStream(MS,DIST,'mutation.summary.min.js');
    minFileStream(JQ,DIST,'jquery.min.js');
    minFileStream(UTILS,DIST,'elliptical.utils.min.js');
    minFileStream(MOMENT,DIST,'moment.min.js');
    minFileStream(BUILD_JSON,DIST,MIN_NAME);
});



function srcStream(src){
    if(src===undefined) src=BUILD_JSON;
    return gulp.src(src);
}

function concatStream(name,src){
    if(src===undefined) src=BUILD_JSON;
    return srcStream(src)
        .pipe(concat(name))
}

function fileStream(src,dest){
    gulp.src(src)
        .pipe(gulp.dest(dest));
}

function concatFileStream(src,dest,name){
    gulp.src(src)
        .pipe(concat(name))
        .pipe(gulp.dest(dest));
}

function minFileStream(src,dest,name){
    gulp.src(src)
        .pipe(concat(name))
        .pipe(uglify())
        .pipe(gulp.dest(dest));
}
