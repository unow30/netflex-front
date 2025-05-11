const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
  entry: './src/main.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].[contenthash].js',
    chunkFilename: 'js/[name].[contenthash].js',
    publicPath: '/',
    clean: true
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  },
  devtool: isDevelopment ? 'eval-source-map' : false,
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
        },
      },
      {
        test: /\.css$/,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name].[hash][ext]',
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[hash][ext]',
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      inject: true,
      minify: !isDevelopment && {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
    !isDevelopment && new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css',
      chunkFilename: 'css/[id].[contenthash].css',
    }),
    // 프로덕션 빌드 시에만 분석 리포트 생성 (--env.analyze 옵션을 추가했을 때만 실행)
    process.env.ANALYZE && new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: 'bundle-report.html',
      openAnalyzer: true,
    }),
  ].filter(Boolean),
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    historyApiFallback: true,
    hot: true,
    port: 3010,
    open: true,
  },
  optimization: {
    minimize: !isDevelopment,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          parse: {
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2,
            drop_console: !isDevelopment,
          },
          mangle: {
            safari10: true,
          },
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true,
          },
        },
      }),
      new CssMinimizerPlugin(),
    ],
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 5000, // 더 작은 청크 허용 (10000 -> 5000)
      maxSize: 100000, // 최대 크기 감소 (150000 -> 100000)
      cacheGroups: {
        framework: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/,
          name: 'framework',
          priority: 40,
          enforce: true,
        },
        // UI 라이브러리 별도 분리
        ui: {
          test: /[\\/]node_modules[\\/](tailwindcss|@headlessui|@heroicons)[\\/]/,
          name: 'ui-lib',
          priority: 35,
        },
        // 미디어 관련 라이브러리 분리
        media: {
          test: /[\\/]node_modules[\\/](video\.js|@videojs)[\\/]/,
          name: 'media-lib',
          priority: 33,
          chunks: 'async',
        },
        // 이미지 관련 라이브러리 분리
        images: {
          test: /[\\/]node_modules[\\/](react-image-gallery|react-responsive-carousel|@steveeeie|swiper)[\\/]/,
          name: 'image-lib',
          priority: 32,
          chunks: 'async',
        },
        // 차트/데이터 라이브러리 분리
        dataViz: {
          test: /[\\/]node_modules[\\/](recharts|d3|victory|chart\.js|plotly)[\\/]/,
          name: 'data-viz-lib',
          priority: 31,
          chunks: 'async',
        },
        utils: {
          test: /[\\/]node_modules[\\/](lodash|moment|date-fns|axios|swr)[\\/]/,
          name: 'utils',
          priority: 31,
          chunks: 'async',
        },
        lib: {
          test: /[\\/]node_modules[\\/](?!react|react-dom|react-router|react-router-dom|tailwindcss|@headlessui|@heroicons|video\.js|@videojs|react-image-gallery|react-responsive-carousel|@steveeeie|swiper|recharts|d3|victory|chart\.js|plotly|lodash|moment|date-fns|axios|swr)[\\/]/,
          name: 'vendors',
          priority: 30,
          chunks: 'async',
          minChunks: 1,
        },
        commons: {
          name: 'commons',
          minChunks: 2,
          priority: 20,
        },
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true,
        },
      },
    },
    runtimeChunk: 'single',
  },
  stats: 'errors-warnings',
  performance: {
    hints: false, // 경고 메시지 비활성화
    maxEntrypointSize: 500000,
    maxAssetSize: 500000,
  },
}; 