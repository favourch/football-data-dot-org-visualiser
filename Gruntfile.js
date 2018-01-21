module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        // css processors
        sass: {
            options: {
                compress: false,
                sourcemap: 'none'
            },
            scss: {
                files: [{
                    expand: true,
                    cwd: '_assets/sass/',
                    src: ['*.scss'],
                    dest: 'assets/css/',
                    ext: '.min.css'
                }]
            }
        },
        postcss: {
            options: {
                processors: [
                    require('autoprefixer'),
                    require('csswring')
                ]
            },
            mincss: {
                files: [{
                    expand: true,
                    cwd: 'assets/css/',
                    src: ['*.min.css'],
                    dest: 'assets/css/'
                }]
            }
        },
        // js processors
        import: {
            js: {
                expand: true,
                cwd: '_assets/js/',
                src: ['*.js'],
                dest: 'assets/js/',
                ext: '.min.js'
            }
        },
        uglify: {
            minjs: {
                files: [{
                    expand: true,
                    cwd: 'assets/js/',
                    src: ['*.min.js'],
                    dest: 'assets/js/',
                    ext: '.min.js'
                }]
            }
        },
        // favicon generator
        realFavicon: {
            favicons: {
                src: '_assets/icons/favicon.png',
                dest: 'assets/icons',
                options: {
                    iconsPath: "{{ '/assets/icons/' | prepend: site.baseurl | prepend: site.url }}",
                    html: ['_includes/head.html'],
                    design: {
                        ios: {
                            pictureAspect: 'backgroundAndMargin',
                            backgroundColor: '#ffffff',
                            margin: '14%',
                            assets: {
                                ios6AndPriorIcons: false,
                                ios7AndLaterIcons: false,
                                precomposedIcons: false,
                                declareOnlyDefaultIcon: true
                            }
                        },
                        desktopBrowser: {},
                        windows: {
                            pictureAspect: 'whiteSilhouette',
                            backgroundColor: '#2b5797',
                            onConflict: 'override',
                            assets: {
                                windows80Ie10Tile: false,
                                windows10Ie11EdgeTiles: {
                                    small: false,
                                    medium: true,
                                    big: false,
                                    rectangle: false
                                }
                            }
                        },
                        androidChrome: {
                            pictureAspect: 'backgroundAndMargin',
                            margin: '17%',
                            backgroundColor: '#ffffff',
                            themeColor: '#ffffff',
                            manifest: {
                                name: 'football-data.org visualiser',
                                display: 'standalone',
                                orientation: 'notSet',
                                onConflict: 'override',
                                declared: true
                            },
                            assets: {
                                legacyIcon: false,
                                lowResolutionIcons: false
                            }
                        },
                        safariPinnedTab: {
                            pictureAspect: 'silhouette',
                            themeColor: '#333333'
                        }
                    },
                    settings: {
                        scalingAlgorithm: 'Mitchell',
                        errorOnImageTooSmall: false
                    }
                }
            }
        },
        // copy css and js
        copy: {
            mincss: {
                expand: true,
                cwd: 'assets/css/',
                src: ['*.min.css'],
                dest: '_site/assets/css/'
            },
            minjs: {
                expand: true,
                cwd: 'assets/js/',
                src: ['*.min.js'],
                dest: '_site/assets/js/'
            }
        },
        // jekyll build
        shell: {
            jekyll_drafts: {
                command: 'jekyll build --drafts'
            },
            jekyll: {
                command: 'jekyll build --config _config.yml,_config-dev.yml'
            }
        },
        // watch
        watch: {
            options: {
                livereload: true
            },
            css: {
                files: ['_assets/sass/*.scss'],
                tasks: ['sass', 'postcss', 'copy:mincss']
            },
            js: {
                files: ['_assets/js/*.js'],
                tasks: ['import', 'uglify', 'copy:minjs']
            },
            jekyll: {
                files: ['*.html', '*.md', '*.yml', '*.xml', '*.ico', '_assets/**', '_includes/**', '_layouts/*'],
                tasks: ['shell:jekyll']
            }
        },
        // serve
        connect: {
            server: {
                options: {
                    port: 4000,
                    base: '_site/',
                    livereload: true
                }
            }
        }
    });

    // register tasks
    grunt.registerTask('gen-favicon', [
        'realFavicon'
    ]);

    grunt.registerTask('build', [
        'sass',
        'postcss',
        'import',
        'uglify',
        'shell:jekyll'
    ]);

    grunt.registerTask('serve', [
        'connect:server',
        'watch'
    ]);

    grunt.registerTask('build-serve', [
        'sass',
        'postcss',
        'import',
        'uglify',
        'shell:jekyll',
        'connect:server',
        'watch'
    ]);
};