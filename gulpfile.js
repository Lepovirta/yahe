const gulp = require('gulp');
const concat = require('gulp-concat');
const zip = require('gulp-zip');
const eslint = require('gulp-eslint');
const del = require('del');
const rollup = require('rollup');
const fs = require('fs');
const util = require('util');
const asyncReadFile = util.promisify(fs.readFile);
const asyncWriteFile = util.promisify(fs.writeFile);

const pkgP = asyncReadFile('./package.json').then(JSON.parse);

async function gmHeader() {
  const pkg = await pkgP;
  const cssContents = await asyncReadFile('./stylesheets/default.css', 'utf8');
  const cssSingleLine = cssContents.replace(/\n/g, '');
  return `// ==UserScript==
// @name          ${pkg.name}
// @namespace     ${pkg.homepage}
// @description   ${pkg.description}
// @grant         GM_addStyle
// @grant         GM_openInTab
// ==/UserScript==
GM_addStyle("${cssSingleLine}");`;
}

function chromeManifest(pkg) {
  return {
    name: pkg.description,
    short_name: pkg.name,
    version: pkg.version,
    manifest_version: 2,
    description: 'A simple hit-a-hint extension',
    options_ui: {
      chrome_style: true,
      page: 'options.html',
    },
    options_page: 'options.html',
    icons: {
      16: 'icon16.png',
      48: 'icon48.png',
      128: 'icon128.png',
    },
    permissions: [
      'http://*/*',
      'https://*/*',
      'ftp://*/*',
      'storage',
    ],
    content_scripts: [
      {
        match_about_blank: true,
        matches: [
          'http://*/*',
          'https://*/*',
          'ftp://*/*',
          'file://*/*',
        ],
        css: ['yahe.css'],
        js: ['yahe.js'],
        run_at: 'document_end',
        all_frames: true,
      },
    ],
  };
}

gulp.task('chrome:js', async function() {
  const bundle = await rollup.rollup({
    input: './src/chrome_main.js',
  });

  await bundle.write({
    file: './dist/chrome/yahe.js',
    format: 'cjs',
    sourcemap: false,
  });
});

gulp.task('chrome:css', () =>
  gulp.src('./stylesheets/default.css')
      .pipe(concat('yahe.css'))
      .pipe(gulp.dest('./dist/chrome/'))
);

gulp.task('chrome:icon', () =>
  gulp.src('img/icon*.png').pipe(gulp.dest('./dist/chrome/'))
);

gulp.task('chrome:options', () =>
  gulp.src('./chrome/options.*').pipe(gulp.dest('./dist/chrome/'))
);

gulp.task('chrome:manifest', async function() {
  const pkg = await pkgP;
  const manifest = chromeManifest(pkg);
  const manifestJson = JSON.stringify(manifest, null, 2);
  await asyncWriteFile('./dist/chrome/manifest.json', manifestJson);
});

gulp.task('gm:js', async function() {
  const bundle = await rollup.rollup({
    input: './src/gm_main.js',
  });

  await bundle.write({
    file: './dist/greasemonkey/yahe.user.js',
    format: 'cjs',
    sourcemap: false,
    banner: gmHeader,
  });
});

gulp.task('chrome', [
  'chrome:js',
  'chrome:css',
  'chrome:icon',
  'chrome:options',
  'chrome:manifest',
]);

gulp.task('chrome:pkg', ['chrome'], () =>
  gulp.src('./dist/chrome/*')
      .pipe(zip('yahe.crx'))
      .pipe(gulp.dest('./dist/'))
);

gulp.task('gm', ['gm:js']);

gulp.task('build', ['chrome', 'gm']);

gulp.task('pkg', ['chrome:pkg']);

gulp.task('lint', () => {
  return gulp.src(['src/*.js', 'gulpfile.js'])
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());
});

gulp.task('test', ['lint']);

gulp.task('clean', () =>
  del([
    'dist/**/*',
  ])
);
