const Jimp = require('jimp'); // https://github.com/jimp-dev/jimp#readme
const fs = require('fs');

const IMAGES_FOLDER = './images';
const PREFIX_NAME = '-small';
const QUALITY = 87;
const RESIZE_WIDTH = 300;
const RESIZE_HEIGHT = Jimp.AUTO;

/**
 * Рекурисвно читает папки и возвращает список файлов в них
 * @param {string} dirPath Путь к папке которую надо прочитать
 * @param {array} files_ Массив уже найденых файлов
 * @param {function} cbFile Callback ф-ция для найденого файла
 * @returns {array}
 */
function getFiles(dirPath, files_, cbFile) {
    files_ = files_ || [];
    var files = fs.readdirSync(dirPath);
    for (var i in files) {
        var filePath = dirPath + '/' + files[i];

        if (fs.statSync(filePath).isDirectory()) {
            getFiles(filePath, files_, cbFile);
        } else {
            files_.push(filePath);
            cbFile(filePath, files[i], dirPath);
        }
    }
    return files_;
}

/**
 * Callback ф-ция для найденого файла
 * @param {string} filePath Полный путь до файла
 * @param {string} fileName Имя файла
 * @param {string} dirPath Путь до папки в которой он находиться
 */
function cbFile(filePath, fileName, dirPath) {

    // Отсеиваем файлы с уже имеющимся префиксом PREFIX_NAME
    if (fileName.indexOf(PREFIX_NAME) === -1) {
        var name = fileName.replace(/\.[^/.]+$/, "");
        var format = fileName.replace(name, "");
    
        resizeImage(filePath, dirPath, name, format);
    }
}

/**
 * Изменяет размер изображения в зависимости 
 * от настроек выше [QUALITY, RESIZE_WIDTH, RESIZE_HEIGHT]
 * Сохраняет файл с префиксом PREFIX_NAME
 * @param {string} filePath Полный путь до файла
 * @param {string} dirPath Путь до папки в которой файл
 * @param {string} name Имя файла
 * @param {string} format Формат файла
 */
async function resizeImage(filePath, dirPath, name, format) {
    await Jimp.read(filePath)
        .then(images => {
            return images
                .resize(RESIZE_WIDTH, RESIZE_HEIGHT)
                .quality(QUALITY)
                .write(`${dirPath}/${name}${PREFIX_NAME}${format}`, () => {
                    console.log('Save file:', `${dirPath}/${name}${PREFIX_NAME}${format}`);
                });
        }).catch(err => {
            console.error(err);
        });
}

let files = getFiles(IMAGES_FOLDER, [], cbFile);
console.log(files);
