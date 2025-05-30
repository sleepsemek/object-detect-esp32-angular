# ObjectDetectEsp32Angular

Использует [Angular CLI](https://github.com/angular/angular-cli) версии 19.2.7.

Веб-интерфейс системы мониторинга человекопотока предназначен для визуализации данных, поступающих с [периферийных устройств на базе микроконтроллера ESP32-S3](https://github.com/ValeraDanger/object-detect-FOMO-stream-Esp32).

## Установка зависимостей

Перед запуском проекта необходимо выполнить терминале команду:

```bash
npm install
```

## Запуск проекта на клиенте

Для того чтобы запустить фронтэнд без сборки:

```bash
npm run start
```

После этого он будет доступен в браузере по `http://localhost:4200/`.

## Запуск бэкенда

```bash
npm run start:backend
```

Бэкенд будет запущен, и будет принимать запросы с камер на ESP32-S3.

## Запуск мок-сервер

Для имитации отправки запросов с устройств можно запустить мокер:

```bash
npm run start:mocker
```

В файле `mocker/mocker.js` можно задать параметры изменением констант.

## Сборка проекта

Команда для сборки проекта:

```bash
ng build
```

Собранные файлы будут размещены в папке `dist/`. Сборка для прода оптимизируется.
