const { getProjectPath, resolve } = require('./utils/projectHelper');

const path = require('path');
const webpack = require('webpack');
const WebpackBar = require('webpackbar');
const webpackMerge = require('webpack-merge');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

const postcssConfig = require('./lib/postcssConfig');

function getWebpackConfig(modules) {
    const pkg = require(getProjectPath('package.json'));
    const babelConfig = require('./lib/getBabelCommonConfig')(modules || false);
    const config = {
        devtool: 'source-map',

        output: {
            path: getProjectPath('./dist/'),
            filename: '[name].js',
        },

        resolve: {
            modules: ['node_modules', path.join(__dirname, '../node_modules')],
            extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
            alias: {
                [pkg.name]: process.cwd(),
            },
        },

        node: ['child_process', 'cluster', 'dgram', 'dns', 'fs', 'module', 'net', 'readline', 'repl', 'tls'].reduce(
            (acc, name) => ({
                ...acc,
                [name]: 'empty',
            }),
            {},
        ),

        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    exclude: /node_modules/,
                    loader: resolve('babel-loader'),
                    options: babelConfig,
                },
                {
                    test: /\.tsx?$/,
                    use: [
                        {
                            loader: resolve('babel-loader'),
                            options: babelConfig,
                        },
                        {
                            loader: resolve('ts-loader'),
                            options: {
                                transpileOnly: true,
                            },
                        },
                    ],
                },
                {
                    test: /\.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: true,
                            },
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                ...postcssConfig,
                                sourceMap: true,
                            },
                        },
                    ],
                },
                {
                    test: /\.less$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: true,
                            },
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                ...postcssConfig,
                                sourceMap: true,
                            },
                        },
                        {
                            loader: resolve('less-loader'),
                            options: {
                                javascriptEnabled: true,
                                sourceMap: true,
                            },
                        },
                    ],
                },

                // // Images
                // {
                //     test: svgRegex,
                //     loader: 'url-loader',
                //     options: svgOptions,
                // },
                // {
                //     test: /\.(png|jpg|jpeg|gif)(\?v=\d+\.\d+\.\d+)?$/i,
                //     loader: 'url-loader',
                //     options: imageOptions,
                // },
            ],
        },

        plugins: [
            new CaseSensitivePathsPlugin(),
            new WebpackBar({
                name: '🚚  Foo Design UI React',
                color: '#2f54eb',
            }),
        ],

        performance: {
            hints: false,
        },
    };
    if (process.env.NODE_ENV === 'PRODUCTION') {
        const entry = ['./index.js'];
        config.output.library = pkg.name;
        config.output.libraryTarget = 'umd';
        config.optimization = {
            minimizer: [
                new UglifyJsPlugin({
                    cache: true,
                    parallel: true,
                    sourceMap: true,
                    uglifyOptions: {
                        warnings: false,
                    },
                }),
            ],
        };

        // Development
        const uncompressedConfig = webpackMerge({}, config, {
            entry: {
                [pkg.name]: entry,
            },
            mode: 'development',
            plugins: [
                new MiniCssExtractPlugin({
                    filename: '[name].css',
                }),
            ],
        });

        // Production
        const prodConfig = webpackMerge({}, config, {
            entry: {
                [`${pkg.name}.min`]: entry,
            },
            mode: 'production',
            plugins: [
                new webpack.optimize.ModuleConcatenationPlugin(),
                new webpack.LoaderOptionsPlugin({
                    minimize: true,
                }),
                new MiniCssExtractPlugin({
                    filename: '[name].css',
                }),
            ],
            optimization: {
                minimizer: [new OptimizeCSSAssetsPlugin({})],
            },
        });

        return [prodConfig, uncompressedConfig];
    }

    return config;
}

module.exports = getWebpackConfig(false);
