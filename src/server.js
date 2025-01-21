const app = require('./app');
const browserSync = require('browser-sync').create();

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);

    // BrowserSync for hot-reloading
    browserSync.init({
        proxy: `http://localhost:${PORT}`,
        files: ['./public/**/*', './public/index.html', './public/script.js'],
        open: false,
        port: 3001,
    });
});
